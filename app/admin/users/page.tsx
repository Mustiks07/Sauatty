import { prisma } from '@/lib/prisma';
import { UsersTable, type AdminUser } from './UsersTable';

export const metadata = { title: 'Пайдаланушылар' };
export const dynamic = 'force-dynamic';

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: { _count: { select: { attempts: true } } },
  });
  const list: AdminUser[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    role: u.role,
    attempts: u._count.attempts,
    createdAt: u.createdAt.toISOString(),
  }));
  return (
    <div className="p-6 md:p-10">
      <h1 className="sa-display text-[28px] font-semibold tracking-[-0.02em] mb-1.5">
        Пайдаланушылар
      </h1>
      <div className="text-sm text-fg-muted mb-6">{users.length} пайдаланушы</div>
      <UsersTable users={list} />
    </div>
  );
}
