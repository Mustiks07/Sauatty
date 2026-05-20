'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn, formatMSS } from '@/lib/utils';

export function Timer({
  startedAtMs,
  timeLimitMinutes,
  onExpire,
}: {
  startedAtMs: number;
  timeLimitMinutes: number;
  onExpire: () => void;
}) {
  const deadline = startedAtMs + timeLimitMinutes * 60_000;
  // First render is server-safe: show full time. useEffect corrects on mount.
  const [remaining, setRemaining] = useState(() => timeLimitMinutes * 60);
  const [mounted, setMounted] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    setMounted(true);
    setRemaining(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    const id = setInterval(() => {
      const left = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !fired.current) {
        fired.current = true;
        onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);

  const critical = mounted && remaining < 60;

  return (
    <div
      className={cn(
        'sa-num inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-base font-semibold relative border',
        critical
          ? 'bg-error-light text-error-ink border-[#FCA5A5]'
          : 'bg-bg-2 text-fg border-transparent',
      )}
      suppressHydrationWarning
    >
      <Clock size={16} className={critical ? 'text-error-ink' : 'text-brand'} />
      <span suppressHydrationWarning>{formatMSS(remaining)}</span>
      {critical && (
        <span
          aria-hidden
          className="absolute -inset-[3px] rounded-[10px] border-2 border-error opacity-40 animate-sapulse"
        />
      )}
    </div>
  );
}
