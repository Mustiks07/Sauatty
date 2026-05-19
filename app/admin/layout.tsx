import { requireAdminPage } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await requireAdminPage();
  return <AdminShell adminName={u.db.name}>{children}</AdminShell>;
}
