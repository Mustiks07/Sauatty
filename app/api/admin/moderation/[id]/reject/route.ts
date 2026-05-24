import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { rejectSchema } from '@/lib/validators/myTest';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdmin();
    const body = rejectSchema.parse(await req.json());
    const test = await prisma.test.findUnique({ where: { id: params.id } });
    if (!test) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);
    if (test.status !== 'PENDING_REVIEW') {
      throw new ApiError('CONFLICT', 'Тек PENDING_REVIEW қайтаруға болады', 409);
    }
    await prisma.test.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: admin.db.id,
        rejectionReason: body.reason,
      },
    });
    return ok({ id: params.id, status: 'REJECTED' });
  } catch (e) {
    return handleError(e);
  }
}
