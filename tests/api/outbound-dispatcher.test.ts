import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  dispatchOutboundSuggestions,
  OutboundDispatcherInput,
  OutboundDispatcherResult,
} from '../../src/packages/api/outbound-dispatcher';
import {
  UniversalInterpretationEnvelope,
  EvidenceRef,
} from '../../src/packages/core/types';

function createDummyEvidence(quote = 'Vendo apartamento'): EvidenceRef {
  return {
    evidence_id: 'ev-test-1',
    message_id: 'msg-1',
    conversation_id: 'conv-101',
    exact_quote: quote,
    char_start: 0,
    char_end: quote.length,
    timestamp: '2026-10-22T12:00:00.000Z',
    extractor_type: 'rule',
    parser_version: '1.0.0',
    confidence: 0.95,
  };
}

function createSampleEnvelope(
  overrides: Partial<UniversalInterpretationEnvelope> = {}
): UniversalInterpretationEnvelope {
  const ev = createDummyEvidence();
  return {
    envelope_id: 'env-dispatch-001',
    tenant_id: 'tenant-real-estate-test',
    conversation_id: 'conv-101',
    turn_id: 'turn-01',
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
        evidence_refs: [ev],
      },
    ],
    intents: [
      {
        intent_id: 'int-1',
        intent_label: 'intent.capture_for_sale',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [ev],
      },
    ],
    facts: [],
    values: [
      {
        value_id: 'val-1',
        field_key: 'sale_asking_price',
        amount: 850000,
        currency: 'BRL',
        raw_expression: '850 mil',
        target_entity_key: 'property_primary',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [ev],
      },
    ],
    relationships: [],
    conditions: [],
    opportunities: [
      {
        opportunity_id: 'opp-sale-1',
        opportunity_type: 'real_estate.capture_sale',
        entity_key: 'property_primary',
        stage: 'qualified',
        epistemic_status: 'declared',
        confidence: 0.95,
        linked_condition_ids: [],
        attributes: { asking_price: 850000 },
        evidence_refs: [ev],
      },
    ],
    actions: [
      {
        action_id: 'act-1',
        action_type: 'qualify_property',
        target_opportunity_id: 'opp-sale-1',
        target_entity_key: 'property_primary',
        execution_mode: 'assist',
        requires_human_approval: false,
        epistemic_status: 'declared',
        confidence: 0.95,
        payload: { property_key: 'property_primary' },
        evidence_refs: [ev],
      },
    ],
    media_results: [],
    evidence_refs: [ev],
    review_items: [],
    ...overrides,
  };
}

describe('Outbound Suggestions Dispatcher (PCRM-06)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns dispatched: false with reason "no_callback_url" when callbackUrl is omitted without calling fetch', async () => {
    const fetchMock = vi.fn();
    const envelope = createSampleEnvelope();

    const result = await dispatchOutboundSuggestions({
      envelope,
      fetchFn: fetchMock as any,
    });

    expect(result.dispatched).toBe(false);
    expect(result.reason).toBe('no_callback_url');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns dispatched: false with reason "duplicate_envelope" when envelope is a duplicate', async () => {
    const fetchMock = vi.fn();
    const envelope = createSampleEnvelope({ duplicate: true });

    const result = await dispatchOutboundSuggestions({
      envelope,
      callbackUrl: 'https://pilotcrm.example.com/api/v1/webhook',
      callbackToken: 'token-abc-123',
      fetchFn: fetchMock as any,
    });

    expect(result.dispatched).toBe(false);
    expect(result.reason).toBe('duplicate_envelope');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('converts envelope via PilotCRMAdapter and sends POST to callbackUrl with headers and ai_suggestions payload', async () => {
    let capturedUrl = '';
    let capturedInit: RequestInit | undefined;

    const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedInit = init;
      return {
        ok: true,
        status: 200,
        json: async () => ({ received: true }),
      };
    });

    const envelope = createSampleEnvelope();
    const callbackUrl = 'https://pilotcrm.example.com/api/v1/webhook';
    const callbackToken = 'secret-token-xyz';

    const result = await dispatchOutboundSuggestions({
      envelope,
      callbackUrl,
      callbackToken,
      fetchFn: fetchMock as any,
    });

    expect(result.dispatched).toBe(true);
    expect(result.status).toBe(200);
    expect(result.count).toBeGreaterThan(0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(capturedUrl).toBe(callbackUrl);
    expect(capturedInit?.method).toBe('POST');

    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer secret-token-xyz');
    expect(headers['x-zaptrail-tenant-id']).toBe(envelope.tenant_id);

    const body = JSON.parse(capturedInit?.body as string);
    expect(body.tenant_id).toBe(envelope.tenant_id);
    expect(body.conversation_id).toBe(envelope.conversation_id);
    expect(body.source).toBe('zaptrail');
    expect(Array.isArray(body.suggestions)).toBe(true);
    expect(body.suggestions.length).toBe(result.count);

    const firstSuggestion = body.suggestions[0];
    expect(firstSuggestion.target_entity).toBe('deal');
    expect(firstSuggestion.enrichment_action).toBe('ADD');
    expect(firstSuggestion.confidence).toBe(0.95);
  });

  it('omits Authorization header when callbackToken is not provided', async () => {
    let capturedInit: RequestInit | undefined;
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedInit = init;
      return { ok: true, status: 201 };
    });

    const envelope = createSampleEnvelope();
    const result = await dispatchOutboundSuggestions({
      envelope,
      callbackUrl: 'https://crm.local/webhook',
      fetchFn: fetchMock as any,
    });

    expect(result.dispatched).toBe(true);
    expect(result.status).toBe(201);
    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['x-zaptrail-tenant-id']).toBe(envelope.tenant_id);
    expect(headers['Authorization']).toBeUndefined();
  });

  it('returns dispatched: false and error message when callback endpoint returns 500 without throwing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Database failure on CRM',
    });

    const envelope = createSampleEnvelope();
    const result = await dispatchOutboundSuggestions({
      envelope,
      callbackUrl: 'https://pilotcrm.example.com/api/v1/webhook',
      callbackToken: 'secret-token-xyz',
      fetchFn: fetchMock as any,
    });

    expect(result.dispatched).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toContain('500');
  });

  it('catches network timeout or network error safely and returns dispatched: false without throwing (T-07-03)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network connection timeout (AbortSignal)'));

    const envelope = createSampleEnvelope();
    const result = await dispatchOutboundSuggestions({
      envelope,
      callbackUrl: 'https://pilotcrm.example.com/api/v1/webhook',
      callbackToken: 'secret-token-xyz',
      fetchFn: fetchMock as any,
    });

    expect(result.dispatched).toBe(false);
    expect(result.error).toContain('Network connection timeout');
  });
});
