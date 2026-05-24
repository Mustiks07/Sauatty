import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { invalidatePublishedTests } from '@/lib/cache';

export const runtime = 'nodejs';

const patchSchema = z.object({
  titleKz: z.string().min(1).max(160).optional(),
  descriptionKz: z.string().max(500).nullable().optional(),
  timeLimitMinutes: z.number().int().min(1).max(180).optional(),
  hasCalculator: z.boolean().optional(),
  hasDraftCanvas: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdmin();
    const body = patchSchema.parse(await req.json());

    // Fetch existing for status guards (always — also used by publish validation)
    const existing = await prisma.test.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
        questions: { include: { options: true } },
      },
    });
    if (!existing) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);

    // Guard: admin must use /admin/moderation flow for PENDING_REVIEW.
    // Don't let isPublished:false silently downgrade a pending submission.
    if (body.isPublished === false && existing.status === 'PENDING_REVIEW') {
      throw new ApiError(
        'CONFLICT',
        'Тест тексеруде — /admin/moderation арқылы өңдеңіз',
        409,
      );
    }

    if (body.isPublished === true) {
      const { getMinQuestionsForSubject } = await import('@/lib/constants');
      const minQuestions = getMinQuestionsForSubject(
        existing.subject.slug,
        existing.subject.kind,
      );
      if (existing.questions.length < minQuestions) {
        throw new ApiError(
          'VALIDATION_ERROR',
          `Кемінде ${minQuestions} сұрақ керек`,
          422,
        );
      }
      for (const q of existing.questions) {
        if (!q.textKz.trim()) {
          throw new ApiError(
            'VALIDATION_ERROR',
            `Сұрақ мәтіні бос: #${q.order}`,
            422,
          );
        }
        if (q.options.length !== 4) {
          throw new ApiError(
            'VALIDATION_ERROR',
            `Сұрақта 4 нұсқа болуы керек: #${q.order}`,
            422,
          );
        }
        if (q.options.some((o) => !o.textKz.trim())) {
          throw new ApiError(
            'VALIDATION_ERROR',
            `Бос нұсқа бар: #${q.order}`,
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

    // Sync status + audit fields when admin toggles isPublished.
    const data: Prisma.TestUpdateInput = { ...body };
    if (body.isPublished === true) {
      data.status = 'PUBLISHED';
      data.reviewedAt = new Date();
      data.reviewedBy = { connect: { id: admin.db.id } };
      data.rejectionReason = null;
    } else if (body.isPublished === false) {
      // existing.status is PUBLISHED, DRAFT, or REJECTED here (PENDING blocked above)
      data.status = 'DRAFT';
    }

    const updated = await prisma.test.update({
      where: { id: params.id },
      data,
    });
    // Invalidate only when something visible to the public dashboard changed.
    if (body.isPublished !== undefined || existing.status === 'PUBLISHED') {
      invalidatePublishedTests();
    }
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
    // Guard: don't let admin silently destroy a PENDING_REVIEW submission via the legacy editor.
    // For PENDING tests admin must use moderation /reject (which records a reason).
    const existing = await prisma.test.findUnique({
      where: { id: params.id },
      select: { status: true, authorId: true },
    });
    if (!existing) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);
    if (existing.status === 'PENDING_REVIEW' && existing.authorId) {
      throw new ApiError(
        'CONFLICT',
        'Тексерудегі пайдаланушы тесін /admin/moderation арқылы қайтарыңыз',
        409,
      );
    }
    await prisma.test.delete({ where: { id: params.id } });
    invalidatePublishedTests();
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
