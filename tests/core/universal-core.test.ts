import { describe, it, expect } from 'vitest';
import {
  UniversalInterpretationEnvelopeSchema,
  EpistemicStatusSchema,
  EvidenceRefSchema,
  ConversationMessageSchema,
  TurnWindowSchema,
  ParticipantObservationSchema,
  IntentObservationSchema,
  FactObservationSchema,
  ValueObservationSchema,
  RelationshipObservationSchema,
  ConditionObservationSchema,
  OpportunityAssessmentSchema,
  ActionRecommendationSchema,
  ReviewItemSchema,
  type DomainPack,
  type CRMAdapter,
  type StoragePort,
  type CRMProposal,
} from '../../src/packages/core/types';
import {
  buildEvidenceRef,
  normalizeMessageText,
} from '../../src/packages/core/evidence';

describe('CORE-01 & CORE-02: Universal Semantic Contracts', () => {
  const baseEvidence = {
    evidence_id: 'ev-1',
    message_id: 'msg-1',
    conversation_id: 'conv-1',
    exact_quote: 'Eu quero vender o imóvel',
    char_start: 0,
    char_end: 24,
    timestamp: '2026-10-21T12:00:00Z',
    extractor_type: 'rule' as const,
    parser_version: '1.0.0',
    confidence: 0.95,
  };

  it('validates a complete UniversalInterpretationEnvelope with all observation categories', () => {
    const envelope = {
      envelope_id: 'env-123',
      tenant_id: 'tenant-abc',
      conversation_id: 'conv-1',
      turn_id: 'turn-1',
      domain_key: 'test_domain',
      parser_version: '1.0.0',
      duplicate: false,
      review_required: false,
      do_not_contact: false,
      participants: [
        {
          participant_id: 'part-1',
          role_label: 'owner',
          contact_name: 'Carlos',
          contact_phone: '+5511999999999',
          epistemic_status: 'declared' as const,
          confidence: 0.95,
          evidence_refs: [baseEvidence],
        },
      ],
      intents: [
        {
          intent_id: 'int-1',
          intent_label: 'capture_for_sale',
          target_entity_key: 'item-1',
          epistemic_status: 'declared' as const,
          confidence: 0.95,
          evidence_refs: [baseEvidence],
        },
      ],
      facts: [
        {
          fact_id: 'fact-1',
          fact_key: 'urgency',
          fact_value: 'high',
          target_entity_key: 'item-1',
          epistemic_status: 'inferred' as const,
          confidence: 0.88,
          evidence_refs: [baseEvidence],
        },
      ],
      values: [
        {
          value_id: 'val-1',
          field_key: 'asking_price',
          amount: 1200000,
          currency: 'BRL',
          raw_expression: '1,2 milhão',
          target_entity_key: 'item-1',
          epistemic_status: 'declared' as const,
          confidence: 0.98,
          evidence_refs: [baseEvidence],
        },
      ],
      relationships: [
        {
          relationship_id: 'rel-1',
          source_participant_id: 'part-1',
          target_entity_key: 'item-1',
          relation_type: 'proprietor',
          epistemic_status: 'declared' as const,
          confidence: 0.95,
          evidence_refs: [baseEvidence],
        },
      ],
      conditions: [
        {
          condition_id: 'cond-1',
          condition_type: 'custom_condition',
          description: 'Apenas após reforma',
          epistemic_status: 'declared' as const,
          confidence: 0.9,
          evidence_refs: [baseEvidence],
        },
      ],
      opportunities: [
        {
          opportunity_id: 'opp-1',
          opportunity_type: 'capture_item',
          entity_key: 'item-1',
          stage: 'qualified' as const,
          epistemic_status: 'declared' as const,
          confidence: 0.92,
          linked_condition_ids: ['cond-1'],
          attributes: { priority: 'urgent' },
          evidence_refs: [baseEvidence],
        },
      ],
      actions: [
        {
          action_id: 'act-1',
          action_type: 'qualify_item',
          target_entity_key: 'item-1',
          target_opportunity_id: 'opp-1',
          execution_mode: 'manual' as const,
          requires_human_approval: true,
          epistemic_status: 'declared' as const,
          confidence: 0.95,
          payload: { note: 'Confirmar documentos' },
          evidence_refs: [baseEvidence],
        },
      ],
      media_results: [],
      evidence_refs: [baseEvidence],
      review_items: [],
      domain_entities: { customField: 'generic_value' },
    };

    const parsed = UniversalInterpretationEnvelopeSchema.parse(envelope);
    expect(parsed.envelope_id).toBe('env-123');
    expect(parsed.values[0].amount).toBe(1200000);
  });

  it('rejects observations with empty evidence_refs (D-04)', () => {
    const invalidObservation = {
      participant_id: 'part-1',
      role_label: 'owner',
      epistemic_status: 'declared',
      confidence: 0.9,
      evidence_refs: [], // Empty evidence_refs must fail
    };

    expect(() => ParticipantObservationSchema.parse(invalidObservation)).toThrow();
  });

  it('allows plugging DomainPack, CRMAdapter, and StoragePort without domain coupling', async () => {
    type TestEntities = { item_code: string };

    const testDomainPack: DomainPack<TestEntities> = {
      domain_key: 'logistics',
      parser_version: '1.0.0',
      interpretTurnWindow: async (turnWindow) => {
        return {
          participants: [],
          intents: [],
          facts: [],
          values: [],
          relationships: [],
          conditions: [],
          opportunities: [],
          actions: [],
          media_results: [],
          evidence_refs: [],
          review_items: [],
          domain_entities: { item_code: 'PKG-100' },
        };
      },
    };

    const testCrmAdapter: CRMAdapter = {
      adapter_id: 'mock_crm',
      translateEnvelope: (envelope) => {
        const proposals: CRMProposal[] = [
          {
            entity_type: 'contact',
            action: 'CONFIRM',
            record_id: 'rec-1',
            payload: { verified: true },
          },
        ];
        return proposals;
      },
      applyProposals: async (proposals) => {
        return { applied_count: proposals.length, rejected_count: 0 };
      },
    };

    const testStoragePort: StoragePort = {
      isProcessed: async (_tenantId, _provider, _messageId) => false,
      markProcessed: async () => {},
      saveEnvelope: async () => {},
      getHistoricalValues: async () => [],
    };

    expect(testDomainPack.domain_key).toBe('logistics');
    const proposals = testCrmAdapter.translateEnvelope({} as any);
    expect(proposals[0].action).toBe('CONFIRM');
    expect(await testStoragePort.isProcessed('t', 'p', 'm')).toBe(false);
  });
});

describe('CORE-03: Deterministic EvidenceRef Offset Calculation (D-05)', () => {
  it('normalizes internal horizontal whitespace and preserves line breaks', () => {
    const raw = '  Olá,   tudo   bem?\nEstou   interessado. \t ';
    const normalized = normalizeMessageText(raw);
    expect(normalized).toBe('Olá, tudo bem?\nEstou interessado.');
  });

  it('calculates exact char_start and char_end from exact_quote', () => {
    const rawText = '  Quero vender meu imóvel por 850 mil hoje mesmo. ';
    const exactQuote = '850 mil';

    const evidence = buildEvidenceRef({
      message_id: 'msg-1',
      conversation_id: 'conv-1',
      raw_text: rawText,
      exact_quote: exactQuote,
      timestamp: '2026-10-21T12:00:00Z',
      extractor_type: 'rule',
      parser_version: '1.0.0',
      confidence: 0.95,
    });

    const normalized = normalizeMessageText(rawText);
    expect(evidence.char_start).toBe(28);
    expect(evidence.char_end).toBe(35);
    expect(normalized.slice(evidence.char_start, evidence.char_end)).toBe(exactQuote);
  });

  it('falls back to case-insensitive match when exact case differs', () => {
    const rawText = 'Estou VENDENDO por 500 mil';
    const exactQuote = 'vendendo por 500 mil';

    const evidence = buildEvidenceRef({
      message_id: 'msg-1',
      conversation_id: 'conv-1',
      raw_text: rawText,
      exact_quote: exactQuote,
      timestamp: '2026-10-21T12:00:00Z',
      extractor_type: 'rule',
      parser_version: '1.0.0',
      confidence: 0.9,
    });

    const normalized = normalizeMessageText(rawText);
    expect(normalized.slice(evidence.char_start, evidence.char_end).toLowerCase()).toBe(
      exactQuote.toLowerCase()
    );
  });

  it('throws EXACT_QUOTE_NOT_FOUND when quote does not exist in message', () => {
    const rawText = 'Não tenho interesse algum.';
    const exactQuote = 'quero comprar';

    expect(() =>
      buildEvidenceRef({
        message_id: 'msg-1',
        conversation_id: 'conv-1',
        raw_text: rawText,
        exact_quote: exactQuote,
        timestamp: '2026-10-21T12:00:00Z',
        extractor_type: 'rule',
        parser_version: '1.0.0',
        confidence: 0.9,
      })
    ).toThrowError(/EXACT_QUOTE_NOT_FOUND/);
  });
});
