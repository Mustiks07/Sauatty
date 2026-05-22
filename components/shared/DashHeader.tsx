import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { SauattyLogo, SauattyMark } from '@/components/shared/Logo';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { getSessionUser } from '@/lib/auth';

export async function DashHeader({ active }: { active?: 'tests' | 'progress' | 'history' }) {
  const u = await getSessionUser();
  const name = u?.db.name ?? 'Қолданушы';
  return (
    <header className="bg-white border-b border-border">
      <div className="container-page flex items-center justify-between py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <SauattyMark size={28} />
            <SauattyLogo size={20} />
          </Link>
          <nav className="hidden md:flex gap-1 text-sm">
            <NavItem href="/dashboard" active={active === 'tests'}>
              Тесттер
            </NavItem>
            <NavItem href="/profile" active={active === 'history'}>
              Тарих
            </NavItem>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 pr-2.5 pl-1 py-1 rounded-full border border-border hover:bg-bg-alt"
          >
            <UserAvatar name={name} preset={u?.db.avatarPreset} size={28} />
            <span className="text-sm font-medium hidden sm:inline">{name}</span>
            <ChevronDown size={14} className="text-fg-muted" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-md text-sm ${
        active
          ? 'bg-bg-2 text-fg font-semibold'
          : 'text-fg-muted font-medium hover:text-fg'
      }`}
    >
      {children}
    </Link>
  );
}
