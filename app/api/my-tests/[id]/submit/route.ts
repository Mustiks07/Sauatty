import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { ok, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { assertCanSubmit } from '@/lib/myTests';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const u = await requireUser();
    // Validates content + ownership + cooldown. Pending-cap also checked here
    // but the atomic UPDATE below is the actual source of truth (TOCTOU-safe).
    await assertCanSubmit(params.id, u.db.id);

    try {
      // Atomic state transition. The NOT EXISTS subquery enforces the
      // MAX_USER_PENDING=1 invariant in a single statement; the unique
      // partial index `one_pending_per_author` (migration 0003) is the
      // belt-and-suspenders. Also resets reviewer audit fields so the next
      // moderator sees a clean PENDING entry.
      const affected = await prisma.$executeRaw`
        UPDATE tests
        SET status = 'PENDING_REVIEW',
            submitted_at = NOW(),
            rejection_reason = NULL,
            reviewed_at = NULL,
            reviewed_by_id = NULL
        WHERE id = ${params.id}
          AND author_id = ${u.db.id}::uuid
          AND status IN ('DRAFT', 'REJECTED')
          AND NOT EXISTS (
            SELECT 1 FROM tests
            WHERE author_id = ${u.db.id}::uuid
              AND status = 'PENDING_REVIEW'
          )
      `;
      if (affected === 0) {
        throw new ApiError(
          'CONFLICT',
          'Тест күйі өзгерген — бетті жаңартыңыз',
          409,
        );
      }
    } catch (e) {
      // Partial unique index catches the residual race where two concurrent
      // updates both pass NOT EXISTS before either commits.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ApiError(
          'CONFLICT',
          'Бір уақытта тек 1 тест тексеруде бола алады',
          409,
        );
      }
      throw e;
    }

    return ok({ id: params.id, status: 'PENDING_REVIEW' });
  } catch (e) {
    return handleError(e);
  }
}
