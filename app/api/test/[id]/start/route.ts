import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const u = await requireUser();
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
    if (!test || !test.isPublished) throw new ApiError('NOT_FOUND', 'Тест табылмады', 404);

    // Reuse an unfinished attempt if exists.
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
    }

    return ok({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      timeLimitMinutes: test.timeLimitMinutes,
      test: {
        id: test.id,
        titleKz: test.titleKz,
        descriptionKz: test.descriptionKz,
      },
      questions: test.questions.map((q) => ({
        id: q.id,
        order: q.order,
        textKz: q.textKz,
        imageUrl: q.imageUrl,
        options: q.options,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
