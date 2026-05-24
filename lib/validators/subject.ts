import { z } from 'zod';

export const SLUG_REGEX = /^[a-z0-9-]+$/;

export const subjectCreateSchema = z.object({
  nameKz: z.string().min(1).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(SLUG_REGEX, 'Тек a-z, 0-9, дефис'),
  order: z.number().int().min(0).max(999).optional(),
  kind: z.enum(['CORE', 'PROFILE']).default('PROFILE'),
});

export const subjectUpdateSchema = z.object({
  nameKz: z.string().min(1).max(80).optional(),
  order: z.number().int().min(0).max(999).optional(),
  kind: z.enum(['CORE', 'PROFILE']).optional(),
});

/** Простой транслит «Физика» → «fizika». */
export function transliterateToSlug(input: string): string {
  const map: Record<string, string> = {
    а: 'a', ә: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo',
    ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n',
    ң: 'n', о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ұ: 'u',
    ү: 'u', ф: 'f', х: 'h', һ: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', і: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return input
    .toLowerCase()
    .split('')
    .map((c) => (map[c] !== undefined ? map[c] : c))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
