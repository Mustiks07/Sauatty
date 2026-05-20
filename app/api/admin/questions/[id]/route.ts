import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { invalidatePublishedTests } from '@/lib/cache';
import { adminQuestionSchema } from '@/lib/validators/test';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const body = adminQuestionSchema.parse(await req.json());

    // Three independent writes — Prisma batch transaction (single SQL transaction,
    // no interactive overhead) plays nicer with PgBouncer than $transaction(fn).
    await prisma.$transaction([
      prisma.question.update({
        where: { id: params.id },
        data: {
          testId: body.testId,
          topicId: body.topicId ?? null,
          order: body.order,
          textKz: body.textKz,
          imageUrl: body.imageUrl ?? null,
          explanationKz: body.explanationKz ?? null,
          explanationImageUrl: body.explanationImageUrl ?? null,
        },
      }),
      prisma.answerOption.deleteMany({ where: { questionId: params.id } }),
      prisma.answerOption.createMany({
        data: body.options.map((o) => ({
          questionId: params.id,
          textKz: o.textKz,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
      }),
    ]);

    invalidatePublishedTests();
    return ok({ id: params.id });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    await prisma.question.delete({ where: { id: params.id } });
    invalidatePublishedTests();
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
