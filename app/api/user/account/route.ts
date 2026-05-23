import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isAllowedOrigin } from '@/lib/origin';

export const runtime = 'nodejs';

const bodySchema = z.object({
  confirm: z.literal('Жою'),
});

export async function DELETE(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) return fail('FORBIDDEN', 'Invalid origin', 403);
    const u = await requireUser();
    // Body must contain literal "Жою" to confirm.
    const body = bodySchema.parse(await req.json().catch(() => ({})));
    if (!body.confirm) throw new ApiError('VALIDATION_ERROR', 'Растау керек', 422);

    // Prevent admin self-delete via this endpoint (admins should be managed manually).
    if (u.db.role === 'ADMIN') {
      throw new ApiError('FORBIDDEN', 'Админ аккаунтын осылай жою мүмкін емес', 403);
    }

    // 1. Delete from public.users — cascade removes attempts, answers, drafts.
    await prisma.user.delete({ where: { id: u.db.id } });

    // 2. Delete from auth.users via service-role.
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(u.auth.id);

    // 3. Sign out current session (clears cookies).
    const supabase = createClient();
    await supabase.auth.signOut();

    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
