import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/AuthShell';
import { OnboardingForm } from './OnboardingForm';

export const metadata = { title: 'Профильді толтыр' };

export default async function OnboardingPage() {
  const t = await getTranslations();
  return (
    <AuthShell heading={t('onboarding.title')} subheading={t('onboarding.subtitle')}>
      <OnboardingForm />
    </AuthShell>
  );
}
