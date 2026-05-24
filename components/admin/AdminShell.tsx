'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Inbox,
  LineChart,
  Layers,
  Settings,
  Users,
} from 'lucide-react';
import { SauattyLogo, SauattyMark } from '@/components/shared/Logo';

const ITEMS: {
  key: string;
  href: string | null;
  label: string;
  icon: any;
  match: (path: string) => boolean;
  badgeKey?: 'pending';
}[] = [
  {
    key: 'tests',
    href: '/admin',
    label: 'Тесттер',
    icon: BookOpen,
    match: (p) =>
      p === '/admin' ||
      (p.startsWith('/admin/test') && !p.startsWith('/admin/test-stats')),
  },
  {
    key: 'moderation',
    href: '/admin/moderation',
    label: 'Тексеру',
    icon: Inbox,
    match: (p) => p.startsWith('/admin/moderation'),
    badgeKey: 'pending',
  },
  {
    key: 'subjects',
    href: '/admin/subjects',
    label: 'Пәндер',
    icon: Layers,
    match: (p) => p.startsWith('/admin/subjects'),
  },
  {
    key: 'users',
    href: '/admin/users',
    label: 'Пайдаланушылар',
    icon: Users,
    match: (p) => p.startsWith('/admin/users'),
  },
  {
    key: 'stats',
    href: '/admin/stats',
    label: 'Статистика',
    icon: LineChart,
    match: (p) => p.startsWith('/admin/stats'),
  },
  {
    key: 'settings',
    href: null,
    label: 'Параметрлер',
    icon: Settings,
    match: () => false,
  },
];

export function AdminShell({
  adminName = 'Admin',
  pendingCount = 0,
  children,
}: {
  adminName?: string;
  pendingCount?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/admin';
  const initial = adminName.charAt(0).toUpperCase();

  return (
    <div className="bg-bg-alt min-h-screen flex">
      <aside className="w-[220px] bg-white border-r border-border min-h-screen p-3.5 flex-col gap-1 hidden md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 pb-5">
          <SauattyMark size={28} />
          <div>
            <SauattyLogo size={16} />
            <div className="text-[11px] font-semibold text-fg-muted mt-px uppercase tracking-[0.06em]">
              Admin
            </div>
          </div>
        </Link>
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const isActive = it.match(pathname);
          const baseClass =
            'flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm transition-colors';
          if (!it.href) {
            return (
              <div
                key={it.key}
                title="Жуырда"
                className={`${baseClass} text-fg-subtle font-medium cursor-not-allowed select-none`}
              >
                <Icon size={16} /> {it.label}
                <span className="ml-auto text-[10px] font-semibold text-fg-subtle border border-border rounded px-1 py-px uppercase">
                  soon
                </span>
              </div>
            );
          }
          const badge = it.badgeKey === 'pending' && pendingCount > 0 ? pendingCount : null;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={`${baseClass} ${
                isActive
                  ? 'bg-brand-50 text-brand font-semibold'
                  : 'text-fg-muted font-medium hover:bg-bg-alt'
              }`}
            >
              <Icon size={16} /> {it.label}
              {badge != null && (
                <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-white text-[11px] font-bold">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </aside>

      <div className="flex-1 min-w-0">
        <div className="h-14 bg-white border-b border-border flex items-center justify-end px-5 md:px-8 gap-3">
          <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border">
            <div className="w-7 h-7 rounded-full bg-fg text-white flex items-center justify-center text-[11px] font-bold">
              {initial}
            </div>
            <span className="text-[13px] font-medium">{adminName} · Admin</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
