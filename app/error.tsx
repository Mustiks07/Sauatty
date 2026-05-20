'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';
import { SauattyMark } from '@/components/shared/Logo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center p-6">
      <div className="text-center max-w-[480px]">
        <SauattyMark size={48} />
        <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em] mt-6 mb-2">
          Бірдеңе дұрыс болмады
        </h1>
        <p className="text-sm text-fg-muted mb-7">
          Біз қатені жазып алдық. Қайта көріп көріңіз немесе кейінірек оралыңыз.
        </p>
        <div className="flex gap-2.5 justify-center">
          <Button variant="secondary" onClick={() => reset()}>
            Қайта көру
          </Button>
          <Button asChild>
            <a href="/">Басты бетке</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
