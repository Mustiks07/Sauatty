// Subject slugs and per-subject configuration. Single source of truth.

export const SUBJECT_SLUGS = {
  matSauattylyq: 'mat-sauattylyq',
  qazaqstanTarihy: 'qazaqstan-tarihy',
} as const;

export const MIN_QUESTIONS_BY_SUBJECT: Record<string, number> = {
  [SUBJECT_SLUGS.matSauattylyq]: 10,
  [SUBJECT_SLUGS.qazaqstanTarihy]: 20,
};

export const DEFAULT_MIN_QUESTIONS = 10;

export function getMinQuestionsForSubject(slug: string): number {
  return MIN_QUESTIONS_BY_SUBJECT[slug] ?? DEFAULT_MIN_QUESTIONS;
}

export const TEST_OPTIONS_COUNT = 4;
