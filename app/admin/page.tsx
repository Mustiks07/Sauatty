import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { TestsTable, type AdminTest } from './TestsTable';

export const metadata = { title: 'Тесттер' };
export const dynamic = 'force-dynamic';

export default async function AdminTests() {
  // Single optimized query: counts + aggregate avg score per test, no per-attempt fetch.
  const tests = await prisma.test.findMany({
    include: {
      subject: { select: { nameKz: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Compute averages via a single grouped query instead of loading all attempts.
  const grouped = await prisma.testAttempt.groupBy({
    by: ['testId'],
    where: { finishedAt: { not: null } },
    _avg: { score: true },
    _max: { totalQuestions: true },
  });
  const avgByTest = new Map<string, number>();
  for (const g of grouped) {
    const totalQ = g._max.totalQuestions ?? 1;
    const avg = g._avg.score ?? 0;
    avgByTest.set(g.testId, (avg / Math.max(1, totalQ)) * 10);
  }

  const list: AdminTest[] = tests.map((t) => ({
    id: t.id,
    titleKz: t.titleKz,
    subjectName: t.subject.nameKz,
    questionCount: t._count.questions,
    attemptsCount: t._count.attempts,
    avg: avgByTest.get(t.id) ?? null,
    isPublished: t.isPublished,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em]">
            Тесттер
          </h1>
          <div className="text-sm text-fg-muted mt-1">
            Тесттерді басқару, өңдеу және публикациялау
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/test/new">
            <Plus size={16} /> Жаңа тест
          </Link>
        </Button>
      </div>

      <TestsTable tests={list} />
    </div>
  );
}
