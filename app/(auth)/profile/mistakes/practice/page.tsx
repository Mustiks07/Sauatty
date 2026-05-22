import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { requireRegularUserPage } from '@/lib/auth';
import { getUserMistakes } from '@/lib/mistakes';
import { Practice, type PracticeQuestion } from './Practice';

export const metadata = { title: 'Қайталау режимі' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function PracticePage() {
  const u = await requireRegularUserPage();
  const mistakes = await getUserMistakes(u.db.id);
  if (mistakes.length === 0) redirect('/profile/mistakes');

  // Shuffle, take up to 10
  const shuffled = [...mistakes].sort(() => Math.random() - 0.5).slice(0, 10);
  const questions: PracticeQuestion[] = shuffled.map((m) => ({
    questionId: m.questionId,
    textKz: m.textKz,
    imageUrl: m.imageUrl,
    explanationKz: m.explanationKz,
    subjectName: m.subject.nameKz,
    options: m.options,
  }));

  return (
    <div className="bg-bg-alt min-h-screen">
      <div className="max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-12 pb-20">
        <Link
          href="/profile/mistakes"
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg mb-5"
        >
          <ChevronLeft size={16} /> Қателерім
        </Link>
        <Practice questions={questions} />
      </div>
    </div>
  );
}
