'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { UniversalInterpretationEnvelope } from '@/packages/core/types';
import type { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ObservationRow } from './observation-row';
import { OpportunityCard } from './opportunity-card';
import { cn } from '@/lib/utils';

interface ExtractionDetailProps {
  envelope: UniversalInterpretationEnvelope;
  manifest: DomainPackUIManifest;
}

type ObservationTabKey =
  | 'participants'
  | 'intents'
  | 'facts'
  | 'values'
  | 'relationships'
  | 'conditions';

const TABS: Array<{ key: ObservationTabKey; label: string }> = [
  { key: 'participants', label: 'Participantes' },
  { key: 'intents', label: 'Intenções' },
  { key: 'facts', label: 'Fatos' },
  { key: 'values', label: 'Valores' },
  { key: 'relationships', label: 'Relações' },
  { key: 'conditions', label: 'Condições' },
];

export function ExtractionDetail({ envelope, manifest }: ExtractionDetailProps) {
  const [activeTab, setActiveTab] = useState<ObservationTabKey>('participants');

  const formatBrl = (amount: number, currency = 'BRL') =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Rail — Envelope Metadata */}
      <aside className="space-y-4 lg:col-span-3">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">
              Metadados do Envelope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono font-medium">{envelope.envelope_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conversa:</span>
              <Link
                href={`/conversations/${envelope.conversation_id}`}
                className="font-mono font-medium text-primary hover:underline"
              >
                {envelope.conversation_id}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Domínio:</span>
              <Badge variant="secondary">{manifest.display_name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Parser:</span>
              <span className="font-mono">{envelope.parser_version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Extrator:</span>
              <Badge variant="outline">{envelope.extractor_type ?? 'rule'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LLM Stage 2:</span>
              <span className="font-mono">
                {envelope.llm_invoked ? 'Acionado' : 'Não acionado'}
              </span>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Center Rail — 6 Semantic Observation Tabs */}
      <section className="space-y-4 lg:col-span-6">
        <div
          role="tablist"
          aria-label="Componentes semânticos extraídos"
          className="flex flex-wrap gap-1 rounded-lg bg-muted p-1"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                type="button"
                variant="ghost"
                size="sm"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium',
                  isActive
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        <div role="tabpanel" className="space-y-3">
          {activeTab === 'participants' &&
            (envelope.participants.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhum participante identificado neste turno.
              </p>
            ) : (
              envelope.participants.map((p) => (
                <ObservationRow
                  key={p.participant_id}
                  label={p.contact_name ?? p.participant_id}
                  value={manifest.role_labels[p.role_label] ?? p.role_label}
                  confidence={p.confidence}
                  epistemicStatus={p.epistemic_status}
                  evidenceQuote={p.evidence_refs?.[0]?.exact_quote}
                  conversationId={envelope.conversation_id}
                  messageId={p.evidence_refs?.[0]?.message_id}
                />
              ))
            ))}

          {activeTab === 'intents' &&
            (envelope.intents.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma intenção detectada neste turno.
              </p>
            ) : (
              envelope.intents.map((intent) => (
                <ObservationRow
                  key={intent.intent_id}
                  label="Intenção"
                  value={
                    manifest.intent_labels[intent.intent_label] ??
                    intent.intent_label
                  }
                  confidence={intent.confidence}
                  epistemicStatus={intent.epistemic_status}
                  evidenceQuote={intent.evidence_refs?.[0]?.exact_quote}
                  conversationId={envelope.conversation_id}
                  messageId={intent.evidence_refs?.[0]?.message_id}
                />
              ))
            ))}

          {activeTab === 'facts' &&
            (envelope.facts.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhum fato isolado registrado.
              </p>
            ) : (
              envelope.facts.map((fact) => (
                <ObservationRow
                  key={fact.fact_id}
                  label={fact.fact_key}
                  value={String(fact.fact_value)}
                  confidence={fact.confidence}
                  epistemicStatus={fact.epistemic_status}
                  evidenceQuote={fact.evidence_refs?.[0]?.exact_quote}
                  conversationId={envelope.conversation_id}
                  messageId={fact.evidence_refs?.[0]?.message_id}
                />
              ))
            ))}

          {activeTab === 'values' &&
            (envelope.values.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhum valor monetário ou métrica extraída.
              </p>
            ) : (
              envelope.values.map((val) => (
                <ObservationRow
                  key={val.value_id}
                  label={val.field_key}
                  value={
                    <span className="font-mono">
                      {formatBrl(val.amount, val.currency)}
                    </span>
                  }
                  confidence={val.confidence}
                  epistemicStatus={val.epistemic_status}
                  evidenceQuote={val.evidence_refs?.[0]?.exact_quote}
                  conversationId={envelope.conversation_id}
                  messageId={val.evidence_refs?.[0]?.message_id}
                  testId={
                    val.epistemic_status === 'superseded'
                      ? 'value-superseded'
                      : undefined
                  }
                />
              ))
            ))}

          {activeTab === 'relationships' &&
            (envelope.relationships.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma relação detectada.
              </p>
            ) : (
              envelope.relationships.map((rel) => (
                <ObservationRow
                  key={rel.relationship_id}
                  label={rel.relation_type}
                  value={rel.referred_name ?? rel.target_entity_key}
                  confidence={rel.confidence}
                  epistemicStatus={rel.epistemic_status}
                  evidenceQuote={rel.evidence_refs?.[0]?.exact_quote}
                  conversationId={envelope.conversation_id}
                  messageId={rel.evidence_refs?.[0]?.message_id}
                />
              ))
            ))}

          {activeTab === 'conditions' &&
            (envelope.conditions.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma condição vinculada.
              </p>
            ) : (
              envelope.conditions.map((cond) => (
                <ObservationRow
                  key={cond.condition_id}
                  label={cond.condition_type}
                  value={cond.description}
                  confidence={cond.confidence}
                  epistemicStatus={cond.epistemic_status}
                  evidenceQuote={cond.evidence_refs?.[0]?.exact_quote}
                  conversationId={envelope.conversation_id}
                  messageId={cond.evidence_refs?.[0]?.message_id}
                />
              ))
            ))}
        </div>
      </section>

      {/* Right Rail — Opportunities, Recommended Actions & Review Items */}
      <aside className="space-y-4 lg:col-span-3">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            {manifest.labels.opportunity} ({envelope.opportunities.length})
          </h3>
          {envelope.opportunities.map((opp) => (
            <OpportunityCard
              key={opp.opportunity_id}
              opportunity={opp}
              manifest={manifest}
            />
          ))}
        </div>

        {envelope.actions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
              Ações Recomendadas ({envelope.actions.length})
            </h3>
            {envelope.actions.map((act) => (
              <Card key={act.action_id} className="p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{act.action_type}</span>
                  <Badge variant="outline">{act.execution_mode}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {envelope.review_items.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
              Itens de Revisão ({envelope.review_items.length})
            </h3>
            {envelope.review_items.map((rev) => (
              <Card key={rev.review_id} className="p-3 text-xs">
                <p className="font-medium text-foreground">{rev.reason}</p>
                <Link
                  href={`/review?inspectId=${rev.review_id}`}
                  className="mt-1 inline-block font-medium text-primary hover:underline"
                >
                  Resolver na Fila →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
