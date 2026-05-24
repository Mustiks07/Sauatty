import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { invalidateSubjects, invalidatePublishedTests } from '@/lib/cache';
import { subjectCreateSchema } from '@/lib/validators/subject';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = subjectCreateSchema.parse(await req.json());

    const exists = await prisma.subject.findUnique({ where: { slug: body.slug } });
    if (exists) {
      throw new ApiError('CONFLICT', 'Slug бос емес', 409);
    }

    const subject = await prisma.subject.create({
      data: {
        nameKz: body.nameKz,
        slug: body.slug,
        kind: body.kind,
        order: body.order ?? 100,
      },
    });
    invalidateSubjects();
    invalidatePublishedTests();
    return ok({ id: subject.id });
  } catch (e) {
    return handleError(e);
  }
}
