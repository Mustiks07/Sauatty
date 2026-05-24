import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { invalidateSubjects, invalidatePublishedTests } from '@/lib/cache';
import { subjectUpdateSchema } from '@/lib/validators/subject';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const body = subjectUpdateSchema.parse(await req.json());
    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: body,
    });
    invalidateSubjects();
    invalidatePublishedTests();
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
    // Не даём удалить если есть тесты — иначе каскадом убьём учебные данные.
    const testCount = await prisma.test.count({ where: { subjectId: params.id } });
    if (testCount > 0) {
      throw new ApiError(
        'CONFLICT',
        `Пәнде ${testCount} тест бар, алдымен оларды жойыңыз`,
        409,
      );
    }
    await prisma.subject.delete({ where: { id: params.id } });
    invalidateSubjects();
    invalidatePublishedTests();
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
