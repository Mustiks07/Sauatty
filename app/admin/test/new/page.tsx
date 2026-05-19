import { prisma } from '@/lib/prisma';
import { NewTestForm } from './NewTestForm';

export const metadata = { title: 'Жаңа тест' };

export default async function NewTestPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { order: 'asc' } });
  return (
    <div className="p-6 md:p-10 max-w-[720px]">
      <h1 className="sa-display text-[24px] font-semibold tracking-[-0.02em] mb-6">
        Жаңа тест жасау
      </h1>
      <NewTestForm subjects={subjects.map((s) => ({ id: s.id, nameKz: s.nameKz }))} />
    </div>
  );
}
