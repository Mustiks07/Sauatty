import { z } from 'zod';
import { TEST_OPTIONS_COUNT } from '@/lib/constants';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

const supabaseImageUrl = z
  .string()
  .url()
  .refine(
    (url) => !SUPABASE_URL || url.startsWith(SUPABASE_URL),
    { message: 'Тек Supabase storage URL рұқсат етілген' },
  );

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

export const myQuestionSchema = z.object({
  order: z.number().int().min(1),
  textKz: z.string().min(1).max(2000),
  imageUrl: supabaseImageUrl.nullable().optional(),
  explanationKz: z.string().max(2000).nullable().optional(),
  explanationImageUrl: supabaseImageUrl.nullable().optional(),
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

export const rejectSchema = z.object({
  reason: z.string().min(3).max(500),
});
