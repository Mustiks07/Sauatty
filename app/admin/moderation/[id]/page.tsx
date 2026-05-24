import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ReviewActions } from './ReviewActions';

export const metadata = { title: 'Тестті тексеру' };
export const dynamic = 'force-dynamic';

export default async function ReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: {
      subject: true,
      author: { select: { id: true, name: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!test) notFound();

  return (
    <div className="p-6 md:p-10 max-w-[860px]">
      <div className="text-[13px] text-fg-muted flex items-center gap-1.5 mb-1.5">
        <Link href="/admin/moderation" className="hover:text-fg">
          Кезек
        </Link>{' '}
        / <span className="text-fg font-medium">{test.titleKz}</span>
      </div>

      <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em] mb-0.5">
            {test.subject.nameKz}
          </div>
          <h1 className="sa-display text-[26px] font-semibold tracking-[-0.02em]">
            {test.titleKz}
          </h1>
          <div className="text-sm text-fg-muted mt-1">
            Автор: <span className="text-fg">{test.author?.name ?? '—'}</span> ·{' '}
            {test.timeLimitMinutes} мин · {test.questions.length} сұрақ
          </div>
          {test.descriptionKz && (
            <p className="text-[14px] mt-2 text-fg-muted">{test.descriptionKz}</p>
          )}
        </div>
        {test.status === 'PENDING_REVIEW' && <Badge tone="amber">Тексеруде</Badge>}
        {test.status === 'PUBLISHED' && <Badge tone="green">Жарияланды</Badge>}
        {test.status === 'REJECTED' && <Badge tone="red">Қайтарылды</Badge>}
      </div>

      {test.status === 'PENDING_REVIEW' && (
        <Card className="p-4 mb-5 bg-bg-alt">
          <ReviewActions testId={test.id} />
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {test.questions.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em]">
                Сұрақ {String(q.order).padStart(2, '0')}
              </div>
            </div>
            <div className="text-[15px] mb-3 whitespace-pre-wrap">{q.textKz}</div>
            {q.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={q.imageUrl}
                alt=""
                className="rounded-md border border-border max-h-[300px] mb-3"
              />
            )}
            <div className="flex flex-col gap-2">
              {q.options.map((o) => (
                <div
                  key={o.id}
                  className={`p-2.5 rounded-md border flex items-center gap-2 ${
                    o.isCorrect
                      ? 'bg-success-light border-success/40'
                      : 'bg-white border-border'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      o.isCorrect
                        ? 'bg-success text-white'
                        : 'bg-bg-alt text-fg-muted'
                    }`}
                  >
                    {['A', 'B', 'C', 'D'][o.order - 1] ?? '?'}
                  </div>
                  <span className="text-[14px]">{o.textKz}</span>
                </div>
              ))}
            </div>
            {q.explanationKz && (
              <div className="mt-3 p-3 rounded-md bg-brand-light text-[13px]">
                <strong>Түсініктеме:</strong> {q.explanationKz}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
