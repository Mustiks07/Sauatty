'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, FieldError } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api-fetch';

export function NewUserTestForm({
  subjects,
}: {
  subjects: { id: string; nameKz: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [titleKz, setTitleKz] = useState('');
  const [descriptionKz, setDescriptionKz] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(80);
  const [hasCalculator, setHasCalculator] = useState(false);
  const [hasDraftCanvas, setHasDraftCanvas] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (titleKz.trim().length < 3) {
      setErr('Атау тым қысқа');
      return;
    }
    setPending(true);
    try {
      const created = await apiFetch<{ id: string }>('/api/my-tests', {
        method: 'POST',
        body: JSON.stringify({
          subjectId,
          titleKz: titleKz.trim(),
          descriptionKz: descriptionKz.trim() || null,
          timeLimitMinutes,
          hasCalculator,
          hasDraftCanvas,
        }),
      });
      router.push(`/my-tests/${created.id}/edit`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Қате');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <Label>Пән (бейіндік)</Label>
          <select
            className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-[15px]"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameKz}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Тест атауы</Label>
          <Input
            placeholder="Механика негіздері"
            value={titleKz}
            onChange={(e) => setTitleKz(e.target.value)}
          />
        </div>
        <div>
          <Label>Сипаттама (қалауыңша)</Label>
          <Textarea
            rows={3}
            value={descriptionKz}
            onChange={(e) => setDescriptionKz(e.target.value)}
          />
        </div>
        <div>
          <Label>Уақыт лимиті (минут)</Label>
          <Input
            type="number"
            min={5}
            max={180}
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
          />
          <p className="text-[12px] text-fg-muted mt-1">
            Әдетте 40 сұраққа 80 минут
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-3 p-3.5 rounded-md border border-border cursor-pointer hover:bg-bg-alt">
            <input
              type="checkbox"
              checked={hasCalculator}
              onChange={(e) => setHasCalculator(e.target.checked)}
              className="mt-1 w-4 h-4 accent-brand"
            />
            <div>
              <div className="text-sm font-semibold">Калькулятор</div>
              <div className="text-[12px] text-fg-muted mt-0.5">
                Тест ішінде қолжетімді
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3.5 rounded-md border border-border cursor-pointer hover:bg-bg-alt">
            <input
              type="checkbox"
              checked={hasDraftCanvas}
              onChange={(e) => setHasDraftCanvas(e.target.checked)}
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
        {err && <FieldError>{err}</FieldError>}
        <div className="flex justify-end mt-2">
          <Button type="submit" disabled={pending}>
            {pending ? '...' : 'Жасау'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
