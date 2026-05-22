import { prisma } from '@/lib/prisma';

/**
 * Returns questions where the user's LATEST answer (across all finished
 * attempts) was wrong. Questions later answered correctly are excluded.
 */
export async function getUserMistakes(userId: string) {
  // Pull all finished answers for this user, newest first.
  const answers = await prisma.userAnswer.findMany({
    where: {
      attempt: { userId, finishedAt: { not: null } },
    },
    orderBy: { attempt: { finishedAt: 'desc' } },
    include: {
      attempt: { select: { finishedAt: true } },
      question: {
        include: {
          options: { orderBy: { order: 'asc' } },
          test: {
            select: {
              id: true,
              titleKz: true,
              subject: { select: { id: true, slug: true, nameKz: true } },
            },
          },
        },
      },
    },
  });

  // For each question, keep only the LATEST answer.
  const latestByQ = new Map<string, (typeof answers)[number]>();
  for (const a of answers) {
    if (!latestByQ.has(a.questionId)) latestByQ.set(a.questionId, a);
  }

  // Filter to only those where latest is wrong.
  const mistakes = Array.from(latestByQ.values())
    .filter((a) => !a.isCorrect)
    .map((a) => {
      const yourOpt = a.question.options.find((o) => o.id === a.selectedOptionId);
      const correctOpt = a.question.options.find((o) => o.isCorrect);
      return {
        questionId: a.question.id,
        testId: a.question.test.id,
        testTitle: a.question.test.titleKz,
        subject: a.question.test.subject,
        textKz: a.question.textKz,
        imageUrl: a.question.imageUrl,
        explanationKz: a.question.explanationKz,
        options: a.question.options.map((o) => ({
          id: o.id,
          textKz: o.textKz,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
        yourAnswer: yourOpt?.textKz ?? null,
        correctAnswer: correctOpt?.textKz ?? null,
        when: a.attempt.finishedAt,
      };
    });

  return mistakes;
}

export async function countUserMistakes(userId: string): Promise<number> {
  const list = await getUserMistakes(userId);
  return list.length;
}
