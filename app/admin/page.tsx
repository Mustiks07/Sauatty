import Link from 'next/link';
import { Plus, Search, Filter, Edit, MoreHorizontal } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export const metadata = { title: 'Тесттер' };

export default async function AdminTests() {
  const tests = await prisma.test.findMany({
    include: {
      _count: { select: { questions: true, attempts: true } },
      attempts: { select: { score: true, totalQuestions: true, finishedAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

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

      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-[320px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <Input placeholder="Тесттерді іздеу..." className="pl-9 h-10" />
        </div>
        <Button variant="secondary" size="sm">
          <Filter size={14} /> Сүзгі
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[50px_1fr_100px_130px_100px_130px_60px] px-5 py-3 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
          <div>ID</div>
          <div>Атауы</div>
          <div>Сұрақ</div>
          <div>Попыткалар</div>
          <div>Орташа</div>
          <div>Статус</div>
          <div />
        </div>
        {tests.length === 0 ? (
          <div className="px-6 py-12 text-center text-fg-muted">
            Тест жоқ.{' '}
            <Link href="/admin/test/new" className="text-brand font-semibold">
              Алғашқысын жасау
            </Link>
          </div>
        ) : (
          tests.map((t, i) => {
            const finished = t.attempts.filter((a) => a.finishedAt);
            const avg = finished.length
              ? finished.reduce(
                  (s, a) =>
                    s + ((a.score ?? 0) / Math.max(1, a.totalQuestions)) * 10,
                  0,
                ) / finished.length
              : null;
            return (
              <div
                key={t.id}
                className={`grid grid-cols-1 md:grid-cols-[50px_1fr_100px_130px_100px_130px_60px] px-5 py-3.5 items-center text-sm gap-2 ${
                  i === tests.length - 1 ? '' : 'border-b border-border'
                }`}
              >
                <div className="sa-num text-fg-muted">
                  #{t.id.slice(0, 6).toUpperCase()}
                </div>
                <div className="font-medium">{t.titleKz}</div>
                <div className="sa-num text-fg-muted">{t._count.questions}</div>
                <div className="sa-num text-fg-muted">{t._count.attempts}</div>
                <div className="sa-num font-semibold">
                  {avg != null ? avg.toFixed(1) : '—'}
                </div>
                <div>
                  {t.isPublished ? (
                    <Badge tone="green">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" /> Live
                    </Badge>
                  ) : (
                    <Badge tone="gray">Драфт</Badge>
                  )}
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="text-fg-muted h-8 w-8"
                  >
                    <Link href={`/admin/test/${t.id}`}>
                      <Edit size={14} />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
