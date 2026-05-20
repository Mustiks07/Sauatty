import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { getAttemptOwned, finalizeAttempt } from '@/lib/attempt';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: { attemptId: string } },
) {
  try {
    const u = await requireUser();
    await getAttemptOwned(params.attemptId, u.db.id);
    const result = await finalizeAttempt(params.attemptId);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
