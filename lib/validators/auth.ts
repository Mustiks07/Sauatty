import { z } from 'zod';
import { PHONE_REGEX, PASSWORD_MIN } from '@/lib/utils';

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, 'Дұрыс қазақстандық нөмір енгізіңіз: +77XXXXXXXXX');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Кемінде ${PASSWORD_MIN} таңба`)
  .regex(/[A-Za-zӘәҢңҒғҮүҰұҚқӨөҺһІі]/, 'Кемінде бір әріп')
  .regex(/[0-9]/, 'Кемінде бір сан');

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Атыңды енгіз').max(60),
  phone: phoneSchema,
  password: passwordSchema,
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Шарттарды қабылдау керек' }),
  }),
});

export const onboardingSchema = z.object({
  phone: phoneSchema,
});
