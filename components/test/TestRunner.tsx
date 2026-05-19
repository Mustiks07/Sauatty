'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calculator as CalcIcon,
  Pencil,
  Info,
  X as XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SauattyLogo } from '@/components/shared/Logo';
import { Timer } from './Timer';
import { Calculator } from './Calculator';
import { DraftCanvas } from './DraftCanvas';
import { ToolDialog } from './ToolDialog';
import { apiFetch } from '@/lib/api-fetch';
import { cn } from '@/lib/utils';

export type Question = {
  id: string;
  order: number;
  textKz: string;
  imageUrl: string | null;
  options: { id: string; textKz: string; order: number }[];
};

export type StartPayload = {
  attemptId: string;
  startedAt: string;
  timeLimitMinutes: number;
  test: { id: string; titleKz: string };
  questions: Question[];
  initialAnswers?: Record<string, string | null>;
  initialDrafts?: Record<string, string>;
};

export function TestRunner(p: StartPayload) {
  const t = useTranslations();
  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>(
    p.initialAnswers ?? {},
  );
  const [drafts] = useState<Record<string, string>>(p.initialDrafts ?? {});
  const [desktopTool, setDesktopTool] = useState<'calc' | 'sketch'>('calc');
  const [mobileTool, setMobileTool] = useState<'calc' | 'sketch' | null>(null);
  const [sketchFullscreen, setSketchFullscreen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startedAtMs = useMemo(() => new Date(p.startedAt).getTime(), [p.startedAt]);

  const q = p.questions[current];
  const total = p.questions.length;
  const isLast = current === total - 1;
  const isFirst = current === 0;
  const answered = Object.values(answers).filter(Boolean).length;
  const unanswered = total - answered;

  const saveAnswer = useCallback(
    async (questionId: string, optionId: string | null) => {
      setAnswers((a) => ({ ...a, [questionId]: optionId }));
      try {
        await apiFetch(`/api/attempt/${p.attemptId}/answer`, {
          method: 'POST',
          body: JSON.stringify({ questionId, selectedOptionId: optionId }),
        });
      } catch (e: any) {
        if (e?.code === 'TIMEOUT') doFinish(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.attemptId],
  );

  const doFinish = useCallback(
    async (silent = false) => {
      if (finishing) return;
      setFinishing(true);
      try {
        await apiFetch(`/api/attempt/${p.attemptId}/finish`, { method: 'POST' });
        router.push(`/test/${p.test.id}/result/${p.attemptId}`);
        router.refresh();
      } catch {
        if (!silent) setFinishing(false);
      }
    },
    [finishing, p.attemptId, p.test.id, router],
  );

  const onExpire = useCallback(() => {
    toast.error(t('test.timer_expired'));
    doFinish(true);
  }, [doFinish, t]);

  // Keyboard nav (desktop)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx >= 0 && q.options[idx]) {
        saveAnswer(q.id, q.options[idx].id);
        return;
      }
      const letterIdx = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
      if (letterIdx >= 0 && q.options[letterIdx]) {
        saveAnswer(q.id, q.options[letterIdx].id);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!isLast) setCurrent((c) => Math.min(total - 1, c + 1));
        else setShowConfirm(true);
      }
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(0, c - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, isLast, total, saveAnswer]);

  return (
    <div className="bg-bg-alt min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="md:hidden text-fg-muted p-1 hover:text-fg"
              aria-label="Шығу"
            >
              <XIcon size={20} />
            </button>
            <div className="hidden md:flex items-center gap-5">
              <SauattyLogo size={18} />
              <div className="w-px h-5 bg-border" />
              <div className="text-sm text-fg-muted truncate max-w-[280px]">
                <span className="text-fg font-semibold">{p.test.titleKz}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            <div className="hidden lg:flex gap-1.5">
              {p.questions.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 rounded transition-all',
                    i === current
                      ? 'w-6 bg-brand'
                      : answers[p.questions[i].id]
                      ? 'w-2 bg-brand-light'
                      : 'w-2 bg-bg-2',
                  )}
                />
              ))}
            </div>
            <div className="text-[13px] text-fg-muted">
              Сұрақ{' '}
              <span className="sa-num text-fg font-semibold">{current + 1}</span>
              <span className="opacity-50"> / {total}</span>
            </div>
            <Timer
              startedAtMs={startedAtMs}
              timeLimitMinutes={p.timeLimitMinutes}
              onExpire={onExpire}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden md:inline-flex"
            >
              {t('test.exit')}
            </Button>
          </div>
        </div>
        {/* mobile progress bar */}
        <div className="lg:hidden h-[3px] bg-bg-2">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 p-4 md:p-6 pb-32 lg:pb-6 min-h-0">
        {/* Question panel */}
        <Card className="p-6 md:p-10 flex flex-col">
          <div className="text-[13px] font-semibold text-brand uppercase tracking-[0.08em] mb-3.5">
            {t('test.question_n', { n: current + 1 })}
          </div>
          <div className="text-[17px] md:text-[19px] leading-[1.55] text-fg mb-6">
            {q.textKz}
          </div>

          {q.imageUrl && (
            <div className="p-6 bg-bg-alt rounded-lg mb-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.imageUrl} alt="" className="max-h-[260px]" />
            </div>
          )}

          <div className="flex flex-col gap-3 flex-1">
            {q.options.map((o, i) => {
              const letter = ['A', 'B', 'C', 'D'][i] ?? String(i + 1);
              const selected = answers[q.id] === o.id;
              return (
                <label
                  key={o.id}
                  className={cn(
                    'flex items-center gap-3.5 px-4 md:px-5 py-3.5 md:py-4 rounded-lg cursor-pointer text-base transition-colors border-[1.5px]',
                    selected
                      ? 'border-brand bg-brand-50 font-semibold'
                      : 'border-border bg-white font-medium hover:border-border-strong',
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="sr-only"
                    checked={selected}
                    onChange={() => saveAnswer(q.id, o.id)}
                  />
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0',
                      selected
                        ? 'bg-brand text-white'
                        : 'bg-white text-fg-muted border-[1.5px] border-border-strong',
                    )}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 text-fg">{o.textKz}</span>
                  {selected && <Check size={18} className="text-brand" />}
                </label>
              );
            })}
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="secondary"
              disabled={isFirst}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              <ArrowLeft size={16} /> {t('test.back')}
            </Button>
            {isLast ? (
              <Button
                variant="accent"
                size="lg"
                onClick={() => setShowConfirm(true)}
                className="shadow-[0_0_0_4px_rgba(245,158,11,0.15)]"
              >
                {t('test.finish')} <Check size={16} />
              </Button>
            ) : (
              <Button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}>
                {t('test.next')} <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </Card>

        {/* Desktop tools */}
        <div className="hidden lg:flex flex-col gap-4 min-h-0">
          <div className="flex gap-2">
            <ToolTab
              active={desktopTool === 'calc'}
              onClick={() => setDesktopTool('calc')}
              icon={<CalcIcon size={16} />}
              label={t('test.calculator')}
            />
            <ToolTab
              active={desktopTool === 'sketch'}
              onClick={() => setDesktopTool('sketch')}
              icon={<Pencil size={16} />}
              label={t('test.sketch')}
            />
          </div>

          {desktopTool === 'calc' ? (
            <Calculator />
          ) : (
            <DraftCanvas
              attemptId={p.attemptId}
              questionId={q.id}
              initialData={drafts[q.id] ?? null}
              fullscreen={sketchFullscreen}
              onToggleFullscreen={() => setSketchFullscreen((v) => !v)}
            />
          )}

          <div className="p-3.5 bg-brand-50 rounded-md border border-brand-light flex gap-2.5 items-start">
            <Info size={16} className="text-brand flex-shrink-0 mt-0.5" />
            <div className="text-[13px] leading-[1.5] text-fg">{t('test.tip')}</div>
          </div>
        </div>
      </div>

      {/* Mobile floating tool buttons */}
      <div className="lg:hidden fixed bottom-[88px] right-4 flex flex-col gap-2.5 z-30">
        <button
          onClick={() => setMobileTool('calc')}
          aria-label={t('test.calculator')}
          className="w-[52px] h-[52px] rounded-full bg-white shadow-pop border border-border flex items-center justify-center"
        >
          <CalcIcon size={22} className="text-brand" />
        </button>
        <button
          onClick={() => setMobileTool('sketch')}
          aria-label={t('test.sketch')}
          className="w-[52px] h-[52px] rounded-full bg-white shadow-pop border border-border flex items-center justify-center"
        >
          <Pencil size={22} className="text-brand" />
        </button>
      </div>

      {/* Mobile sticky bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-3.5 bg-white border-t border-border flex gap-2.5 z-20">
        <Button
          variant="secondary"
          disabled={isFirst}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          className="flex-[0.4]"
        >
          <ArrowLeft size={16} />
        </Button>
        {isLast ? (
          <Button
            variant="accent"
            onClick={() => setShowConfirm(true)}
            className="flex-1"
          >
            {t('test.finish')} <Check size={16} />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            className="flex-1"
          >
            {t('test.next')} <ArrowRight size={16} />
          </Button>
        )}
      </div>

      {/* Mobile tool dialogs */}
      <ToolDialog
        open={mobileTool === 'calc'}
        onOpenChange={(v) => !v && setMobileTool(null)}
        title={t('test.calculator')}
        icon={<CalcIcon size={18} className="text-brand" />}
      >
        <div className="p-4 overflow-auto">
          <Calculator />
        </div>
      </ToolDialog>
      <ToolDialog
        open={mobileTool === 'sketch'}
        onOpenChange={(v) => !v && setMobileTool(null)}
        title={t('test.sketch')}
        icon={<Pencil size={18} className="text-brand" />}
        fullscreen={sketchFullscreen}
      >
        <DraftCanvas
          attemptId={p.attemptId}
          questionId={q.id}
          initialData={drafts[q.id] ?? null}
          fullscreen={sketchFullscreen}
          onToggleFullscreen={() => setSketchFullscreen((v) => !v)}
        />
      </ToolDialog>

      {/* Finish confirm */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] bg-white rounded-xl shadow-modal border border-border p-7">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  unanswered === 0 ? 'bg-success-light' : 'bg-error-light',
                )}
              >
                {unanswered === 0 ? (
                  <Check size={20} className="text-success" />
                ) : (
                  <Info size={20} className="text-error" />
                )}
              </div>
              <div className="flex-1">
                <div className="sa-display text-[19px] font-semibold tracking-[-0.01em]">
                  {t('test.confirm_finish_title')}
                </div>
                <div className="text-sm text-fg-muted mt-1.5 leading-[1.5]">
                  {unanswered === 0
                    ? t('test.confirm_finish_body_all')
                    : t('test.confirm_finish_body_partial', { n: unanswered })}
                </div>
                <div className="flex gap-2.5 mt-5 justify-end">
                  <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                    {t('test.confirm_continue')}
                  </Button>
                  <Button
                    variant={unanswered === 0 ? 'accent' : 'danger'}
                    onClick={() => doFinish()}
                    disabled={finishing}
                  >
                    {unanswered === 0
                      ? t('test.confirm_finish')
                      : t('test.confirm_finish_anyway')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md text-sm font-semibold border transition-colors',
        active
          ? 'bg-white text-brand border-brand shadow-[0_0_0_3px_#DBEAFE]'
          : 'bg-transparent text-fg-muted border-border hover:bg-white',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
