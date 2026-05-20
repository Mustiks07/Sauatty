'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SauattyLogo, SauattyMark } from '@/components/shared/Logo';

export function LandingNav({
  texts,
}: {
  texts: { how: string; subjects: string; pricing: string; login: string; register: string };
}) {
  const [user, setUser] = useState<{ role: 'USER' | 'ADMIN' } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setUser({ role: j.data.role });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const homeHref = user?.role === 'ADMIN' ? '/admin' : '/dashboard';
  const loggedIn = !!user;

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur-md">
      <div className="container-page flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <SauattyMark size={28} />
          <SauattyLogo size={20} />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          <a href="#how" className="px-3 py-2 text-fg hover:text-brand">
            {texts.how}
          </a>
          <a href="#features" className="px-3 py-2 text-fg hover:text-brand">
            {texts.subjects}
          </a>
          <a href="#pricing" className="px-3 py-2 text-fg hover:text-brand">
            {texts.pricing}
          </a>
          {loggedIn ? (
            <Button asChild variant="primary" size="md" className="ml-2">
              <Link href={homeHref}>
                Жеке кабинет <ArrowRight size={16} />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="md" className="ml-2">
                <Link href="/kiru">{texts.login}</Link>
              </Button>
              <Button asChild variant="primary" size="md">
                <Link href="/tirkelu">{texts.register}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          {loggedIn ? (
            <Button asChild size="sm">
              <Link href={homeHref}>Жеке кабинет</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/tirkelu">{texts.register}</Link>
            </Button>
          )}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 rounded-md flex items-center justify-center text-fg hover:bg-bg-alt"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 top-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-[64px] right-0 left-0 bg-white border-b border-border shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-page flex flex-col gap-1 py-4">
              <MobileLink href="#how" onClick={() => setOpen(false)}>
                {texts.how}
              </MobileLink>
              <MobileLink href="#features" onClick={() => setOpen(false)}>
                {texts.subjects}
              </MobileLink>
              <MobileLink href="#pricing" onClick={() => setOpen(false)}>
                {texts.pricing}
              </MobileLink>
              <div className="h-px bg-border my-2" />
              {loggedIn ? (
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link href={homeHref}>
                    Жеке кабинет <ArrowRight size={16} />
                  </Link>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/kiru">{texts.login}</Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/tirkelu">{texts.register}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="px-3 py-3 text-base font-medium text-fg hover:bg-bg-alt rounded-md"
    >
      {children}
    </a>
  );
}
