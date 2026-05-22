'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';
import { Check, X, Info, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pill } from '@/components/ui/Pill';
import { ImageZoom } from '@/components/shared/ImageZoom';
import { cn } from '@/lib/utils';

type Mistake = {
  questionId: string;
  testId: string;
  testTitle: string;
  subject: { id: string; slug: string; nameKz: string };
  textKz: string;
  imageUrl: string | null;
  explanationKz: string | null;
  yourAnswer: string | null;
  correctAnswer: string | null;
  when: Date | null;
};

export function MistakesList({ mistakes }: { mistakes: Mistake[] }) {
  const subjects = useMemo(() => {
    const m = new Map<string, { id: string; nameKz: string; count: number }>();
    for (const x of mistakes) {
      const cur = m.get(x.subject.id) ?? {
        id: x.subject.id,
        nameKz: x.subject.nameKz,
        count: 0,
      };
      cur.count += 1;
      m.set(x.subject.id, cur);
    }
    return Array.from(m.values());
  }, [mistakes]);

  const [subjectId, setSubjectId] = useState<string>('all');
  const visible = useMemo(
    () =>
      subjectId === 'all'
        ? mistakes
        : mistakes.filter((x) => x.subject.id === subjectId),
    [mistakes, subjectId],
  );

  return (
    <>
      {subjects.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <Pill active={subjectId === 'all'} onClick={() => setSubjectId('all')}>
            Барлығы <span className="opacity-60 ml-1">{mistakes.length}</span>
          </Pill>
          {subjects.map((s) => (
            <Pill
              key={s.id}
              active={subjectId === s.id}
              onClick={() => setSubjectId(s.id)}
            >
              {s.nameKz} <span className="opacity-60 ml-1">{s.count}</span>
            </Pill>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((m) => (
          <Card key={m.questionId} className="p-5 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-9 h-9 rounded-md bg-error-light text-error flex items-center justify-center flex-shrink-0">
                <X size={18} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge tone="gray">{m.subject.nameKz}</Badge>
                  <span className="text-[12px] text-fg-muted">{m.testTitle}</span>
                  {m.when && (
                    <span className="text-[12px] text-fg-subtle">
                      · {format(m.when, 'd MMM', { locale: kk })}
                    </span>
                  )}
                </div>
                <div className="text-[15px] leading-[1.5] text-fg mb-3.5">
                  {m.textKz}
                </div>
                {m.imageUrl && (
                  <div className="mb-3.5 p-3 bg-bg-alt rounded-md inline-block max-w-full">
                    <ImageZoom
                      src={m.imageUrl}
                      alt="Сұрақ суреті"
                      className="max-h-[200px] rounded"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-3.5">
                  {m.yourAnswer && (
                    <Pill2 state="wrong" label="Сенің жауабың" value={m.yourAnswer} />
                  )}
                  {m.correctAnswer && (
                    <Pill2 state="right" label="Дұрыс жауап" value={m.correctAnswer} />
                  )}
                </div>
                {m.explanationKz && (
                  <div className="p-3.5 bg-brand-50 rounded-md border-l-[3px] border-brand flex gap-2.5 items-start mb-3">
                    <Info size={16} className="text-brand flex-shrink-0 mt-0.5" />
                    <div className="text-[14px] leading-[1.55] text-fg">
                      <span className="font-semibold">Түсініктеме. </span>
                      {m.explanationKz}
                    </div>
                  </div>
                )}
                <Link
                  href={`/test/${m.testId}`}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
                >
                  Тестті қайта тапсыру <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Pill2({
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
