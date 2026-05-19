import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';

export const metadata = { title: 'Пайдаланушылар' };

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { _count: { select: { attempts: true } } },
  });
  return (
    <div className="p-6 md:p-10">
      <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em] mb-1.5">
        Пайдаланушылар
      </h1>
      <div className="text-sm text-fg-muted mb-6">{users.length} пайдаланушы</div>
      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_100px_140px] px-5 py-3 text-[12px] text-fg-muted font-semibold uppercase tracking-[0.05em] border-b border-border bg-bg-alt">
          <div>Аты</div>
          <div>Телефон</div>
          <div>Email</div>
          <div>Попытка</div>
          <div>Тіркелген</div>
        </div>
        {users.map((u, i) => (
          <div
            key={u.id}
            className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_100px_140px] px-5 py-3.5 items-center text-sm gap-2 ${
              i === users.length - 1 ? '' : 'border-b border-border'
            }`}
          >
            <div className="font-medium flex items-center gap-2">
              {u.name}
              {u.role === 'ADMIN' && <Badge tone="amber">Admin</Badge>}
            </div>
            <div className="sa-num text-fg-muted">{u.phone ?? '—'}</div>
            <div className="text-fg-muted truncate">{u.email ?? '—'}</div>
            <div className="sa-num">{u._count.attempts}</div>
            <div className="sa-num text-fg-muted">
              {format(u.createdAt, 'd MMM yyyy', { locale: kk })}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
