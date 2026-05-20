import { notFound, redirect } from 'next/navigation';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestRunner, type Question } from '@/components/test/TestRunner';
import { isExpired } from '@/lib/attempt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function TestPage({ params }: { params: { id: string } }) {
  const u = await requireRegularUserPage();

  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: {
            orderBy: { order: 'asc' },
            select: { id: true, textKz: true, order: true },
          },
        },
      },
    },
  });
  if (!test || !test.isPublished) notFound();

  let attempt = await prisma.testAttempt.findFirst({
    where: { userId: u.db.id, testId: test.id, finishedAt: null },
    orderBy: { startedAt: 'desc' },
  });
  if (!attempt) {
    attempt = await prisma.testAttempt.create({
      data: {
        userId: u.db.id,
        testId: test.id,
        totalQuestions: test.questions.length,
      },
    });
  } else if (isExpired(attempt.startedAt, test.timeLimitMinutes)) {
    // Auto-finalize stale attempt and bounce to result.
    const answers = await prisma.userAnswer.findMany({
      where: { attemptId: attempt.id },
      include: {
        question: { include: { options: { select: { id: true, isCorrect: true } } } },
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
    redirect(`/test/${test.id}/result/${attempt.id}`);
  }

  const [existingAnswers, existingDrafts] = await Promise.all([
    prisma.userAnswer.findMany({
      where: { attemptId: attempt.id },
      select: { questionId: true, selectedOptionId: true },
    }),
    prisma.draft.findMany({
      where: { attemptId: attempt.id },
      select: { questionId: true, canvasData: true },
    }),
  ]);

  const initialAnswers: Record<string, string | null> = {};
  for (const a of existingAnswers) initialAnswers[a.questionId] = a.selectedOptionId;
  const initialDrafts: Record<string, string> = {};
  for (const d of existingDrafts) initialDrafts[d.questionId] = d.canvasData;

  const questions: Question[] = test.questions.map((q) => ({
    id: q.id,
    order: q.order,
    textKz: q.textKz,
    imageUrl: q.imageUrl,
    options: q.options,
  }));

  return (
    <TestRunner
      attemptId={attempt.id}
      startedAt={attempt.startedAt.toISOString()}
      timeLimitMinutes={test.timeLimitMinutes}
      test={{ id: test.id, titleKz: test.titleKz }}
      questions={questions}
      initialAnswers={initialAnswers}
      initialDrafts={initialDrafts}
    />
  );
}
