import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashHeader } from '@/components/shared/DashHeader';
import { NewUserTestForm } from './NewUserTestForm';

export const metadata = { title: 'Жаңа тест' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function NewMyTestPage() {
  await requireRegularUserPage();
  const subjects = await prisma.subject.findMany({
    where: { kind: 'PROFILE' },
    orderBy: { order: 'asc' },
  });
  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader />
      <div className="container-page py-10 max-w-[640px]">
        <h1 className="sa-display text-[24px] font-semibold tracking-[-0.02em] mb-1.5">
          Жаңа тест жасау
        </h1>
        <p className="text-sm text-fg-muted mb-6">
          Бейіндік пәнді таңда. Тестті сақтап, сұрақтар қос, содан кейін
          тексеруге жібер.
        </p>
        {subjects.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border-strong bg-white text-center text-sm text-fg-muted">
            Қазір бейіндік пәндер жоқ. Кейінірек көріп көріңіз.
          </div>
        ) : (
          <NewUserTestForm
            subjects={subjects.map((s) => ({ id: s.id, nameKz: s.nameKz }))}
          />
        )}
      </div>
    </div>
  );
}
