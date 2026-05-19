import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { answerSchema } from '@/lib/validators/test';
import { getAttemptOwned, isExpired } from '@/lib/attempt';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } },
) {
  try {
    const u = await requireUser();
    const body = answerSchema.parse(await req.json());

    const attempt = await getAttemptOwned(params.attemptId, u.db.id);
    if (attempt.finishedAt) {
      throw new ApiError('CONFLICT', 'Попытка аяқталған', 409);
    }
    if (isExpired(attempt.startedAt, attempt.test.timeLimitMinutes)) {
      // Auto-finish silently — client will catch TIMEOUT and redirect.
      return fail('TIMEOUT', 'Уақыт бітті', 410);
    }

    // Validate question belongs to test and option (if any) belongs to question.
    const q = await prisma.question.findFirst({
      where: { id: body.questionId, testId: attempt.testId },
      select: { id: true },
    });
    if (!q) throw new ApiError('NOT_FOUND', 'Сұрақ табылмады', 404);

    if (body.selectedOptionId) {
      const opt = await prisma.answerOption.findFirst({
        where: { id: body.selectedOptionId, questionId: body.questionId },
        select: { id: true },
      });
      if (!opt) throw new ApiError('VALIDATION_ERROR', 'Нұсқа қате', 422);
    }

    await prisma.userAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: attempt.id,
          questionId: body.questionId,
        },
      },
      create: {
        attemptId: attempt.id,
        questionId: body.questionId,
        selectedOptionId: body.selectedOptionId,
        isCorrect: false,
      },
      update: { selectedOptionId: body.selectedOptionId, isCorrect: false },
    });

    return ok({ saved: true });
  } catch (e) {
    return handleError(e);
  }
}
