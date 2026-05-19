import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const patchSchema = z.object({
  titleKz: z.string().min(1).max(160).optional(),
  descriptionKz: z.string().max(500).nullable().optional(),
  timeLimitMinutes: z.number().int().min(1).max(180).optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const body = patchSchema.parse(await req.json());

    if (body.isPublished === true) {
      // Publish guard: ≥10 questions, each with exactly 4 options and one correct.
      const test = await prisma.test.findUnique({
        where: { id: params.id },
        include: {
          questions: { include: { options: true } },
        },
      });
      if (!test) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);
      if (test.questions.length < 10) {
        throw new ApiError('VALIDATION_ERROR', 'Кемінде 10 сұрақ керек', 422);
      }
      for (const q of test.questions) {
        if (q.options.length !== 4) {
          throw new ApiError(
            'VALIDATION_ERROR',
            `Сұрақта 4 нұсқа болуы керек: #${q.order}`,
            422,
          );
        }
        if (q.options.filter((o) => o.isCorrect).length !== 1) {
          throw new ApiError(
            'VALIDATION_ERROR',
            `Сұрақта дәл 1 дұрыс жауап: #${q.order}`,
            422,
          );
        }
      }
    }

    const updated = await prisma.test.update({
      where: { id: params.id },
      data: body,
    });
    return ok({ id: updated.id });
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
    await prisma.test.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
