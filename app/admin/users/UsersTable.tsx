'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type AdminUser = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN';
  attempts: number;
  createdAt: string; // ISO
};

type SortKey = 'newest' | 'oldest' | 'attempts' | 'name';

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let xs = users;
    if (q) {
      xs = xs.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.phone ?? '').includes(q) ||
          (u.email ?? '').toLowerCase().includes(q),
      );
    }
    const sorted = [...xs];
    if (sort === 'newest') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === 'oldest') sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (sort === 'attempts') sorted.sort((a, b) => b.attempts - a.attempts);
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [users, search, sort]);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 max-w-[360px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <Input
            placeholder="Аты, телефон немесе email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <SortPill active={sort === 'newest'} onClick={() => setSort('newest')}>
            Жаңалары
          </SortPill>
          <SortPill active={sort === 'oldest'} onClick={() => setSort('oldest')}>
            Ескілері
          </SortPill>
          <SortPill active={sort === 'attempts'} onClick={() => setSort('attempts')}>
            Попыткалар
          </SortPill>
          <SortPill active={sort === 'name'} onClick={() => setSort('name')}>
            Аты
          </SortPill>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_100px_140px] px-5 py-3 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
          <div>Аты</div>
          <div>Телефон</div>
          <div>Email</div>
          <div>Попытка</div>
          <div>Тіркелген</div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-fg-muted">
            Сұранысқа сай пайдаланушы жоқ
          </div>
        ) : (
          filtered.map((u, i) => (
            <div
              key={u.id}
              className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_100px_140px] px-5 py-3.5 items-center text-sm gap-2 ${
                i === filtered.length - 1 ? '' : 'border-b border-border'
              }`}
            >
              <div className="font-medium flex items-center gap-2">
                {u.name}
                {u.role === 'ADMIN' && <Badge tone="amber">Admin</Badge>}
              </div>
              <div className="sa-num text-fg-muted">{u.phone ?? '—'}</div>
              <div className="text-fg-muted truncate">{u.email ?? '—'}</div>
              <div className="sa-num">{u.attempts}</div>
              <div className="sa-num text-fg-muted">
                {format(new Date(u.createdAt), 'd MMM yyyy', { locale: kk })}
              </div>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

function SortPill({
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
