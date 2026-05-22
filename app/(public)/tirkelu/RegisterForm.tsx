'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { PhoneField } from '@/components/ui/PhoneField';
import { registerSchema } from '@/lib/validators/auth';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

type Values = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: true as true },
  });

  async function onSubmit(values: Values) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      phone: values.phone,
      password: values.password,
      options: { data: { name: values.name } },
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="name">{t('auth.name')}</Label>
        <Input id="name" placeholder={t('auth.name_ph')} {...register('name')} />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <PhoneField
        control={control}
        name="phone"
        label={t('auth.phone')}
        error={errors.phone?.message}
      />
      <div>
        <Label htmlFor="password">{t('auth.password')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={show ? 'text' : 'password'}
            placeholder={t('auth.password_hint')}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted p-1"
            aria-label="show password"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FieldError>{errors.password?.message}</FieldError>
      </div>
      <div>
        <label className="flex items-start gap-2.5 text-[13px] text-fg-muted leading-[1.5] -mt-0.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-brand"
            {...register('terms')}
          />
          <span>
            <a href="/terms" target="_blank" className="text-brand underline">
              {t('auth.terms')}
            </a>{' '}
            {t('auth.and')}{' '}
            <a href="/privacy" target="_blank" className="text-brand underline">
              {t('auth.privacy')}
            </a>{' '}
            {t('auth.terms_accept')}
          </span>
        </label>
        <FieldError>{errors.terms?.message as string | undefined}</FieldError>
      </div>
      <Button type="submit" className="w-full mt-1" disabled={pending}>
        {pending ? '...' : t('auth.register')}
      </Button>
    </form>
  );
}
