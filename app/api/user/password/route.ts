import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';
import { createAdminClient } from '@/lib/supabase/server';
import { passwordSchema } from '@/lib/validators/auth';
import { isAllowedOrigin } from '@/lib/origin';

export const runtime = 'nodejs';

const bodySchema = z.object({
  newPassword: passwordSchema,
});

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) return fail('FORBIDDEN', 'Invalid origin', 403);
    const u = await requireUser();
    const body = bodySchema.parse(await req.json());

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(u.auth.id, {
      password: body.newPassword,
    });
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500);

    return ok({ updated: true });
  } catch (e) {
    return handleError(e);
  }
}
