import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
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
        url: 'https://www.sauatty.kz/opengraph-image',
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
    images: ['https://www.sauatty.kz/opengraph-image'],
  },
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
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale="kk">
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
