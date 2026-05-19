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
  metadataBase: new URL('https://sauatty.kz'),
  title: {
    default: 'Sauatty — ҰБТ-ға дайындық',
    template: '%s | Sauatty',
  },
  description: 'Қазақ тіліндегі ҰБТ-ға дайындалу платформасы.',
  openGraph: {
    title: 'Sauatty',
    description: 'Қазақ тіліндегі ҰБТ-ға дайындалу платформасы.',
    locale: 'kk_KZ',
    type: 'website',
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
      <body>
        <NextIntlClientProvider messages={messages} locale="kk">
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
