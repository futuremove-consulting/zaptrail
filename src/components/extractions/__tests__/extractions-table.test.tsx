import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { UniversalInterpretationEnvelope } from '@/packages/core/types';
import { REAL_ESTATE_MANIFEST } from '@/lib/domain-manifest';
import { ExtractionsTable } from '../extractions-table';

const mockEnvelope: UniversalInterpretationEnvelope & { created_at?: string } = {
  envelope_id: 'env_1',
  tenant_id: 't1',
  conversation_id: 'conv_abc',
  turn_id: 'turn_1',
  domain_key: 'real_estate',
  parser_version: '1.0.0',
  duplicate: false,
  review_required: false,
  do_not_contact: false,
  created_at: '2026-11-05T10:00:00Z',
  participants: [],
  intents: [],
  facts: [],
  values: [],
  relationships: [],
  conditions: [],
  opportunities: [
    {
      opportunity_id: 'opp_1',
      opportunity_type: 'real_estate.sale',
      entity_key: 'prop_1',
      stage: 'qualified',
      epistemic_status: 'declared',
      confidence: 0.91,
      linked_condition_ids: [],
      attributes: { sale_asking_price: 1200000, property_type: 'Apartamento', neighborhood: 'Pinheiros' },
      evidence_refs: [
        {
          evidence_id: 'ev_1',
          message_id: 'msg_1',
          conversation_id: 'conv_abc',
          exact_quote: 'vendendo por 1,2 milhão',
          timestamp: '2026-11-05T10:00:00Z',
          extractor_type: 'rule',
          parser_version: '1.0.0',
          confidence: 0.91,
        },
      ],
    },
    {
      opportunity_id: 'opp_2',
      opportunity_type: 'real_estate.rental',
      entity_key: 'prop_2',
      stage: 'detected',
      epistemic_status: 'inferred',
      confidence: 0.91,
      linked_condition_ids: [],
      attributes: {},
      evidence_refs: [
        {
          evidence_id: 'ev_2',
          message_id: 'msg_2',
          conversation_id: 'conv_abc',
          exact_quote: 'alugo também',
          timestamp: '2026-11-05T10:00:00Z',
          extractor_type: 'rule',
          parser_version: '1.0.0',
          confidence: 0.91,
        },
      ],
    },
  ],
  actions: [],
  media_results: [],
  evidence_refs: [
    {
      evidence_id: 'ev_1',
      message_id: 'msg_1',
      conversation_id: 'conv_abc',
      exact_quote: 'vendendo por 1,2 milhão',
      timestamp: '2026-11-05T10:00:00Z',
      extractor_type: 'rule',
      parser_version: '1.0.0',
      confidence: 0.91,
    },
  ],
  review_items: [],
};

describe('ExtractionsTable', () => {
  it('renders envelope rows with domain badge and opportunities count', () => {
    render(
      <ExtractionsTable envelopes={[mockEnvelope]} manifest={REAL_ESTATE_MANIFEST} />
    );
    expect(screen.getByText('conv_abc')).toBeInTheDocument();
    expect(screen.getByText('Imobiliário')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders confidence with correct high band color', () => {
    render(
      <ExtractionsTable envelopes={[mockEnvelope]} manifest={REAL_ESTATE_MANIFEST} />
    );
    const badge = screen.getByTestId('confidence-badge');
    expect(badge).toHaveClass('bg-success');
  });

  it('renders domain-specific extra columns from manifest formatted in BRL currency', () => {
    const customManifest = {
      ...REAL_ESTATE_MANIFEST,
      extra_columns: [
        {
          key: 'sale_price',
          label: 'Preço de Venda',
          type: 'currency' as const,
          path: 'domain_entities.asking_price',
        },
      ],
    };
    render(
      <ExtractionsTable
        envelopes={[
          {
            ...mockEnvelope,
            domain_entities: { asking_price: 1200000 },
          },
        ]}
        manifest={customManifest}
      />
    );
    expect(
      screen.getByRole('columnheader', { name: 'Preço de Venda' })
    ).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*1\.200\.000/)).toBeInTheDocument();
  });
});
