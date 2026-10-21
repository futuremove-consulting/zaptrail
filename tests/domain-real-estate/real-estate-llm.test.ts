import { describe, it, expect, beforeEach } from 'vitest';
import {
  interpretRealEstateTurnHybrid,
  interpretRealEstateTurn,
} from '../../src/packages/domain-real-estate/opportunity-orchestrator';
import { coalesceTurnWindowWithDebounce } from '../../src/packages/domain-real-estate/turn-window-coalescer';
import { MockLLMProvider } from '../../src/packages/domain-real-estate/llm/mock-llm-provider';
import {
  RealEstateLLMStructuredOutput,
  RealEstateLLMStructuredOutputSchema,
} from '../../src/packages/domain-real-estate/llm/real-estate-llm-schema';
import {
  buildRealEstateLlmSystemPrompt,
  buildRealEstateLlmUserPrompt,
} from '../../src/packages/domain-real-estate/llm/real-estate-prompt';
import { SeededPropertyCandidate } from '../../src/packages/domain-real-estate/types';

describe('Real Estate LLM Fast Path & Stage 1 Bypass (LLM-01, E-02-01)', () => {
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
  });

  it('completes decisive turn via Stage 1 rules without calling LLM (CT-01, E-02-01)', async () => {
    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-decisive-1',
        conversation_id: 'conv-fast-1',
        raw_text: 'Sou o dono sim, estou vendendo por 1,2 milhão.',
      },
    ]);

    const envelope = await interpretRealEstateTurnHybrid(window, {
      llmProvider: mockProvider,
    });

    expect(envelope.extractor_type).toBe('rule');
    expect(envelope.llm_invoked).toBe(false);
    expect(envelope.llm_error).toBe(false);
    expect(mockProvider.callCount).toBe(0);
    expect(envelope.opportunities.some((o) => o.opportunity_type === 'real_estate.capture_sale')).toBe(true);
  });

  it('skips LLM on explicit opt-out do_not_contact (CT-07)', async () => {
    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-optout-1',
        conversation_id: 'conv-fast-2',
        raw_text: 'Não tenho interesse e por favor pare de me mandar mensagem.',
      },
    ]);

    const envelope = await interpretRealEstateTurnHybrid(window, {
      llmProvider: mockProvider,
    });

    expect(envelope.do_not_contact).toBe(true);
    expect(envelope.llm_invoked).toBe(false);
    expect(mockProvider.callCount).toBe(0);
  });

  it('skips LLM on wrong number / unrelated third party (CT-06)', async () => {
    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-unrelated-1',
        conversation_id: 'conv-fast-3',
        raw_text: 'Engano, não tenho imóvel nenhum nesse condomínio.',
      },
    ]);

    const envelope = await interpretRealEstateTurnHybrid(window, {
      llmProvider: mockProvider,
    });

    expect(envelope.participants[0].role_label).toBe('unrelated_third_party');
    expect(envelope.llm_invoked).toBe(false);
    expect(mockProvider.callCount).toBe(0);
  });
});

describe('Stage 2 Structured LLM Extraction on Ambiguous Turns (LLM-01, LLM-02, E-02-02)', () => {
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
  });

  it('triggers Stage 2 LLM when Stage 1 detects ambiguity and merges structured output (E-02-02)', async () => {
    const text = 'Depende da proposta, quanto estão pagando? Mas se chegar em 700 mil eu vendo';
    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-ambig-1',
        conversation_id: 'conv-ambig-1',
        raw_text: text,
      },
    ]);

    // Structured LLM output with verbatim exact quotes
    const mockOutput: RealEstateLLMStructuredOutput = {
      detected_role: {
        role: 'owner',
        confidence: 0.88,
        exact_quote: 'eu vendo',
      },
      intents: [
        {
          label: 'intent.capture_for_sale',
          confidence: 0.9,
          exact_quote: 'eu vendo',
        },
        {
          label: 'intent.conditional_interest',
          confidence: 0.85,
          exact_quote: 'Depende da proposta',
        },
      ],
      properties: [
        {
          property_index: 0,
          sale_asking_price: 700000,
          exact_quote: '700 mil eu vendo',
          address_hint: 'Imóvel Principal',
        },
      ],
      conditions: [
        {
          condition_type: 'custom_condition',
          description: 'Valor mínimo condicionado à proposta',
          exact_quote: 'Depende da proposta',
        },
      ],
      summary: 'Proprietário demonstra interesse condicionado a valor mínimo de 700 mil',
    };

    mockProvider.setMockResponse(mockOutput);

    const envelope = await interpretRealEstateTurnHybrid(window, {
      llmProvider: mockProvider,
    });

    expect(mockProvider.callCount).toBe(1);
    expect(envelope.llm_invoked).toBe(true);
    expect(envelope.llm_error).toBe(false);
    expect(envelope.extractor_type).toBe('hybrid');

    // Merged role and intents
    expect(envelope.participants[0].role_label).toBe('owner');
    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);

    // Opportunities created
    expect(envelope.opportunities.some((o) => o.opportunity_type === 'real_estate.capture_sale')).toBe(true);

    // Exact quote verified deterministically with valid char_start/char_end
    const saleEv = envelope.opportunities[0].evidence_refs[0];
    expect(saleEv.exact_quote).toBe('700 mil eu vendo');
    expect(saleEv.hallucination_detected).toBe(false);
    expect(saleEv.char_start).toBeGreaterThanOrEqual(0);
    expect(saleEv.char_end).toBeGreaterThan(saleEv.char_start!);
  });

  it('correctly handles multi-property alternative offer via LLM extraction (E-02-06, T-02-03)', async () => {
    const text = 'Esse do centro já vendi, mas tenho um nos Jardins para vender por 1 milhão';
    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-multi-1',
        conversation_id: 'conv-multi-1',
        raw_text: text,
      },
    ]);

    const mockOutput: RealEstateLLMStructuredOutput = {
      detected_role: {
        role: 'owner',
        confidence: 0.92,
        exact_quote: 'tenho um nos Jardins',
      },
      intents: [
        {
          label: 'intent.not_interested_property',
          confidence: 0.95,
          exact_quote: 'Esse do centro já vendi',
        },
        {
          label: 'intent.capture_other_property',
          confidence: 0.9,
          exact_quote: 'tenho um nos Jardins para vender',
        },
      ],
      properties: [
        {
          property_index: 0,
          intent: 'intent.not_interested_property',
          exact_quote: 'Esse do centro já vendi',
          address_hint: 'Centro',
        },
        {
          property_index: 1,
          intent: 'intent.capture_for_sale',
          sale_asking_price: 1000000,
          exact_quote: 'tenho um nos Jardins para vender por 1 milhão',
          address_hint: 'Jardins',
        },
      ],
      conditions: [],
      summary: 'Imóvel do Centro vendido; novo imóvel nos Jardins ofertado para venda',
    };

    mockProvider.setMockResponse(mockOutput);

    const envelope = await interpretRealEstateTurnHybrid(window, {
      llmProvider: mockProvider,
    });

    const notInterested = envelope.intents.find(
      (i) => i.intent_label === 'intent.not_interested_property'
    );
    expect(notInterested).toBeDefined();

    const captureOther = envelope.intents.find(
      (i) => i.intent_label === 'intent.capture_other_property'
    );
    expect(captureOther).toBeDefined();
  });
});

describe('Deterministic Quote Validation & Hallucination Rejection (LLM-02, E-02-03)', () => {
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
  });

  it('detects hallucinated quote and generates ReviewItem while downgrading confidence (LLM-02, E-02-03)', async () => {
    const text = 'Pode ser, me manda mais detalhes';
    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-halluc-1',
        conversation_id: 'conv-halluc-1',
        raw_text: text,
      },
    ]);

    const mockOutput: RealEstateLLMStructuredOutput = {
      detected_role: {
        role: 'owner',
        confidence: 0.9,
        // Hallucinated quote: "proprietário autorizou a venda" does NOT exist in text
        exact_quote: 'proprietário autorizou a venda com exclusividade',
      },
      intents: [
        {
          label: 'intent.capture_for_sale',
          confidence: 0.88,
          // Hallucinated quote
          exact_quote: 'quero vender pelo melhor preço possível',
        },
      ],
      properties: [],
      conditions: [],
      summary: 'Alucinação proposital de citação para validação de segurança',
    };

    mockProvider.setMockResponse(mockOutput);

    const envelope = await interpretRealEstateTurnHybrid(window, {
      llmProvider: mockProvider,
    });

    expect(envelope.llm_invoked).toBe(true);
    expect(envelope.review_required).toBe(true);
    expect(envelope.review_items.length).toBeGreaterThanOrEqual(1);

    const hallucinationReview = envelope.review_items.find((r) =>
      r.reason.includes('Citação não encontrada no texto original')
    );
    expect(hallucinationReview).toBeDefined();
    expect(hallucinationReview?.severity).toBe('high');

    // Char offsets must be undefined and hallucination flag true
    const hallucinatedRef = hallucinationReview?.evidence_refs[0];
    expect(hallucinatedRef?.hallucination_detected).toBe(true);
    expect(hallucinatedRef?.char_start).toBeUndefined();
    expect(hallucinatedRef?.char_end).toBeUndefined();
  });
});

describe('Graceful Fallback on LLM Failure / Network Error (E-02-07)', () => {
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
  });

  it('falls back gracefully to Stage 1 when LLM throws network exception (E-02-07)', async () => {
    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-timeout-1',
        conversation_id: 'conv-timeout-1',
        raw_text: 'Depende da proposta, quanto estão pagando?',
      },
    ]);

    mockProvider.setSimulateFailure(true, new Error('ETIMEDOUT: Connection to LLM failed'));

    const envelope = await interpretRealEstateTurnHybrid(window, {
      llmProvider: mockProvider,
    });

    expect(envelope.llm_invoked).toBe(true);
    expect(envelope.llm_error).toBe(true);
    expect(envelope.review_required).toBe(true);
    expect(envelope.extractor_type).toBe('rule');

    const errReview = envelope.review_items.find((r) =>
      r.reason.includes('Fallback acionado: Falha na extração pelo LLMProvider')
    );
    expect(errReview).toBeDefined();
    expect(errReview?.reason).toContain('ETIMEDOUT');
  });
});

describe('Prompt Construction & Token Tracking (LLM-01, LLM-02)', () => {
  it('builds system prompt containing Portuguese real estate taxonomy and strict quote directives', () => {
    const sysPrompt = buildRealEstateLlmSystemPrompt();
    expect(sysPrompt).toContain('pt-BR');
    expect(sysPrompt).toContain('exact_quote');
    expect(sysPrompt).toContain('intent.capture_for_sale');
    expect(sysPrompt).toContain('documentation_regularization');
    expect(sysPrompt).toContain('family_approval');
  });

  it('builds user prompt with seeded candidates and conversation history', () => {
    const seed: SeededPropertyCandidate = {
      address_line: 'Av. Paulista, 1000 - Apto 141',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      listing_type: 'sale',
      expected_price: 950000,
      campaign_id: 'camp-paulista-2026',
    };

    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-user-1',
        conversation_id: 'conv-user-1',
        raw_text: 'Sim, pode anunciar',
      },
    ]);
    window.seeded_context = { seeded_property_candidates: [seed] };

    const userPrompt = buildRealEstateLlmUserPrompt(window);
    expect(userPrompt).toContain('Av. Paulista, 1000 - Apto 141');
    expect(userPrompt).toContain('Sim, pode anunciar');
    expect(userPrompt).toContain('msg-user-1');
  });

  it('tracks token usage accurately in MockLLMProvider', async () => {
    const mockProvider = new MockLLMProvider();
    const mockOutput: RealEstateLLMStructuredOutput = {
      detected_role: { role: 'owner', confidence: 0.9, exact_quote: 'dono' },
      intents: [],
      properties: [],
      conditions: [],
      summary: 'Teste de tokens',
    };
    mockProvider.setMockResponse(mockOutput);

    const window = coalesceTurnWindowWithDebounce([
      {
        message_id: 'msg-tok-1',
        conversation_id: 'conv-tok-1',
        raw_text: 'Depende da proposta',
      },
    ]);

    await interpretRealEstateTurnHybrid(window, { llmProvider: mockProvider });

    expect(mockProvider.callCount).toBe(1);
    expect(mockProvider.totalPromptTokens).toBeGreaterThan(0);
    expect(mockProvider.totalCompletionTokens).toBeGreaterThan(0);
  });

  it('validates schema conformity for RealEstateLLMStructuredOutputSchema', () => {
    const validData = {
      detected_role: { role: 'owner', confidence: 0.9, exact_quote: 'sou o dono' },
      intents: [{ label: 'intent.capture_for_sale', confidence: 0.95, exact_quote: 'vendo por 1 mi' }],
      properties: [
        {
          property_index: 0,
          sale_asking_price: 1000000,
          exact_quote: 'vendo por 1 mi',
        },
      ],
      conditions: [],
      summary: 'Proprietário vendendo imóvel por 1 milhão',
    };

    const parsed = RealEstateLLMStructuredOutputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });
});
