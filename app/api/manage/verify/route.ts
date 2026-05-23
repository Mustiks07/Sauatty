import type { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { ok, fail } from '@/lib/api-error';
import { isAllowedOrigin } from '@/lib/origin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) return fail('FORBIDDEN', 'Invalid origin', 403);
  const u = await getSessionUser();
  if (!u) {
    // In production this leaks nothing (same generic 403),
    // but in dev we add a `reason` to debug.
    return fail(
      'FORBIDDEN',
      'Кіру қате',
      403,
      process.env.NODE_ENV !== 'production' ? { reason: 'no_session' } : undefined,
    );
  }
  if (u.db.role !== 'ADMIN') {
    return fail(
      'FORBIDDEN',
      'Кіру қате',
      403,
      process.env.NODE_ENV !== 'production'
        ? { reason: 'not_admin', actualRole: u.db.role, userId: u.db.id }
        : undefined,
    );
  }
  return ok({ ok: true });
}
