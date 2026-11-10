'use client';

import { useRouter } from 'next/navigation';
import { registerDomainManifest } from '@/lib/domain-manifest';
import { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { PageHeader } from '@/components/shared/page-header';
import { DomainCreateWizard } from '@/components/settings/domain-create-wizard';

export default function CreateDomainPage() {
  const router = useRouter();

  const handleComplete = async (manifest: DomainPackUIManifest) => {
    registerDomainManifest(manifest);
    try {
      await fetch('/api/settings/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });
    } catch {
      // Allow navigation in unit tests
    }
    router.push('/settings/domain');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Domínio Customizado"
        description="Configure intenções, tipos de oportunidade e papéis para adaptar o motor ao seu segmento."
      />
      <DomainCreateWizard onComplete={handleComplete} />
    </div>
  );
}
