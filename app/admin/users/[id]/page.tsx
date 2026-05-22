import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';
import {
  ChevronLeft,
  Flame,
  Target,
  Trophy,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { getUserStats } from '@/lib/stats';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressLine, Heatmap } from '@/components/admin/StatsCharts';
import { formatMSS, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminUserDetail({
  params,
}: {
  params: { id: string };
}) {
  const data = await getUserStats(params.id);
  if (!data) notFound();
  const { user, totalAttempts, unfinishedAttempts, avg, best, pct, streak, progress, bySubject, heatmap, attempts, lastActivity } = data;
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg mb-5"
      >
        <ChevronLeft size={16} /> Пайдаланушылар
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Profile sidebar */}
        <Card className="p-7">
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-[88px] h-[88px] rounded-full text-white flex items-center justify-center text-[32px] font-bold font-display mb-4"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #F59E0B 100%)',
              }}
            >
              {initial}
            </div>
            <div className="sa-display text-[22px] font-semibold flex items-center gap-2 flex-wrap justify-center">
              {user.name}
              {user.role === 'ADMIN' && <Badge tone="amber">Admin</Badge>}
            </div>
            {streak > 0 && (
              <Badge tone="amber" className="mt-2.5">
                <Flame size={11} />
                <span className="sa-num">{streak}</span> күн серпін
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-3 text-sm">
            {user.phone && (
              <Row icon={<Phone size={15} />} label={user.phone} />
            )}
            {user.email && (
              <Row icon={<Mail size={15} />} label={user.email} truncate />
            )}
            <Row
              icon={<Calendar size={15} />}
              label={`Тіркелген: ${format(user.createdAt, 'd MMM yyyy', { locale: kk })}`}
            />
            {lastActivity && (
              <Row
                icon={<TrendingUp size={15} />}
                label={`Соңғы белсенділік: ${format(lastActivity, 'd MMM yyyy', { locale: kk })}`}
              />
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-5 min-w-0">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat
              icon={<Target size={18} className="text-brand" />}
              label="Тапсыру"
              value={String(totalAttempts)}
              sub={unfinishedAttempts > 0 ? `+${unfinishedAttempts} аяқталмаған` : undefined}
            />
            <MiniStat
              icon={<TrendingUp size={18} className="text-brand" />}
              label="Орташа"
              value={avg.toFixed(1)}
            />
            <MiniStat
              icon={<Trophy size={18} className="text-success-ink" />}
              label="Үздік"
              value={String(best)}
              tone="green"
            />
            <MiniStat
              icon={<Flame size={18} className="text-accent-ink" />}
              label="Дұрыс %"
              value={`${pct.toFixed(0)}%`}
              tone="amber"
            />
          </div>

          {/* Progress chart */}
          {progress.length > 1 && (
            <Card className="p-5">
              <div className="mb-3">
                <div className="text-[15px] font-semibold">Прогресс</div>
                <div className="text-[12px] text-fg-muted">
                  Соңғы {progress.length} тапсыру (балл)
                </div>
              </div>
              <ProgressLine data={progress} />
            </Card>
          )}

          {/* By subject */}
          {bySubject.length > 0 && (
            <Card className="p-5">
              <div className="text-[15px] font-semibold mb-4">Пәндер бойынша</div>
              <div className="flex flex-col gap-3">
                {bySubject.map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-[12px] text-fg-muted">
                        {s.attempts} тапсыру · орташа {s.avg.toFixed(1)}
                      </div>
                    </div>
                    <Badge tone={s.pct >= 80 ? 'green' : s.pct >= 50 ? 'blue' : 'red'}>
                      {s.pct.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Activity heatmap */}
          <Card className="p-5">
            <div className="mb-3">
              <div className="text-[15px] font-semibold">Белсенділік</div>
              <div className="text-[12px] text-fg-muted">Соңғы 90 күн</div>
            </div>
            <Heatmap data={heatmap} />
          </Card>

          {/* Attempts table */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-[15px] font-semibold">Соңғы тапсырулар</div>
            </div>
            {attempts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-fg-muted">
                Әлі тапсыру жоқ
              </div>
            ) : (
              <div>
                <div className="hidden md:grid grid-cols-[100px_1fr_100px_100px_100px] gap-3 px-5 py-2 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
                  <div>Күн</div>
                  <div>Тест</div>
                  <div>Уақыт</div>
                  <div>Балл</div>
                  <div />
                </div>
                {attempts.map((a, i) => {
                  const secs = a.finishedAt
                    ? Math.min(
                        a.test.timeLimitMinutes * 60 + 10,
                        Math.max(
                          0,
                          Math.floor(
                            (a.finishedAt.getTime() - a.startedAt.getTime()) / 1000,
                          ),
                        ),
                      )
                    : 0;
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        'grid grid-cols-1 md:grid-cols-[100px_1fr_100px_100px_100px] gap-2 md:gap-3 px-5 py-3 items-center text-sm',
                        i !== attempts.length - 1 && 'border-b border-border',
                      )}
                    >
                      <div className="sa-num text-fg-muted">
                        {a.finishedAt
                          ? format(a.finishedAt, 'd MMM', { locale: kk })
                          : '—'}
                      </div>
                      <div className="font-medium truncate">{a.test.titleKz}</div>
                      <div className="sa-num text-fg-muted">{formatMSS(secs)}</div>
                      <div className="sa-num font-semibold">
                        <span
                          className={cn(
                            (a.score ?? 0) >= a.totalQuestions * 0.8
                              ? 'text-success'
                              : (a.score ?? 0) >= a.totalQuestions * 0.5
                              ? 'text-fg'
                              : 'text-error',
                          )}
                        >
                          {a.score ?? 0}
                        </span>
                        <span className="text-fg-subtle">/{a.totalQuestions}</span>
                      </div>
                      <div className="flex md:justify-end">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/test/${a.testId}/result/${a.id}`}>
                            Талдау
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  truncate,
}: {
  icon: React.ReactNode;
  label: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 text-fg-muted">
      <span className="flex-shrink-0">{icon}</span>
      <span className={truncate ? 'truncate' : ''}>{label}</span>
    </div>
  );
}

function MiniStat({
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
  const color = {
    blue: 'text-fg',
    amber: 'text-accent-ink',
    green: 'text-success-ink',
  }[tone];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-1">
        <div className="text-[12px] text-fg-muted font-medium uppercase tracking-[0.04em]">
          {label}
        </div>
        {icon}
      </div>
      <div className={cn('sa-display sa-num text-[26px] font-bold tracking-[-0.02em]', color)}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-fg-muted mt-0.5">{sub}</div>}
    </Card>
  );
}
