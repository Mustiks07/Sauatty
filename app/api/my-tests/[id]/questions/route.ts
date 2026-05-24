import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { makeMyQuestionSchema } from '@/lib/validators/myTest';
import { assertTestEditableAtomic } from '@/lib/myTests';
import { MAX_QUESTIONS_USER_TEST } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const u = await requireUser();
    await assertTestEditableAtomic(params.id, u.db.id);
    const count = await prisma.question.count({ where: { testId: params.id } });
    if (count >= MAX_QUESTIONS_USER_TEST) {
      throw new ApiError(
        'CONFLICT',
        `Максимум ${MAX_QUESTIONS_USER_TEST} сұрақ`,
        409,
      );
    }
    const body = makeMyQuestionSchema(u.db.id).parse(await req.json());
    const q = await prisma.question.create({
      data: {
        testId: params.id,
        order: body.order,
        textKz: body.textKz,
        imageUrl: body.imageUrl ?? null,
        explanationKz: body.explanationKz ?? null,
        explanationImageUrl: body.explanationImageUrl ?? null,
        options: {
          create: body.options.map((o) => ({
            textKz: o.textKz,
            isCorrect: o.isCorrect,
            order: o.order,
          })),
        },
      },
    });
    return ok({ id: q.id });
  } catch (e) {
    return handleError(e);
  }
}
