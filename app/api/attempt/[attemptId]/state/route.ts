import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { getAttemptOwned } from '@/lib/attempt';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { attemptId: string } },
) {
  try {
    const u = await requireUser();
    const attempt = await getAttemptOwned(params.attemptId, u.db.id);

    const [answers, drafts] = await Promise.all([
      prisma.userAnswer.findMany({
        where: { attemptId: attempt.id },
        select: { questionId: true, selectedOptionId: true },
      }),
      prisma.draft.findMany({
        where: { attemptId: attempt.id },
        select: { questionId: true, canvasData: true },
      }),
    ]);

    return ok({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
      timeLimitMinutes: attempt.test.timeLimitMinutes,
      answers,
      drafts,
    });
  } catch (e) {
    return handleError(e);
  }
}
