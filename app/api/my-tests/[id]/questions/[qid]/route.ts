import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { makeMyQuestionSchema } from '@/lib/validators/myTest';
import { assertTestEditableAtomic } from '@/lib/myTests';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; qid: string } },
) {
  try {
    const u = await requireUser();
    // Atomic editable check — locks the test row from concurrent submit.
    await assertTestEditableAtomic(params.id, u.db.id);
    // Question must belong to this test (after ownership check above).
    const q = await prisma.question.findUnique({
      where: { id: params.qid },
      select: { testId: true },
    });
    if (!q || q.testId !== params.id) {
      throw new ApiError('NOT_FOUND', 'Сұрақ жоқ', 404);
    }

    const body = makeMyQuestionSchema(u.db.id).parse(await req.json());

    await prisma.$transaction([
      prisma.question.update({
        where: { id: params.qid },
        data: {
          order: body.order,
          textKz: body.textKz,
          imageUrl: body.imageUrl ?? null,
          explanationKz: body.explanationKz ?? null,
          explanationImageUrl: body.explanationImageUrl ?? null,
        },
      }),
      prisma.answerOption.deleteMany({ where: { questionId: params.qid } }),
      prisma.answerOption.createMany({
        data: body.options.map((o) => ({
          questionId: params.qid,
          textKz: o.textKz,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
      }),
    ]);
    return ok({ id: params.qid });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; qid: string } },
) {
  try {
    const u = await requireUser();
    await assertTestEditableAtomic(params.id, u.db.id);
    const q = await prisma.question.findUnique({
      where: { id: params.qid },
      select: { testId: true },
    });
    if (!q || q.testId !== params.id) {
      throw new ApiError('NOT_FOUND', 'Сұрақ жоқ', 404);
    }
    await prisma.question.delete({ where: { id: params.qid } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
