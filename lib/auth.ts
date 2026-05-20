import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

// React `cache` dedupes calls within a single server render — same request
// won't hit Supabase/Prisma more than once for user lookup.
export const getSessionUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  return dbUser ? { auth: user, db: dbUser } : null;
});

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

/** For user-only pages — admins are bounced to /admin (no cross-side access). */
export async function requireRegularUserPage() {
  const u = await requireUserPage();
  if (u.db.role === 'ADMIN') redirect('/admin');
  return u;
}

export async function requireAdminPage() {
  const u = await requireUserPage();
  if (u.db.role !== 'ADMIN') redirect('/dashboard');
  return u;
}
