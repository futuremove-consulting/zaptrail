'use client';

import { useRouter } from 'next/navigation';
import { useDomainContext } from '@/context/domain-context';
import { SetupWizard } from '@/components/onboarding/setup-wizard';

export default function OnboardingPage() {
  const router = useRouter();
  const { setDomainKey } = useDomainContext();

  return (
    <div className="p-6">
      <SetupWizard
        onFinish={({ domainKey }) => {
          setDomainKey(domainKey);
          router.push('/dashboard');
        }}
      />
    </div>
  );
}
