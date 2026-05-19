import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { onboardingSchema } from '@/lib/validators/auth';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const u = await requireUser();
    const body = onboardingSchema.parse(await req.json());

    // Update phone in both auth.users (via admin api) and public.users (Prisma)
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(u.auth.id, { phone: body.phone });

    await prisma.user.update({
      where: { id: u.db.id },
      data: { phone: body.phone },
    });

    return ok({ phone: body.phone });
  } catch (e) {
    return handleError(e);
  }
}
