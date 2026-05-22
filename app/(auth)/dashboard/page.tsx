import { Flame, Target, LineChart, Trophy } from 'lucide-react';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPublishedTestsCached } from '@/lib/cache';
import { calcStreak } from '@/lib/streak';
import { finalizeStaleAttemptsForUser } from '@/lib/attempt';
import { DashHeader } from '@/components/shared/DashHeader';
import { UbtCountdown } from '@/components/shared/UbtCountdown';
import { Card } from '@/components/ui/Card';
import { DashboardList, type DashboardTest } from './DashboardList';

export const metadata = { title: 'Тесттер' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function Dashboard() {
  const u = await requireRegularUserPage();

  // Auto-finalize any expired-but-unfinished attempts (e.g. user closed tab).
  await finalizeStaleAttemptsForUser(u.db.id);

  const [tests, attempts] = await Promise.all([
    getPublishedTestsCached(),
    prisma.testAttempt.findMany({
      where: { userId: u.db.id, finishedAt: { not: null } },
      select: { testId: true, score: true, finishedAt: true, totalQuestions: true },
    }),
  ]);

  const bestByTest = new Map<string, number>();
  for (const a of attempts) {
    if (a.score == null) continue;
    const prev = bestByTest.get(a.testId);
    if (prev == null || a.score > prev) bestByTest.set(a.testId, a.score);
  }

  const totalAttempts = attempts.length;
  const sumScore = attempts.reduce((s, a) => s + (a.score ?? 0), 0);
  const sumTotal = attempts.reduce((s, a) => s + a.totalQuestions, 0);
  const avg = totalAttempts ? sumScore / totalAttempts : 0;
  const best = attempts.reduce((m, a) => Math.max(m, a.score ?? 0), 0);
  const streak = calcStreak(
    attempts.map((a) => a.finishedAt).filter((d): d is Date => !!d),
  );
  const pct = sumTotal ? Math.round((sumScore / sumTotal) * 100) : 0;

  const list: DashboardTest[] = tests.map((t) => ({
    id: t.id,
    titleKz: t.titleKz,
    questionCount: t._count.questions,
    timeLimitMinutes: t.timeLimitMinutes,
    best: bestByTest.get(t.id) ?? null,
    subject: t.subject,
  }));

  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader active="tests" />

      <div className="container-page py-10 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="sa-display text-[28px] md:text-[36px] font-semibold tracking-[-0.02em] m-0">
              Сәлем, {u.db.name}!
            </h1>
            <p className="text-base text-fg-muted mt-1.5">
              {streak > 0
                ? `${streak} күн қатарынан тапсыруға дайынсың ба?`
                : 'Бүгін бір тест тапсырып, серпінді баста.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {u.db.examDate && (
              <UbtCountdown examDate={u.db.examDate} variant="badge" />
            )}
            {streak > 0 && (
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-accent-light rounded-full"
                title="Күн қатарынан"
              >
                <Flame size={18} className="text-accent-hover" />
                <span className="sa-num text-sm font-semibold text-accent-ink">
                  {streak} күн серпін
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <StatCard
            icon={<Target size={20} className="text-brand" />}
            tone="blue"
            label="Барлық попытка"
            value={String(totalAttempts)}
          />
          <StatCard
            icon={<LineChart size={20} className="text-accent-ink" />}
            tone="amber"
            label="Орташа балл"
            value={avg.toFixed(1)}
          />
          <StatCard
            icon={<Trophy size={20} className="text-success-ink" />}
            tone="green"
            label="Үздік нәтиже"
            value={String(best)}
          />
          <StatCard
            icon={<Flame size={20} className="text-accent-hover" />}
            tone="amber"
            label="Дұрыс %"
            value={`${pct}%`}
          />
        </div>

        <DashboardList tests={list} />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: 'blue' | 'amber' | 'green';
  label: string;
  value: string;
}) {
  const bg = {
    blue: 'bg-brand-light',
    amber: 'bg-accent-light',
    green: 'bg-success-light',
  }[tone];
  return (
    <Card className="p-4 sm:p-5 flex justify-between items-start">
      <div>
        <div className="text-[12px] sm:text-[13px] text-fg-muted font-medium mb-1.5">
          {label}
        </div>
        <div className="sa-display sa-num text-[24px] sm:text-[32px] font-bold tracking-[-0.02em] text-fg leading-none">
          {value}
        </div>
      </div>
      <div className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center`}>
        {icon}
      </div>
    </Card>
  );
}
