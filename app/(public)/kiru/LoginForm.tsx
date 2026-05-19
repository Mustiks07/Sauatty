'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { loginSchema } from '@/lib/validators/auth';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

type Values = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: Values) {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      phone: values.phone,
      password: values.password,
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
        <Label htmlFor="phone">{t('auth.phone')}</Label>
        <Input id="phone" placeholder={t('auth.phone_ph')} {...register('phone')} />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>
      <div>
        <div className="flex justify-between items-end mb-1.5">
          <Label htmlFor="password" className="mb-0">
            {t('auth.password')}
          </Label>
          <Link href="#" className="text-[13px] text-brand font-medium">
            {t('auth.forgot')}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={show ? 'text' : 'password'}
            placeholder={t('auth.password_ph')}
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
      <Button type="submit" className="w-full mt-1" disabled={pending}>
        {pending ? '...' : t('auth.login')}
      </Button>
    </form>
  );
}
