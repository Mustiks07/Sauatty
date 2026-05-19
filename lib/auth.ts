import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

export async function getSessionUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  return dbUser ? { auth: user, db: dbUser } : null;
}

export async function requireUser() {
  const u = await getSessionUser();
  if (!u) throw new ApiError('UNAUTHORIZED', 'Кіру қажет', 401);
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.db.role !== 'ADMIN') throw new ApiError('FORBIDDEN', 'Тек админ', 403);
  return u;
}

export async function requireUserPage() {
  const u = await getSessionUser();
  if (!u) redirect('/kiru');
  return u;
}

export async function requireAdminPage() {
  const u = await requireUserPage();
  if (u.db.role !== 'ADMIN') redirect('/dashboard');
  return u;
}
