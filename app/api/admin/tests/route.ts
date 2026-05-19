import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { adminTestSchema } from '@/lib/validators/test';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = adminTestSchema.parse(await req.json());
    const test = await prisma.test.create({ data: body });
    return ok({ id: test.id });
  } catch (e) {
    return handleError(e);
  }
}
