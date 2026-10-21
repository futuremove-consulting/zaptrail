import { describe, it, expect, vi } from 'vitest';
import {
  shouldTriggerStage2,
  HybridInterpretationEngine,
} from '../../src/packages/core/hybrid-engine';
import { UniversalInterpretationEngine } from '../../src/packages/core/engine';
import {
  DomainPack,
  TurnWindow,
  UniversalInterpretationEnvelope,
  LLMProvider,
  LLMExtractionRequest,
  LLMExtractionResponse,
} from '../../src/packages/core/types';

describe('HybridInterpretationEngine & Stage 2 Smart Routing (LLM-01)', () => {
  const baseEnvelope: UniversalInterpretationEnvelope = {
    envelope_id: 'env-test-01',
    tenant_id: 'tenant-default',
    conversation_id: 'conv-01',
    turn_id: 'turn-01',
    domain_key: 'real_estate',
    parser_version: '2.0.0',
    extractor_type: 'rule',
    llm_invoked: false,
    llm_error: false,
    duplicate: false,
    review_required: false,
    do_not_contact: false,
    participants: [
      {
        participant_id: 'part-01',
        role_label: 'owner',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [
          {
            evidence_id: 'ev-1',
            message_id: 'msg-01',
            conversation_id: 'conv-01',
            exact_quote: 'Sou o dono',
            char_start: 0,
            char_end: 10,
            timestamp: '2026-10-21T12:00:00Z',
            extractor_type: 'rule',
            parser_version: '2.0.0',
            confidence: 0.95,
          },
        ],
      },
    ],
    intents: [
      {
        intent_id: 'int-01',
        intent_label: 'intent.capture_for_sale',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [
          {
            evidence_id: 'ev-2',
            message_id: 'msg-01',
            conversation_id: 'conv-01',
            exact_quote: 'quero vender',
            char_start: 11,
            char_end: 23,
            timestamp: '2026-10-21T12:00:00Z',
            extractor_type: 'rule',
            parser_version: '2.0.0',
            confidence: 0.95,
          },
        ],
      },
    ],
    facts: [],
    values: [
      {
        value_id: 'val-01',
        field_key: 'sale_asking_price',
        amount: 1200000,
        currency: 'BRL',
        raw_expression: '1,2 milhão',
        target_entity_key: 'property_candidate_default',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [
          {
            evidence_id: 'ev-3',
            message_id: 'msg-01',
            conversation_id: 'conv-01',
            exact_quote: '1,2 milhão',
            char_start: 24,
            char_end: 34,
            timestamp: '2026-10-21T12:00:00Z',
            extractor_type: 'rule',
            parser_version: '2.0.0',
            confidence: 0.95,
          },
        ],
      },
    ],
    relationships: [],
    conditions: [],
    opportunities: [
      {
        opportunity_id: 'opp-01',
        opportunity_type: 'real_estate.capture_sale',
        entity_key: 'property_candidate_default',
        stage: 'qualified',
        epistemic_status: 'declared',
        confidence: 0.95,
        linked_condition_ids: [],
        attributes: {},
        evidence_refs: [
          {
            evidence_id: 'ev-2',
            message_id: 'msg-01',
            conversation_id: 'conv-01',
            exact_quote: 'quero vender',
            char_start: 11,
            char_end: 23,
            timestamp: '2026-10-21T12:00:00Z',
            extractor_type: 'rule',
            parser_version: '2.0.0',
            confidence: 0.95,
          },
        ],
      },
    ],
    actions: [],
    media_results: [],
    evidence_refs: [],
    review_items: [],
  };

  const sampleTurnWindow: TurnWindow = {
    turn_id: 'turn-01',
    tenant_id: 'tenant-default',
    provider: 'wpp',
    conversation_id: 'conv-01',
    messages: [
      {
        message_id: 'msg-01',
        external_message_id: 'ext-01',
        tenant_id: 'tenant-default',
        provider: 'wpp',
        conversation_id: 'conv-01',
        direction: 'inbound',
        sender_id: '5511999999999',
        raw_text: 'Sou o dono, quero vender por 1,2 milhão',
        normalized_text: 'Sou o dono, quero vender por 1,2 milhão',
        timestamp: '2026-10-21T12:00:00Z',
        attachments: [],
      },
    ],
    consolidated_text: 'Sou o dono, quero vender por 1,2 milhão',
  };

  describe('shouldTriggerStage2', () => {
    it('returns false when Stage 1 envelope has decisive intent, known role and confidence >= 0.85', () => {
      expect(shouldTriggerStage2(baseEnvelope)).toBe(false);
    });

    it('returns false for opt-out / do_not_contact envelopes', () => {
      const optOutEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        do_not_contact: true,
        intents: [
          {
            ...baseEnvelope.intents[0],
            intent_label: 'intent.do_not_contact',
          },
        ],
      };
      expect(shouldTriggerStage2(optOutEnvelope)).toBe(false);
    });

    it('returns false for not_interested_property with high confidence', () => {
      const notInterestedEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        intents: [
          {
            ...baseEnvelope.intents[0],
            intent_label: 'intent.not_interested_property',
            confidence: 0.9,
          },
        ],
      };
      expect(shouldTriggerStage2(notInterestedEnvelope)).toBe(false);
    });

    it('returns true when intent is intent.ambiguous_or_open', () => {
      const ambiguousEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        intents: [
          {
            ...baseEnvelope.intents[0],
            intent_label: 'intent.ambiguous_or_open',
            confidence: 0.6,
          },
        ],
      };
      expect(shouldTriggerStage2(ambiguousEnvelope)).toBe(true);
    });

    it('returns true when participant role is unknown', () => {
      const unknownRoleEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        participants: [
          {
            ...baseEnvelope.participants[0],
            role_label: 'unknown',
            confidence: 0.5,
          },
        ],
      };
      expect(shouldTriggerStage2(unknownRoleEnvelope)).toBe(true);
    });

    it('returns true when an observation has confidence < 0.85', () => {
      const lowConfidenceEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        intents: [
          {
            ...baseEnvelope.intents[0],
            confidence: 0.72,
          },
        ],
      };
      expect(shouldTriggerStage2(lowConfidenceEnvelope)).toBe(true);
    });

    it('returns true for mixed intents when negative is accompanied by an ambiguous or positive intent', () => {
      const mixedEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        intents: [
          {
            ...baseEnvelope.intents[0],
            intent_label: 'intent.not_interested_property',
            confidence: 0.9,
          },
          {
            ...baseEnvelope.intents[0],
            intent_id: 'int-02',
            intent_label: 'intent.capture_other_property',
            confidence: 0.7,
          },
        ],
      };
      expect(shouldTriggerStage2(mixedEnvelope)).toBe(true);
    });

    it('returns true when review_required is true due to contradictions or low confidence', () => {
      const reviewEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        review_required: true,
        review_items: [
          {
            item_id: 'rev-01',
            reason: 'spousal_or_family_conflict',
            severity: 'critical',
            suggested_action: 'review_manually',
            review_required: true,
          },
        ],
      };
      expect(shouldTriggerStage2(reviewEnvelope)).toBe(true);
    });

    it('respects routerOptions: forceStage2 and skipStage2', () => {
      expect(shouldTriggerStage2(baseEnvelope, { forceStage2: true })).toBe(true);

      const ambiguousEnvelope: UniversalInterpretationEnvelope = {
        ...baseEnvelope,
        intents: [
          {
            ...baseEnvelope.intents[0],
            intent_label: 'intent.ambiguous_or_open',
          },
        ],
      };
      expect(shouldTriggerStage2(ambiguousEnvelope, { skipStage2: true })).toBe(false);
    });
  });

  describe('HybridInterpretationEngine', () => {
    it('fast-paths decisive turn: Stage 1 resolves, LLM is NOT called (llm_invoked: false)', async () => {
      const mockDomainPack: DomainPack = {
        domain_key: 'real_estate',
        parser_version: '2.0.0',
        interpretTurnWindow: vi.fn().mockResolvedValue({
          participants: baseEnvelope.participants,
          intents: baseEnvelope.intents,
          facts: baseEnvelope.facts,
          values: baseEnvelope.values,
          relationships: baseEnvelope.relationships,
          conditions: baseEnvelope.conditions,
          opportunities: baseEnvelope.opportunities,
          actions: baseEnvelope.actions,
          media_results: [],
          evidence_refs: baseEnvelope.evidence_refs,
          review_items: [],
        }),
      };

      const mockLlmProvider: LLMProvider = {
        name: 'test-llm',
        extractStructured: vi.fn(),
      };

      const hybridEngine = new HybridInterpretationEngine({
        domainPack: mockDomainPack,
        llmProvider: mockLlmProvider,
      });

      const envelope = await hybridEngine.interpretTurnHybrid(sampleTurnWindow);

      expect(mockDomainPack.interpretTurnWindow).toHaveBeenCalledTimes(1);
      expect(mockLlmProvider.extractStructured).not.toHaveBeenCalled();
      expect(envelope.llm_invoked).toBe(false);
      expect(envelope.llm_error).toBe(false);
      expect(envelope.extractor_type).toBe('rule');
    });

    it('invokes LLM when turn is ambiguous, validates quotes, and merges into hybrid envelope', async () => {
      const ambiguousTurn: TurnWindow = {
        ...sampleTurnWindow,
        consolidated_text: 'Acho que posso vender sim, mas tem inventário enrolado.',
        messages: [
          {
            ...sampleTurnWindow.messages[0],
            raw_text: 'Acho que posso vender sim, mas tem inventário enrolado.',
            normalized_text: 'Acho que posso vender sim, mas tem inventário enrolado.',
          },
        ],
      };

      const mockDomainPack: DomainPack = {
        domain_key: 'real_estate',
        parser_version: '2.0.0',
        interpretTurnWindow: vi.fn().mockResolvedValue({
          participants: [
            {
              participant_id: 'part-01',
              role_label: 'unknown',
              epistemic_status: 'inferred',
              confidence: 0.5,
              evidence_refs: [
                {
                  evidence_id: 'ev-amb-1',
                  message_id: 'msg-01',
                  conversation_id: 'conv-01',
                  exact_quote: 'Acho que posso',
                  char_start: 0,
                  char_end: 14,
                  timestamp: '2026-10-21T12:00:00Z',
                  extractor_type: 'rule',
                  parser_version: '2.0.0',
                  confidence: 0.5,
                },
              ],
            },
          ],
          intents: [
            {
              intent_id: 'int-amb',
              intent_label: 'intent.ambiguous_or_open',
              epistemic_status: 'inferred',
              confidence: 0.6,
              evidence_refs: [
                {
                  evidence_id: 'ev-amb-2',
                  message_id: 'msg-01',
                  conversation_id: 'conv-01',
                  exact_quote: 'Acho que posso vender sim',
                  char_start: 0,
                  char_end: 25,
                  timestamp: '2026-10-21T12:00:00Z',
                  extractor_type: 'rule',
                  parser_version: '2.0.0',
                  confidence: 0.6,
                },
              ],
            },
          ],
          facts: [],
          values: [],
          relationships: [],
          conditions: [],
          opportunities: [],
          actions: [],
          media_results: [],
          evidence_refs: [],
          review_items: [],
        }),
      };

      const mockLlmProvider: LLMProvider = {
        name: 'mock-gpt4o',
        extractStructured: vi.fn().mockResolvedValue({
          model: 'mock-gpt4o',
          data: {
            participants: [
              {
                participant_id: 'part-llm-1',
                role_label: 'owner',
                epistemic_status: 'inferred',
                confidence: 0.88,
                evidence_refs: [
                  {
                    evidence_id: 'ev-llm-1',
                    message_id: 'msg-01',
                    conversation_id: 'conv-01',
                    exact_quote: 'Acho que posso vender sim',
                    char_start: 0,
                    char_end: 25,
                    timestamp: '2026-10-21T12:00:00Z',
                    extractor_type: 'llm',
                    parser_version: '2.0.0',
                    confidence: 0.88,
                  },
                ],
              },
            ],
            intents: [
              {
                intent_id: 'int-llm-1',
                intent_label: 'intent.capture_for_sale',
                epistemic_status: 'declared',
                confidence: 0.9,
                evidence_refs: [
                  {
                    evidence_id: 'ev-llm-2',
                    message_id: 'msg-01',
                    conversation_id: 'conv-01',
                    exact_quote: 'posso vender sim',
                    char_start: 9,
                    char_end: 25,
                    timestamp: '2026-10-21T12:00:00Z',
                    extractor_type: 'llm',
                    parser_version: '2.0.0',
                    confidence: 0.9,
                  },
                ],
              },
            ],
            conditions: [
              {
                condition_id: 'cond-llm-1',
                condition_type: 'documentation_regularization',
                description: 'inventário enrolado',
                epistemic_status: 'declared',
                confidence: 0.92,
                evidence_refs: [
                  {
                    evidence_id: 'ev-llm-3',
                    message_id: 'msg-01',
                    conversation_id: 'conv-01',
                    exact_quote: 'inventário enrolado',
                    char_start: 35,
                    char_end: 54,
                    timestamp: '2026-10-21T12:00:00Z',
                    extractor_type: 'llm',
                    parser_version: '2.0.0',
                    confidence: 0.92,
                  },
                ],
              },
            ],
          },
        }),
      };

      const hybridEngine = new HybridInterpretationEngine({
        domainPack: mockDomainPack,
        llmProvider: mockLlmProvider,
      });

      const envelope = await hybridEngine.interpretTurnHybrid(ambiguousTurn);

      expect(mockLlmProvider.extractStructured).toHaveBeenCalledTimes(1);
      expect(envelope.llm_invoked).toBe(true);
      expect(envelope.llm_error).toBe(false);
      expect(envelope.extractor_type).toBe('hybrid');
      expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(
        true
      );
      expect(
        envelope.conditions.some((c) => c.condition_type === 'documentation_regularization')
      ).toBe(true);
    });

    it('detects hallucinated quote in LLM output, marks hallucination_detected: true, and generates ReviewItem', async () => {
      const ambiguousTurn: TurnWindow = {
        ...sampleTurnWindow,
        consolidated_text: 'Quero vender o imóvel.',
        messages: [
          {
            ...sampleTurnWindow.messages[0],
            raw_text: 'Quero vender o imóvel.',
            normalized_text: 'Quero vender o imóvel.',
          },
        ],
      };

      const mockDomainPack: DomainPack = {
        domain_key: 'real_estate',
        parser_version: '2.0.0',
        interpretTurnWindow: vi.fn().mockResolvedValue({
          participants: [],
          intents: [
            {
              intent_id: 'int-amb',
              intent_label: 'intent.ambiguous_or_open',
              epistemic_status: 'inferred',
              confidence: 0.5,
              evidence_refs: [
                {
                  evidence_id: 'ev-1',
                  message_id: 'msg-01',
                  conversation_id: 'conv-01',
                  exact_quote: 'Quero vender',
                  char_start: 0,
                  char_end: 12,
                  timestamp: '2026-10-21T12:00:00Z',
                  extractor_type: 'rule',
                  parser_version: '2.0.0',
                  confidence: 0.5,
                },
              ],
            },
          ],
          facts: [],
          values: [],
          relationships: [],
          conditions: [],
          opportunities: [],
          actions: [],
          media_results: [],
          evidence_refs: [],
          review_items: [],
        }),
      };

      const mockLlmProvider: LLMProvider = {
        name: 'mock-llm',
        extractStructured: vi.fn().mockResolvedValue({
          model: 'mock-llm',
          data: {
            values: [
              {
                value_id: 'val-hallucinated',
                field_key: 'sale_asking_price',
                amount: 1000000,
                currency: 'BRL',
                raw_expression: '1 milhão',
                target_entity_key: 'prop-1',
                epistemic_status: 'declared',
                confidence: 0.9,
                evidence_refs: [
                  {
                    evidence_id: 'ev-hallucinated',
                    message_id: 'msg-01',
                    conversation_id: 'conv-01',
                    exact_quote: 'proprietário quer 1 milhão à vista', // hallucinated phrase!
                    char_start: 99,
                    char_end: 133,
                    timestamp: '2026-10-21T12:00:00Z',
                    extractor_type: 'llm',
                    parser_version: '2.0.0',
                    confidence: 0.9,
                  },
                ],
              },
            ],
          },
        }),
      };

      const hybridEngine = new HybridInterpretationEngine({
        domainPack: mockDomainPack,
        llmProvider: mockLlmProvider,
      });

      const envelope = await hybridEngine.interpretTurnHybrid(ambiguousTurn);

      expect(envelope.llm_invoked).toBe(true);
      expect(envelope.review_required).toBe(true);

      const hallucinatedValue = envelope.values.find((v) => v.value_id === 'val-hallucinated');
      expect(hallucinatedValue).toBeDefined();
      expect(hallucinatedValue?.epistemic_status).toBe('inferred');
      expect(hallucinatedValue?.confidence).toBeLessThan(0.65);
      expect(hallucinatedValue?.evidence_refs[0].hallucination_detected).toBe(true);
      expect(hallucinatedValue?.evidence_refs[0].char_start).toBeUndefined();

      const reviewItem = envelope.review_items.find(
        (r) => r.target_id === 'ev-hallucinated' || r.reason.includes('Citação não encontrada')
      );
      expect(reviewItem).toBeDefined();
    });

    it('gracefully falls back to Stage 1 on LLM exception or timeout (llm_error: true, review_required: true)', async () => {
      const mockDomainPack: DomainPack = {
        domain_key: 'real_estate',
        parser_version: '2.0.0',
        interpretTurnWindow: vi.fn().mockResolvedValue({
          participants: [],
          intents: [
            {
              intent_id: 'int-amb',
              intent_label: 'intent.ambiguous_or_open',
              epistemic_status: 'inferred',
              confidence: 0.5,
              evidence_refs: [
                {
                  evidence_id: 'ev-1',
                  message_id: 'msg-01',
                  conversation_id: 'conv-01',
                  exact_quote: 'Sou o dono',
                  char_start: 0,
                  char_end: 10,
                  timestamp: '2026-10-21T12:00:00Z',
                  extractor_type: 'rule',
                  parser_version: '2.0.0',
                  confidence: 0.5,
                },
              ],
            },
          ],
          facts: [],
          values: [],
          relationships: [],
          conditions: [],
          opportunities: [],
          actions: [],
          media_results: [],
          evidence_refs: [],
          review_items: [],
        }),
      };

      const failingLlmProvider: LLMProvider = {
        name: 'failing-llm',
        extractStructured: vi.fn().mockRejectedValue(new Error('Rate limit exceeded: 429 Too Many Requests')),
      };

      const hybridEngine = new HybridInterpretationEngine({
        domainPack: mockDomainPack,
        llmProvider: failingLlmProvider,
      });

      const envelope = await hybridEngine.interpretTurnHybrid(sampleTurnWindow);

      expect(envelope.llm_invoked).toBe(true);
      expect(envelope.llm_error).toBe(true);
      expect(envelope.review_required).toBe(true);
      expect(envelope.extractor_type).toBe('rule');

      const failureReviewItem = envelope.review_items.find((r) =>
        r.reason.includes('Rate limit exceeded')
      );
      expect(failureReviewItem).toBeDefined();
    });
  });
});
