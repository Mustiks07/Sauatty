import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireRegularUserPage } from '@/lib/auth';
import { EditForm } from './EditForm';

export const metadata = { title: 'Профильді өңдеу' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ProfileEditPage() {
  const u = await requireRegularUserPage();
  return (
    <div className="bg-bg-alt min-h-screen">
      <div className="max-w-[720px] mx-auto px-5 md:px-8 py-10 md:py-12 pb-20">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg mb-5"
        >
          <ChevronLeft size={16} /> Профиль
        </Link>
        <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em] mb-6">
          Профильді өңдеу
        </h1>
        <EditForm
          initial={{
            name: u.db.name,
            avatarPreset: (u.db.avatarPreset ?? 'blue-amber') as any,
            examDate: u.db.examDate ? u.db.examDate.toISOString().slice(0, 10) : '',
            phone: u.db.phone,
            email: u.db.email,
          }}
        />
      </div>
    </div>
  );
}
