'use client';

import { useState, useEffect, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { FilterToolbar } from '@/components/shared/filter-toolbar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { SkeletonTable } from '@/components/shared/skeleton-table';
import {
  ConversationsTable,
  type ConversationSummaryItem,
} from '@/components/conversations/conversations-table';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationSummaryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/conversations');
        if (!res.ok) throw new Error('Falha ao carregar conversas');
        const data = await res.json();
        if (!cancelled) {
          setConversations(data.conversations ?? []);
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
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.conversation_id.toLowerCase().includes(q) ||
        c.contact_name.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Conversas Processadas"
        description="Inspecione o histórico de turnos e abra a Timeline Dual para auditar evidências."
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearAll={() => setSearchQuery('')}
      />

      {isLoading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma conversa registrada"
          description="As conversas recebidas via WhatsApp aparecerão aqui automaticamente."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma conversa encontrada para a busca"
          action={{ label: 'Limpar filtros', onClick: () => setSearchQuery('') }}
        />
      ) : (
        <ConversationsTable conversations={filtered} />
      )}
    </div>
  );
}
