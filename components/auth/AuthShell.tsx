import Link from 'next/link';
import { SauattyLogo, SauattyMark } from '@/components/shared/Logo';
import { useTranslations } from 'next-intl';

export function AuthShell({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-bg-alt flex flex-col relative overflow-hidden">
      <div
        className="absolute -top-32 -right-20 w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FEF3C7 0%, transparent 70%)' }}
      />
      <nav className="relative z-10 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <SauattyMark size={28} />
          <SauattyLogo size={20} />
        </Link>
        <Link href="/" className="text-sm text-fg-muted hover:text-fg">
          {t('auth.back_home')}
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-[0_10px_40px_-8px_rgba(15,23,42,0.1)] border border-border p-8 md:p-9">
          <div className="mb-6">
            <h1 className="sa-display text-[26px] font-semibold tracking-[-0.02em] m-0">
              {heading}
            </h1>
            <p className="text-sm text-fg-muted mt-1.5">{subheading}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Divider() {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-3.5 text-fg-subtle text-xs font-medium uppercase tracking-[0.06em] my-1.5">
      <div className="flex-1 h-px bg-border" />
      {t('auth.or')}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export { GoogleButton } from './GoogleButton';
