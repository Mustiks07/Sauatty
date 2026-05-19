import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { getAttemptOwned } from '@/lib/attempt';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: { attemptId: string } },
) {
  try {
    const u = await requireUser();
    const attempt = await getAttemptOwned(params.attemptId, u.db.id);
    if (attempt.finishedAt) {
      return ok({
        attemptId: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
      });
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

    // 3 independent writes — run in parallel, no interactive transaction
    // (PgBouncer transaction mode is unfriendly to those).
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

    return ok({
      attemptId: attempt.id,
      score,
      totalQuestions: attempt.totalQuestions,
    });
  } catch (e) {
    return handleError(e);
  }
}
