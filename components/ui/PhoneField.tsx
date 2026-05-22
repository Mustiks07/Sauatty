'use client';

import { useRef } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Input, Label, FieldError } from './Input';

/**
 * KZ phone mask `+7 (___) ___-__-__`.
 * Stored as E.164 (`+7XXXXXXXXXX`) in form state.
 *
 * One-keystroke = one-digit guarantee:
 *   - Stored format ALWAYS starts with `+7` → localFromE164 strips first 7.
 *   - On input change we look only at chars AFTER the `+7 (` prefix.
 *   - Backspace on formatting char triggers a manual digit removal.
 */

const PREFIX = '+7 (';
const SLOT_INDICES = [4, 5, 6, 9, 10, 11, 13, 14, 16, 17];

function buildMask(local: string): string {
  const slots = local.padEnd(10, '_').split('');
  return (
    '+7 (' +
    slots.slice(0, 3).join('') +
    ') ' +
    slots.slice(3, 6).join('') +
    '-' +
    slots.slice(6, 8).join('') +
    '-' +
    slots.slice(8, 10).join('')
  );
}

function localFromE164(value: string): string {
  const digits = (value ?? '').replace(/\D/g, '');
  // Stored format is always "+7" + local digits — strip the leading 7.
  return digits.startsWith('7') ? digits.slice(1, 11) : digits.slice(0, 10);
}

function localFromPaste(text: string): string {
  let d = (text ?? '').replace(/\D/g, '');
  // 11-digit numbers with leading 7 or 8 → drop the country/trunk code.
  if (d.length > 10 && (d.startsWith('7') || d.startsWith('8'))) d = d.slice(1);
  return d.slice(0, 10);
}

function caretAfterDigits(filledCount: number): number {
  if (filledCount >= 10) return 18;
  return SLOT_INDICES[filledCount] ?? 18;
}

export function PhoneField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  autoComplete = 'tel',
  id,
}: {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  autoComplete?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function setCaret(pos: number) {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el || document.activeElement !== el) return;
      try {
        el.setSelectionRange(pos, pos);
      } catch {
        /* iOS Safari can throw on type=tel — ignore */
      }
    });
  }

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={'' as any}
      render={({ field }) => {
        const local = localFromE164((field.value as string) ?? '');
        const display = buildMask(local);

        const commit = (nextLocal: string) => {
          const clamped = nextLocal.slice(0, 10);
          field.onChange(clamped ? '+7' + clamped : '');
          setCaret(caretAfterDigits(clamped.length));
        };

        return (
          <div>
            {label && <Label htmlFor={id ?? (name as string)}>{label}</Label>}
            <Input
              ref={inputRef}
              id={id ?? (name as string)}
              type="tel"
              inputMode="numeric"
              autoComplete={autoComplete}
              value={display}
              onBlur={field.onBlur}
              onFocus={() => setCaret(caretAfterDigits(local.length))}
              onClick={() => setCaret(caretAfterDigits(local.length))}
              onChange={(e) => {
                const v = e.target.value;

                // Autofill / paste — value lost mask structure entirely.
                if (!v.startsWith(PREFIX)) {
                  commit(localFromPaste(v));
                  return;
                }

                // Normal typing — extract digits AFTER the prefix only.
                const afterPrefix = v.slice(PREFIX.length);
                let newDigits = afterPrefix.replace(/\D/g, '').slice(0, 10);

                // Backspace on a formatting char (space / paren / dash):
                // value got shorter but digit count didn't drop — manually
                // remove the last digit.
                if (v.length < display.length && newDigits.length >= local.length) {
                  newDigits = local.slice(0, -1);
                }

                commit(newDigits);
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                commit(localFromPaste(text));
              }}
            />
            <FieldError>{error}</FieldError>
          </div>
        );
      }}
    />
  );
}
