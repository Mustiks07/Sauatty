'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { onboardingSchema } from '@/lib/validators/auth';
import { apiFetch } from '@/lib/api-fetch';
import { z } from 'zod';

type Values = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const t = useTranslations();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(onboardingSchema) });

  async function onSubmit(values: Values) {
    setPending(true);
    try {
      await apiFetch('/api/user/onboarding', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      router.push('/dashboard');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="phone">{t('auth.phone')}</Label>
        <Input id="phone" placeholder={t('auth.phone_ph')} {...register('phone')} />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '...' : t('onboarding.submit')}
      </Button>
    </form>
  );
}
