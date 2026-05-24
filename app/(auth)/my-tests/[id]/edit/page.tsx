import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashHeader } from '@/components/shared/DashHeader';
import { UserTestEditor } from './UserTestEditor';

export const metadata = { title: 'Тестті өңдеу' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function EditMyTestPage({
  params,
}: {
  params: { id: string };
}) {
  const u = await requireRegularUserPage();
  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: {
      subject: { select: { id: true, nameKz: true, slug: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!test || test.authorId !== u.db.id) notFound();

  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader />
      <div className="container-page py-8">
        <div className="text-[13px] text-fg-muted flex items-center gap-1.5 mb-1.5">
          <Link href="/my-tests" className="hover:text-fg">
            Менің тесттерім
          </Link>{' '}
          / <span className="text-fg font-medium">{test.titleKz}</span>
        </div>
        <UserTestEditor
          test={{
            id: test.id,
            titleKz: test.titleKz,
            descriptionKz: test.descriptionKz,
            timeLimitMinutes: test.timeLimitMinutes,
            hasCalculator: test.hasCalculator,
            hasDraftCanvas: test.hasDraftCanvas,
            status: test.status,
            rejectionReason: test.rejectionReason,
            subjectName: test.subject.nameKz,
          }}
          questions={test.questions.map((q) => ({
            id: q.id,
            order: q.order,
            textKz: q.textKz,
            imageUrl: q.imageUrl,
            explanationKz: q.explanationKz,
            options: q.options.map((o) => ({
              id: o.id,
              textKz: o.textKz,
              isCorrect: o.isCorrect,
              order: o.order,
            })),
          }))}
        />
      </div>
    </div>
  );
}
