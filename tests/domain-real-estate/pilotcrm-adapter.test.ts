import { describe, it, expect } from 'vitest';
import {
  PilotCRMAdapter,
  PilotCRMEnrichmentActionSchema,
  PILOTCRM_ENRICHMENT_ACTIONS,
  PilotCRMProposalSchema,
} from '../../src/packages/domain-real-estate/adapters/pilotcrm-adapter';
import {
  UniversalInterpretationEnvelope,
  UniversalInterpretationEnvelopeSchema,
  EvidenceRef,
} from '../../src/packages/core/types';

function createDummyEvidence(quote = 'Sou o dono'): EvidenceRef {
  return {
    evidence_id: 'ev-dummy-1',
    message_id: 'msg-1',
    conversation_id: 'conv-1',
    exact_quote: quote,
    char_start: 0,
    char_end: quote.length,
    timestamp: '2026-10-21T12:00:00.000Z',
    extractor_type: 'rule',
    parser_version: '1.0.0',
    confidence: 0.95,
  };
}

function createDummyEnvelope(
  overrides: Partial<UniversalInterpretationEnvelope> = {}
): UniversalInterpretationEnvelope {
  const base: UniversalInterpretationEnvelope = {
    envelope_id: 'env-test-1',
    tenant_id: 'tenant-alpha',
    conversation_id: 'conv-1',
    turn_id: 'turn-1',
    domain_key: 'real_estate',
    parser_version: '1.0.0',
    duplicate: false,
    review_required: false,
    do_not_contact: false,
    participants: [
      {
        participant_id: 'part-1',
        role_label: 'owner',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [createDummyEvidence()],
      },
    ],
    intents: [],
    facts: [],
    values: [],
    relationships: [],
    conditions: [],
    opportunities: [],
    actions: [],
    media_results: [],
    evidence_refs: [createDummyEvidence()],
    review_items: [],
    ...overrides,
  };
  return UniversalInterpretationEnvelopeSchema.parse(base);
}

describe('PilotCRMAdapter (CRM-01, D-11)', () => {
  it('strictly validates allowed actions against enrichment_action_ck enum and rejects create_deal', () => {
    // Valid actions
    for (const action of PILOTCRM_ENRICHMENT_ACTIONS) {
      expect(PilotCRMEnrichmentActionSchema.parse(action)).toBe(action);
    }

    // Prohibited actions
    expect(() => PilotCRMEnrichmentActionSchema.parse('create_deal')).toThrow();
    expect(() => PilotCRMEnrichmentActionSchema.parse('CREATE_DEAL')).toThrow();
    expect(() => PilotCRMEnrichmentActionSchema.parse('unknown_action')).toThrow();
  });

  it('translates new opportunities to ADD with business operation in payload.recommended_action', () => {
    const ev = createDummyEvidence('vendo por 1,2 milhão');
    const envelope = createDummyEnvelope({
      opportunities: [
        {
          opportunity_id: 'opp-sale-1',
          opportunity_type: 'real_estate.capture_sale',
          entity_key: 'property_primary',
          stage: 'detected',
          epistemic_status: 'declared',
          confidence: 0.92,
          linked_condition_ids: [],
          attributes: { price: 1200000 },
          evidence_refs: [ev],
        },
      ],
      actions: [
        {
          action_id: 'act-qual-1',
          action_type: 'qualify_property',
          target_opportunity_id: 'opp-sale-1',
          target_entity_key: 'property_primary',
          execution_mode: 'assist',
          requires_human_approval: true,
          epistemic_status: 'declared',
          confidence: 0.92,
          payload: {},
          evidence_refs: [ev],
        },
      ],
    });

    const proposals = PilotCRMAdapter.toProposals(envelope);
    expect(proposals).toHaveLength(2);
    const p = proposals[0];
    expect(p.enrichment_action).toBe('ADD');
    expect(p.target_entity).toBe('deal');
    expect(p.target_key).toBe('property_primary');
    expect(p.payload.recommended_action).toBe('qualify_property');
    expect(p.payload.opportunity_type).toBe('real_estate.capture_sale');
    expect(p.action).not.toBe('create_deal');
    expect(PilotCRMProposalSchema.parse(p)).toBeDefined();
  });

  it('translates future nurture opportunity to DEFER', () => {
    const ev = createDummyEvidence('só penso em vender depois de março');
    const envelope = createDummyEnvelope({
      opportunities: [
        {
          opportunity_id: 'opp-nurture-1',
          opportunity_type: 'real_estate.future_nurture',
          entity_key: 'property_primary',
          stage: 'nurture',
          epistemic_status: 'declared',
          confidence: 0.85,
          linked_condition_ids: [],
          attributes: {},
          evidence_refs: [ev],
        },
      ],
    });

    const proposals = PilotCRMAdapter.toProposals(envelope);
    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('DEFER');
    expect(proposals[0].payload.recommended_action).toBe('register_future_followup');
  });

  it('translates explicit opt-out to SUPPRESS', () => {
    const ev = createDummyEvidence('pare de me mandar mensagem');
    const envelope = createDummyEnvelope({
      do_not_contact: true,
      intents: [
        {
          intent_id: 'int-optout',
          intent_label: 'intent.do_not_contact',
          target_entity_key: 'property_primary',
          epistemic_status: 'declared',
          confidence: 0.98,
          evidence_refs: [ev],
        },
      ],
    });

    const proposals = PilotCRMAdapter.toProposals(envelope);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].enrichment_action).toBe('SUPPRESS');
    expect(proposals[0].target_entity).toBe('contact');
    expect(proposals[0].payload.do_not_contact).toBe(true);
  });

  it('translates unrelated third party with general disinterest to INVALIDATE', () => {
    const ev = createDummyEvidence('Engano, não tenho imóvel nenhum');
    const envelope = createDummyEnvelope({
      participants: [
        {
          participant_id: 'part-unrelated',
          role_label: 'unrelated_third_party',
          epistemic_status: 'declared',
          confidence: 0.9,
          evidence_refs: [ev],
        },
      ],
      intents: [
        {
          intent_id: 'int-notgen',
          intent_label: 'intent.not_interested_general',
          target_entity_key: 'property_primary',
          epistemic_status: 'declared',
          confidence: 0.9,
          evidence_refs: [ev],
        },
      ],
    });

    const proposals = PilotCRMAdapter.toProposals(envelope);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].enrichment_action).toBe('INVALIDATE');
    expect(proposals[0].target_entity).toBe('contact');
  });

  it('translates conditional opportunity linkage to RELATE', () => {
    const ev = createDummyEvidence('só consigo se vender o meu atual antes');
    const envelope = createDummyEnvelope({
      conditions: [
        {
          condition_id: 'cond-sbb-1',
          condition_type: 'sale_before_purchase',
          source_opportunity_id: 'opp-buy-1',
          prerequisite_opportunity_id: 'opp-sale-1',
          description: 'Compra condicionada à venda',
          epistemic_status: 'declared',
          confidence: 0.9,
          evidence_refs: [ev],
        },
      ],
    });

    const proposals = PilotCRMAdapter.toProposals(envelope);
    const relate = proposals.find((p) => p.enrichment_action === 'RELATE');
    expect(relate).toBeDefined();
    expect(relate?.target_entity).toBe('relationship');
    expect(relate?.payload.source_opportunity_id).toBe('opp-buy-1');
    expect(relate?.payload.prerequisite_opportunity_id).toBe('opp-sale-1');
  });

  it('translates superseded values to UPDATE on property entity', () => {
    const evOld = createDummyEvidence('vendo por 1.200.000');
    const evNew = createDummyEvidence('subi para 1.350.000');
    const envelope = createDummyEnvelope({
      values: [
        {
          value_id: 'val-old',
          field_key: 'sale_asking_price',
          amount: 1200000,
          currency: 'BRL',
          raw_expression: '1.200.000',
          target_entity_key: 'property_primary',
          epistemic_status: 'superseded',
          confidence: 0.95,
          superseded_by_value_id: 'val-new',
          evidence_refs: [evOld],
        },
        {
          value_id: 'val-new',
          field_key: 'sale_asking_price',
          amount: 1350000,
          currency: 'BRL',
          raw_expression: '1.350.000',
          target_entity_key: 'property_primary',
          epistemic_status: 'declared',
          confidence: 0.95,
          evidence_refs: [evNew],
        },
      ],
    });

    const proposals = PilotCRMAdapter.toProposals(envelope);
    const update = proposals.find((p) => p.enrichment_action === 'UPDATE');
    expect(update).toBeDefined();
    expect(update?.target_entity).toBe('property');
    expect(update?.payload.amount).toBe(1350000);
    expect(update?.payload.superseded_amount).toBe(1200000);
    expect(update?.payload.superseded_value_id).toBe('val-old');
  });

  it('translates spousal conflict or review required to REVIEW', () => {
    const ev = createDummyEvidence('meu marido disse que não vende, mas se chegar em 1,5 mi eu convenço');
    const envelope = createDummyEnvelope({
      review_required: true,
      opportunities: [
        {
          opportunity_id: 'opp-conflict',
          opportunity_type: 'real_estate.capture_sale',
          entity_key: 'property_primary',
          stage: 'detected',
          epistemic_status: 'declared',
          confidence: 0.62,
          linked_condition_ids: [],
          attributes: {},
          evidence_refs: [ev],
        },
      ],
      review_items: [
        {
          review_id: 'rev-1',
          reason: 'Conflito conjugal',
          severity: 'high',
          target_id: 'opp-conflict',
          evidence_refs: [ev],
        },
      ],
      actions: [
        {
          action_id: 'act-rev',
          action_type: 'human_review',
          target_entity_key: 'property_primary',
          target_opportunity_id: 'opp-conflict',
          execution_mode: 'manual',
          requires_human_approval: true,
          epistemic_status: 'declared',
          confidence: 0.88,
          payload: {},
          evidence_refs: [ev],
        },
      ],
    });

    const proposals = PilotCRMAdapter.toProposals(envelope);
    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('REVIEW');
    expect(proposals[0].requires_human_review).toBe(true);
    expect(proposals[0].payload.recommended_action).toBe('human_review');
  });

  it('returns empty proposals array on duplicate webhook delivery (CT-18 idempotency)', () => {
    const envelope = createDummyEnvelope({
      duplicate: true,
    });
    const proposals = PilotCRMAdapter.toProposals(envelope);
    expect(proposals).toEqual([]);
  });

  it('satisfies CRMAdapter interface and applies proposals successfully', async () => {
    const adapter = new PilotCRMAdapter();
    expect(adapter.adapter_id).toBe('pilotcrm');
    expect(adapter.adapterName).toBe('pilotcrm');

    const ev = createDummyEvidence('sou o dono');
    const envelope = createDummyEnvelope({
      opportunities: [
        {
          opportunity_id: 'opp-1',
          opportunity_type: 'real_estate.capture_sale',
          entity_key: 'property_primary',
          stage: 'detected',
          epistemic_status: 'declared',
          confidence: 0.95,
          linked_condition_ids: [],
          attributes: {},
          evidence_refs: [ev],
        },
      ],
    });

    const proposals = adapter.translateEnvelope(envelope);
    expect(proposals).toHaveLength(2);

    const result = await adapter.applyProposals(proposals);
    expect(result.applied_count).toBe(2);
    expect(result.rejected_count).toBe(0);
  });
});

describe('PilotCRMAdapter — identity contract (pilotcrm#489 Onda 1)', () => {
  const participant = (role_label: string, confidence = 0.95) => ({
    participant_id: 'part-1',
    role_label,
    epistemic_status: 'declared' as const,
    confidence,
    evidence_refs: [createDummyEvidence('Sou o dono')],
  });

  it('emits CONFIRM identity proposal for a declared owner', () => {
    const envelope = createDummyEnvelope({ participants: [participant('owner')] });
    const proposals = PilotCRMAdapter.toProposals(envelope);

    const identity = proposals.find((p) => p.proposal_id.endsWith('-identity'));
    expect(identity).toBeDefined();
    expect(identity!.enrichment_action).toBe('CONFIRM');
    expect(identity!.target_entity).toBe('contact');
    expect(identity!.payload.party_role).toBe('owner');
    expect(identity!.payload.identity_status).toBe('verified');
    expect(identity!.payload.exact_quote).toBe('Sou o dono');
  });

  it('emits RELATE for spouse/family with referred contact', () => {
    const envelope = createDummyEnvelope({
      participants: [participant('family_member')],
      relationships: [
        {
          relationship_id: 'rel-1',
          source_participant_id: 'part-1',
          target_entity_key: 'property_primary',
          relation_type: 'family_member',
          referred_name: 'Ricardo',
          epistemic_status: 'declared',
          confidence: 0.9,
          evidence_refs: [createDummyEvidence('Ricardo é meu pai')],
        },
      ],
    });
    const proposals = PilotCRMAdapter.toProposals(envelope);

    const identity = proposals.find((p) => p.proposal_id.endsWith('-identity'));
    expect(identity!.enrichment_action).toBe('RELATE');
    expect(identity!.payload.identity_status).toBe('relationship');
    expect(identity!.payload.referred_name).toBe('Ricardo');
  });

  it('emits REVIEW for unknown role (goes to the human review queue)', () => {
    const envelope = createDummyEnvelope({
      participants: [participant('unknown', 0.4)],
    });
    const proposals = PilotCRMAdapter.toProposals(envelope);

    const identity = proposals.find((p) => p.proposal_id.endsWith('-identity'));
    expect(identity!.enrichment_action).toBe('REVIEW');
    expect(identity!.payload.identity_status).toBe('unknown');
    expect(identity!.requires_human_review).toBe(true);
  });
});
