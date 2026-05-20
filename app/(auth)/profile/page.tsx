import Link from 'next/link';
import { User, Settings, Bell, Flame, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calcStreak } from '@/lib/streak';
import { DashHeader } from '@/components/shared/DashHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatMSS, cn } from '@/lib/utils';
import { LogoutButton } from './LogoutButton';

export const metadata = { title: 'Профиль' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ProfilePage() {
  const u = await requireRegularUserPage();
  const initial = u.db.name.charAt(0).toUpperCase();

  const attempts = await prisma.testAttempt.findMany({
    where: { userId: u.db.id, finishedAt: { not: null } },
    include: { test: true },
    orderBy: { finishedAt: 'desc' },
    take: 50,
  });

  const totalAttempts = attempts.length;
  const sumScore = attempts.reduce((s, a) => s + (a.score ?? 0), 0);
  const sumTotal = attempts.reduce((s, a) => s + a.totalQuestions, 0);
  const avg = totalAttempts ? sumScore / totalAttempts : 0;
  const best = attempts.reduce((m, a) => Math.max(m, a.score ?? 0), 0);
  const pct = sumTotal ? Math.round((sumScore / sumTotal) * 100) : 0;
  const streak = calcStreak(
    attempts.map((a) => a.finishedAt).filter((d): d is Date => !!d),
  );

  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader active="history" />
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-10 md:py-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">
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
              <div className="sa-display text-[22px] font-semibold">{u.db.name}</div>
              <div className="text-sm text-fg-muted mt-1">
                {u.db.phone ?? u.db.email}
              </div>
              {streak > 0 && (
                <Badge tone="amber" className="mt-3">
                  <Flame size={11} />{' '}
                  <span className="sa-num">{streak}</span> күн серпін
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <DisabledRow
                icon={<User size={16} className="text-fg-subtle" />}
                label="Профильді өңдеу"
              />
              <DisabledRow
                icon={<Settings size={16} className="text-fg-subtle" />}
                label="Параметрлер"
              />
              <DisabledRow
                icon={<Bell size={16} className="text-fg-subtle" />}
                label="Хабарламалар"
              />
            </div>
            <div className="h-px bg-border my-5" />
            <LogoutButton />
          </Card>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Mini label="Тапсыру" value={String(totalAttempts)} />
              <Mini label="Орташа балл" value={avg.toFixed(1)} />
              <Mini label="Үздік" value={String(best)} tone="amber" />
              <Mini label="Дұрыс %" value={`${pct}%`} tone="green" />
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex justify-between items-center">
                <div className="sa-display text-[18px] font-semibold tracking-[-0.01em]">
                  Тапсыру тарихы
                </div>
              </div>
              {attempts.length === 0 ? (
                <div className="px-6 py-10 text-center text-fg-muted">
                  Әлі тапсыру жоқ
                </div>
              ) : (
                <div>
                  <div className="hidden md:grid grid-cols-[90px_1fr_100px_100px_120px] gap-4 px-6 py-3 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
                    <div>Күн</div>
                    <div>Тест</div>
                    <div>Уақыт</div>
                    <div>Балл</div>
                    <div />
                  </div>
                  {attempts.map((a, i) => {
                    const secs = a.finishedAt
                      ? Math.max(
                          0,
                          Math.floor(
                            (a.finishedAt.getTime() - a.startedAt.getTime()) / 1000,
                          ),
                        )
                      : 0;
                    const score = a.score ?? 0;
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          'grid grid-cols-1 md:grid-cols-[90px_1fr_100px_100px_120px] gap-2 md:gap-4 px-6 py-3.5 items-center text-sm',
                          i !== attempts.length - 1 && 'border-b border-border',
                        )}
                      >
                        <div className="sa-num text-fg-muted">
                          {a.finishedAt
                            ? format(a.finishedAt, 'd MMM', { locale: kk })
                            : '—'}
                        </div>
                        <div className="text-fg font-medium">{a.test.titleKz}</div>
                        <div className="sa-num text-fg-muted">{formatMSS(secs)}</div>
                        <div className="sa-num font-semibold">
                          <span
                            className={cn(
                              score >= a.totalQuestions * 0.8
                                ? 'text-success'
                                : score >= a.totalQuestions * 0.5
                                ? 'text-fg'
                                : 'text-error',
                            )}
                          >
                            {score}
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
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisabledRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      title="Жуырда"
      className="flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-fg-subtle rounded-md cursor-not-allowed select-none"
    >
      {icon}
      <span className="flex-1">{label}</span>
      <span className="text-[10px] font-semibold text-fg-subtle border border-border rounded px-1 py-px uppercase">
        soon
      </span>
    </div>
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
      <div className={cn('sa-display sa-num text-[28px] font-bold tracking-[-0.02em]', color)}>
        {value}
      </div>
    </Card>
  );
}
