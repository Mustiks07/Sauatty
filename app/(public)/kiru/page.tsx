import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AuthShell, Divider, GoogleButton } from '@/components/auth/AuthShell';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Кіру' };

export default async function LoginPage() {
  const t = await getTranslations();
  return (
    <AuthShell heading={t('auth.login_title')} subheading={t('auth.login_subtitle')}>
      <div className="flex flex-col gap-3.5">
        <GoogleButton label={t('auth.google_login')} />
        <Divider />
        <LoginForm />
        <div className="text-center text-sm text-fg-muted mt-2.5">
          {t('auth.no_account')}{' '}
          <Link href="/tirkelu" className="text-brand font-semibold">
            {t('auth.register')}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
