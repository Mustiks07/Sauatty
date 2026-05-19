import { cn } from '@/lib/utils';

export function SauattyLogo({
  size = 22,
  color,
  accent = '#F59E0B',
  className,
}: {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-baseline leading-none font-display', className)}
      style={{
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.02em',
        color: color || '#0F172A',
      }}
    >
      sauatt
      <span className="relative">
        y
        <span
          aria-hidden
          className="absolute left-0 right-0 rounded-full"
          style={{
            bottom: '-0.18em',
            height: '0.16em',
            background: accent,
          }}
        />
      </span>
    </span>
  );
}

export function SauattyMark({
  size = 40,
  radius,
  bg = '#2563EB',
  fg = '#fff',
  accent = '#F59E0B',
  className,
}: {
  size?: number;
  radius?: number;
  bg?: string;
  fg?: string;
  accent?: string;
  className?: string;
}) {
  const r = radius ?? size * 0.24;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx={r} fill={bg} />
      <path
        d="M27 13 c-1.5-2-4-3-7-3 -4 0-7 2-7 5.5 0 3 2.5 4.5 6 5.5 3.5 1 5 2 5 3.8 0 1.8-2 3-4.5 3 -3 0-5-1.2-6.5-3.2"
        stroke={fg}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="29" cy="27" r="4" fill={accent} />
      <path
        d="M27 27 l1.5 1.5 L31 25.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
