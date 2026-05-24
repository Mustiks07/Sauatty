import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import {
  MAX_USER_DRAFTS,
  MAX_USER_PENDING,
  REJECT_COOLDOWN_MS,
  MIN_QUESTIONS_USER_TEST,
  MAX_QUESTIONS_USER_TEST,
  MAX_IMAGES_PER_USER_TEST,
  TEST_OPTIONS_COUNT,
} from '@/lib/constants';

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

export async function assertCanUploadImage(testId: string, userId: string) {
  const test = await getOwnedTest(testId, userId);
  if (!isEditableStatus(test.status)) {
    throw new ApiError(
      'CONFLICT',
      'Тек DRAFT/REJECTED тестке сурет жүктеуге болады',
      409,
    );
  }
  // Лимит картинок: считаем imageUrl + explanationImageUrl
  const qs = await prisma.question.findMany({
    where: { testId },
    select: { imageUrl: true, explanationImageUrl: true },
  });
  const count = qs.reduce(
    (s, q) => s + (q.imageUrl ? 1 : 0) + (q.explanationImageUrl ? 1 : 0),
    0,
  );
  if (count >= MAX_IMAGES_PER_USER_TEST) {
    throw new ApiError(
      'CONFLICT',
      `Лимит: ${MAX_IMAGES_PER_USER_TEST} сурет / тест`,
      409,
    );
  }
  return test;
}
