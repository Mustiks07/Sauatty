import { CalendarClock, Sparkles } from 'lucide-react';

function daysUntil(date: Date): number {
  // Almaty timezone day diff
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-CA', { timeZone: 'Asia/Almaty' });
  const today = new Date(fmt(new Date()));
  const target = new Date(fmt(date));
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / 86400000);
}

export function UbtCountdown({
  examDate,
  variant = 'card',
}: {
  examDate: Date | null;
  variant?: 'card' | 'badge';
}) {
  if (!examDate) return null;
  const days = daysUntil(examDate);

  if (days < 0) {
    if (variant === 'badge') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-2 text-fg-muted rounded-full text-sm font-medium">
          <CalendarClock size={14} />
          ҰБТ өтті
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-border bg-bg-alt p-4 text-center text-sm text-fg-muted">
        ҰБТ күні өтті. Жаңа күн қой.
      </div>
    );
  }

  if (days === 0) {
    const inner = (
      <>
        <Sparkles size={variant === 'badge' ? 14 : 18} />
        <span>Бүгін ҰБТ күні! Сәттілік!</span>
      </>
    );
    if (variant === 'badge')
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-full text-sm font-semibold">
          {inner}
        </div>
      );
    return (
      <div
        className="rounded-lg p-5 text-white flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
      >
        {inner}
      </div>
    );
  }

  const tone =
    days <= 30 ? 'urgent' : days <= 90 ? 'warning' : 'normal';

  if (variant === 'badge') {
    const cls =
      tone === 'urgent'
        ? 'bg-error-light text-error-ink'
        : tone === 'warning'
        ? 'bg-accent-light text-accent-ink'
        : 'bg-brand-light text-brand-hover';
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${cls}`}
      >
        <CalendarClock size={14} />
        ҰБТ-ға <span className="sa-num">{days}</span> күн қалды
      </div>
    );
  }

  const grad =
    tone === 'urgent'
      ? 'linear-gradient(135deg, #EF4444, #F59E0B)'
      : tone === 'warning'
      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
      : 'linear-gradient(135deg, #2563EB, #1D4ED8)';

  return (
    <div
      className="rounded-lg p-5 text-white"
      style={{ background: grad }}
    >
      <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] font-semibold opacity-90 mb-2">
        <CalendarClock size={14} /> ҰБТ-ға дейін
      </div>
      <div className="sa-display sa-num text-[40px] font-bold leading-none">
        {days}
      </div>
      <div className="text-sm opacity-90 mt-1">
        {days === 1 ? 'күн қалды' : 'күн қалды'}
      </div>
    </div>
  );
}
