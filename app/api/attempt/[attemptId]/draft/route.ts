import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { draftSchema } from '@/lib/validators/test';
import { getAttemptOwned, isExpired } from '@/lib/attempt';

export const runtime = 'nodejs';

const MAX_BODY = 1_000_000; // 1MB

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } },
) {
  try {
    const u = await requireUser();
    const text = await req.text();
    if (text.length > MAX_BODY) {
      return fail('BODY_TOO_LARGE', 'Қаралама тым үлкен, тазалаңыз', 413);
    }
    const body = draftSchema.parse(JSON.parse(text));

    const attempt = await getAttemptOwned(params.attemptId, u.db.id);
    if (attempt.finishedAt) throw new ApiError('CONFLICT', 'Попытка аяқталған', 409);
    if (isExpired(attempt.startedAt, attempt.test.timeLimitMinutes)) {
      return fail('TIMEOUT', 'Уақыт бітті', 410);
    }

    const q = await prisma.question.findFirst({
      where: { id: body.questionId, testId: attempt.testId },
      select: { id: true },
    });
    if (!q) throw new ApiError('NOT_FOUND', 'Сұрақ табылмады', 404);

    await prisma.draft.upsert({
      where: {
        attemptId_questionId: { attemptId: attempt.id, questionId: body.questionId },
      },
      create: {
        attemptId: attempt.id,
        questionId: body.questionId,
        canvasData: body.canvasData,
      },
      update: { canvasData: body.canvasData },
    });

    return ok({ saved: true });
  } catch (e) {
    return handleError(e);
  }
}
