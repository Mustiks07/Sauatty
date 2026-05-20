'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, FieldError } from '@/components/ui/Input';
import { adminTestSchema } from '@/lib/validators/test';
import { apiFetch } from '@/lib/api-fetch';

type Values = z.infer<typeof adminTestSchema>;

export function NewTestForm({
  subjects,
}: {
  subjects: { id: string; nameKz: string; slug: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(adminTestSchema),
    defaultValues: {
      subjectId: subjects[0]?.id,
      timeLimitMinutes: 20,
      hasCalculator: true,
      hasDraftCanvas: true,
    },
  });

  const subjectId = watch('subjectId');
  const subject = subjects.find((s) => s.id === subjectId);
  const isHistory = subject?.slug === 'qazaqstan-tarihy';
  const hasCalculator = watch('hasCalculator');
  const hasDraftCanvas = watch('hasDraftCanvas');

  async function onSubmit(values: Values) {
    setPending(true);
    try {
      const created = await apiFetch<{ id: string }>('/api/admin/tests', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      router.push(`/admin/test/${created.id}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Label>Пән</Label>
          <select
            className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-[15px]"
            {...register('subjectId', {
              onChange: (e) => {
                const sub = subjects.find((s) => s.id === e.target.value);
                if (sub?.slug === 'qazaqstan-tarihy') {
                  setValue('hasCalculator', false);
                  setValue('hasDraftCanvas', false);
                  setValue('timeLimitMinutes', 40);
                } else {
                  setValue('hasCalculator', true);
                  setValue('hasDraftCanvas', true);
                  setValue('timeLimitMinutes', 20);
                }
              },
            })}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameKz}
              </option>
            ))}
          </select>
          <FieldError>{errors.subjectId?.message}</FieldError>
        </div>
        <div>
          <Label>Тест атауы</Label>
          <Input placeholder="Сандар және өлшемдер" {...register('titleKz')} />
          <FieldError>{errors.titleKz?.message}</FieldError>
        </div>
        <div>
          <Label>Сипаттама (қалауыңша)</Label>
          <Textarea rows={3} {...register('descriptionKz')} />
        </div>
        <div>
          <Label>Уақыт лимиті (минут)</Label>
          <Input
            type="number"
            min={1}
            max={180}
            {...register('timeLimitMinutes', { valueAsNumber: true })}
          />
          <FieldError>{errors.timeLimitMinutes?.message}</FieldError>
          <p className="text-[12px] text-fg-muted mt-1">
            {isHistory
              ? '20 сұрақ × 2 минут = 40 минут (ұсынылған)'
              : '10 сұрақ × 2 минут = 20 минут (ұсынылған)'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-3 p-3.5 rounded-md border border-border cursor-pointer hover:bg-bg-alt">
            <input
              type="checkbox"
              {...register('hasCalculator')}
              className="mt-1 w-4 h-4 accent-brand"
            />
            <div>
              <div className="text-sm font-semibold">Калькулятор</div>
              <div className="text-[12px] text-fg-muted mt-0.5">
                Тест ішінде калькулятор қолжетімді
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3.5 rounded-md border border-border cursor-pointer hover:bg-bg-alt">
            <input
              type="checkbox"
              {...register('hasDraftCanvas')}
              className="mt-1 w-4 h-4 accent-brand"
            />
            <div>
              <div className="text-sm font-semibold">Қаралама</div>
              <div className="text-[12px] text-fg-muted mt-0.5">
                Сурет салуға арналған тақта
              </div>
            </div>
          </label>
        </div>

        {!hasCalculator && !hasDraftCanvas && (
          <div className="p-3 rounded-md bg-bg-alt border border-border text-[13px] text-fg-muted">
            Бұл тестте қосымша құрал болмайды — тек сұрақ + жауап нұсқалары.
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <Button type="submit" disabled={pending}>
            {pending ? '...' : 'Жасау'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
