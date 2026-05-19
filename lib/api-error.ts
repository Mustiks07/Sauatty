import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'BODY_TOO_LARGE'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number = 400,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(code: ApiErrorCode, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, code, details }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return fail(err.code, err.message, err.status, err.details);
  }
  if (err instanceof ZodError) {
    return fail('VALIDATION_ERROR', 'Енгізілген деректер дұрыс емес', 422, err.flatten());
  }
  console.error('[api error]', err);
  return fail('INTERNAL_ERROR', 'Күтпеген қате', 500);
}
