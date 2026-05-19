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
  subjects: { id: string; nameKz: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(adminTestSchema),
    defaultValues: {
      subjectId: subjects[0]?.id,
      timeLimitMinutes: 20,
    },
  });

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
            {...register('subjectId')}
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
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <Button type="submit" disabled={pending}>
            {pending ? '...' : 'Жасау'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
