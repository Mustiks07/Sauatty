'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api-fetch';
import { transliterateToSlug } from '@/lib/validators/subject';

export function NewSubjectForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [nameKz, setNameKz] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [kind, setKind] = useState<'CORE' | 'PROFILE'>('PROFILE');
  const [order, setOrder] = useState<number>(100);
  const [err, setErr] = useState<string | null>(null);

  function onNameChange(v: string) {
    setNameKz(v);
    if (!slugTouched) setSlug(transliterateToSlug(v));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!nameKz.trim() || !slug.trim()) {
      setErr('Атау мен slug міндетті');
      return;
    }
    setPending(true);
    try {
      await apiFetch('/api/admin/subjects', {
        method: 'POST',
        body: JSON.stringify({ nameKz, slug, kind, order }),
      });
      toast.success('Пән қосылды');
      router.push('/admin/subjects');
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
          <Label>Атауы (қазақша)</Label>
          <Input
            placeholder="Физика"
            value={nameKz}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div>
          <Label>Slug (URL-да)</Label>
          <Input
            placeholder="fizika"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
              setSlugTouched(true);
            }}
          />
          <p className="text-[12px] text-fg-muted mt-1">
            Атаудан автоматты, тек a-z, 0-9, дефис
          </p>
        </div>
        <div>
          <Label>Түрі</Label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={kind === 'PROFILE'}
                onChange={() => setKind('PROFILE')}
                className="accent-brand"
              />
              <span className="text-sm">Бейіндік пән</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={kind === 'CORE'}
                onChange={() => setKind('CORE')}
                className="accent-brand"
              />
              <span className="text-sm">Міндетті</span>
            </label>
          </div>
        </div>
        <div>
          <Label>Реті</Label>
          <Input
            type="number"
            min={0}
            max={999}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        {err && <FieldError>{err}</FieldError>}
        <div className="flex justify-end gap-3 mt-2">
          <Button type="submit" disabled={pending}>
            {pending ? '...' : 'Қосу'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
