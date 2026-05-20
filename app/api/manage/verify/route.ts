import { getSessionUser } from '@/lib/auth';
import { ok, fail } from '@/lib/api-error';

export const runtime = 'nodejs';

export async function POST() {
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
