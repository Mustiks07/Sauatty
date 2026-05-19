import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, X, Clock, Redo2, Info } from 'lucide-react';
import { requireUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashHeader } from '@/components/shared/DashHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatMSS, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ResultPage({
  params,
}: {
  params: { id: string; attemptId: string };
}) {
  const u = await requireUserPage();
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      test: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: { orderBy: { order: 'asc' } } },
          },
        },
      },
      answers: true,
    },
  });
  if (!attempt || attempt.userId !== u.db.id) notFound();
  if (!attempt.finishedAt) notFound();

  const score = attempt.score ?? 0;
  const total = attempt.totalQuestions;
  const wrong = total - score;
  const seconds = Math.max(
    0,
    Math.floor((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 1000),
  );
  const tone =
    score >= total * 0.9 ? 'green' : score >= total * 0.7 ? 'blue' : score >= total * 0.4 ? 'amber' : 'red';
  const message =
    score === total
      ? 'Керемет! Барлық сұраққа дұрыс жауап бердің.'
      : score >= Math.ceil(total * 0.8)
      ? 'Жақсы! Тағы біраз жаттық — ұпайды толтыруға болады.'
      : score >= Math.ceil(total * 0.5)
      ? 'Орташа нәтиже. Қателіктеріңді талдап, қайта тапсыр.'
      : 'Жалғастыр! Әр тапсыру — жаңа сабақ.';

  const ansByQ = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader />
      <div className="max-w-[880px] mx-auto px-5 md:px-8 py-10 md:py-12 pb-20">
        {/* Hero */}
        <Card
          className="mb-8 overflow-hidden p-0"
          style={{ background: 'linear-gradient(135deg, #fff 0%, #F8FAFC 100%)' } as any}
        >
          <div className="p-8 md:p-12 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-10 items-center">
            <ScoreRing score={score} total={total} tone={tone} />
            <div>
              <Badge tone="blue" className="mb-3">
                <Check size={11} /> Аяқталды
              </Badge>
              <h1 className="sa-display text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] mb-2">
                {attempt.test.titleKz}
              </h1>
              <div className="text-base text-fg-muted mb-5">{message}</div>
              <div className="flex flex-wrap gap-5 text-sm">
                <Stat icon={<Check size={16} className="text-success" />} label="Дұрыс" value={String(score)} />
                <Stat icon={<X size={16} className="text-error" />} label="Қате" value={String(wrong)} />
                <Stat icon={<Clock size={16} className="text-brand" />} label="Уақыт" value={formatMSS(seconds)} />
              </div>
            </div>
          </div>
          <div className="px-8 md:px-12 py-5 bg-white border-t border-border flex gap-3 justify-end">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Басты бетке</Link>
            </Button>
            <Button asChild>
              <Link href={`/test/${attempt.testId}`}>
                Қайта тапсыру <Redo2 size={16} />
              </Link>
            </Button>
          </div>
        </Card>

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="sa-display text-[20px] md:text-[22px] font-semibold tracking-[-0.015em]">
            Сұрақтарды талдау
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {attempt.test.questions.map((q) => {
            const a = ansByQ.get(q.id);
            const correctOpt = q.options.find((o) => o.isCorrect);
            const yourOpt = q.options.find((o) => o.id === a?.selectedOptionId);
            const correct = !!a?.isCorrect;
            return (
              <Card key={q.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0',
                      correct ? 'bg-success-light text-success' : 'bg-error-light text-error',
                    )}
                  >
                    {correct ? <Check size={18} /> : <X size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em] mb-1">
                      Сұрақ {String(q.order).padStart(2, '0')}
                    </div>
                    <div className="text-[15px] leading-[1.5] text-fg mb-3.5">
                      {q.textKz}
                    </div>
                    <div className="flex gap-2.5 flex-wrap mb-3.5">
                      <Pill
                        label="Сенің жауабың"
                        value={yourOpt?.textKz ?? '—'}
                        state={correct ? 'right' : 'wrong'}
                      />
                      {!correct && correctOpt && (
                        <Pill label="Дұрыс жауап" value={correctOpt.textKz} state="right" />
                      )}
                    </div>
                    {q.explanationKz && !correct && (
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
      </div>
    </div>
  );
}

function ScoreRing({
  score,
  total,
  tone,
}: {
  score: number;
  total: number;
  tone: 'green' | 'blue' | 'amber' | 'red';
}) {
  const colors = {
    green: '#10B981',
    blue: '#2563EB',
    amber: '#F59E0B',
    red: '#EF4444',
  } as const;
  const pct = total === 0 ? 0 : score / total;
  const R = 78;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative w-[180px] h-[180px] mx-auto sm:mx-0">
      <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden>
        <circle cx="90" cy="90" r={R} fill="none" stroke="#F1F5F9" strokeWidth="14" />
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke={colors[tone]}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${pct * C} ${C}`}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="sa-display sa-num text-[56px] font-bold tracking-[-0.03em] leading-none"
          style={{ color: colors[tone] }}
        >
          {score}
        </div>
        <div className="sa-num text-sm text-fg-muted font-medium">/ {total}</div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="sa-num text-[17px] font-semibold text-fg">{value}</span>
      <span className="text-[13px] text-fg-muted">{label}</span>
    </div>
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
    <div className={cn('inline-flex items-center gap-2 px-3.5 py-2 rounded-md', bg)}>
      <span className={cn('text-[12px] font-semibold opacity-70', fg)}>{label}:</span>
      <span className={cn('text-sm font-semibold', fg)}>{value}</span>
      {state === 'wrong' ? <X size={14} className={fg} /> : <Check size={14} className={fg} />}
    </div>
  );
}
