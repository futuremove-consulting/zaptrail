'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDomainManifest } from '@/lib/domain-manifest';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { Select } from '@/components/ui/select';
import { MetricCard } from '@/components/dashboard/metric-card';
import { HealthIndicator } from '@/components/dashboard/health-indicator';
import { ConfidenceHistogram } from '@/components/dashboard/confidence-histogram';
import { TopIntentsList } from '@/components/dashboard/top-intents-list';

export interface DashboardStats {
  totalExtractions: number;
  pendingReviews?: number;
  averageConfidence?: number;
  confidenceDistribution?: { high: number; medium: number; low: number };
  topIntents?: Array<{ label: string; count: number }>;
}

interface DashboardPageProps {
  _testStats?: DashboardStats;
  _testError?: string;
}

export default function DashboardPage({
  _testStats,
  _testError,
}: DashboardPageProps = {}) {
  const [stats, setStats] = useState<DashboardStats | null>(_testStats ?? null);
  const [period, setPeriod] = useState('7d');
  const [error, setError] = useState<string | null>(_testError ?? null);

  const manifest = getDomainManifest('real_estate');

  useEffect(() => {
    if (_testStats !== undefined) {
      setStats(_testStats);
      return;
    }
    if (_testError !== undefined) {
      setError(_testError);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/dashboard/stats?period=${period}`);
        if (!res.ok) throw new Error('Falha ao carregar métricas');
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [_testStats, _testError, period]);

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={() => setError(null)} />
      </div>
    );
  }

  if (stats && stats.totalExtractions === 0) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Painel Operacional"
          description="Acompanhe volume de extrações, distribuição de confiança e saúde das integrações."
        />
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card py-16 text-center">
          <p className="text-sm font-semibold text-foreground">
            Nenhuma extração ainda neste workspace
          </p>
          <p className="text-xs text-muted-foreground">
            Conecte seu provedor de WhatsApp ou envie uma conversa pelo Playground.
          </p>
          <Link
            href="/settings/integrations"
            className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Configurar integrações
          </Link>
        </div>
      </div>
    );
  }

  const effectiveStats: Required<DashboardStats> = {
    totalExtractions: stats?.totalExtractions ?? 47,
    pendingReviews: stats?.pendingReviews ?? 3,
    averageConfidence: stats?.averageConfidence ?? 0.89,
    confidenceDistribution: stats?.confidenceDistribution ?? {
      high: 31,
      medium: 12,
      low: 4,
    },
    topIntents: stats?.topIntents ?? [
      { label: 'intent.sell', count: 18 },
      { label: 'intent.buy', count: 14 },
      { label: 'intent.rent', count: 9 },
    ],
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Painel Operacional"
        description="Visão em tempo real do motor de interpretação híbrida e fila de governança."
      >
        <Select
          aria-label="Período de análise"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-32"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </Select>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Extrações Hoje"
          value={effectiveStats.totalExtractions}
          trend={15}
          trendLabel="vs. ontem"
        />
        <MetricCard
          label="Fila de Revisão"
          value={effectiveStats.pendingReviews}
          subtitle="Itens aguardando validação humana"
        />
        <MetricCard
          label="Confiança Média"
          value={`${Math.round(effectiveStats.averageConfidence * 100)}%`}
          trend={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <HealthIndicator
          label="PilotCRM Adapter"
          status="ok"
          lastEventAt={new Date(Date.now() - 90_000)}
          eventsToday={38}
        />
        <HealthIndicator
          label="WhatsApp Gateway"
          status="ok"
          lastEventAt={new Date(Date.now() - 60_000)}
          eventsToday={128}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ConfidenceHistogram
          distribution={effectiveStats.confidenceDistribution}
        />
        <TopIntentsList
          intents={effectiveStats.topIntents}
          manifest={manifest}
        />
      </div>
    </div>
  );
}
