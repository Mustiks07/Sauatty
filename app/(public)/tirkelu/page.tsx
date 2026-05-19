import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AuthShell, Divider, GoogleButton } from '@/components/auth/AuthShell';
import { RegisterForm } from './RegisterForm';

export const metadata = { title: 'Тіркелу' };

export default async function RegisterPage() {
  const t = await getTranslations();
  return (
    <AuthShell heading={t('auth.register_title')} subheading={t('auth.register_subtitle')}>
      <div className="flex flex-col gap-3.5">
        <GoogleButton label={t('auth.google_register')} />
        <Divider />
        <RegisterForm />
        <div className="text-center text-sm text-fg-muted">
          {t('auth.have_account')}{' '}
          <Link href="/kiru" className="text-brand font-semibold">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
