import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { SauattyMark, SauattyLogo } from '@/components/shared/Logo';
import { AdminLoginForm } from './AdminLoginForm';

export const metadata = {
  title: 'Manage',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ManagePage() {
  const u = await getSessionUser();
  if (u?.db.role === 'ADMIN') redirect('/admin');

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-7 justify-center">
          <SauattyMark size={32} />
          <SauattyLogo size={22} color="#fff" accent="#FCD34D" />
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.12em] ml-1.5 border border-white/20 rounded px-1.5 py-0.5">
            Manage
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-modal border border-border p-8">
          <h1 className="sa-display text-[22px] font-semibold tracking-[-0.02em] mb-1.5">
            Қызметкерлерге арналған кіру
          </h1>
          <p className="text-sm text-fg-muted mb-6">
            Тек уәкілетті адамдарға қолжетімді.
          </p>
          <AdminLoginForm />
        </div>
        <p className="text-center text-[12px] text-white/40 mt-5">
          Қате жерге келдің бе? <a href="/" className="text-white/60 underline">Басты бетке</a>
        </p>
      </div>
    </div>
  );
}
