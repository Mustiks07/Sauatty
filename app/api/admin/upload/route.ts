import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';

export const runtime = 'nodejs';

const MAX_SIZE = 3_000_000; // 3 MB after client compression
const BUCKET = 'question-images';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      throw new ApiError('VALIDATION_ERROR', 'Файл табылмады', 422);
    }
    if (file.size > MAX_SIZE) {
      return fail('BODY_TOO_LARGE', 'Файл тым үлкен (максимум 3 МБ)', 413);
    }
    if (!file.type.startsWith('image/')) {
      throw new ApiError('VALIDATION_ERROR', 'Тек суреттер рұқсат етілген', 422);
    }

    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const path = `q/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Service-role client — bypasses RLS, but admin check above guards access.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
    if (upErr) {
      throw new ApiError('INTERNAL_ERROR', upErr.message, 500);
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return ok({ url: pub.publicUrl, path });
  } catch (e) {
    return handleError(e);
  }
}
