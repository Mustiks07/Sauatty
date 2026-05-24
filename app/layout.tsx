import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({
  subsets: ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});
const display = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sauatty.kz'),
  title: {
    default: 'Sauatty — ҰБТ-ға дайындық',
    template: '%s | Sauatty',
  },
  description: 'Қазақ тіліндегі ҰБТ-ға дайындалу платформасы.',
  openGraph: {
    title: 'Sauatty — ҰБТ-ға қазақша дайындық',
    description:
      'Нақты формат, таймер, калькулятор және қаралама — бір жерде. Қателеріңді талдап, жақсы ұпай жинай аласың.',
    url: 'https://www.sauatty.kz',
    siteName: 'Sauatty',
    locale: 'kk_KZ',
    type: 'website',
    images: [
      {
        url: 'https://www.sauatty.kz/og.png',
        width: 1200,
        height: 630,
        alt: 'Sauatty — ҰБТ-ға қазақша дайындық',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sauatty — ҰБТ-ға қазақша дайындық',
    description: 'Қазақ тіліндегі ҰБТ-ға дайындалу платформасы.',
    images: ['https://www.sauatty.kz/og.png'],
  },
  alternates: {
    canonical: 'https://www.sauatty.kz',
  },
  keywords: [
    'ҰБТ',
    'ҰБТ-ға дайындық',
    'математикалық сауаттылық',
    'Қазақстан тарихы',
    'тест',
    'онлайн дайындық',
    'қазақша',
    'sauatty',
    'тегін тест',
    '11 сынып',
  ],
  authors: [{ name: 'Sauatty' }],
  creator: 'Sauatty',
  publisher: 'Sauatty',
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Заполни эти ID после регистрации в Search Console / Webmaster
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Sauatty',
  alternateName: 'Sauatty — ҰБТ-ға дайындық',
  url: 'https://www.sauatty.kz',
  logo: 'https://www.sauatty.kz/icon',
  description: 'Қазақ тіліндегі ҰБТ-ға дайындалу платформасы.',
  inLanguage: 'kk',
  areaServed: {
    '@type': 'Country',
    name: 'Қазақстан',
  },
  sameAs: [],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <html lang="kk" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale="kk">
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
