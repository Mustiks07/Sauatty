import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/manage',
          '/api/',
          '/auth/callback',
          '/onboarding',
          '/dashboard',
          '/test/',
          '/profile',
        ],
      },
    ],
    sitemap: 'https://www.sauatty.kz/sitemap.xml',
    host: 'https://www.sauatty.kz',
  };
}
