import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

export async function getAttemptOwned(attemptId: string, userId: string) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: { test: true },
  });
  if (!attempt) throw new ApiError('NOT_FOUND', 'Попытка табылмады', 404);
  if (attempt.userId !== userId) throw new ApiError('FORBIDDEN', 'Рұқсат жоқ', 403);
  return attempt;
}

export function deadlineMs(startedAt: Date, timeLimitMinutes: number): number {
  return startedAt.getTime() + timeLimitMinutes * 60_000 + 10_000; // 10s grace
}

export function isExpired(startedAt: Date, timeLimitMinutes: number, now = Date.now()) {
  return now > deadlineMs(startedAt, timeLimitMinutes);
}
