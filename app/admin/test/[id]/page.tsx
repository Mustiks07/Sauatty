import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TestEditor } from './TestEditor';

export const metadata = { title: 'Тестті өңдеу' };
export const dynamic = 'force-dynamic';

export default async function EditTestPage({
  params,
}: {
  params: { id: string };
}) {
  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!test) notFound();
  return (
    <div className="p-6 md:p-10">
      <div className="text-[13px] text-fg-muted flex items-center gap-1.5 mb-1.5">
        <Link href="/admin" className="hover:text-fg">
          Тесттер
        </Link>{' '}
        / <span className="text-fg font-medium">{test.titleKz}</span>
      </div>
      <TestEditor
        test={{
          id: test.id,
          titleKz: test.titleKz,
          descriptionKz: test.descriptionKz,
          timeLimitMinutes: test.timeLimitMinutes,
          isPublished: test.isPublished,
          hasCalculator: test.hasCalculator,
          hasDraftCanvas: test.hasDraftCanvas,
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
  );
}
