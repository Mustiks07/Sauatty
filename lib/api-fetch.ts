'use client';

import { toast } from 'sonner';

export type ApiResult<T> = { data: T } | { error: string; code: string };

export async function apiFetch<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  let json: ApiResult<T>;
  try {
    json = (await res.json()) as ApiResult<T>;
  } catch {
    throw new Error('Серверден жауап алынбады');
  }
  if (!res.ok || 'error' in json) {
    const err = 'error' in json ? json : { error: 'Қате', code: 'INTERNAL_ERROR' };
    toast.error(err.error);
    throw Object.assign(new Error(err.error), { code: err.code });
  }
  return json.data;
}
