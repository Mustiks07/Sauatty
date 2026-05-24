import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EditSubjectForm } from './EditSubjectForm';

export const metadata = { title: 'Пәнді өңдеу' };
export const dynamic = 'force-dynamic';

export default async function EditSubjectPage({
  params,
}: {
  params: { id: string };
}) {
  const subject = await prisma.subject.findUnique({
    where: { id: params.id },
    include: { _count: { select: { tests: true } } },
  });
  if (!subject) notFound();
  return (
    <div className="p-6 md:p-10 max-w-[640px]">
      <h1 className="sa-display text-[24px] font-semibold tracking-[-0.02em] mb-1.5">
        Пәнді өңдеу
      </h1>
      <p className="text-sm text-fg-muted mb-6">
        Slug: <span className="font-mono">{subject.slug}</span> · {subject._count.tests}{' '}
        тест
      </p>
      <EditSubjectForm
        subject={{
          id: subject.id,
          nameKz: subject.nameKz,
          kind: subject.kind,
          order: subject.order,
          testCount: subject._count.tests,
        }}
      />
    </div>
  );
}
