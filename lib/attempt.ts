import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

export async function getAttemptOwned(attemptId: string, userId: string) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: { test: true },
  });
  if (!attempt) throw new ApiError('NOT_FOUND', 'Тапсыру табылмады', 404);
  if (attempt.userId !== userId) throw new ApiError('FORBIDDEN', 'Рұқсат жоқ', 403);
  return attempt;
}

export function deadlineMs(startedAt: Date, timeLimitMinutes: number): number {
  return startedAt.getTime() + timeLimitMinutes * 60_000 + 10_000; // 10s grace
}

export function isExpired(startedAt: Date, timeLimitMinutes: number, now = Date.now()) {
  return now > deadlineMs(startedAt, timeLimitMinutes);
}

/**
 * Finalize an attempt: compute `isCorrect` on each answer, sum score, set finishedAt.
 * Idempotent if already finished. Uses parallel updateMany (no interactive
 * transaction) for PgBouncer compatibility.
 */
export async function finalizeAttempt(attemptId: string): Promise<{
  attemptId: string;
  score: number;
  totalQuestions: number;
}> {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt) throw new ApiError('NOT_FOUND', 'Тапсыру табылмады', 404);
  if (attempt.finishedAt) {
    return {
      attemptId: attempt.id,
      score: attempt.score ?? 0,
      totalQuestions: attempt.totalQuestions,
    };
  }

  const answers = await prisma.userAnswer.findMany({
    where: { attemptId: attempt.id },
    include: {
      question: {
        include: { options: { select: { id: true, isCorrect: true } } },
      },
    },
  });

  let score = 0;
  const correctIds: string[] = [];
  const wrongIds: string[] = [];
  for (const a of answers) {
    const correctId = a.question.options.find((o) => o.isCorrect)?.id;
    const isCorrect = !!a.selectedOptionId && a.selectedOptionId === correctId;
    if (isCorrect) {
      score += 1;
      correctIds.push(a.id);
    } else {
      wrongIds.push(a.id);
    }
  }

  await Promise.all([
    correctIds.length
      ? prisma.userAnswer.updateMany({
          where: { id: { in: correctIds } },
          data: { isCorrect: true },
        })
      : Promise.resolve(),
    wrongIds.length
      ? prisma.userAnswer.updateMany({
          where: { id: { in: wrongIds } },
          data: { isCorrect: false },
        })
      : Promise.resolve(),
    prisma.testAttempt.update({
      where: { id: attempt.id },
      data: { score, finishedAt: new Date() },
    }),
  ]);

  return {
    attemptId: attempt.id,
    score,
    totalQuestions: attempt.totalQuestions,
  };
}
