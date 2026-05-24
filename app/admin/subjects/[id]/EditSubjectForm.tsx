'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api-fetch';

export function EditSubjectForm({
  subject,
}: {
  subject: {
    id: string;
    nameKz: string;
    kind: 'CORE' | 'PROFILE';
    order: number;
    testCount: number;
  };
}) {
  const router = useRouter();
  const [nameKz, setNameKz] = useState(subject.nameKz);
  const [kind, setKind] = useState(subject.kind);
  const [order, setOrder] = useState(subject.order);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/subjects/${subject.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ nameKz, kind, order }),
      });
      toast.success('Сақталды');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (subject.testCount > 0) {
      toast.error('Алдымен пәндегі тесттерді жойыңыз');
      return;
    }
    if (!confirm(`«${nameKz}» пәнін жоюды растайсың ба?`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/subjects/${subject.id}`, { method: 'DELETE' });
      router.push('/admin/subjects');
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <div>
          <Label>Атауы</Label>
          <Input value={nameKz} onChange={(e) => setNameKz(e.target.value)} />
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
              <span className="text-sm">Бейіндік</span>
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
        <div className="flex justify-between gap-3 mt-2">
          <Button variant="outlineDanger" onClick={remove} disabled={deleting}>
            <Trash2 size={14} /> Жою
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? '...' : 'Сақтау'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
