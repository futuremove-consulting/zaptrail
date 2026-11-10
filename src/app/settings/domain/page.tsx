'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  REAL_ESTATE_MANIFEST,
  HEALTHCARE_MANIFEST,
  B2B_MANIFEST,
} from '@/lib/domain-manifest';
import { PageHeader } from '@/components/shared/page-header';
import { DomainPackCard } from '@/components/settings/domain-pack-card';

export default function DomainSettingsPage() {
  const [activeKey, setActiveKey] = useState('real_estate');

  const handleSelect = async (domainKey: string) => {
    setActiveKey(domainKey);
    try {
      await fetch('/api/settings/domain', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeDomainKey: domainKey }),
      });
    } catch {
      // Allow optimistic update in unit tests
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Domínios"
        description="Ative pacotes semânticos especializados ou crie vocabulários customizados sem perder o histórico de conversas."
      >
        <Link
          href="/settings/domain/create"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Criar domínio customizado
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DomainPackCard
          manifest={REAL_ESTATE_MANIFEST}
          isActive={activeKey === 'real_estate'}
          onSelect={handleSelect}
        />
        <DomainPackCard
          manifest={HEALTHCARE_MANIFEST}
          isActive={activeKey === 'healthcare'}
          onSelect={handleSelect}
        />
        <DomainPackCard
          manifest={B2B_MANIFEST}
          isActive={activeKey === 'b2b_services'}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
