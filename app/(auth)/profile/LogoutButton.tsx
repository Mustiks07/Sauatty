'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
      }}
      className="flex items-center gap-2.5 px-3 py-2.5 w-full text-sm font-semibold text-error rounded-md hover:bg-error-light/40"
    >
      <LogOut size={16} /> Шығу
    </button>
  );
}
