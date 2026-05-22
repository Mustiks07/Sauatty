import Link from 'next/link';
import { ChevronLeft, ListChecks, Sparkles } from 'lucide-react';
import { requireRegularUserPage } from '@/lib/auth';
import { getUserMistakes } from '@/lib/mistakes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MistakesList } from './MistakesList';

export const metadata = { title: 'Қателерім' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function MistakesPage() {
  const u = await requireRegularUserPage();
  const mistakes = await getUserMistakes(u.db.id);

  return (
    <div className="bg-bg-alt min-h-screen">
      <div className="max-w-[880px] mx-auto px-5 md:px-8 py-10 md:py-12 pb-20">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg mb-5"
        >
          <ChevronLeft size={16} /> Профиль
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="sa-display text-[26px] md:text-[32px] font-semibold tracking-[-0.02em]">
              Қателерім
            </h1>
            <p className="text-sm text-fg-muted mt-1">
              Қате жауап берген сұрақтарың. Қайта көріп, есте сақта.
            </p>
          </div>
          {mistakes.length > 0 && (
            <Button asChild>
              <Link href="/profile/mistakes/practice">
                <Sparkles size={16} /> Қайталау режимі
              </Link>
            </Button>
          )}
        </div>

        {mistakes.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
              <ListChecks size={28} className="text-success" />
            </div>
            <div className="sa-display text-[20px] font-semibold mb-2">
              Қателер жоқ!
            </div>
            <p className="text-sm text-fg-muted max-w-[400px] mx-auto">
              Барлық тапсырған сұрақтарыңа дұрыс жауап бердің. Жаңасын
              тапсырып, тағы тексерсең де болады.
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard">Тестке оралу</Link>
            </Button>
          </Card>
        ) : (
          <MistakesList mistakes={mistakes} />
        )}
      </div>
    </div>
  );
}
