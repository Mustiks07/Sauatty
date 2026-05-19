'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Check, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { apiFetch } from '@/lib/api-fetch';
import { cn } from '@/lib/utils';

type Option = { id?: string; textKz: string; isCorrect: boolean; order: number };
type Question = {
  id?: string;
  order: number;
  textKz: string;
  imageUrl: string | null;
  explanationKz: string | null;
  options: Option[];
};

export function TestEditor({
  test,
  questions: initial,
}: {
  test: {
    id: string;
    titleKz: string;
    descriptionKz: string | null;
    timeLimitMinutes: number;
    isPublished: boolean;
  };
  questions: Question[];
}) {
  const router = useRouter();
  const [meta, setMeta] = useState({
    titleKz: test.titleKz,
    descriptionKz: test.descriptionKz ?? '',
    timeLimitMinutes: test.timeLimitMinutes,
  });
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function saveMeta() {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/tests/${test.id}`, {
        method: 'PATCH',
        body: JSON.stringify(meta),
      });
      toast.success('Сақталды');
    } finally {
      setSaving(false);
    }
  }

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      {
        order: qs.length + 1,
        textKz: '',
        imageUrl: null,
        explanationKz: null,
        options: [1, 2, 3, 4].map((n) => ({
          textKz: '',
          isCorrect: n === 1,
          order: n,
        })),
      },
    ]);
  }

  async function saveQuestion(idx: number) {
    const q = questions[idx];
    if (q.options.filter((o) => o.isCorrect).length !== 1) {
      toast.error('Дәл бір дұрыс жауап болуы керек');
      return;
    }
    if (q.options.length !== 4) {
      toast.error('4 нұсқа болуы керек');
      return;
    }
    try {
      const saved = await apiFetch<{ id: string }>(
        `/api/admin/questions${q.id ? `/${q.id}` : ''}`,
        {
          method: q.id ? 'PATCH' : 'POST',
          body: JSON.stringify({
            testId: test.id,
            order: q.order,
            textKz: q.textKz,
            imageUrl: q.imageUrl,
            explanationKz: q.explanationKz,
            options: q.options.map((o, i) => ({
              textKz: o.textKz,
              isCorrect: o.isCorrect,
              order: i + 1,
            })),
          }),
        },
      );
      setQuestions((qs) => {
        const next = [...qs];
        next[idx] = { ...q, id: saved.id };
        return next;
      });
      toast.success('Сұрақ сақталды');
    } catch {}
  }

  function moveQuestion(idx: number, dir: -1 | 1) {
    setQuestions((qs) => {
      const target = idx + dir;
      if (target < 0 || target >= qs.length) return qs;
      const next = [...qs];
      [next[idx], next[target]] = [next[target], next[idx]];
      // Re-number sequentially.
      return next.map((q, i) => ({ ...q, order: i + 1 }));
    });
  }

  async function removeQuestion(idx: number) {
    const q = questions[idx];
    if (q.id && !confirm('Жоюды растайсың ба?')) return;
    if (q.id) {
      await apiFetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' });
    }
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  async function togglePublish() {
    setPublishing(true);
    try {
      await apiFetch(`/api/admin/tests/${test.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !test.isPublished }),
      });
      toast.success(test.isPublished ? 'Жариялаудан алып тасталды' : 'Жарияланды');
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <h1 className="sa-display text-[24px] font-semibold tracking-[-0.02em]">
          Тестті өңдеу
        </h1>
        <div className="flex gap-2.5 items-center">
          {test.isPublished ? (
            <Badge tone="green">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Live
            </Badge>
          ) : (
            <Badge tone="gray">Драфт</Badge>
          )}
          <Button variant="secondary" onClick={togglePublish} disabled={publishing}>
            {test.isPublished ? 'Жариялауды алып тастау' : 'Жариялау'}
          </Button>
          <Button onClick={saveMeta} disabled={saving}>
            <Check size={14} /> Сақтау
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Атауы</Label>
            <Input
              value={meta.titleKz}
              onChange={(e) => setMeta({ ...meta, titleKz: e.target.value })}
            />
          </div>
          <div>
            <Label>Уақыт (минут)</Label>
            <Input
              type="number"
              min={1}
              max={180}
              value={meta.timeLimitMinutes}
              onChange={(e) =>
                setMeta({ ...meta, timeLimitMinutes: Number(e.target.value) })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>Сипаттама</Label>
            <Textarea
              rows={2}
              value={meta.descriptionKz}
              onChange={(e) => setMeta({ ...meta, descriptionKz: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="sa-display text-[20px] font-semibold tracking-[-0.015em]">
          Сұрақтар ({questions.length})
        </h2>
        <Button variant="secondary" onClick={addQuestion}>
          <Plus size={14} /> Сұрақ қосу
        </Button>
      </div>

      {questions.map((q, idx) => (
        <Card key={q.id ?? `new-${idx}`} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 text-[13px] font-semibold text-fg-muted uppercase tracking-[0.05em]">
              <GripVertical size={14} /> Сұрақ {String(q.order).padStart(2, '0')}
            </div>
            <div className="flex gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveQuestion(idx, -1)}
                disabled={idx === 0}
                aria-label="Жоғары"
              >
                <ChevronUp size={16} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveQuestion(idx, 1)}
                disabled={idx === questions.length - 1}
                aria-label="Төмен"
              >
                <ChevronDown size={16} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeQuestion(idx)}>
                <Trash2 size={14} />
              </Button>
              <Button size="sm" onClick={() => saveQuestion(idx)}>
                <Check size={14} /> Сақтау
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Сұрақ мәтіні</Label>
              <Textarea
                rows={3}
                value={q.textKz}
                onChange={(e) =>
                  setQuestions((qs) => {
                    const next = [...qs];
                    next[idx] = { ...q, textKz: e.target.value };
                    return next;
                  })
                }
              />
            </div>
            <div>
              <Label>Сурет / диаграмма (қалауыңша)</Label>
              <ImageUpload
                value={q.imageUrl}
                onChange={(url) =>
                  setQuestions((qs) => {
                    const next = [...qs];
                    next[idx] = { ...q, imageUrl: url };
                    return next;
                  })
                }
              />
            </div>
            <div>
              <Label>Жауап нұсқалары</Label>
              <div className="flex flex-col gap-2.5">
                {q.options.map((o, oi) => {
                  const letter = ['A', 'B', 'C', 'D'][oi];
                  return (
                    <div
                      key={oi}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-md border',
                        o.isCorrect
                          ? 'bg-success-light border-success/40'
                          : 'bg-bg-alt border-border',
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          o.isCorrect
                            ? 'bg-success text-white'
                            : 'bg-white text-fg-muted border border-border-strong',
                        )}
                      >
                        {letter}
                      </div>
                      <Input
                        className="flex-1 bg-white"
                        value={o.textKz}
                        onChange={(e) =>
                          setQuestions((qs) => {
                            const next = [...qs];
                            const opts = [...q.options];
                            opts[oi] = { ...o, textKz: e.target.value };
                            next[idx] = { ...q, options: opts };
                            return next;
                          })
                        }
                      />
                      <label className="flex items-center gap-1.5 text-[13px] font-medium cursor-pointer px-2 select-none">
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={o.isCorrect}
                          onChange={() =>
                            setQuestions((qs) => {
                              const next = [...qs];
                              next[idx] = {
                                ...q,
                                options: q.options.map((oo, k) => ({
                                  ...oo,
                                  isCorrect: k === oi,
                                })),
                              };
                              return next;
                            })
                          }
                          className="accent-success w-4 h-4"
                        />
                        Дұрыс
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Түсініктеме (қате жауапта көрсетіледі)</Label>
              <Textarea
                rows={2}
                value={q.explanationKz ?? ''}
                onChange={(e) =>
                  setQuestions((qs) => {
                    const next = [...qs];
                    next[idx] = { ...q, explanationKz: e.target.value || null };
                    return next;
                  })
                }
              />
            </div>
          </div>
        </Card>
      ))}

      {questions.length === 0 && (
        <Card className="p-10 text-center text-fg-muted">
          Сұрақ жоқ. «Сұрақ қосу» арқылы алғашқысын құрыңыз.
        </Card>
      )}
    </div>
  );
}
