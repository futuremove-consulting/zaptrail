'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { getDomainManifest } from '@/lib/domain-manifest';
import { PageHeader } from '@/components/shared/page-header';
import { FilterToolbar } from '@/components/shared/filter-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { SkeletonTable } from '@/components/shared/skeleton-table';
import {
  ExtractionsTable,
  type EnvelopeWithTimestamp,
} from '@/components/extractions/extractions-table';

interface ExtractionsPageProps {
  _testEnvelopes?: EnvelopeWithTimestamp[];
  _testLoaded?: boolean;
  _testError?: string;
}

export default function ExtractionsPage({
  _testEnvelopes,
  _testLoaded = false,
  _testError,
}: ExtractionsPageProps = {}) {
  const [envelopes, setEnvelopes] = useState<EnvelopeWithTimestamp[]>(
    _testEnvelopes ?? []
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    !_testLoaded && !_testError && !_testEnvelopes
  );
  const [error, setError] = useState<string | null>(_testError ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState('all');

  const manifest = getDomainManifest('real_estate');

  useEffect(() => {
    if (_testLoaded || _testError || _testEnvelopes !== undefined) return;
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/extractions');
        if (!res.ok) throw new Error('Falha ao carregar extrações');
        const data = await res.json();
        if (!cancelled) {
          setEnvelopes(data.envelopes ?? []);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar');
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [_testLoaded, _testError, _testEnvelopes]);

  const filtered = useMemo(() => {
    return envelopes.filter((env) => {
      if (reviewFilter === 'review' && !env.review_required) return false;
      if (reviewFilter === 'auto' && env.review_required) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          env.conversation_id.toLowerCase().includes(q) ||
          env.envelope_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [envelopes, reviewFilter, searchQuery]);

  const hasFilters = Boolean(searchQuery.trim()) || reviewFilter !== 'all';

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Extrações Semânticas"
        description="Catálogo auditável de envelopes interpretados com colunas dinâmicas do Domain Pack ativo."
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: 'review',
            label: 'Governança',
            value: reviewFilter,
            options: [
              { value: 'all', label: 'Todas' },
              { value: 'auto', label: 'Automáticas' },
              { value: 'review', label: 'Requer Revisão' },
            ],
            onChange: setReviewFilter,
          },
        ]}
        onClearAll={() => {
          setSearchQuery('');
          setReviewFilter('all');
        }}
      />

      {isLoading ? (
        <SkeletonTable rows={6} columns={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : envelopes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma extração registrada"
          description="Envie mensagens via webhook do WhatsApp ou experimente o Playground para gerar envelopes."
        />
      ) : filtered.length === 0 && hasFilters ? (
        <EmptyState
          title="Nenhum resultado para os filtros selecionados"
          action={{
            label: 'Limpar filtros',
            onClick: () => {
              setSearchQuery('');
              setReviewFilter('all');
            },
          }}
        />
      ) : (
        <ExtractionsTable envelopes={filtered} manifest={manifest} />
      )}
    </div>
  );
}
