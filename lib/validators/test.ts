import { z } from 'zod';

export const answerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1).nullable(),
});

export const draftSchema = z.object({
  questionId: z.string().min(1),
  canvasData: z.string().max(1_000_000, 'Қаралама тым үлкен'),
});

export const adminTestSchema = z.object({
  subjectId: z.string().min(1),
  titleKz: z.string().min(1).max(160),
  descriptionKz: z.string().max(500).optional().nullable(),
  timeLimitMinutes: z.number().int().min(1).max(180),
  hasCalculator: z.boolean().optional(),
  hasDraftCanvas: z.boolean().optional(),
});

export const adminQuestionSchema = z.object({
  testId: z.string().min(1),
  topicId: z.string().nullable().optional(),
  order: z.number().int().min(1),
  textKz: z.string().min(1),
  imageUrl: z.string().url().nullable().optional(),
  explanationKz: z.string().nullable().optional(),
  explanationImageUrl: z.string().url().nullable().optional(),
  options: z
    .array(
      z.object({
        textKz: z.string().min(1),
        isCorrect: z.boolean(),
        order: z.number().int().min(1).max(10),
      }),
    )
    .length(4, '4 нұсқа болуы керек')
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: 'Дәл бір дұрыс жауап болуы керек',
    }),
});
