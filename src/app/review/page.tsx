'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { ReviewQueueRecord } from '@/packages/core/supabase-storage';
import { PageHeader } from '@/components/shared/page-header';
import { FilterToolbar } from '@/components/shared/filter-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { SkeletonTable } from '@/components/shared/skeleton-table';
import { Badge } from '@/components/ui/badge';
import { ReviewInboxTable } from '@/components/review/review-inbox-table';
import { ReviewPeekSheet } from '@/components/review/review-peek-sheet';

interface ReviewInboxPageProps {
  _testItems?: ReviewQueueRecord[];
  _testLoaded?: boolean;
  _testLoading?: boolean;
  _testError?: string;
  _testSearchQuery?: string;
}

export default function ReviewInboxPage({
  _testItems,
  _testLoaded = false,
  _testLoading = false,
  _testError,
  _testSearchQuery = '',
}: ReviewInboxPageProps = {}) {
  const searchParams = useSearchParams();
  const initialInspectId = searchParams?.get('inspectId') ?? null;

  const [items, setItems] = useState<ReviewQueueRecord[]>(_testItems ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(
    _testLoading || (!_testLoaded && !_testError && !_testItems)
  );
  const [error, setError] = useState<string | null>(_testError ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(initialInspectId);
  const [searchQuery, setSearchQuery] = useState<string>(_testSearchQuery);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (_testItems !== undefined) setItems(_testItems);
    if (_testError !== undefined) {
      setError(_testError);
      setIsLoading(false);
    } else if (_testLoaded) {
      setError(null);
      setIsLoading(false);
    } else if (_testLoading) {
      setIsLoading(true);
    }
  }, [_testItems, _testLoaded, _testLoading, _testError]);

  useEffect(() => {
    if (_testSearchQuery !== undefined) {
      setSearchQuery(_testSearchQuery);
    }
  }, [_testSearchQuery]);

  useEffect(() => {
    if (_testLoaded || _testError || _testItems !== undefined) return;
    let cancelled = false;
    async function loadReviews() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/review');
        if (!res.ok) throw new Error('Falha ao carregar fila de revisão');
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
          setIsLoading(false);
        }
      }
    }
    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [_testLoaded, _testError, _testItems]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (severityFilter !== 'all' && item.severity !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesConv = item.conversation_id.toLowerCase().includes(q);
        const matchesReason = item.reason.toLowerCase().includes(q);
        const matchesId = item.review_id.toLowerCase().includes(q);
        const matchesQuote = item.evidence_refs?.some((ev) =>
          ev.exact_quote.toLowerCase().includes(q)
        );
        return matchesConv || matchesReason || matchesId || Boolean(matchesQuote);
      }
      return true;
    });
  }, [items, severityFilter, statusFilter, searchQuery]);

  const selectedItem = useMemo(
    () => items.find((i) => i.review_id === selectedId) ?? null,
    [items, selectedId]
  );

  const [peekMode, setPeekMode] = useState<'inspect' | 'edit' | 'reject'>('inspect');

  const advanceSelectionAndResolve = async (
    resolvedId: string,
    newStatus: ReviewQueueRecord['status'],
    resolvedPayload?: Record<string, unknown>,
    reviewerNotes?: string
  ) => {
    const currentIndex = filteredItems.findIndex(
      (i) => i.review_id === resolvedId
    );
    const nextItem =
      currentIndex >= 0 && currentIndex < filteredItems.length - 1
        ? filteredItems[currentIndex + 1]
        : null;

    setItems((prev) =>
      prev.map((item) =>
        item.review_id === resolvedId
          ? {
              ...item,
              status: newStatus,
              resolved_payload: resolvedPayload ?? item.original_payload,
              reviewer_notes: reviewerNotes,
            }
          : item
      )
    );
    setSelectedId(nextItem ? nextItem.review_id : null);
    setPeekMode('inspect');

    try {
      const decision =
        newStatus === 'approved'
          ? 'approve'
          : newStatus === 'edited'
          ? 'edit'
          : 'reject';

      await fetch(`/api/review/${resolvedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reviewer_id: 'usr_operator',
          reviewer_notes: reviewerNotes,
          resolved_payload: resolvedPayload,
        }),
      });
    } catch {
      // Optimistic state fallback for offline/test environments
    }
  };

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    severityFilter !== 'all' ||
    statusFilter !== 'all';

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <PageHeader
          title="Fila de Revisão"
          description="Valide extrações com ambiguidade ou baixa confiança com 1 clique ou atalhos de teclado (J/K, Enter, E, R)."
        >
          <Badge variant="secondary" className="font-mono">
            {items.filter((i) => i.status === 'pending').length} pendentes
          </Badge>
        </PageHeader>

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[
            {
              key: 'severity',
              label: 'Severidade',
              value: severityFilter,
              options: [
                { value: 'all', label: 'Todas' },
                { value: 'high', label: 'Alta' },
                { value: 'medium', label: 'Média' },
                { value: 'low', label: 'Baixa' },
              ],
              onChange: setSeverityFilter,
            },
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              options: [
                { value: 'all', label: 'Todos' },
                { value: 'pending', label: 'Pendente' },
                { value: 'approved', label: 'Aprovado' },
                { value: 'edited', label: 'Editado' },
                { value: 'rejected', label: 'Rejeitado' },
              ],
              onChange: setStatusFilter,
            },
          ]}
          onClearAll={() => {
            setSearchQuery('');
            setSeverityFilter('all');
            setStatusFilter('all');
          }}
        />

        {isLoading ? (
          <SkeletonTable rows={6} columns={6} />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null);
              setIsLoading(false);
            }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Tudo revisado!"
            description="Não há itens pendentes na fila de revisão no momento."
          />
        ) : filteredItems.length === 0 && hasFilters ? (
          <EmptyState
            title="Nenhum resultado encontrado"
            description="Tente ajustar os termos de busca ou limpar os filtros ativos."
            action={{
              label: 'Limpar filtros',
              onClick: () => {
                setSearchQuery('');
                setSeverityFilter('all');
                setStatusFilter('all');
              },
            }}
          />
        ) : (
          <ReviewInboxTable
            items={filteredItems}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setPeekMode('inspect');
            }}
            onApprove={() => {
              if (selectedItem) {
                advanceSelectionAndResolve(selectedItem.review_id, 'approved');
              }
            }}
            onEdit={() => {
              if (selectedItem) {
                setPeekMode('edit');
              }
            }}
            onReject={() => {
              if (selectedItem) {
                setPeekMode('reject');
              }
            }}
          />
        )}
      </div>

      <ReviewPeekSheet
        item={selectedItem}
        mode={peekMode}
        onModeChange={setPeekMode}
        onClose={() => setSelectedId(null)}
        onApprove={(item) =>
          advanceSelectionAndResolve(item.review_id, 'approved')
        }
        onEdit={(item, payload, notes) =>
          advanceSelectionAndResolve(item.review_id, 'edited', payload, notes)
        }
        onReject={(item, notes) =>
          advanceSelectionAndResolve(item.review_id, 'rejected', undefined, notes)
        }
      />
    </div>
  );
}
