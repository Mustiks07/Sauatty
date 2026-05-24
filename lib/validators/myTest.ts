import { z } from 'zod';
import { TEST_OPTIONS_COUNT, MAX_QUESTIONS_USER_TEST } from '@/lib/constants';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

/**
 * URL must point at this user's own upload folder under the
 * `question-images` bucket. Prevents user B from referencing user A's
 * uploaded image (cross-user data referencing + storage scraping).
 */
function makeUserImageUrl(userId: string) {
  return z
    .string()
    .url()
    .refine(
      (url) => {
        if (!SUPABASE_URL) return true; // local dev without env
        if (!url.startsWith(SUPABASE_URL)) return false;
        // Path must contain /user-uploads/<userId>/
        return url.includes(`/user-uploads/${userId}/`);
      },
      { message: 'Сурет тек өз жүктеп салған файлдарыңыздан болуы керек' },
    );
}

export const myTestCreateSchema = z.object({
  subjectId: z.string().min(1),
  titleKz: z.string().min(3).max(160),
  descriptionKz: z.string().max(500).optional().nullable(),
  timeLimitMinutes: z.number().int().min(5).max(180).optional(),
  hasCalculator: z.boolean().optional(),
  hasDraftCanvas: z.boolean().optional(),
});

export const myTestUpdateSchema = z.object({
  titleKz: z.string().min(3).max(160).optional(),
  descriptionKz: z.string().max(500).nullable().optional(),
  timeLimitMinutes: z.number().int().min(5).max(180).optional(),
  hasCalculator: z.boolean().optional(),
  hasDraftCanvas: z.boolean().optional(),
});

/**
 * Builds a question schema bound to a specific user. Image URLs must
 * live under that user's upload folder.
 */
export function makeMyQuestionSchema(userId: string) {
  const userImageUrl = makeUserImageUrl(userId);
  return z.object({
    order: z
      .number()
      .int()
      .min(1)
      .max(MAX_QUESTIONS_USER_TEST, `Реті ${MAX_QUESTIONS_USER_TEST}-ден аспауы керек`),
    textKz: z.string().min(1).max(2000),
    imageUrl: userImageUrl.nullable().optional(),
    explanationKz: z.string().max(2000).nullable().optional(),
    explanationImageUrl: userImageUrl.nullable().optional(),
    options: z
      .array(
        z.object({
          textKz: z.string().min(1).max(500),
          isCorrect: z.boolean(),
          order: z.number().int().min(1).max(10),
        }),
      )
      .length(TEST_OPTIONS_COUNT, '4 нұсқа болуы керек')
      .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
        message: 'Дәл бір дұрыс жауап болуы керек',
      }),
  });
}

export const rejectSchema = z.object({
  reason: z.string().min(3).max(500),
});
