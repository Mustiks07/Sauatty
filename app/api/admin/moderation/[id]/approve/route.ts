import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { invalidatePublishedTests } from '@/lib/cache';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdmin();
    const test = await prisma.test.findUnique({
      where: { id: params.id },
      include: { questions: { include: { options: true } } },
    });
    if (!test) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);
    if (test.status !== 'PENDING_REVIEW') {
      throw new ApiError('CONFLICT', 'Тек PENDING_REVIEW бекітуге болады', 409);
    }
    // Жёсткая повторная валидация на сервере
    for (const q of test.questions) {
      if (q.options.length !== 4 || q.options.filter((o) => o.isCorrect).length !== 1) {
        throw new ApiError(
          'VALIDATION_ERROR',
          `Сұрақ #${q.order}: 4 нұсқа + 1 дұрыс керек`,
          422,
        );
      }
    }
    await prisma.test.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
        reviewedAt: new Date(),
        reviewedById: admin.db.id,
        rejectionReason: null,
      },
    });
    invalidatePublishedTests();
    return ok({ id: params.id, status: 'PUBLISHED' });
  } catch (e) {
    return handleError(e);
  }
}
