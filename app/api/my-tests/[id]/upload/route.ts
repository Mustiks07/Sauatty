import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';
import { assertCanUploadImage } from '@/lib/myTests';
import { USER_UPLOAD_MAX_BYTES } from '@/lib/constants';

export const runtime = 'nodejs';

const BUCKET = 'question-images';
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const u = await requireUser();
    await assertCanUploadImage(params.id, u.db.id);

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      throw new ApiError('VALIDATION_ERROR', 'Файл табылмады', 422);
    }
    if (file.size > USER_UPLOAD_MAX_BYTES) {
      return fail('BODY_TOO_LARGE', 'Файл тым үлкен (максимум 2 МБ)', 413);
    }
    if (!ALLOWED.has(file.type)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Тек JPEG/PNG/WEBP рұқсат етілген',
        422,
      );
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
    const path = `user-uploads/${u.db.id}/${params.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

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
