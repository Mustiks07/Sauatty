import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SauattyMark } from '@/components/shared/Logo';

export const metadata = { title: 'Бет табылмады' };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center p-6">
      <div className="text-center max-w-[420px]">
        <SauattyMark size={48} />
        <h1 className="sa-display text-[44px] font-bold tracking-[-0.025em] mt-6 mb-2 sa-num">
          404
        </h1>
        <p className="text-base text-fg-muted mb-7">
          Сұралған бет табылмады. Мүмкін сілтеме ескірген немесе қате жазылған.
        </p>
        <Button asChild>
          <Link href="/">Басты бетке</Link>
        </Button>
      </div>
    </div>
  );
}
