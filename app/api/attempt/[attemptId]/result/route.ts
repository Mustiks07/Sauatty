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
    if (!attempt.finishedAt) {
      throw new ApiError('CONFLICT', 'Попытка аяқталмаған', 409);
    }

    const [test, answers] = await Promise.all([
      prisma.test.findUnique({
        where: { id: attempt.testId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: { orderBy: { order: 'asc' } },
            },
          },
        },
      }),
      prisma.userAnswer.findMany({
        where: { attemptId: attempt.id },
      }),
    ]);
    if (!test) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);

    const ansByQ = new Map(answers.map((a) => [a.questionId, a]));

    return ok({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
      },
      test: {
        id: test.id,
        titleKz: test.titleKz,
      },
      questions: test.questions.map((q) => ({
        id: q.id,
        order: q.order,
        textKz: q.textKz,
        imageUrl: q.imageUrl,
        explanationKz: q.explanationKz,
        options: q.options.map((o) => ({
          id: o.id,
          textKz: o.textKz,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
        userAnswer: ansByQ.get(q.id)?.selectedOptionId ?? null,
        isCorrect: ansByQ.get(q.id)?.isCorrect ?? false,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
