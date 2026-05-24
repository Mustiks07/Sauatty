import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { assertCanSubmit } from '@/lib/myTests';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const u = await requireUser();
    await assertCanSubmit(params.id, u.db.id);
    await prisma.test.update({
      where: { id: params.id },
      data: {
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });
    return ok({ id: params.id, status: 'PENDING_REVIEW' });
  } catch (e) {
    return handleError(e);
  }
}
