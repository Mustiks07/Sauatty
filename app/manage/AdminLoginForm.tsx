'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { loginSchema } from '@/lib/validators/auth';
import { createClient } from '@/lib/supabase/client';

type Values = z.infer<typeof loginSchema>;

const GENERIC_ERROR = 'Кіру қате. Деректерді тексер.';

export function AdminLoginForm() {
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
    if (error) {
      setPending(false);
      toast.error(GENERIC_ERROR);
      return;
    }
    // Server-side role check — generic error if not admin (don't leak existence).
    const res = await fetch('/api/manage/verify', { method: 'POST' });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.data?.ok) {
      await supabase.auth.signOut();
      setPending(false);
      toast.error(GENERIC_ERROR);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="phone">Телефон</Label>
        <Input id="phone" placeholder="+7..." autoComplete="username" {...register('phone')} />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">Құпиясөз</Label>
        <div className="relative">
          <Input
            id="password"
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
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
        {pending ? '...' : 'Кіру'}
      </Button>
    </form>
  );
}
