import { getSessionUser } from '@/lib/auth';
import { ok, fail } from '@/lib/api-error';

export const runtime = 'nodejs';

export async function POST() {
  const u = await getSessionUser();
  if (!u || u.db.role !== 'ADMIN') {
    // Same response for both cases — don't leak admin existence.
    return fail('FORBIDDEN', 'Кіру қате', 403);
  }
  return ok({ ok: true });
}
