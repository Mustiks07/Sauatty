import Link from 'next/link';
import {
  ChevronRight,
  Edit3,
  Flame,
  LineChart as LineChartIcon,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calcStreak } from '@/lib/streak';
import { countUserMistakes } from '@/lib/mistakes';
import { DashHeader } from '@/components/shared/DashHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { UbtCountdown } from '@/components/shared/UbtCountdown';
import { ProgressLine, Heatmap } from '@/components/admin/StatsCharts';
import { cn } from '@/lib/utils';
import { yyyymmdd, addDays, fillDays } from '@/lib/date-utils';
import { LogoutButton } from './LogoutButton';
import { AttemptsList, type AttemptRow } from './AttemptsList';

export const metadata = { title: 'Профиль' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ProfilePage() {
  const u = await requireRegularUserPage();

  const [attemptsAll, mistakesCount] = await Promise.all([
    prisma.testAttempt.findMany({
      where: { userId: u.db.id, finishedAt: { not: null } },
      include: {
        test: {
          include: {
            subject: { select: { nameKz: true } },
          },
        },
      },
      orderBy: { finishedAt: 'desc' },
      take: 200,
    }),
    countUserMistakes(u.db.id),
  ]);

  const rows: AttemptRow[] = attemptsAll.map((a) => ({
    id: a.id,
    testId: a.testId,
    testTitleKz: a.test.titleKz,
    finishedAt: a.finishedAt!.toISOString(),
    startedAt: a.startedAt.toISOString(),
    timeLimitMinutes: a.test.timeLimitMinutes,
    score: a.score ?? 0,
    totalQuestions: a.totalQuestions,
  }));

  const totalAttempts = attemptsAll.length;
  const sumScore = attemptsAll.reduce((s, a) => s + (a.score ?? 0), 0);
  const sumTotal = attemptsAll.reduce((s, a) => s + a.totalQuestions, 0);
  const avg = totalAttempts ? sumScore / totalAttempts : 0;
  const best = attemptsAll.reduce((m, a) => Math.max(m, a.score ?? 0), 0);
  const pct = sumTotal ? Math.round((sumScore / sumTotal) * 100) : 0;
  const streak = calcStreak(
    attemptsAll.map((a) => a.finishedAt).filter((d): d is Date => !!d),
  );

  // Progress chart: last 20 finished, oldest -> newest
  const progress = attemptsAll
    .slice(0, 20)
    .reverse()
    .map((a, i) => ({ idx: i + 1, score: a.score ?? 0, total: a.totalQuestions }));

  // Subject breakdown
  const subjMap = new Map<
    string,
    { name: string; attempts: number; sumScore: number; sumQ: number }
  >();
  for (const a of attemptsAll) {
    const key = a.test.subject.nameKz;
    const cur = subjMap.get(key) ?? {
      name: key,
      attempts: 0,
      sumScore: 0,
      sumQ: 0,
    };
    cur.attempts += 1;
    cur.sumScore += a.score ?? 0;
    cur.sumQ += a.totalQuestions;
    subjMap.set(key, cur);
  }
  const bySubject = Array.from(subjMap.values()).map((s) => ({
    name: s.name,
    attempts: s.attempts,
    pct: s.sumQ ? (s.sumScore / s.sumQ) * 100 : 0,
  }));

  // Heatmap last 90 days
  const day90 = addDays(new Date(), -90);
  const heatmapCount = new Map<string, number>();
  for (const a of attemptsAll) {
    if (!a.finishedAt || a.finishedAt < day90) continue;
    const k = yyyymmdd(a.finishedAt);
    heatmapCount.set(k, (heatmapCount.get(k) ?? 0) + 1);
  }
  const heatmap = fillDays(
    Array.from(heatmapCount.entries()).map(([day, value]) => ({ day, value })),
    day90,
    new Date(),
  );

  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader active="history" />
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-10 md:py-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <Card className="p-7">
              <div className="flex flex-col items-center text-center mb-5">
                <UserAvatar
                  name={u.db.name}
                  preset={u.db.avatarPreset}
                  size={88}
                  className="mb-4"
                />
                <div className="sa-display text-[22px] font-semibold">
                  {u.db.name}
                </div>
                <div className="text-sm text-fg-muted mt-1">
                  {u.db.phone ?? u.db.email}
                </div>
                {streak > 0 && (
                  <Badge tone="amber" className="mt-3">
                    <Flame size={11} />
                    <span className="sa-num">{streak}</span> күн серпін
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <SidebarLink href="/profile/edit" icon={<Edit3 size={16} />}>
                  Профильді өңдеу
                </SidebarLink>
                <SidebarLink
                  href="/profile/mistakes"
                  icon={<ListChecks size={16} />}
                  count={mistakesCount}
                >
                  Қателерім
                </SidebarLink>
              </div>
              <div className="h-px bg-border my-5" />
              <LogoutButton />
            </Card>

            {u.db.examDate && (
              <UbtCountdown examDate={u.db.examDate} variant="card" />
            )}
          </div>

          {/* Main */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Mini label="Тапсыру" value={String(totalAttempts)} />
              <Mini label="Орташа балл" value={avg.toFixed(1)} />
              <Mini label="Үздік" value={String(best)} tone="amber" />
              <Mini label="Дұрыс %" value={`${pct}%`} tone="green" />
            </div>

            {progress.length > 1 && (
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <LineChartIcon size={16} className="text-brand" />
                  <div className="text-[15px] font-semibold">Прогресс</div>
                  <span className="text-[12px] text-fg-muted">
                    Соңғы {progress.length} тапсыру
                  </span>
                </div>
                <ProgressLine data={progress} />
              </Card>
            )}

            {bySubject.length > 0 && (
              <Card className="p-5">
                <div className="text-[15px] font-semibold mb-4">
                  Пәндер бойынша
                </div>
                <div className="flex flex-col gap-3">
                  {bySubject.map((s) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-[12px] text-fg-muted">
                          {s.attempts} тапсыру
                        </div>
                      </div>
                      <Badge
                        tone={s.pct >= 80 ? 'green' : s.pct >= 50 ? 'blue' : 'red'}
                      >
                        {s.pct.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {totalAttempts > 0 && (
              <Card className="p-5">
                <div className="mb-3">
                  <div className="text-[15px] font-semibold">Белсенділік</div>
                  <div className="text-[12px] text-fg-muted">Соңғы 90 күн</div>
                </div>
                <Heatmap data={heatmap} />
              </Card>
            )}

            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex justify-between items-center">
                <div className="sa-display text-[18px] font-semibold tracking-[-0.01em]">
                  Тапсыру тарихы
                </div>
              </div>
              {rows.length === 0 ? (
                <div className="px-6 py-10 text-center text-fg-muted">
                  Әлі тапсыру жоқ
                </div>
              ) : (
                <AttemptsList attempts={rows} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  count,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-fg rounded-md hover:bg-bg-alt"
    >
      <span className="text-fg-muted">{icon}</span>
      <span className="flex-1">{children}</span>
      {count !== undefined && count > 0 && (
        <Badge tone="red" className="text-[11px] py-0.5 px-1.5 sa-num">
          {count}
        </Badge>
      )}
      <ChevronRight size={14} className="text-fg-subtle" />
    </Link>
  );
}

function Mini({
  label,
  value,
  tone = 'blue',
}: {
  label: string;
  value: string;
  tone?: 'blue' | 'amber' | 'green';
}) {
  const color = {
    blue: 'text-fg',
    amber: 'text-accent-ink',
    green: 'text-success-ink',
  }[tone];
  return (
    <Card className="p-4">
      <div className="text-[12px] text-fg-muted font-medium mb-1 uppercase tracking-[0.04em]">
        {label}
      </div>
      <div
        className={cn(
          'sa-display sa-num text-[28px] font-bold tracking-[-0.02em]',
          color,
        )}
      >
        {value}
      </div>
    </Card>
  );
}
