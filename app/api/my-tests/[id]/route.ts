import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { myTestUpdateSchema } from '@/lib/validators/myTest';
import { getOwnedTest, isEditableStatus } from '@/lib/myTests';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const u = await requireUser();
    const test = await getOwnedTest(params.id, u.db.id);
    const full = await prisma.test.findUnique({
      where: { id: test.id },
      include: {
        subject: { select: { id: true, nameKz: true, slug: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
      },
    });
    return ok({ test: full });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const u = await requireUser();
    const test = await getOwnedTest(params.id, u.db.id);
    if (!isEditableStatus(test.status)) {
      throw new ApiError('CONFLICT', 'Тек DRAFT/REJECTED өзгертуге болады', 409);
    }
    const body = myTestUpdateSchema.parse(await req.json());
    await prisma.test.update({ where: { id: params.id }, data: body });
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
    const u = await requireUser();
    const test = await getOwnedTest(params.id, u.db.id);
    if (test.status === 'PUBLISHED') {
      throw new ApiError('FORBIDDEN', 'Жарияланған тестті тек админ жоя алады', 403);
    }
    await prisma.test.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
