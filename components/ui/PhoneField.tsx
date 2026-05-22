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
 * Fully controlled — we intercept every keystroke in onBeforeInput and apply
 * the change ourselves. Native onChange is a no-op (except for autofill).
 * This avoids the "prefix digit getting counted as a user digit" bug.
 */

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
  if (digits.length > 10 && digits.startsWith('7')) return digits.slice(1, 11);
  return digits.slice(0, 10);
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
              onBeforeInput={(e) => {
                const ne = e.nativeEvent as InputEvent;
                const type = ne.inputType;

                if (type === 'insertText') {
                  e.preventDefault();
                  const data = ne.data ?? '';
                  const digits = data.replace(/\D/g, '');
                  if (digits) commit(local + digits);
                  return;
                }
                if (
                  type === 'deleteContentBackward' ||
                  type === 'deleteContentForward' ||
                  type === 'deleteByCut'
                ) {
                  e.preventDefault();
                  commit(local.slice(0, -1));
                  return;
                }
                // insertFromPaste — handled in onPaste; let others through
              }}
              onChange={(e) => {
                // Most input handled in onBeforeInput. This fires only on
                // browser autofill (iCloud Keychain etc.). Parse the full
                // pasted value as if it were paste data.
                if (e.target.value === display) return;
                let d = e.target.value.replace(/\D/g, '');
                if (d.length > 10 && d.startsWith('7')) d = d.slice(1);
                commit(d);
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                let d = text.replace(/\D/g, '');
                if (d.length > 10 && d.startsWith('7')) d = d.slice(1);
                commit(d);
              }}
            />
            <FieldError>{error}</FieldError>
          </div>
        );
      }}
    />
  );
}
