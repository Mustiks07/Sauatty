import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/auth';
import { ok, fail, handleError, ApiError } from '@/lib/api-error';
import { getOwnedTest, isEditableStatus } from '@/lib/myTests';
import {
  USER_UPLOAD_MAX_BYTES,
  MAX_IMAGES_PER_USER_TEST,
} from '@/lib/constants';

export const runtime = 'nodejs';

const BUCKET = 'question-images';
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const u = await requireUser();
    const test = await getOwnedTest(params.id, u.db.id);
    if (!isEditableStatus(test.status)) {
      throw new ApiError(
        'CONFLICT',
        'Тек DRAFT/REJECTED тестке сурет жүктеуге болады',
        409,
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Real storage-based quota: counts every file the user has uploaded for
    // this test, including orphans not yet attached to a question. Prevents
    // the previous DoS where a user could upload unlimited files without
    // saving them to any question (DB-attached count stayed 0).
    const folder = `user-uploads/${u.db.id}/${params.id}`;
    const { data: existing, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: MAX_IMAGES_PER_USER_TEST + 1 });
    if (listErr) {
      throw new ApiError('INTERNAL_ERROR', listErr.message, 500);
    }
    if ((existing?.length ?? 0) >= MAX_IMAGES_PER_USER_TEST) {
      throw new ApiError(
        'CONFLICT',
        `Лимит: ${MAX_IMAGES_PER_USER_TEST} сурет / тест`,
        409,
      );
    }

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

    const ext =
      file.type === 'image/jpeg'
        ? 'jpg'
        : file.type === 'image/png'
          ? 'png'
          : 'webp';
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

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
