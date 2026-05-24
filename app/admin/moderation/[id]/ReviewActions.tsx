'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api-fetch';

export function ReviewActions({ testId }: { testId: string }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);

  async function approve() {
    if (!confirm('Жариялауды растайсың ба?')) return;
    setPending(true);
    try {
      await apiFetch(`/api/admin/moderation/${testId}/approve`, { method: 'POST' });
      toast.success('Жарияланды');
      router.push('/admin/moderation');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function reject() {
    if (reason.trim().length < 3) {
      toast.error('Себебін көрсетіңіз');
      return;
    }
    setPending(true);
    try {
      await apiFetch(`/api/admin/moderation/${testId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      toast.success('Қайтарылды');
      router.push('/admin/moderation');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={approve} disabled={pending}>
          <Check size={14} /> Жариялау
        </Button>
        <Button
          variant="outlineDanger"
          onClick={() => setShowReject((s) => !s)}
          disabled={pending}
        >
          <X size={14} /> Қайтару
        </Button>
      </div>
      {showReject && (
        <div className="flex flex-col gap-2">
          <Textarea
            rows={3}
            placeholder="Себебі (автор көреді)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end">
            <Button variant="danger" onClick={reject} disabled={pending}>
              Қайтаруды растау
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
