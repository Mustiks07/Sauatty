import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const PUBLIC_PATHS = ['/', '/kiru', '/tirkelu', '/auth/callback'];
const AUTH_REDIRECT_FROM = new Set(['/kiru', '/tirkelu']);

function isAuthGated(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/test') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/my-tests') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboarding')
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isAuthGated(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/kiru';
    return NextResponse.redirect(url);
  }

  if (user && AUTH_REDIRECT_FROM.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Onboarding check — needs DB lookup, but middleware avoids Prisma (Edge).
  // We rely on auth user phone presence as a proxy. If phone is empty,
  // redirect Google-OAuth users to /onboarding.
  if (user && !user.phone && isAuthGated(pathname) && pathname !== '/onboarding') {
    const url = req.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
