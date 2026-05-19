'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Calculator,
  LineChart,
  Target,
  Trophy,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const TONES = ['blue', 'amber', 'green', 'purple'] as const;
const ICONS = [Calculator, LineChart, Target, BookOpen];

type Tone = (typeof TONES)[number];
type Filter = 'all' | 'new' | 'done';

export type DashboardTest = {
  id: string;
  titleKz: string;
  questionCount: number;
  timeLimitMinutes: number;
  best: number | null;
};

export function DashboardList({ tests }: { tests: DashboardTest[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let xs = tests;
    if (filter === 'new') xs = xs.filter((t) => t.best == null);
    else if (filter === 'done') xs = xs.filter((t) => t.best != null);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      xs = xs.filter((t) => t.titleKz.toLowerCase().includes(q));
    }
    return xs;
  }, [tests, filter, search]);

  const counts = useMemo(
    () => ({
      all: tests.length,
      new: tests.filter((t) => t.best == null).length,
      done: tests.filter((t) => t.best != null).length,
    }),
    [tests],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="sa-display text-[22px] md:text-[24px] font-semibold tracking-[-0.015em]">
          Қолжетімді тесттер
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Pill active={filter === 'all'} onClick={() => setFilter('all')}>
            Барлығы <span className="opacity-60 ml-1">{counts.all}</span>
          </Pill>
          <Pill active={filter === 'new'} onClick={() => setFilter('new')}>
            Жаңалары <span className="opacity-60 ml-1">{counts.new}</span>
          </Pill>
          <Pill active={filter === 'done'} onClick={() => setFilter('done')}>
            Аяқталған <span className="opacity-60 ml-1">{counts.done}</span>
          </Pill>
        </div>
      </div>

      <div className="relative max-w-[360px] mb-5">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
        />
        <Input
          placeholder="Тестті іздеу..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-bg-alt p-9 text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center mx-auto mb-3.5">
            <BookOpen size={28} className="text-fg-subtle" />
          </div>
          <div className="sa-display text-[18px] font-semibold mb-1.5">
            {search ? 'Сұранысқа сай тест жоқ' : 'Әлі тест жоқ'}
          </div>
          <div className="text-sm text-fg-muted">
            {search ? 'Басқа кілт сөз көріп көр' : 'Жуырда жарияланады'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => {
            const Icon = ICONS[i % ICONS.length];
            const tone = TONES[i % TONES.length];
            return (
              <TestCard
                key={t.id}
                href={`/test/${t.id}`}
                icon={<Icon size={24} />}
                tone={tone}
                title={t.titleKz}
                n={i + 1}
                count={t.questionCount}
                time={t.timeLimitMinutes}
                best={t.best != null ? `${t.best}/${t.questionCount}` : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors border',
        active
          ? 'bg-white text-fg border-border shadow-card'
          : 'bg-transparent text-fg-muted border-transparent hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}

function TestCard({
  href,
  icon,
  tone,
  title,
  n,
  count,
  time,
  best,
}: {
  href: string;
  icon: React.ReactNode;
  tone: Tone;
  title: string;
  n: number;
  count: number;
  time: number;
  best: string | null;
}) {
  const bg = {
    blue: 'bg-brand-light text-brand',
    amber: 'bg-accent-light text-accent-ink',
    green: 'bg-success-light text-success-ink',
    purple: 'bg-[#EDE9FE] text-[#7C3AED]',
  }[tone];
  return (
    <Card className="p-6 flex flex-col gap-5 hover:shadow-card-hover transition-shadow">
      <div className="flex justify-between items-start">
        <div
          className={`rounded-lg flex items-center justify-center ${bg}`}
          style={{ width: 52, height: 52 }}
        >
          {icon}
        </div>
        {best ? (
          <Badge tone="green">
            <Trophy size={11} /> Үздік: {best}
          </Badge>
        ) : (
          <Badge tone="blue">Жаңа</Badge>
        )}
      </div>
      <div>
        <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em] mb-1.5">
          Тест {String(n).padStart(2, '0')}
        </div>
        <div className="sa-display text-[19px] font-semibold leading-[1.25] tracking-[-0.01em] mb-3">
          {title}
        </div>
        <div className="flex gap-3.5 text-[13px] text-fg-muted">
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} /> {count} сұрақ
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {time} минут
          </span>
        </div>
      </div>
      <Button asChild className="w-full">
        <Link href={href}>
          Бастау <ArrowRight size={16} />
        </Link>
      </Button>
    </Card>
  );
}
