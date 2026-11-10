'use client';

import Link from 'next/link';
import type { UniversalInterpretationEnvelope } from '@/packages/core/types';
import type { DomainPackUIManifest, ExtraColumn } from '@/lib/domain-manifest.types';
import { getDomainManifest } from '@/lib/domain-manifest';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/review/confidence-badge';

export type EnvelopeWithTimestamp = UniversalInterpretationEnvelope & {
  created_at?: string;
};

interface ExtractionsTableProps {
  envelopes: EnvelopeWithTimestamp[];
  manifest?: DomainPackUIManifest;
}

export function resolveColumnValue(
  envelope: Record<string, unknown>,
  rawPath?: string
): unknown {
  if (!rawPath) return undefined;
  const normalizedPath = rawPath.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalizedPath.split('.').filter(Boolean);
  let current: unknown = envelope;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function formatExtraCell(value: unknown, col: ExtraColumn): string {
  if (value === undefined || value === null || value === '') return '—';
  const formatType = col.type ?? col.format ?? 'text';
  if (
    (formatType === 'currency' || formatType === 'currency_brl') &&
    typeof value === 'number'
  ) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (formatType === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('pt-BR').format(value);
  }
  return String(value);
}

function computeAverageConfidence(envelope: UniversalInterpretationEnvelope): number {
  const refs = envelope.evidence_refs ?? [];
  if (refs.length > 0) {
    const sum = refs.reduce((acc, r) => acc + r.confidence, 0);
    return sum / refs.length;
  }
  const opps = envelope.opportunities ?? [];
  if (opps.length > 0) {
    const sum = opps.reduce((acc, o) => acc + o.confidence, 0);
    return sum / opps.length;
  }
  return 0.85;
}

export function ExtractionsTable({
  envelopes,
  manifest: manifestProp,
}: ExtractionsTableProps) {
  const activeManifest = manifestProp ?? getDomainManifest('real_estate');
  const extraColumns = activeManifest.extra_columns ?? [];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Conversa
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Domínio
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Oportunidades
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Confiança Média
            </th>
            {extraColumns.map((col) => (
              <th key={col.key} scope="col" className="px-4 py-3 font-medium">
                {col.label ?? col.header ?? col.key}
              </th>
            ))}
            <th scope="col" className="px-4 py-3 font-medium">
              Revisão
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {envelopes.map((env) => {
            const envManifest =
              env.domain_key === activeManifest.domain_key
                ? activeManifest
                : getDomainManifest(env.domain_key);
            const avgConfidence = computeAverageConfidence(env);

            return (
              <tr
                key={env.envelope_id}
                className="transition-colors hover:bg-accent/50"
              >
                <td className="px-4 py-3 font-mono text-xs font-medium">
                  <Link
                    href={`/extractions/${env.envelope_id}`}
                    className="text-primary hover:underline"
                  >
                    {env.conversation_id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{envManifest.display_name}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">
                  {env.opportunities?.length ?? 0}
                </td>
                <td className="px-4 py-3">
                  <ConfidenceBadge confidence={avgConfidence} />
                </td>
                {extraColumns.map((col) => {
                  const rawVal = resolveColumnValue(
                    env as unknown as Record<string, unknown>,
                    col.path ?? col.accessor
                  );
                  return (
                    <td
                      key={col.key}
                      className="px-4 py-3 font-mono text-xs text-foreground"
                    >
                      {formatExtraCell(rawVal, col)}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  {env.review_required ? (
                    <Badge variant="warning">Requer revisão</Badge>
                  ) : (
                    <Badge variant="outline">Automático</Badge>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {env.created_at
                    ? new Date(env.created_at).toLocaleDateString('pt-BR')
                    : 'Hoje'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
