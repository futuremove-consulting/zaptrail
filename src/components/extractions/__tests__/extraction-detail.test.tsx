import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { UniversalInterpretationEnvelope } from '@/packages/core/types';
import { REAL_ESTATE_MANIFEST } from '@/lib/domain-manifest';
import { ExtractionDetail } from '../extraction-detail';

const baseEvidence = {
  evidence_id: 'ev_1',
  message_id: 'msg_1',
  conversation_id: 'conv_abc',
  exact_quote: 'Sou o dono sim, estou vendendo por 1,2 milhão',
  timestamp: '2026-11-05T10:00:00Z',
  extractor_type: 'rule' as const,
  parser_version: '1.0.0',
  confidence: 0.92,
};

const mockFullEnvelope: UniversalInterpretationEnvelope = {
  envelope_id: 'env_1',
  tenant_id: 't1',
  conversation_id: 'conv_abc',
  turn_id: 'turn_1',
  domain_key: 'real_estate',
  parser_version: '1.0.0',
  extractor_type: 'rule',
  llm_invoked: false,
  duplicate: false,
  review_required: false,
  do_not_contact: false,
  participants: [
    {
      participant_id: 'p_1',
      role_label: 'owner',
      contact_name: 'Carlos Proprietário',
      epistemic_status: 'declared',
      confidence: 0.95,
      evidence_refs: [baseEvidence],
    },
  ],
  intents: [
    {
      intent_id: 'int_1',
      intent_label: 'intent.sell',
      epistemic_status: 'declared',
      confidence: 0.9,
      evidence_refs: [baseEvidence],
    },
  ],
  facts: [],
  values: [
    {
      value_id: 'val_old',
      field_key: 'sale_asking_price',
      amount: 1000000,
      currency: 'BRL',
      raw_expression: '1 milhão',
      target_entity_key: 'prop_1',
      epistemic_status: 'superseded',
      confidence: 0.88,
      evidence_refs: [baseEvidence],
    },
    {
      value_id: 'val_new',
      field_key: 'sale_asking_price',
      amount: 1200000,
      currency: 'BRL',
      raw_expression: '1,2 milhão',
      target_entity_key: 'prop_1',
      epistemic_status: 'declared',
      confidence: 0.94,
      evidence_refs: [baseEvidence],
    },
  ],
  relationships: [],
  conditions: [],
  opportunities: [
    {
      opportunity_id: 'opp_1',
      opportunity_type: 'real_estate.sale',
      entity_key: 'prop_1',
      stage: 'qualified',
      epistemic_status: 'declared',
      confidence: 0.92,
      linked_condition_ids: [],
      attributes: { neighborhood: 'Pinheiros' },
      evidence_refs: [baseEvidence],
    },
  ],
  actions: [],
  media_results: [],
  evidence_refs: [baseEvidence],
  review_items: [],
};

describe('ExtractionDetail', () => {
  it('renders all 6 observation tabs', () => {
    render(
      <ExtractionDetail
        envelope={mockFullEnvelope}
        manifest={REAL_ESTATE_MANIFEST}
      />
    );
    expect(screen.getByRole('tab', { name: /participantes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /intenções/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fatos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /valores/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /relações/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /condições/i })).toBeInTheDocument();
  });

  it('renders participant with translated role label and show-in-conversation link', () => {
    render(
      <ExtractionDetail
        envelope={mockFullEnvelope}
        manifest={REAL_ESTATE_MANIFEST}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: /participantes/i }));
    expect(screen.getByText('Proprietário')).toBeInTheDocument();
    expect(screen.getByText(/mostrar na conversa/i)).toBeInTheDocument();
  });

  it('renders superseded value with strikethrough', () => {
    render(
      <ExtractionDetail
        envelope={mockFullEnvelope}
        manifest={REAL_ESTATE_MANIFEST}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: /valores/i }));
    const superseded = screen.getByTestId('value-superseded');
    expect(superseded).toHaveClass('line-through');
  });
});
