'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Info, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ImageZoom } from '@/components/shared/ImageZoom';
import { cn } from '@/lib/utils';

export type PracticeQuestion = {
  questionId: string;
  textKz: string;
  imageUrl: string | null;
  explanationKz: string | null;
  subjectName: string;
  options: { id: string; textKz: string; order: number }[];
  correctOptionId: string | null;
};

export function Practice({ questions }: { questions: PracticeQuestion[] }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Card className="p-8 md:p-12 text-center">
        <div
          className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5',
            correctCount === questions.length
              ? 'bg-success-light text-success'
              : correctCount >= questions.length / 2
              ? 'bg-brand-light text-brand'
              : 'bg-accent-light text-accent-ink',
          )}
        >
          <Check size={36} strokeWidth={2.5} />
        </div>
        <div className="sa-display text-[24px] font-semibold mb-2">
          Қайталау аяқталды
        </div>
        <div className="sa-display sa-num text-[48px] font-bold tracking-[-0.02em] mb-1">
          {correctCount} / {questions.length}
        </div>
        <div className="text-sm text-fg-muted mb-7">
          {correctCount === questions.length
            ? 'Барлығын дұрыс жауап бердің! Тамаша.'
            : correctCount >= questions.length / 2
            ? 'Жақсы прогресс. Тағы біраз қайталасаң, барлығын меңгересің.'
            : 'Ештеңе етпейді. Тағы қайтала, бірте-бірте есте қалады.'}
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:justify-center">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/profile/mistakes">Қателерге оралу</Link>
          </Button>
          <Button
            onClick={() => {
              setIdx(0);
              setSelected(null);
              setRevealed(false);
              setCorrectCount(0);
              setDone(false);
            }}
            className="w-full sm:w-auto"
          >
            <RotateCcw size={14} /> Қайта бастау
          </Button>
        </div>
      </Card>
    );
  }

  const q = questions[idx];
  const correctId = q.correctOptionId;

  function pickAnswer(optId: string) {
    if (revealed) return;
    setSelected(optId);
    setRevealed(true);
    if (optId === correctId) setCorrectCount((c) => c + 1);
  }

  function nextQuestion() {
    if (idx + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <h1 className="sa-display text-[22px] md:text-[24px] font-semibold tracking-[-0.02em]">
            Қайталау режимі
          </h1>
        </div>
        <div className="text-sm text-fg-muted">
          <span className="sa-num text-fg font-semibold">{idx + 1}</span>
          <span className="opacity-50"> / {questions.length}</span>
        </div>
      </div>

      <div className="h-1.5 bg-bg-2 rounded mb-6 overflow-hidden">
        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${((idx + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <Card className="p-6 md:p-8">
        <Badge tone="gray" className="mb-3">
          {q.subjectName}
        </Badge>
        <div className="text-[17px] md:text-[19px] leading-[1.55] text-fg mb-5">
          {q.textKz}
        </div>
        {q.imageUrl && (
          <div className="p-4 sm:p-6 bg-bg-alt rounded-lg mb-5 flex justify-center">
            <ImageZoom
              src={q.imageUrl}
              alt="Сұрақ суреті"
              className="max-h-[240px] rounded-md"
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {q.options.map((o, i) => {
            const letter = ['A', 'B', 'C', 'D'][i] ?? String(i + 1);
            const isSelected = selected === o.id;
            const isCorrect = o.id === correctId;

            let stateCls = 'border-border bg-white hover:border-border-strong';
            if (revealed) {
              if (isCorrect)
                stateCls = 'border-success bg-success-light';
              else if (isSelected)
                stateCls = 'border-error bg-error-light';
              else stateCls = 'border-border bg-white opacity-60';
            } else if (isSelected) {
              stateCls = 'border-brand bg-brand-50';
            }

            return (
              <button
                key={o.id}
                type="button"
                disabled={revealed}
                onClick={() => pickAnswer(o.id)}
                className={cn(
                  'flex items-center gap-3.5 px-4 md:px-5 py-3.5 md:py-4 rounded-lg text-base text-left transition-colors border-[1.5px]',
                  stateCls,
                  !revealed && 'cursor-pointer',
                )}
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0',
                    revealed && isCorrect
                      ? 'bg-success text-white'
                      : revealed && isSelected
                      ? 'bg-error text-white'
                      : isSelected
                      ? 'bg-brand text-white'
                      : 'bg-white text-fg-muted border-[1.5px] border-border-strong',
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1 text-fg">{o.textKz}</span>
                {revealed && isCorrect && (
                  <Check size={18} className="text-success" strokeWidth={2.5} />
                )}
                {revealed && isSelected && !isCorrect && (
                  <X size={18} className="text-error" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>

        {revealed && q.explanationKz && selected !== correctId && (
          <div className="mt-5 p-3.5 bg-brand-50 rounded-md border-l-[3px] border-brand flex gap-2.5 items-start">
            <Info size={16} className="text-brand flex-shrink-0 mt-0.5" />
            <div className="text-[14px] leading-[1.55] text-fg">
              <span className="font-semibold">Түсініктеме. </span>
              {q.explanationKz}
            </div>
          </div>
        )}

        {revealed && (
          <div className="mt-5 flex justify-end">
            <Button onClick={nextQuestion}>
              {idx + 1 >= questions.length ? 'Аяқтау' : 'Келесі'}{' '}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </Card>
    </>
  );
}
