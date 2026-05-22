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
 * Phone mask `+7 (___) ___-__-__`.
 * Always shows the full template; digits fill the underscores left-to-right.
 * Stored in form state as E.164 (`+7XXXXXXXXXX`).
 * Mobile-friendly: uses `onBeforeInput` to handle deletions reliably across virtual keyboards.
 */

// Indices of digit slots in the mask "+7 (___) ___-__-__"
//                                      0 1 2  3  4 5 6  7 8  9 10 11 12 13 14 15 16 17
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
  // If 11+ digits and starts with 7, drop the leading country-code 7
  if (digits.length > 10 && digits.startsWith('7')) {
    return digits.slice(1, 11);
  }
  return digits.slice(0, 10);
}

function localFromAnyInput(text: string): string {
  const digits = (text ?? '').replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('7')) {
    return digits.slice(1, 11);
  }
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
      if (!el) return;
      if (document.activeElement !== el) return;
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

        const commit = (newLocal: string) => {
          field.onChange(newLocal ? '+7' + newLocal : '');
          setCaret(caretAfterDigits(newLocal.length));
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
                const ne = e as unknown as InputEvent;
                const type = ne.inputType;
                // Mobile-safe delete handling (Backspace on virtual keyboards).
                if (
                  type === 'deleteContentBackward' ||
                  type === 'deleteContentForward' ||
                  type === 'deleteByCut'
                ) {
                  e.preventDefault();
                  commit(local.slice(0, -1));
                  return;
                }
              }}
              onChange={(e) => {
                // Insertions: extract digits from new value, normalize, commit.
                const newLocal = localFromAnyInput(e.target.value);
                if (newLocal !== local) commit(newLocal);
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                commit(localFromAnyInput(text));
              }}
            />
            <FieldError>{error}</FieldError>
          </div>
        );
      }}
    />
  );
}
