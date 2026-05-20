import { getSessionUser } from '@/lib/auth';
import { ok, fail } from '@/lib/api-error';

export const runtime = 'nodejs';

export async function GET() {
  const u = await getSessionUser();
  if (!u) return fail('UNAUTHORIZED', '', 401);
  return ok({ role: u.db.role, hasPhone: !!u.db.phone });
}
