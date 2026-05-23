import type { NextRequest } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'sauatty.kz',
  'www.sauatty.kz',
  'localhost',
  'localhost:3000',
  '127.0.0.1',
  '127.0.0.1:3000',
]);

/**
 * Basic CSRF defence: reject mutations whose Origin/Referer is not from us.
 * Browsers always send Origin on fetch POST/PATCH/DELETE — if absent, allow
 * (server-to-server callers don't send it, and we don't expect them).
 */
export function isAllowedOrigin(req: NextRequest | Request): boolean {
  const headers = (req as NextRequest).headers ?? (req as Request).headers;
  const origin = headers.get('origin');
  if (!origin) return true; // No Origin header → not a browser cross-site request.
  try {
    const { host } = new URL(origin);
    // Allow exact host or any *.vercel.app preview deployment.
    if (ALLOWED_HOSTS.has(host)) return true;
    if (host.endsWith('.vercel.app')) return true;
    return false;
  } catch {
    return false;
  }
}
