import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { myTestCreateSchema } from '@/lib/validators/myTest';
import { assertCanCreateDraft } from '@/lib/myTests';
import {
  PROFILE_DEFAULT_TIME_MINUTES,
  PROFILE_DEFAULT_QUESTIONS,
} from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const u = await requireUser();
    const tests = await prisma.test.findMany({
      where: { authorId: u.db.id },
      include: {
        subject: { select: { id: true, nameKz: true, slug: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok({ tests });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const u = await requireUser();
    const body = myTestCreateSchema.parse(await req.json());

    // Только PROFILE предметы для user-generated
    const subject = await prisma.subject.findUnique({
      where: { id: body.subjectId },
    });
    if (!subject) throw new ApiError('NOT_FOUND', 'Пән табылмады', 404);
    if (subject.kind !== 'PROFILE') {
      throw new ApiError(
        'FORBIDDEN',
        'Тек бейіндік пәнге тест жасауға болады',
        403,
      );
    }

    await assertCanCreateDraft(u.db.id);

    const test = await prisma.test.create({
      data: {
        subjectId: body.subjectId,
        authorId: u.db.id,
        titleKz: body.titleKz,
        descriptionKz: body.descriptionKz ?? null,
        timeLimitMinutes: body.timeLimitMinutes ?? PROFILE_DEFAULT_TIME_MINUTES,
        hasCalculator: body.hasCalculator ?? false,
        hasDraftCanvas: body.hasDraftCanvas ?? true,
        status: 'DRAFT',
        isPublished: false,
      },
    });

    return ok({ id: test.id, recommendedQuestions: PROFILE_DEFAULT_QUESTIONS });
  } catch (e) {
    return handleError(e);
  }
}
