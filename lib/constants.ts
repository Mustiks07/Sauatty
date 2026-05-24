// Subject slugs and per-subject configuration. Single source of truth.

export const SUBJECT_SLUGS = {
  matSauattylyq: 'mat-sauattylyq',
  qazaqstanTarihy: 'qazaqstan-tarihy',
} as const;

export const MIN_QUESTIONS_BY_SUBJECT: Record<string, number> = {
  [SUBJECT_SLUGS.matSauattylyq]: 10,
  [SUBJECT_SLUGS.qazaqstanTarihy]: 20,
};

// Дефолт для CORE-предметов без явной записи.
export const DEFAULT_MIN_QUESTIONS = 10;
// Для PROFILE (бейіндік) предметов — совпадает с user-generated минимумом,
// чтобы админ мог опубликовать профильный тест начиная с 5 вопросов.
export const PROFILE_MIN_QUESTIONS = 5;

export function getMinQuestionsForSubject(
  slug: string,
  kind: 'CORE' | 'PROFILE' = 'CORE',
): number {
  if (MIN_QUESTIONS_BY_SUBJECT[slug] != null) return MIN_QUESTIONS_BY_SUBJECT[slug];
  return kind === 'PROFILE' ? PROFILE_MIN_QUESTIONS : DEFAULT_MIN_QUESTIONS;
}

export const TEST_OPTIONS_COUNT = 4;

// User-generated tests
export const MIN_QUESTIONS_USER_TEST = 5;
export const MAX_QUESTIONS_USER_TEST = 50;
export const MAX_USER_DRAFTS = 3;            // юзер может иметь до 3 DRAFT одновременно
export const MAX_USER_PENDING = 1;           // и только 1 в PENDING_REVIEW
export const REJECT_COOLDOWN_MS = 60 * 60_000; // 1 час перед re-submit после REJECTED
export const MAX_IMAGES_PER_USER_TEST = 20;
export const USER_UPLOAD_MAX_BYTES = 2_000_000; // 2 MB

// Profile subject defaults (admin-created PROFILE Subject)
export const PROFILE_DEFAULT_QUESTIONS = 40;
export const PROFILE_DEFAULT_TIME_MINUTES = 80;
