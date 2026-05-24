import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { myQuestionSchema } from '@/lib/validators/myTest';
import { getOwnedTest, isEditableStatus } from '@/lib/myTests';

export const runtime = 'nodejs';

async function assertOwnedQuestion(testId: string, qid: string, userId: string) {
  const test = await getOwnedTest(testId, userId);
  if (!isEditableStatus(test.status)) {
    throw new ApiError('CONFLICT', 'Тек DRAFT/REJECTED өзгертуге болады', 409);
  }
  const q = await prisma.question.findUnique({ where: { id: qid } });
  if (!q || q.testId !== testId) {
    throw new ApiError('NOT_FOUND', 'Сұрақ жоқ', 404);
  }
  return { test, q };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; qid: string } },
) {
  try {
    const u = await requireUser();
    await assertOwnedQuestion(params.id, params.qid, u.db.id);
    const body = myQuestionSchema.parse(await req.json());

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
    await assertOwnedQuestion(params.id, params.qid, u.db.id);
    await prisma.question.delete({ where: { id: params.qid } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
