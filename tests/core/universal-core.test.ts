import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  UniversalInterpretationEnvelopeSchema,
  ParticipantObservationSchema,
  type ValueObservation,
  type ActionRecommendation,
  type DomainPack,
  type CRMAdapter,
  type StoragePort,
  type CRMProposal,
  type TurnWindow,
} from '../../src/packages/core/types';
import {
  buildEvidenceRef,
  normalizeMessageText,
} from '../../src/packages/core/evidence';
import {
  evaluateConfidenceBand,
  applyValueEvolution,
  canAutoExecuteAction,
  sanitizeActionRecommendation,
  EXTERNAL_OUTBOUND_ACTIONS,
} from '../../src/packages/core/confidence-policy';
import { UniversalInterpretationEngine } from '../../src/packages/core/engine';

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
      evidence_refs: [],
    };

    expect(() => ParticipantObservationSchema.parse(invalidObservation)).toThrow();
  });

  it('allows plugging DomainPack, CRMAdapter, and StoragePort without domain coupling', async () => {
    type TestEntities = { item_code: string };

    const testDomainPack: DomainPack<TestEntities> = {
      domain_key: 'logistics',
      parser_version: '1.0.0',
      interpretTurnWindow: async (_turnWindow) => {
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
      translateEnvelope: (_envelope) => {
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

describe('CORE-04: Epistemic Status & Value Evolution (D-06)', () => {
  const dummyEvidence = {
    evidence_id: 'ev-test',
    message_id: 'msg-1',
    conversation_id: 'conv-1',
    exact_quote: 'valor',
    char_start: 0,
    char_end: 5,
    timestamp: '2026-10-21T12:00:00Z',
    extractor_type: 'rule' as const,
    parser_version: '1.0.0',
    confidence: 0.95,
  };

  it('marks prior active value observation as superseded while preserving it in history', () => {
    const existing: ValueObservation[] = [
      {
        value_id: 'val-old',
        field_key: 'asking_price',
        amount: 1000000,
        currency: 'BRL',
        raw_expression: '1 milhão',
        target_entity_key: 'prop-1',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [dummyEvidence],
      },
    ];

    const incoming: ValueObservation[] = [
      {
        value_id: 'val-new',
        field_key: 'asking_price',
        amount: 1350000,
        currency: 'BRL',
        raw_expression: '1,35 milhão',
        target_entity_key: 'prop-1',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [dummyEvidence],
      },
    ];

    const evolved = applyValueEvolution(existing, incoming);
    expect(evolved).toHaveLength(2);

    const oldVal = evolved.find((v) => v.value_id === 'val-old');
    const newVal = evolved.find((v) => v.value_id === 'val-new');

    expect(oldVal?.epistemic_status).toBe('superseded');
    expect(oldVal?.superseded_by_value_id).toBe('val-new');
    expect(newVal?.epistemic_status).toBe('declared');
    expect(newVal?.amount).toBe(1350000);
  });

  it('does not supersede when field_key or target_entity_key differ', () => {
    const existing: ValueObservation[] = [
      {
        value_id: 'val-price',
        field_key: 'asking_price',
        amount: 1000000,
        currency: 'BRL',
        raw_expression: '1 milhão',
        target_entity_key: 'prop-1',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [dummyEvidence],
      },
    ];

    const incoming: ValueObservation[] = [
      {
        value_id: 'val-rent',
        field_key: 'monthly_rate',
        amount: 5000,
        currency: 'BRL',
        raw_expression: '5 mil',
        target_entity_key: 'prop-1',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [dummyEvidence],
      },
    ];

    const evolved = applyValueEvolution(existing, incoming);
    expect(evolved).toHaveLength(2);
    expect(evolved.find((v) => v.value_id === 'val-price')?.epistemic_status).toBe('declared');
    expect(evolved.find((v) => v.value_id === 'val-rent')?.epistemic_status).toBe('declared');
  });
});

describe('CORE-05: Confidence Policy & Action Guards (D-04)', () => {
  it('categorizes confidence >= 0.85 into high band with autoUpdateAllowed', () => {
    const result = evaluateConfidenceBand(0.92);
    expect(result.band).toBe('high');
    expect(result.autoUpdateAllowed).toBe(true);
    expect(result.reviewRequired).toBe(false);
    expect(result.recommendedEpistemicStatus).toBe('declared');
  });

  it('categorizes 0.65 <= confidence < 0.85 into medium band with reviewRequired', () => {
    const result = evaluateConfidenceBand(0.75, true);
    expect(result.band).toBe('medium');
    expect(result.autoUpdateAllowed).toBe(false);
    expect(result.reviewRequired).toBe(true);
    expect(result.recommendedEpistemicStatus).toBe('inferred');
  });

  it('categorizes confidence < 0.65 into low band preserving confirmed data', () => {
    const result = evaluateConfidenceBand(0.5);
    expect(result.band).toBe('low');
    expect(result.autoUpdateAllowed).toBe(false);
    expect(result.preserveConfirmedData).toBe(true);
    expect(result.reviewRequired).toBe(true);
  });

  it('blocks autonomous execution of external outbound actions even at high confidence', () => {
    for (const action of EXTERNAL_OUTBOUND_ACTIONS) {
      expect(canAutoExecuteAction(action, 'auto', 0.99)).toBe(false);
    }
  });

  it('sanitizes external action recommendations to manual with human approval required', () => {
    const unsafeAction: ActionRecommendation = {
      action_id: 'act-outbound',
      action_type: 'send_whatsapp_followup',
      execution_mode: 'auto',
      requires_human_approval: false,
      epistemic_status: 'declared',
      confidence: 0.95,
      evidence_refs: [
        {
          evidence_id: 'ev-1',
          message_id: 'msg-1',
          conversation_id: 'conv-1',
          exact_quote: 'ok',
          char_start: 0,
          char_end: 2,
          timestamp: '2026-10-21T12:00:00Z',
          extractor_type: 'rule',
          parser_version: '1.0.0',
          confidence: 0.95,
        },
      ],
      payload: {},
    };

    const sanitized = sanitizeActionRecommendation(unsafeAction);
    expect(sanitized.execution_mode).toBe('manual');
    expect(sanitized.requires_human_approval).toBe(true);
  });
});

describe('CORE-01 & CORE-04 & CORE-05: UniversalInterpretationEngine', () => {
  const dummyEvidence = {
    evidence_id: 'ev-engine',
    message_id: 'ext-msg-1',
    conversation_id: 'conv-100',
    exact_quote: 'sim',
    char_start: 0,
    char_end: 3,
    timestamp: '2026-10-21T12:00:00Z',
    extractor_type: 'rule' as const,
    parser_version: '1.0.0',
    confidence: 0.95,
  };

  const sampleTurn: TurnWindow = {
    turn_id: 'turn-100',
    tenant_id: 'ten-1',
    provider: 'whatsapp',
    conversation_id: 'conv-100',
    consolidated_text: 'sim',
    messages: [
      {
        message_id: 'msg-int-1',
        external_message_id: 'ext-msg-1',
        tenant_id: 'ten-1',
        provider: 'whatsapp',
        conversation_id: 'conv-100',
        direction: 'inbound',
        sender_id: 'usr-1',
        raw_text: 'sim',
        normalized_text: 'sim',
        timestamp: '2026-10-21T12:00:00Z',
        attachments: [],
      },
    ],
  };

  const mockPack: DomainPack = {
    domain_key: 'test_pack',
    parser_version: '1.0.0',
    interpretTurnWindow: async (_turn) => ({
      participants: [],
      intents: [
        {
          intent_id: 'int-medium',
          intent_label: 'test_intent',
          epistemic_status: 'inferred',
          confidence: 0.72, // Medium confidence -> should trigger ReviewItem
          evidence_refs: [dummyEvidence],
        },
      ],
      facts: [],
      values: [],
      relationships: [],
      conditions: [],
      opportunities: [],
      actions: [
        {
          action_id: 'act-followup',
          action_type: 'send_whatsapp_followup',
          execution_mode: 'auto',
          requires_human_approval: false,
          epistemic_status: 'declared',
          confidence: 0.95,
          evidence_refs: [dummyEvidence],
          payload: {},
        },
      ],
      media_results: [],
      evidence_refs: [dummyEvidence],
      review_items: [],
    }),
  };

  it('interprets turn, creates review item for medium confidence, and sanitizes actions', async () => {
    const engine = new UniversalInterpretationEngine(mockPack);
    const envelope = await engine.interpretTurn(sampleTurn);

    expect(envelope.duplicate).toBe(false);
    expect(envelope.review_required).toBe(true);
    expect(envelope.review_items.length).toBeGreaterThanOrEqual(1);
    expect(envelope.actions[0].execution_mode).toBe('manual');
    expect(envelope.actions[0].requires_human_approval).toBe(true);
  });

  it('enforces idempotency on reprocessed message id (CT-18)', async () => {
    const engine = new UniversalInterpretationEngine(mockPack);
    const firstResult = await engine.interpretTurn(sampleTurn);
    expect(firstResult.duplicate).toBe(false);

    const duplicateResult = await engine.interpretTurn(sampleTurn);
    expect(duplicateResult.duplicate).toBe(true);
    expect(duplicateResult.opportunities).toHaveLength(0);
    expect(duplicateResult.actions).toHaveLength(0);
  });
});

describe('Boundary Isolation: Zero Real-Estate Tokens in Core (CORE-01, CORE-02, D-02)', () => {
  it('ensures src/packages/core/ contains zero real-estate-specific domain tokens', () => {
    const coreDir = path.resolve(__dirname, '../../src/packages/core');
    const files = fs.readdirSync(coreDir).filter((f) => f.endsWith('.ts'));

    const forbiddenTokens = ['iptu', 'condo_fee', 'condominio', 'bedrooms', 'matricula'];

    for (const file of files) {
      const content = fs.readFileSync(path.join(coreDir, file), 'utf-8').toLowerCase();
      for (const token of forbiddenTokens) {
        expect(
          content.includes(token),
          `Found forbidden domain token "${token}" in core file "${file}"`
        ).toBe(false);
      }
    }
  });
});
