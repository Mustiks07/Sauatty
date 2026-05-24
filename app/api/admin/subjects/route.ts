import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
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

    try {
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
      // Race-safe: if a parallel admin took the slug, unique constraint
      // throws P2002 — return a clean 409 instead of generic 500.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ApiError('CONFLICT', 'Slug бос емес', 409);
      }
      throw e;
    }
  } catch (e) {
    return handleError(e);
  }
}
