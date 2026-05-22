import Link from 'next/link';
import {
  Users,
  UserPlus,
  Target,
  TrendingUp,
  Trophy,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { getSiteStats } from '@/lib/stats';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LineDays, BarBuckets } from '@/components/admin/StatsCharts';

export const metadata = { title: 'Статистика' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminStatsPage() {
  const s = await getSiteStats();

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em]">
          Статистика
        </h1>
        <div className="text-sm text-fg-muted mt-1">
          Платформаның жалпы көрсеткіштері
        </div>
      </div>

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3.5">
        <Kpi
          icon={<Users size={20} className="text-brand" />}
          tone="blue"
          label="Барлық пайдаланушы"
          value={String(s.totalUsers)}
          sub={`+${s.newUsers7} осы аптада`}
        />
        <Kpi
          icon={<UserPlus size={20} className="text-success-ink" />}
          tone="green"
          label="Жаңалары (30 күн)"
          value={String(s.newUsers30)}
        />
        <Kpi
          icon={<Flame size={20} className="text-accent-ink" />}
          tone="amber"
          label="Аптада белсенді"
          value={String(s.wau)}
          sub={`${s.mau} айда`}
        />
        <Kpi
          icon={<Trophy size={20} className="text-success-ink" />}
          tone="green"
          label="Жарияланған тест"
          value={String(s.publishedTests)}
        />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi
          icon={<Target size={20} className="text-brand" />}
          tone="blue"
          label="Барлық тапсыру"
          value={String(s.finishedAttempts)}
          sub={`${s.totalAttempts - s.finishedAttempts} аяқталмаған`}
        />
        <Kpi
          icon={<TrendingUp size={20} className="text-brand" />}
          tone="blue"
          label="Осы аптада"
          value={String(s.attemptsWeek)}
        />
        <Kpi
          icon={<TrendingUp size={20} className="text-success-ink" />}
          tone="green"
          label="Орташа балл"
          value={`${s.avgScorePct.toFixed(0)}%`}
        />
        <Kpi
          icon={<Flame size={20} className="text-accent-ink" />}
          tone="amber"
          label="Аяқтау %"
          value={`${
            s.totalAttempts
              ? Math.round((s.finishedAttempts / s.totalAttempts) * 100)
              : 0
          }%`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card className="p-5">
          <ChartHeader title="Тіркелулер" sub="Соңғы 30 күн" />
          <LineDays data={s.usersByDay} color="#10B981" />
        </Card>
        <Card className="p-5">
          <ChartHeader title="Тапсырулар" sub="Соңғы 30 күн" />
          <LineDays data={s.attemptsByDay} color="#2563EB" />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <ChartHeader
            title="Баллдар таралуы"
            sub="Барлық аяқталған тапсырулар"
          />
          <BarBuckets data={s.distribution} />
        </Card>
      </div>

      {/* Top tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <ChartHeader title="Танымал тесттер" sub="Тапсыру саны бойынша" />
          {s.topTests.length === 0 ? (
            <EmptyMsg>Әлі тапсырулар жоқ</EmptyMsg>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {s.topTests.map((t) => (
                <Link
                  key={t.testId}
                  href={`/admin/test/${t.testId}/analytics`}
                  className="py-3 flex items-center justify-between hover:bg-bg-alt -mx-2 px-2 rounded"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-[12px] text-fg-muted">{t.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className="sa-num text-sm font-semibold">{t.attempts}</div>
                    <div className="text-[12px] text-fg-muted">тапсыру</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <ChartHeader
            title="Ең қиын тесттер"
            sub="Орташа балл бойынша (мин 3 тапсыру)"
            icon={<AlertTriangle size={14} className="text-accent" />}
          />
          {s.hardestTests.length === 0 ? (
            <EmptyMsg>Жеткілікті деректер жоқ</EmptyMsg>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {s.hardestTests.map((t) => (
                <Link
                  key={t.testId}
                  href={`/admin/test/${t.testId}/analytics`}
                  className="py-3 flex items-center justify-between hover:bg-bg-alt -mx-2 px-2 rounded"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-[12px] text-fg-muted">{t.subject}</div>
                  </div>
                  <Badge tone={t.avg < 5 ? 'red' : t.avg < 7 ? 'amber' : 'green'}>
                    {t.avg.toFixed(1)} / 10
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({
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
    <Card className="p-4 sm:p-5 flex justify-between items-start">
      <div className="min-w-0">
        <div className="text-[12px] sm:text-[13px] text-fg-muted font-medium mb-1.5">
          {label}
        </div>
        <div className="sa-display sa-num text-[24px] sm:text-[30px] font-bold tracking-[-0.02em] leading-none">
          {value}
        </div>
        {sub && (
          <div className="text-[12px] text-fg-muted mt-1.5 truncate">{sub}</div>
        )}
      </div>
      <div
        className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
    </Card>
  );
}

function ChartHeader({
  title,
  sub,
  icon,
}: {
  title: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <div className="text-[15px] font-semibold flex items-center gap-1.5">
          {icon}
          {title}
        </div>
        {sub && <div className="text-[12px] text-fg-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function EmptyMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center text-sm text-fg-muted py-8">{children}</div>
  );
}
