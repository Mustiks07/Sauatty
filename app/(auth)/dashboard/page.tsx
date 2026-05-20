import { Flame, Target, LineChart, Trophy } from 'lucide-react';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashHeader } from '@/components/shared/DashHeader';
import { Card } from '@/components/ui/Card';
import { DashboardList, type DashboardTest } from './DashboardList';

export const metadata = { title: 'Тесттер' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function Dashboard() {
  const u = await requireRegularUserPage();

  const [tests, attempts] = await Promise.all([
    prisma.test.findMany({
      where: { isPublished: true },
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.testAttempt.findMany({
      where: { userId: u.db.id, finishedAt: { not: null } },
      select: { testId: true, score: true },
    }),
  ]);

  const bestByTest = new Map<string, number>();
  for (const a of attempts) {
    if (a.score == null) continue;
    const prev = bestByTest.get(a.testId);
    if (prev == null || a.score > prev) bestByTest.set(a.testId, a.score);
  }

  const totalAttempts = attempts.length;
  const avg =
    attempts.length === 0
      ? 0
      : attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length;
  const best = attempts.reduce((m, a) => Math.max(m, a.score ?? 0), 0);

  const list: DashboardTest[] = tests.map((t) => ({
    id: t.id,
    titleKz: t.titleKz,
    questionCount: t._count.questions,
    timeLimitMinutes: t.timeLimitMinutes,
    best: bestByTest.get(t.id) ?? null,
  }));

  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader active="tests" />

      <div className="container-page py-10 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="sa-display text-[28px] md:text-[36px] font-semibold tracking-[-0.02em] m-0">
              Сәлем, {u.db.name}! <span className="text-[32px]">👋</span>
            </h1>
            <p className="text-base text-fg-muted mt-1.5">
              Бүгін бір тест тапсырып, серпінді сақта.
            </p>
          </div>
          {totalAttempts > 0 && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-accent-light rounded-full">
              <Flame size={18} className="text-accent-hover" />
              <span className="text-sm font-semibold text-accent-ink">
                Қарай дайындал!
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={<Target size={22} className="text-brand" />}
            tone="blue"
            label="Барлық попытка"
            value={String(totalAttempts)}
            sub="барлығы"
          />
          <StatCard
            icon={<LineChart size={22} className="text-accent-ink" />}
            tone="amber"
            label="Орташа балл"
            value={avg.toFixed(1)}
            sub="10 ұпайдан"
          />
          <StatCard
            icon={<Trophy size={22} className="text-success-ink" />}
            tone="green"
            label="Үздік нәтиже"
            value={String(best)}
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
  sub,
}: {
  icon: React.ReactNode;
  tone: 'blue' | 'amber' | 'green';
  label: string;
  value: string;
  sub?: string;
}) {
  const bg = {
    blue: 'bg-brand-light',
    amber: 'bg-accent-light',
    green: 'bg-success-light',
  }[tone];
  return (
    <Card className="p-6 flex justify-between items-start">
      <div>
        <div className="text-[13px] text-fg-muted font-medium mb-1.5">{label}</div>
        <div className="sa-display sa-num text-[36px] font-bold tracking-[-0.02em] text-fg leading-none">
          {value}
        </div>
        {sub && <div className="text-[13px] text-fg-muted mt-1">{sub}</div>}
      </div>
      <div className={`w-11 h-11 rounded-md ${bg} flex items-center justify-center`}>
        {icon}
      </div>
    </Card>
  );
}
