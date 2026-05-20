import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMSS(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export const PHONE_REGEX = /^\+77\d{9}$/;
export const PASSWORD_MIN = 8;

/**
 * Format raw E.164 phone (`+77XXXXXXXXX` or partial) for display:
 * `+7 (XXX) XXX-XX-XX`. Accepts anything; non-digits are stripped.
 */
export function formatPhoneDisplay(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  // Drop leading 7 — we'll re-add as the fixed prefix.
  const local = digits.startsWith('7') ? digits.slice(1) : digits;
  const d = local.slice(0, 10);

  let out = '+7';
  if (d.length === 0) return out;
  out += ' (' + d.slice(0, 3);
  if (d.length < 4) return out;
  out += ') ' + d.slice(3, 6);
  if (d.length < 7) return out;
  out += '-' + d.slice(6, 8);
  if (d.length < 9) return out;
  out += '-' + d.slice(8, 10);
  return out;
}

/**
 * Extract clean E.164 form from anything the user typed.
 * Always returns either `''` or `+7XXXXXXXXXX` (with whatever digits they have so far).
 */
export function phoneToE164(input: string): string {
  const digits = (input ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const local = digits.startsWith('7') ? digits.slice(1) : digits;
  if (!local) return '+7';
  return '+7' + local.slice(0, 10);
}
