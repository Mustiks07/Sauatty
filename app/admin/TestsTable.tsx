'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Edit } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export type AdminTest = {
  id: string;
  titleKz: string;
  subjectName: string;
  questionCount: number;
  attemptsCount: number;
  avg: number | null;
  isPublished: boolean;
};

type Filter = 'all' | 'published' | 'draft';

export function TestsTable({ tests }: { tests: AdminTest[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    let xs = tests;
    if (filter === 'published') xs = xs.filter((t) => t.isPublished);
    else if (filter === 'draft') xs = xs.filter((t) => !t.isPublished);
    const q = search.trim().toLowerCase();
    if (q) {
      xs = xs.filter(
        (t) =>
          t.titleKz.toLowerCase().includes(q) ||
          t.subjectName.toLowerCase().includes(q),
      );
    }
    return xs;
  }, [tests, search, filter]);

  const counts = {
    all: tests.length,
    published: tests.filter((t) => t.isPublished).length,
    draft: tests.filter((t) => !t.isPublished).length,
  };

  return (
    <>
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-[360px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <Input
            placeholder="Тесттерді іздеу..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Pill active={filter === 'all'} onClick={() => setFilter('all')}>
          Барлығы <span className="opacity-60 ml-1">{counts.all}</span>
        </Pill>
        <Pill active={filter === 'published'} onClick={() => setFilter('published')}>
          Жарияланған <span className="opacity-60 ml-1">{counts.published}</span>
        </Pill>
        <Pill active={filter === 'draft'} onClick={() => setFilter('draft')}>
          Драфт <span className="opacity-60 ml-1">{counts.draft}</span>
        </Pill>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_140px_80px_120px_90px_120px_60px] px-5 py-3 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
          <div>ID</div>
          <div>Атауы</div>
          <div>Пән</div>
          <div>Сұрақ</div>
          <div>Тапсыру</div>
          <div>Орташа</div>
          <div>Статус</div>
          <div />
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-fg-muted">
            {search ? 'Сұранысқа сай тест жоқ' : 'Тест жоқ'}
          </div>
        ) : (
          filtered.map((t, i) => (
            <div
              key={t.id}
              className={`grid grid-cols-1 md:grid-cols-[60px_1fr_140px_80px_120px_90px_120px_60px] px-5 py-3.5 items-center text-sm gap-2 ${
                i === filtered.length - 1 ? '' : 'border-b border-border'
              }`}
            >
              <div className="sa-num text-fg-muted">
                #{t.id.slice(0, 6).toUpperCase()}
              </div>
              <div className="font-medium">{t.titleKz}</div>
              <div className="text-fg-muted text-[13px]">{t.subjectName}</div>
              <div className="sa-num text-fg-muted">{t.questionCount}</div>
              <div className="sa-num text-fg-muted">{t.attemptsCount}</div>
              <div className="sa-num font-semibold">
                {t.avg != null ? t.avg.toFixed(1) : '—'}
              </div>
              <div>
                {t.isPublished ? (
                  <Badge tone="green">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" /> Live
                  </Badge>
                ) : (
                  <Badge tone="gray">Драфт</Badge>
                )}
              </div>
              <div className="flex justify-end gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="text-fg-muted h-8 w-8"
                >
                  <Link href={`/admin/test/${t.id}`}>
                    <Edit size={14} />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </>
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
