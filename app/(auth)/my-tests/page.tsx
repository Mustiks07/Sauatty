import Link from 'next/link';
import { Plus, FileText, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { requireRegularUserPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashHeader } from '@/components/shared/DashHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MAX_USER_DRAFTS } from '@/lib/constants';

export const metadata = { title: 'Менің тесттерім' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUS_LABELS = {
  DRAFT: { label: 'Драфт', tone: 'gray', icon: FileText },
  PENDING_REVIEW: { label: 'Тексеруде', tone: 'amber', icon: Clock },
  PUBLISHED: { label: 'Жарияланды', tone: 'green', icon: CheckCircle2 },
  REJECTED: { label: 'Қайтарылды', tone: 'red', icon: XCircle },
} as const;

export default async function MyTestsPage() {
  const u = await requireRegularUserPage();
  const tests = await prisma.test.findMany({
    where: { authorId: u.db.id },
    include: {
      subject: { select: { nameKz: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  const draftsCount = tests.filter((t) => t.status === 'DRAFT').length;
  const canCreateMore = draftsCount < MAX_USER_DRAFTS;

  return (
    <div className="bg-bg-alt min-h-screen">
      <DashHeader />
      <div className="container-page py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em] m-0">
              Менің тесттерім
            </h1>
            <p className="text-sm text-fg-muted mt-1">
              Бейіндік пәндер бойынша өз тестіңді жаса. Тексеруден өткен соң
              басқа оқушылар да тапсыра алады.
            </p>
          </div>
          {canCreateMore ? (
            <Button asChild>
              <Link href="/my-tests/new">
                <Plus size={16} /> Жаңа тест
              </Link>
            </Button>
          ) : (
            <Button disabled>
              <Plus size={16} /> Жаңа тест
            </Button>
          )}
        </div>

        {!canCreateMore && (
          <Card className="p-3.5 mb-5 bg-accent-light border-accent/20 text-[13px]">
            Лимит: бір уақытта {MAX_USER_DRAFTS} драфт. Бірін жариялау үшін
            жіберіңіз немесе жойыңыз.
          </Card>
        )}

        {tests.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-3.5">
              <BookOpen size={28} className="text-brand" />
            </div>
            <div className="sa-display text-[18px] font-semibold mb-1.5">
              Әлі тест жоқ
            </div>
            <div className="text-sm text-fg-muted mb-4">
              «Жаңа тест» батырмасын бас та, өз сұрақтарыңды жаса
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {tests.map((t) => {
              const meta = STATUS_LABELS[t.status as keyof typeof STATUS_LABELS];
              const Icon = meta.icon;
              return (
                <Link key={t.id} href={`/my-tests/${t.id}/edit`}>
                  <Card className="p-4 hover:shadow-card-hover transition-shadow">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold text-fg-muted uppercase tracking-[0.05em] mb-0.5">
                          {t.subject.nameKz}
                        </div>
                        <div className="sa-display text-[17px] font-semibold leading-tight">
                          {t.titleKz}
                        </div>
                        <div className="text-[13px] text-fg-muted mt-1.5 flex gap-3 flex-wrap">
                          <span>{t._count.questions} сұрақ</span>
                          <span>{t.timeLimitMinutes} мин</span>
                          <span>{new Date(t.createdAt).toLocaleDateString('kk-KZ')}</span>
                        </div>
                        {t.status === 'REJECTED' && t.rejectionReason && (
                          <div className="mt-2 p-2.5 rounded-md bg-error-light text-error-ink text-[12px]">
                            <strong>Қайтару себебі:</strong> {t.rejectionReason}
                          </div>
                        )}
                      </div>
                      <Badge tone={meta.tone as any}>
                        <Icon size={11} /> {meta.label}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
