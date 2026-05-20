'use client';

import * as React from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input, Label, FieldError } from './Input';
import { formatPhoneDisplay, phoneToE164 } from '@/lib/utils';

/**
 * Phone input with KZ mask `+7 (XXX) XXX-XX-XX`.
 * Stored in form state as E.164 (`+7XXXXXXXXXX`).
 */
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
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={'' as any}
      render={({ field }) => {
        const display = formatPhoneDisplay((field.value as string) ?? '');
        return (
          <div>
            {label && <Label htmlFor={id ?? (name as string)}>{label}</Label>}
            <Input
              id={id ?? (name as string)}
              type="tel"
              inputMode="tel"
              autoComplete={autoComplete}
              placeholder="+7 (___) ___-__-__"
              value={display}
              onBlur={field.onBlur}
              onChange={(e) => {
                const e164 = phoneToE164(e.target.value);
                field.onChange(e164);
              }}
              onKeyDown={(e) => {
                // Make Backspace delete a digit, not the formatting char.
                if (e.key === 'Backspace') {
                  e.preventDefault();
                  const digits = ((field.value as string) ?? '').replace(/\D/g, '');
                  if (!digits) return;
                  const trimmed = digits.slice(0, -1);
                  field.onChange(trimmed ? '+' + trimmed : '');
                }
              }}
            />
            <FieldError>{error}</FieldError>
          </div>
        );
      }}
    />
  );
}
