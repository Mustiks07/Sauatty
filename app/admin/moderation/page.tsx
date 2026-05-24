import Link from 'next/link';
import { Clock, Inbox } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata = { title: 'Тексеру кезегі' };
export const dynamic = 'force-dynamic';

export default async function ModerationQueue() {
  const pending = await prisma.test.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      subject: { select: { nameKz: true } },
      author: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { submittedAt: 'asc' },
  });
  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em]">
          Тексеру кезегі
        </h1>
        <div className="text-sm text-fg-muted mt-1">
          Пайдаланушылар жіберген тесттерді тексер және жариялау туралы шеш
        </div>
      </div>

      {pending.length === 0 ? (
        <Card className="p-10 text-center">
          <Inbox size={36} className="text-fg-subtle mx-auto mb-3" />
          <div className="text-sm font-semibold">Кезек бос</div>
          <div className="text-[13px] text-fg-muted mt-1">
            Тексеретін тест жоқ
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pending.map((t) => (
            <Link key={t.id} href={`/admin/moderation/${t.id}`}>
              <Card className="p-4 hover:shadow-card-hover transition-shadow flex flex-wrap items-center gap-3 justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em] mb-0.5">
                    {t.subject.nameKz}
                  </div>
                  <div className="sa-display text-[17px] font-semibold leading-tight">
                    {t.titleKz}
                  </div>
                  <div className="text-[13px] text-fg-muted mt-1.5">
                    Автор: <span className="text-fg">{t.author?.name ?? '—'}</span> ·{' '}
                    {t._count.questions} сұрақ
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-fg-muted">
                  <Clock size={13} />
                  {t.submittedAt
                    ? new Date(t.submittedAt).toLocaleDateString('kk-KZ')
                    : '—'}
                  <Badge tone="amber">Тексеруде</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
