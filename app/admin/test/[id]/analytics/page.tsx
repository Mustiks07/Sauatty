import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  Edit,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { getTestAnalytics } from '@/lib/stats';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BarBuckets } from '@/components/admin/StatsCharts';
import { formatMSS, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function TestAnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getTestAnalytics(params.id);
  if (!data) notFound();
  const { test, totalAttempts, finishedAttempts, completionRate, avgScorePct, avgTimeSec, distribution, questionStats } = data;

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg mb-3"
      >
        <ChevronLeft size={16} /> Тесттер
      </Link>

      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div className="min-w-0">
          <div className="text-[12px] uppercase tracking-[0.05em] font-semibold text-fg-muted mb-1">
            {test.subject.nameKz}
          </div>
          <h1 className="sa-display text-[24px] md:text-[28px] font-semibold tracking-[-0.02em]">
            {test.titleKz}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {test.isPublished ? (
              <Badge tone="green">
                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Live
              </Badge>
            ) : (
              <Badge tone="gray">Драфт</Badge>
            )}
            <span className="text-sm text-fg-muted">
              {test.timeLimitMinutes} мин лимит
            </span>
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link href={`/admin/test/${test.id}`}>
            <Edit size={14} /> Тестті өңдеу
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi
          icon={<Users size={20} className="text-brand" />}
          label="Бастаған"
          value={String(totalAttempts)}
        />
        <Kpi
          icon={<CheckCircle2 size={20} className="text-success-ink" />}
          label="Аяқтаған"
          value={String(finishedAttempts)}
          sub={`${completionRate.toFixed(0)}% completion`}
          tone="green"
        />
        <Kpi
          icon={<TrendingUp size={20} className="text-brand" />}
          label="Орташа балл"
          value={`${avgScorePct.toFixed(0)}%`}
        />
        <Kpi
          icon={<Clock size={20} className="text-accent-ink" />}
          label="Орташа уақыт"
          value={formatMSS(Math.round(avgTimeSec))}
          tone="amber"
        />
      </div>

      {/* Distribution */}
      <Card className="p-5 mb-8">
        <div className="mb-3">
          <div className="text-[15px] font-semibold">Баллдар таралуы</div>
          <div className="text-[12px] text-fg-muted">
            Барлық аяқталған тапсырулар
          </div>
        </div>
        {finishedAttempts === 0 ? (
          <div className="text-center text-sm text-fg-muted py-8">
            Әлі аяқталған тапсырулар жоқ
          </div>
        ) : (
          <BarBuckets data={distribution} />
        )}
      </Card>

      {/* Per-question */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-[15px] font-semibold">Сұрақтар бойынша</div>
            <div className="text-[12px] text-fg-muted">
              Дұрыс жауаптардың пайызы және ең көп таңдалған қате жауап
            </div>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-fg-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" /> Жеңіл (&gt;70%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent" /> Орташа (40–70%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error" /> Қиын (&lt;40%)
            </span>
          </div>
        </div>
        {questionStats.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-fg-muted">
            Әлі деректер жоқ
          </div>
        ) : (
          <div>
            <div className="hidden md:grid grid-cols-[50px_1fr_100px_120px_1fr_70px] gap-3 px-5 py-2.5 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
              <div>#</div>
              <div>Сұрақ</div>
              <div>Жауап</div>
              <div>Дұрыс %</div>
              <div>Ең көп қате</div>
              <div>Өткіз</div>
            </div>
            {questionStats.map((q, i) => {
              const tone =
                q.correctPct >= 70 ? 'success' : q.correctPct >= 40 ? 'accent' : 'error';
              const bgTone = {
                success: 'bg-success',
                accent: 'bg-accent',
                error: 'bg-error',
              }[tone];
              return (
                <div
                  key={q.questionId}
                  className={cn(
                    'grid grid-cols-1 md:grid-cols-[50px_1fr_100px_120px_1fr_70px] gap-2 md:gap-3 px-5 py-3.5 items-center text-sm',
                    i !== questionStats.length - 1 && 'border-b border-border',
                  )}
                >
                  <div className="sa-num text-fg-muted font-semibold">
                    {String(q.order).padStart(2, '0')}
                  </div>
                  <div className="font-medium truncate" title={q.textKz}>
                    {q.textKz.slice(0, 80)}
                    {q.textKz.length > 80 ? '…' : ''}
                  </div>
                  <div className="sa-num text-fg-muted">{q.answered}</div>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', bgTone)} />
                    <span className="sa-num font-semibold">
                      {q.correctPct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-fg-muted text-[13px] truncate">
                    {q.mostWrong ? (
                      <>
                        <span className="text-error-ink">{q.mostWrong.text}</span>{' '}
                        <span className="text-fg-subtle">×{q.mostWrong.count}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="sa-num text-fg-muted text-[13px]">
                    {q.skipped > 0 ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle size={12} className="text-accent" />
                        {q.skipped}
                      </span>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  tone = 'blue',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: 'blue' | 'amber' | 'green';
}) {
  const bg = {
    blue: 'bg-brand-light',
    amber: 'bg-accent-light',
    green: 'bg-success-light',
  }[tone];
  return (
    <Card className="p-4 flex justify-between items-start">
      <div className="min-w-0">
        <div className="text-[12px] text-fg-muted font-medium mb-1.5">{label}</div>
        <div className="sa-display sa-num text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] leading-none">
          {value}
        </div>
        {sub && <div className="text-[11px] text-fg-muted mt-1.5">{sub}</div>}
      </div>
      <div
        className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
    </Card>
  );
}
