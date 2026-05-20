'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatMSS, cn } from '@/lib/utils';

export type AttemptRow = {
  id: string;
  testId: string;
  testTitleKz: string;
  finishedAt: string; // ISO
  startedAt: string; // ISO
  timeLimitMinutes: number;
  score: number;
  totalQuestions: number;
};

const PAGE_SIZE = 10;

export function AttemptsList({ attempts }: { attempts: AttemptRow[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const visible = attempts.slice(0, shown);
  const hasMore = shown < attempts.length;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex justify-between items-center">
        <div className="sa-display text-[18px] font-semibold tracking-[-0.01em]">
          Тапсыру тарихы
        </div>
        <div className="text-[12px] text-fg-muted sa-num">
          {visible.length} / {attempts.length}
        </div>
      </div>
      {attempts.length === 0 ? (
        <div className="px-6 py-10 text-center text-fg-muted">
          Әлі тапсыру жоқ
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-[90px_1fr_100px_100px_120px] gap-4 px-6 py-3 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
            <div>Күн</div>
            <div>Тест</div>
            <div>Уақыт</div>
            <div>Балл</div>
            <div />
          </div>
          {visible.map((a, i) => {
            const rawSecs = Math.max(
              0,
              Math.floor(
                (new Date(a.finishedAt).getTime() -
                  new Date(a.startedAt).getTime()) /
                  1000,
              ),
            );
            // Cap by time limit + 10s grace — anything longer means auto-finalize.
            const secs = Math.min(rawSecs, a.timeLimitMinutes * 60 + 10);
            return (
              <div
                key={a.id}
                className={cn(
                  'grid grid-cols-1 md:grid-cols-[90px_1fr_100px_100px_120px] gap-2 md:gap-4 px-6 py-3.5 items-center text-sm',
                  i !== visible.length - 1 && 'border-b border-border',
                )}
              >
                <div className="sa-num text-fg-muted">
                  {format(new Date(a.finishedAt), 'd MMM', { locale: kk })}
                </div>
                <div className="text-fg font-medium">{a.testTitleKz}</div>
                <div className="sa-num text-fg-muted">{formatMSS(secs)}</div>
                <div className="sa-num font-semibold">
                  <span
                    className={cn(
                      a.score >= a.totalQuestions * 0.8
                        ? 'text-success'
                        : a.score >= a.totalQuestions * 0.5
                        ? 'text-fg'
                        : 'text-error',
                    )}
                  >
                    {a.score}
                  </span>
                  <span className="text-fg-subtle">/{a.totalQuestions}</span>
                </div>
                <div className="flex md:justify-end">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/test/${a.testId}/result/${a.id}`}>
                      Талдау <ChevronRight size={12} />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <div className="px-6 py-4 border-t border-border bg-bg-alt flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShown((s) => s + PAGE_SIZE)}
              >
                Көбірек жүктеу
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
