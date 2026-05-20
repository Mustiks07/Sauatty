import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  Play,
  Check,
  Sparkles,
  Calculator,
  Target,
  LineChart,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SauattyLogo } from '@/components/shared/Logo';
import { LandingNav } from './LandingNav';

// Static landing — re-rendered hourly. Session-aware nav lives in the
// client island <LandingNav /> which calls /api/me on mount.
export const revalidate = 3600;

export default async function LandingPage() {
  const t = await getTranslations();
  return (
    <div className="bg-white min-h-screen">
      <LandingNav
        texts={{
          how: t('nav.how'),
          subjects: t('nav.subjects'),
          pricing: t('nav.pricing'),
          login: t('nav.login'),
          register: t('nav.register_free'),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-20 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-20 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FEF3C7 0%, transparent 70%)' }}
        />
        <div className="container-page relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center py-16 md:py-24">
          <div>
            <Badge tone="amber" className="mb-6">
              <Sparkles size={12} /> {t('hero.badge')}
            </Badge>
            <h1 className="sa-display text-[44px] sm:text-[56px] lg:text-[68px] font-bold leading-[1.04] tracking-[-0.025em] text-fg m-0">
              {t('hero.title_1')}
              <br />
              <span className="text-brand">{t('hero.title_2_blue')} </span>
              <span className="relative inline-block">
                {t('hero.title_2_amber')}
                <svg
                  viewBox="0 0 220 14"
                  className="absolute left-0 right-0 -bottom-2 w-full"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 8 Q 55 1, 110 6 T 218 5"
                    stroke="#F59E0B"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-[18px] md:text-[20px] leading-[1.55] text-fg-muted max-w-[520px] mt-7 mb-9">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="primary">
                <Link href="/tirkelu">
                  {t('hero.cta_start')} <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#how">
                  <Play size={14} /> {t('hero.cta_demo')}
                </a>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-7 text-sm text-fg-muted">
              {[t('hero.trust_1'), t('hero.trust_2'), t('hero.trust_3')].map((x) => (
                <div key={x} className="flex items-center gap-1.5">
                  <Check size={16} className="text-success" /> {x}
                </div>
              ))}
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container-page pb-24">
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <div className="text-[13px] font-semibold text-brand tracking-[0.08em] uppercase mb-3.5">
            {t('features.kicker')}
          </div>
          <h2 className="sa-display text-[36px] md:text-[44px] font-semibold tracking-[-0.02em]">
            {t('features.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            tone="blue"
            icon={<Target size={26} className="text-brand" />}
            title={t('features.f1_title')}
            body={t('features.f1_body')}
          />
          <FeatureCard
            tone="amber"
            icon={<Calculator size={26} className="text-accent-ink" />}
            title={t('features.f2_title')}
            body={t('features.f2_body')}
          />
          <FeatureCard
            tone="green"
            icon={<LineChart size={26} className="text-success-ink" />}
            title={t('features.f3_title')}
            body={t('features.f3_body')}
          />
        </div>
      </section>

      {/* Steps */}
      <section id="how" className="bg-bg-alt py-20">
        <div className="container-page">
          <div className="text-center max-w-[720px] mx-auto mb-14">
            <div className="text-[13px] font-semibold text-brand tracking-[0.08em] uppercase mb-3.5">
              {t('steps.kicker')}
            </div>
            <h2 className="sa-display text-[36px] md:text-[44px] font-semibold tracking-[-0.02em]">
              {t('steps.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step n="01" title={t('steps.s1_title')} body={t('steps.s1_body')} />
            <Step n="02" title={t('steps.s2_title')} body={t('steps.s2_body')} />
            <Step n="03" title={t('steps.s3_title')} body={t('steps.s3_body')} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="pricing" className="container-page py-28">
        <div
          className="relative overflow-hidden rounded-2xl px-8 py-16 md:px-16 md:py-20 text-center"
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
        >
          <div
            className="absolute -top-16 -right-16 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'rgba(245, 158, 11, 0.18)' }}
          />
          <div
            className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
          <div className="relative max-w-[640px] mx-auto">
            <h2 className="sa-display text-[36px] md:text-[52px] font-bold text-white tracking-[-0.025em] leading-[1.1]">
              {t('cta.title_1')}
              <br />
              {t('cta.title_2')}
            </h2>
            <p className="text-[16px] md:text-[18px] text-white/85 mt-5 mb-9">
              {t('cta.subtitle')}
            </p>
            <Button asChild variant="accent" size="lg" className="text-[17px] px-8 py-4">
              <Link href="/tirkelu">
                {t('hero.cta_start')} <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white/75 px-5 md:px-14 py-14">
        <div className="container-page grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div>
            <SauattyLogo size={22} color="#fff" accent="#FCD34D" />
            <p className="text-sm mt-3.5 leading-relaxed max-w-[280px]">
              {t('footer.tagline')}
            </p>
          </div>
          <FooterCol
            title={t('footer.col_product')}
            items={[
              { label: 'Лендинг', href: '/' },
              { label: 'Пәндер', href: null },
              { label: 'Бағалар', href: null },
              { label: 'FAQ', href: null },
            ]}
          />
          <FooterCol
            title={t('footer.col_company')}
            items={[
              { label: 'Біз туралы', href: null },
              { label: 'Блог', href: null },
              { label: 'Байланыс', href: 'mailto:contact@sauatty.kz' },
            ]}
          />
          <FooterCol
            title={t('footer.col_legal')}
            items={[
              { label: 'Құпиялылық', href: '/privacy' },
              { label: 'Шарттар', href: '/terms' },
              { label: 'Cookies', href: null },
            ]}
          />
        </div>
        <div className="container-page mt-12 pt-6 border-t border-white/10 flex justify-between text-[13px] text-white/50">
          <span>© 2026 Sauatty</span>
          <span>{t('footer.made_in_kz')} 🇰🇿</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: 'blue' | 'amber' | 'green';
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const bg = {
    blue: 'bg-brand-light',
    amber: 'bg-accent-light',
    green: 'bg-success-light',
  }[tone];
  return (
    <Card className="p-8">
      <div
        className={`w-14 h-14 rounded-lg ${bg} flex items-center justify-center mb-6`}
      >
        {icon}
      </div>
      <div className="sa-display text-[22px] font-semibold mb-2.5 tracking-[-0.01em]">
        {title}
      </div>
      <div className="text-[15px] text-fg-muted leading-[1.6]">{body}</div>
    </Card>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl bg-white p-8 border border-border">
      <div className="sa-display sa-num text-[14px] font-bold text-brand tracking-[0.06em] mb-5">
        {n}
      </div>
      <div className="sa-display text-[24px] font-semibold mb-2.5 tracking-[-0.015em]">
        {title}
      </div>
      <div className="text-[15px] text-fg-muted leading-[1.6]">{body}</div>
    </div>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string | null }[];
}) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-white uppercase tracking-[0.08em] mb-4">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((i) =>
          i.href ? (
            <Link
              key={i.label}
              href={i.href}
              className="text-sm text-white/70 hover:text-white"
            >
              {i.label}
            </Link>
          ) : (
            <span
              key={i.label}
              aria-disabled
              title="Жуырда"
              className="text-sm text-white/40 cursor-default select-none"
            >
              {i.label}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="hidden lg:flex justify-center">
      <div
        className="w-[320px] rounded-[36px] p-2.5"
        style={{
          background: '#0F172A',
          boxShadow:
            '0 30px 80px -20px rgba(15,23,42,0.35), 0 0 0 1px rgba(15,23,42,0.08)',
          transform: 'rotate(-2deg)',
        }}
      >
        <div className="bg-white rounded-[28px] overflow-hidden h-[580px] relative">
          <div className="h-9 flex items-center justify-between px-5 text-[13px] font-semibold">
            <span>9:41</span>
            <span className="w-4 h-2.5 rounded-sm border border-fg" />
          </div>
          <div className="px-5 py-3 border-b border-border flex justify-between items-center">
            <div className="text-[13px] text-fg-muted">
              Сұрақ <span className="text-fg font-semibold">3 / 10</span>
            </div>
            <div className="sa-num text-[15px] font-semibold flex items-center gap-1">
              <Clock size={14} className="text-brand" /> 14:32
            </div>
          </div>
          <div className="h-[3px] bg-bg-2">
            <div className="w-[30%] h-full bg-brand" />
          </div>
          <div className="p-5">
            <div className="text-[15px] leading-[1.5] text-fg mb-5">
              Дүкенде көйлектің бағасы 12 000 теңге. Жеңілдік 25%. Көйлектің жаңа
              бағасы қанша?
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                ['A', '8 000 ₸', false],
                ['B', '9 000 ₸', true],
                ['C', '10 000 ₸', false],
                ['D', '11 500 ₸', false],
              ].map(([l, t, s]) => (
                <div
                  key={l as string}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-md text-sm ${
                    s ? 'border-[1.5px] border-brand bg-brand-50 font-semibold' : 'border-[1.5px] border-border bg-white font-medium'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      s ? 'bg-brand text-white' : 'bg-bg-2 text-fg-muted'
                    }`}
                  >
                    {l}
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-[90px] right-5 flex flex-col gap-2.5">
            {[<Calculator key="c" size={20} className="text-brand" />, <Sparkles key="p" size={20} className="text-brand" />].map(
              (icon, i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full bg-white shadow-pop border border-border flex items-center justify-center"
                >
                  {icon}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
