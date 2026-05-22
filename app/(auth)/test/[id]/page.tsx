import { notFound, redirect } from 'next/navigation';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestRunner, type Question } from '@/components/test/TestRunner';
import { isExpired, finalizeAttempt } from '@/lib/attempt';

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
  if (test.questions.length === 0) notFound();

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
    await finalizeAttempt(attempt.id);
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
      test={{
        id: test.id,
        titleKz: test.titleKz,
        hasCalculator: test.hasCalculator,
        hasDraftCanvas: test.hasDraftCanvas,
      }}
      questions={questions}
      initialAnswers={initialAnswers}
      initialDrafts={initialDrafts}
    />
  );
}
