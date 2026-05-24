'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Check,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Send,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { apiFetch } from '@/lib/api-fetch';
import { cn } from '@/lib/utils';
import {
  MIN_QUESTIONS_USER_TEST,
  MAX_QUESTIONS_USER_TEST,
} from '@/lib/constants';

type TestStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
type Option = { id?: string; textKz: string; isCorrect: boolean; order: number };
type Question = {
  id?: string;
  order: number;
  textKz: string;
  imageUrl: string | null;
  explanationKz: string | null;
  options: Option[];
};

const STATUS_BADGES = {
  DRAFT: { label: 'Драфт', tone: 'gray' as const },
  PENDING_REVIEW: { label: 'Тексеруде', tone: 'amber' as const },
  PUBLISHED: { label: 'Жарияланды', tone: 'green' as const },
  REJECTED: { label: 'Қайтарылды', tone: 'red' as const },
};

export function UserTestEditor({
  test,
  questions: initial,
}: {
  test: {
    id: string;
    titleKz: string;
    descriptionKz: string | null;
    timeLimitMinutes: number;
    hasCalculator: boolean;
    hasDraftCanvas: boolean;
    status: TestStatus;
    rejectionReason: string | null;
    subjectName: string;
  };
  questions: Question[];
}) {
  const router = useRouter();
  const readOnly = test.status === 'PENDING_REVIEW' || test.status === 'PUBLISHED';
  const [meta, setMeta] = useState({
    titleKz: test.titleKz,
    descriptionKz: test.descriptionKz ?? '',
    timeLimitMinutes: test.timeLimitMinutes,
    hasCalculator: test.hasCalculator,
    hasDraftCanvas: test.hasDraftCanvas,
  });
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  function toggleCollapsed(k: string) {
    setCollapsed((c) => ({ ...c, [k]: !c[k] }));
  }
  function setAllCollapsed(v: boolean) {
    const next: Record<string, boolean> = {};
    questions.forEach((q, i) => {
      next[q.id ?? `new-${i}`] = v;
    });
    setCollapsed(next);
  }

  async function saveMeta() {
    setSavingMeta(true);
    try {
      await apiFetch(`/api/my-tests/${test.id}`, {
        method: 'PATCH',
        body: JSON.stringify(meta),
      });
      toast.success('Сақталды');
    } finally {
      setSavingMeta(false);
    }
  }

  function addQuestion() {
    if (questions.length >= MAX_QUESTIONS_USER_TEST) {
      toast.error(`Максимум ${MAX_QUESTIONS_USER_TEST} сұрақ`);
      return;
    }
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

  function validateQuestion(q: Question): string | null {
    if (!q.textKz.trim()) return 'Сұрақ мәтіні бос';
    if (q.options.length !== 4) return '4 нұсқа болуы керек';
    if (q.options.some((o) => !o.textKz.trim())) return 'Бос нұсқа бар';
    if (q.options.filter((o) => o.isCorrect).length !== 1)
      return 'Дәл бір дұрыс жауап болуы керек';
    return null;
  }

  async function saveQuestion(idx: number, silent = false): Promise<boolean> {
    const q = questions[idx];
    const err = validateQuestion(q);
    if (err) {
      if (!silent) toast.error(`#${q.order}: ${err}`);
      return false;
    }
    try {
      const body = {
        order: q.order,
        textKz: q.textKz,
        imageUrl: q.imageUrl,
        explanationKz: q.explanationKz,
        options: q.options.map((o, i) => ({
          textKz: o.textKz,
          isCorrect: o.isCorrect,
          order: i + 1,
        })),
      };
      const saved = await apiFetch<{ id: string }>(
        q.id
          ? `/api/my-tests/${test.id}/questions/${q.id}`
          : `/api/my-tests/${test.id}/questions`,
        {
          method: q.id ? 'PATCH' : 'POST',
          body: JSON.stringify(body),
        },
      );
      setQuestions((qs) => {
        const next = [...qs];
        next[idx] = { ...q, id: saved.id };
        return next;
      });
      if (!silent) toast.success('Сұрақ сақталды');
      return true;
    } catch {
      return false;
    }
  }

  async function saveAll(silent = false): Promise<boolean> {
    setSavingAll(true);
    try {
      for (const q of questions) {
        const err = validateQuestion(q);
        if (err) {
          toast.error(`#${q.order}: ${err}`);
          return false;
        }
      }
      let ok = 0;
      for (let i = 0; i < questions.length; i++) {
        const success = await saveQuestion(i, true);
        if (success) ok += 1;
      }
      if (ok < questions.length) {
        toast.error(`${ok} / ${questions.length} сұрақ сақталды (бір нәрсе қате)`);
        return false;
      }
      if (!silent) toast.success(`${ok} / ${questions.length} сұрақ сақталды`);
      return true;
    } finally {
      setSavingAll(false);
    }
  }

  function moveQuestion(idx: number, dir: -1 | 1) {
    setQuestions((qs) => {
      const target = idx + dir;
      if (target < 0 || target >= qs.length) return qs;
      const next = [...qs];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((q, i) => ({ ...q, order: i + 1 }));
    });
  }

  async function removeQuestion(idx: number) {
    const q = questions[idx];
    if (q.id && !confirm('Жоюды растайсың ба?')) return;
    if (q.id) {
      await apiFetch(`/api/my-tests/${test.id}/questions/${q.id}`, {
        method: 'DELETE',
      });
    }
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  async function deleteTest() {
    setDeleting(true);
    try {
      await apiFetch(`/api/my-tests/${test.id}`, { method: 'DELETE' });
      router.push('/my-tests');
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function submitForReview() {
    if (questions.length < MIN_QUESTIONS_USER_TEST) {
      toast.error(`Кемінде ${MIN_QUESTIONS_USER_TEST} сұрақ керек`);
      return;
    }
    // Сначала сохраним всё. Если что-то упало — не идём дальше.
    const allSaved = await saveAll(true);
    if (!allSaved) return;
    if (!confirm('Тексеруге жіберуді растайсың ба? Жіберген соң өңдей алмайсың.'))
      return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/my-tests/${test.id}/submit`, { method: 'POST' });
      toast.success('Тексеруге жіберілді');
      router.push('/my-tests');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const status = STATUS_BADGES[test.status];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em] mb-0.5">
            {test.subjectName}
          </div>
          <h1 className="sa-display text-[24px] font-semibold tracking-[-0.02em]">
            {meta.titleKz || 'Жаңа тест'}
          </h1>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge tone={status.tone}>{status.label}</Badge>
          {!readOnly && (
            <Button onClick={submitForReview} disabled={submitting}>
              <Send size={14} /> Тексеруге жіберу
            </Button>
          )}
          {test.status !== 'PUBLISHED' && (
            <Button variant="outlineDanger" onClick={() => setShowDelete(true)}>
              <Trash2 size={14} /> Жою
            </Button>
          )}
        </div>
      </div>

      {test.status === 'REJECTED' && test.rejectionReason && (
        <Card className="p-4 bg-error-light border-error/30">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-error mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-error-ink text-sm mb-1">
                Қайтару себебі
              </div>
              <div className="text-[13px] text-error-ink whitespace-pre-wrap">
                {test.rejectionReason}
              </div>
              <div className="text-[12px] text-fg-muted mt-2">
                Сұрақтарды түзе, сосын қайта тексеруге жібер.
              </div>
            </div>
          </div>
        </Card>
      )}

      {test.status === 'PENDING_REVIEW' && (
        <Card className="p-3.5 bg-accent-light border-accent/20 text-[13px]">
          Тест админ тексеруінде. Шешілгенше өңдеу мүмкін емес.
        </Card>
      )}

      {test.status === 'PUBLISHED' && (
        <Card className="p-3.5 bg-success-light border-success/20 text-[13px]">
          Тест жарияланды — басқа оқушылар тапсыра алады. Өзгерту үшін админге
          хабарлас.
        </Card>
      )}

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Атауы</Label>
            <Input
              disabled={readOnly}
              value={meta.titleKz}
              onChange={(e) => setMeta({ ...meta, titleKz: e.target.value })}
            />
          </div>
          <div>
            <Label>Уақыт (минут)</Label>
            <Input
              type="number"
              disabled={readOnly}
              min={5}
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
              disabled={readOnly}
              value={meta.descriptionKz}
              onChange={(e) => setMeta({ ...meta, descriptionKz: e.target.value })}
            />
          </div>
          <label className="flex items-start gap-3 p-3.5 rounded-md border border-border cursor-pointer hover:bg-bg-alt">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={meta.hasCalculator}
              onChange={(e) => setMeta({ ...meta, hasCalculator: e.target.checked })}
              className="mt-1 w-4 h-4 accent-brand"
            />
            <div>
              <div className="text-sm font-semibold">Калькулятор</div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3.5 rounded-md border border-border cursor-pointer hover:bg-bg-alt">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={meta.hasDraftCanvas}
              onChange={(e) =>
                setMeta({ ...meta, hasDraftCanvas: e.target.checked })
              }
              className="mt-1 w-4 h-4 accent-brand"
            />
            <div>
              <div className="text-sm font-semibold">Қаралама</div>
            </div>
          </label>
        </div>
        {!readOnly && (
          <div className="flex justify-end mt-4">
            <Button onClick={saveMeta} disabled={savingMeta}>
              <Check size={14} /> Мәліметті сақтау
            </Button>
          </div>
        )}
      </Card>

      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="sa-display text-[20px] font-semibold tracking-[-0.015em]">
          Сұрақтар ({questions.length} / {MAX_QUESTIONS_USER_TEST})
        </h2>
        {!readOnly && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setAllCollapsed(true)}>
              <ChevronsUp size={14} /> Жинау
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAllCollapsed(false)}>
              <ChevronsDown size={14} /> Ашу
            </Button>
            <Button variant="secondary" onClick={addQuestion}>
              <Plus size={14} /> Сұрақ қосу
            </Button>
            <Button
              onClick={() => saveAll()}
              disabled={savingAll || questions.length === 0}
            >
              <Check size={14} /> Бәрін сақтау
            </Button>
          </div>
        )}
      </div>

      {questions.map((q, idx) => {
        const key = q.id ?? `new-${idx}`;
        const isCollapsed = !!collapsed[key];
        const preview = q.textKz.slice(0, 80) || '(бос сұрақ)';
        return (
          <Card key={key} className={isCollapsed ? 'p-4' : 'p-6'}>
            <div
              className={cn(
                'flex items-start justify-between gap-3',
                !isCollapsed && 'mb-4',
              )}
            >
              <button
                type="button"
                onClick={() => toggleCollapsed(key)}
                className="flex items-center gap-3 text-left min-w-0 flex-1"
              >
                <GripVertical size={14} className="text-fg-muted flex-shrink-0" />
                <span className="text-[13px] font-semibold text-fg-muted uppercase tracking-[0.05em] flex-shrink-0">
                  Сұрақ {String(q.order).padStart(2, '0')}
                </span>
                {isCollapsed && (
                  <span className="text-sm text-fg-muted truncate">{preview}</span>
                )}
                {!q.id && <Badge tone="amber">Жаңа</Badge>}
              </button>
              {!readOnly && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleCollapsed(key)}
                    aria-label="Жинау"
                  >
                    {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveQuestion(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Жоғары"
                  >
                    <ChevronsUp size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveQuestion(idx, 1)}
                    disabled={idx === questions.length - 1}
                    aria-label="Төмен"
                  >
                    <ChevronsDown size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeQuestion(idx)}>
                    <Trash2 size={14} />
                  </Button>
                  <Button size="sm" onClick={() => saveQuestion(idx)}>
                    <Check size={14} /> Сақтау
                  </Button>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Сұрақ мәтіні</Label>
                  <Textarea
                    rows={3}
                    disabled={readOnly}
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
                  <Label>Сурет (қалауыңша)</Label>
                  <ImageUpload
                    endpoint={`/api/my-tests/${test.id}/upload`}
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
                              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              o.isCorrect
                                ? 'bg-success text-white'
                                : 'bg-white text-fg-muted border border-border-strong',
                            )}
                          >
                            {letter}
                          </div>
                          <Input
                            disabled={readOnly}
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
                              disabled={readOnly}
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
                    disabled={readOnly}
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
            )}
          </Card>
        );
      })}

      {questions.length === 0 && (
        <Card className="p-10 text-center text-fg-muted">
          Сұрақ жоқ.{' '}
          {!readOnly && '«Сұрақ қосу» арқылы алғашқысын құрыңыз.'}
        </Card>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] bg-white rounded-xl shadow-modal border border-border p-6 sm:p-7">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-error-light flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-error" />
              </div>
              <div className="flex-1">
                <div className="sa-display text-[19px] font-semibold tracking-[-0.01em]">
                  Тестті жоюды растайсың ба?
                </div>
                <div className="text-sm text-fg-muted mt-1.5 leading-[1.5]">
                  «{meta.titleKz}» тесті, барлық сұрақтары мәңгілікке өшіріледі.
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-5 sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDelete(false)}
                className="w-full sm:w-auto"
              >
                Бас тарту
              </Button>
              <Button
                variant="danger"
                onClick={deleteTest}
                disabled={deleting}
                className="w-full sm:w-auto"
              >
                Жою
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
