import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { adminQuestionSchema } from '@/lib/validators/test';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = adminQuestionSchema.parse(await req.json());
    const q = await prisma.question.create({
      data: {
        testId: body.testId,
        topicId: body.topicId ?? null,
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
