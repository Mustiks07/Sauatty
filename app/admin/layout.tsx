import { requireAdminPage } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await requireAdminPage();
  const pendingCount = await prisma.test.count({
    where: { status: 'PENDING_REVIEW' },
  });
  return (
    <AdminShell adminName={u.db.name} pendingCount={pendingCount}>
      {children}
    </AdminShell>
  );
}
