import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/AuthShell';
import { OnboardingForm } from './OnboardingForm';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Профильді толтыр' };
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const u = await getSessionUser();
  // Admins should never see onboarding.
  if (u?.db.role === 'ADMIN') redirect('/admin');
  // Already has phone — onboarding not needed.
  if (u && u.db.phone) redirect('/dashboard');
  const t = await getTranslations();
  return (
    <AuthShell heading={t('onboarding.title')} subheading={t('onboarding.subtitle')}>
      <OnboardingForm />
    </AuthShell>
  );
}
