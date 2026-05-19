'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function GoogleButton({ label }: { label: string }) {
  const [pending, setPending] = useState(false);
  async function onClick() {
    setPending(true);
    const supabase = createClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      setPending(false);
    }
    // On success Supabase redirects to Google; no further action.
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2.5 rounded-md border border-border bg-white px-5 py-3 text-[15px] font-semibold text-fg hover:bg-bg-alt hover:border-border-strong transition-colors disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M21.35 11.1H12v3.2h5.35c-.23 1.37-1.66 4-5.35 4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.9 3.96 14.7 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.65 8.65-8.78 0-.6-.06-1.05-.15-1.52z"
          fill="#0F172A"
        />
      </svg>
      {pending ? '...' : label}
    </button>
  );
}
