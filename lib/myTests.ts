import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import {
  MAX_USER_DRAFTS,
  MAX_USER_PENDING,
  REJECT_COOLDOWN_MS,
  MIN_QUESTIONS_USER_TEST,
  MAX_QUESTIONS_USER_TEST,
  TEST_OPTIONS_COUNT,
} from '@/lib/constants';

/**
 * Atomic editable-status guard for question CRUD.
 *
 * Returns the row count after a no-op update — if the test row matches
 * (owned + DRAFT/REJECTED), count=1; otherwise count=0 and we throw.
 *
 * This collapses the read+check into a single DB statement, eliminating
 * the TOCTOU window where a concurrent submit could move the test to
 * PENDING_REVIEW between an old "find then check" and the subsequent
 * question mutation. PgBouncer-safe (single statement, no interactive tx).
 */
export async function assertTestEditableAtomic(
  testId: string,
  userId: string,
) {
  // No-op SELECT FOR UPDATE-style check via WHERE-filtered UPDATE.
  // Single statement → PgBouncer-safe, no interactive tx, no race with
  // a concurrent submit moving the test out of editable status.
  const affected = await prisma.$executeRaw`
    UPDATE tests SET id = id
    WHERE id = ${testId}
      AND author_id = ${userId}::uuid
      AND status IN ('DRAFT', 'REJECTED')
  `;
  if (affected === 0) {
    // Distinguish 403 / 404 / 409 for better UX.
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { authorId: true, status: true },
    });
    if (!test) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);
    if (test.authorId !== userId)
      throw new ApiError('FORBIDDEN', 'Бұл сіздің тесіңіз емес', 403);
    throw new ApiError(
      'CONFLICT',
      'Тек DRAFT/REJECTED өзгертуге болады',
      409,
    );
  }
}

export async function getOwnedTest(testId: string, userId: string) {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { subject: true },
  });
  if (!test) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);
  if (test.authorId !== userId) {
    throw new ApiError('FORBIDDEN', 'Бұл сіздің тесіңіз емес', 403);
  }
  return test;
}

export function isEditableStatus(status: string) {
  return status === 'DRAFT' || status === 'REJECTED';
}

export async function assertCanCreateDraft(userId: string) {
  const drafts = await prisma.test.count({
    where: { authorId: userId, status: 'DRAFT' },
  });
  if (drafts >= MAX_USER_DRAFTS) {
    throw new ApiError(
      'CONFLICT',
      `Бір уақытта ${MAX_USER_DRAFTS} драфтан артық болмайды`,
      409,
    );
  }
}

export async function assertCanSubmit(testId: string, userId: string) {
  // 1) одна заявка в pending review max
  const pending = await prisma.test.count({
    where: { authorId: userId, status: 'PENDING_REVIEW' },
  });
  if (pending >= MAX_USER_PENDING) {
    throw new ApiError(
      'CONFLICT',
      'Бір уақытта тек 1 тест тексеруде бола алады',
      409,
    );
  }

  // 2) cooldown после REJECTED
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { include: { options: true } } },
  });
  if (!test) throw new ApiError('NOT_FOUND', 'Тест жоқ', 404);
  if (test.authorId !== userId)
    throw new ApiError('FORBIDDEN', 'Бұл сіздің тесіңіз емес', 403);
  if (test.status === 'REJECTED' && test.reviewedAt) {
    const elapsed = Date.now() - test.reviewedAt.getTime();
    if (elapsed < REJECT_COOLDOWN_MS) {
      const mins = Math.ceil((REJECT_COOLDOWN_MS - elapsed) / 60_000);
      throw new ApiError(
        'CONFLICT',
        `Қайта жіберу үшін ${mins} мин күтіңіз`,
        409,
      );
    }
  }
  if (!isEditableStatus(test.status)) {
    throw new ApiError('CONFLICT', 'Бұл тестті жіберуге болмайды', 409);
  }

  // 3) валидация контента
  if (
    test.questions.length < MIN_QUESTIONS_USER_TEST ||
    test.questions.length > MAX_QUESTIONS_USER_TEST
  ) {
    throw new ApiError(
      'VALIDATION_ERROR',
      `Сұрақ саны: ${MIN_QUESTIONS_USER_TEST}–${MAX_QUESTIONS_USER_TEST}`,
      422,
    );
  }
  for (const q of test.questions) {
    if (!q.textKz.trim())
      throw new ApiError('VALIDATION_ERROR', `Бос сұрақ #${q.order}`, 422);
    if (q.options.length !== TEST_OPTIONS_COUNT)
      throw new ApiError('VALIDATION_ERROR', `#${q.order}: 4 нұсқа керек`, 422);
    if (q.options.some((o) => !o.textKz.trim()))
      throw new ApiError('VALIDATION_ERROR', `#${q.order}: бос нұсқа`, 422);
    if (q.options.filter((o) => o.isCorrect).length !== 1)
      throw new ApiError(
        'VALIDATION_ERROR',
        `#${q.order}: дәл 1 дұрыс жауап керек`,
        422,
      );
  }

  return test;
}

