import Link from 'next/link';
import { Bell, BookOpen, Book, BarChart3, LineChart, Settings, Users } from 'lucide-react';
import { SauattyLogo, SauattyMark } from '@/components/shared/Logo';

const ITEMS: { key: string; href: string; label: string; icon: any }[] = [
  { key: 'dash', href: '/admin', label: 'Дашборд', icon: BarChart3 },
  { key: 'tests', href: '/admin', label: 'Тесттер', icon: BookOpen },
  { key: 'qs', href: '/admin', label: 'Сұрақтар', icon: Book },
  { key: 'users', href: '/admin/users', label: 'Пайдаланушылар', icon: Users },
  { key: 'stats', href: '/admin', label: 'Статистика', icon: LineChart },
  { key: 'settings', href: '/admin', label: 'Параметрлер', icon: Settings },
];

export function AdminShell({
  active = 'tests',
  adminName = 'Admin',
  children,
}: {
  active?: string;
  adminName?: string;
  children: React.ReactNode;
}) {
  const initial = adminName.charAt(0).toUpperCase();
  return (
    <div className="bg-bg-alt min-h-screen flex">
      <aside className="w-[220px] bg-white border-r border-border min-h-screen p-3.5 flex flex-col gap-1 hidden md:flex">
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
          const isActive = it.key === active;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm ${
                isActive
                  ? 'bg-brand-50 text-brand font-semibold'
                  : 'text-fg-muted font-medium hover:bg-bg-alt'
              }`}
            >
              <Icon size={16} /> {it.label}
            </Link>
          );
        })}
      </aside>

      <div className="flex-1 min-w-0">
        <div className="h-14 bg-white border-b border-border flex items-center justify-end px-5 md:px-8 gap-3">
          <button className="text-fg-muted p-2 hover:text-fg" aria-label="notifications">
            <Bell size={18} />
          </button>
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
