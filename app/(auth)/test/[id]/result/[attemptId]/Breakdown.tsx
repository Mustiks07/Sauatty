'use client';

import { useState, useMemo } from 'react';
import { Check, X, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ImageZoom } from '@/components/shared/ImageZoom';
import { cn } from '@/lib/utils';

export type BreakdownQuestion = {
  id: string;
  order: number;
  textKz: string;
  imageUrl: string | null;
  explanationKz: string | null;
  options: { id: string; textKz: string; isCorrect: boolean; order: number }[];
  userAnswerId: string | null;
  isCorrect: boolean;
};

export function Breakdown({
  questions,
}: {
  questions: BreakdownQuestion[];
}) {
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');
  const wrongCount = useMemo(() => questions.filter((q) => !q.isCorrect).length, [questions]);
  const list = useMemo(
    () => (filter === 'wrong' ? questions.filter((q) => !q.isCorrect) : questions),
    [questions, filter],
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="sa-display text-[20px] md:text-[22px] font-semibold tracking-[-0.015em]">
          Сұрақтарды талдау
        </h2>
        <div className="flex gap-2">
          <Tab active={filter === 'all'} onClick={() => setFilter('all')}>
            Барлығы <span className="opacity-60 ml-1">{questions.length}</span>
          </Tab>
          <Tab
            active={filter === 'wrong'}
            onClick={() => setFilter('wrong')}
            disabled={wrongCount === 0}
          >
            Тек қателер <span className="opacity-60 ml-1">{wrongCount}</span>
          </Tab>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-success/40 bg-success-light p-9 text-center">
          <div className="w-14 h-14 rounded-full bg-white border border-success/30 flex items-center justify-center mx-auto mb-3.5">
            <Check size={26} className="text-success" strokeWidth={2.5} />
          </div>
          <div className="sa-display text-[18px] font-semibold text-success-ink mb-1">
            Қателер жоқ!
          </div>
          <div className="text-sm text-success-ink/80">
            Сен барлық сұраққа дұрыс жауап бердің.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((q) => {
            const correctOpt = q.options.find((o) => o.isCorrect);
            const yourOpt = q.options.find((o) => o.id === q.userAnswerId);
            return (
              <Card key={q.id} className="p-5 md:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0',
                      q.isCorrect
                        ? 'bg-success-light text-success'
                        : 'bg-error-light text-error',
                    )}
                  >
                    {q.isCorrect ? (
                      <Check size={18} strokeWidth={2.5} />
                    ) : (
                      <X size={18} strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em] mb-1">
                      Сұрақ {String(q.order).padStart(2, '0')}
                    </div>
                    <div className="text-[15px] leading-[1.5] text-fg mb-3.5">
                      {q.textKz}
                    </div>
                    {q.imageUrl && (
                      <div className="mb-3.5 p-3 bg-bg-alt rounded-md inline-block max-w-full">
                        <ImageZoom
                          src={q.imageUrl}
                          alt="Сұрақтың суреті"
                          className="max-h-[200px] rounded"
                        />
                      </div>
                    )}
                    <div className="flex gap-2.5 flex-wrap mb-3.5">
                      <Pill
                        label="Сенің жауабың"
                        value={yourOpt?.textKz ?? '—'}
                        state={q.isCorrect ? 'right' : 'wrong'}
                      />
                      {!q.isCorrect && correctOpt && (
                        <Pill
                          label="Дұрыс жауап"
                          value={correctOpt.textKz}
                          state="right"
                        />
                      )}
                    </div>
                    {q.explanationKz && !q.isCorrect && (
                      <div className="p-3.5 bg-brand-50 rounded-md border-l-[3px] border-brand flex gap-2.5 items-start">
                        <Info size={16} className="text-brand flex-shrink-0 mt-0.5" />
                        <div className="text-[14px] leading-[1.55] text-fg">
                          <span className="font-semibold">Түсініктеме. </span>
                          {q.explanationKz}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function Tab({
  active,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors border',
        active
          ? 'bg-white text-fg border-border shadow-card'
          : 'bg-transparent text-fg-muted border-transparent hover:text-fg',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

function Pill({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: 'right' | 'wrong';
}) {
  const bg = state === 'wrong' ? 'bg-error-light' : 'bg-success-light';
  const fg = state === 'wrong' ? 'text-error-ink' : 'text-success-ink';
  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-md', bg)}>
      <span className={cn('text-[12px] font-semibold opacity-70', fg)}>{label}:</span>
      <span className={cn('text-sm font-semibold', fg)}>{value}</span>
      {state === 'wrong' ? (
        <X size={14} className={fg} />
      ) : (
        <Check size={14} className={fg} />
      )}
    </div>
  );
}
