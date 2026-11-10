import { describe, expect, it, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { ingestWhatsappTurn } from '../../src/packages/api/ingest-handler';
import { SupabaseStoragePort } from '../../src/packages/core/supabase-storage';

/**
 * PilotCRM Ingest Contract Mirror:
 * Reflects C:\Users\Gustavo\pilotcrm\apps\pilotcrm\src\lib\whatsapp\ai-suggestions-service.ts
 */
const PILOTCRM_ACTIONS = [
  'NO_CHANGE',
  'CONFIRM',
  'UPDATE',
  'ADD',
  'RELATE',
  'CONTRADICT',
  'INVALIDATE',
  'SUPPRESS',
  'DEFER',
  'REVIEW',
  'CREATE_DEAL',
  'create_deal',
] as const;

const PilotCrmAiSuggestionItemSchema = z
  .object({
    idempotency_key: z.string().optional(),
    proposal_id: z.string().optional(),
    action_type: z.enum(PILOTCRM_ACTIONS).optional(),
    enrichment_action: z.enum(PILOTCRM_ACTIONS).optional(),
    action: z.string().optional(),
    target_entity_type: z.string().optional(),
    target_entity: z.string().optional(),
    entity_type: z.string().optional(),
    target_key: z.string().optional(),
    confidence: z.union([z.number(), z.string()]).optional(),
    proposed_value: z.unknown().optional(),
    payload: z.unknown().optional(),
    requires_human_review: z.boolean().optional(),
  })
  .refine(
    (item) => {
      const act = item.action_type || item.enrichment_action || item.action;
      return act && (PILOTCRM_ACTIONS as readonly string[]).includes(act);
    },
    { message: 'action_type must match PilotCRM enrichment_action_ck' }
  );

const PilotCrmAiSuggestionsIngestPayloadSchema = z
  .object({
    tenant_id: z.string().optional(),
    conversation_id: z.string().optional(),
    source: z.string().optional(),
    suggestions: z.array(PilotCrmAiSuggestionItemSchema).optional(),
    proposals: z.array(PilotCrmAiSuggestionItemSchema).optional(),
  })
  .refine(
    (data) =>
      (Array.isArray(data.suggestions) && data.suggestions.length > 0) ||
      (Array.isArray(data.proposals) && data.proposals.length > 0),
    { message: 'Payload must contain suggestions or proposals' }
  );

describe('ZapTrail <-> PilotCRM Closed-Loop Integration (PCRM-06, PCRM-07)', () => {
  const TENANT_ID = '00000000-0000-4000-8000-000000000001';
  const CONVERSATION_ID = '11111111-1111-4111-8111-111111111111';
  const PILOTCRM_CALLBACK_URL = 'https://crm.imobiliaria.com.br/api/crm/whatsapp/ai-suggestions/ingest';
  const PILOTCRM_CALLBACK_TOKEN = 'zaptrail-pilotcrm-secret-xyz';

  let storage: SupabaseStoragePort;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new SupabaseStoragePort();
    mockFetch = vi.fn();
  });

  it('1. Captura de demanda do comprador -> extrai oportunidade -> emite proposta ADD deal compativel com PilotCRM', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, count: 1, inserted: 1, duplicates: 0 }),
    });

    const turnPayload = {
      tenant_id: TENANT_ID,
      conversation_id: CONVERSATION_ID,
      provider: 'whatsapp',
      callback_url: PILOTCRM_CALLBACK_URL,
      callback_token: PILOTCRM_CALLBACK_TOKEN,
      messages: [
        {
          external_message_id: 'wamid_buyer_leblon_001',
          sender_id: '5521999991234',
          sender_name: 'Mariana Souza',
          raw_text: 'Olá! Gostaria de comprar um apartamento de 3 quartos no Leblon até R$ 2.500.000, urgente.',
          timestamp: '2026-11-10T10:00:00Z',
          direction: 'inbound' as const,
        },
      ],
    };

    const result = await ingestWhatsappTurn(turnPayload, {
      storage,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    expect(result.status).toBe(201);
    expect(result.duplicate).toBe(false);
    expect(result.outboundResult?.dispatched).toBe(true);
    expect(result.outboundResult?.count).toBeGreaterThanOrEqual(1);

    // Verify webhook call details
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, requestInit] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe(PILOTCRM_CALLBACK_URL);
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers['Authorization']).toBe(`Bearer ${PILOTCRM_CALLBACK_TOKEN}`);
    expect(requestInit.headers['x-zaptrail-tenant-id']).toBe(TENANT_ID);

    // Verify dispatched payload strictly parses PilotCRM Zod schema
    const dispatchedBody = JSON.parse(requestInit.body);
    const parsedPayload = PilotCrmAiSuggestionsIngestPayloadSchema.safeParse(dispatchedBody);
    expect(parsedPayload.success).toBe(true);

    expect(dispatchedBody.tenant_id).toBe(TENANT_ID);
    expect(dispatchedBody.conversation_id).toBe(CONVERSATION_ID);
    expect(dispatchedBody.source).toBe('zaptrail');

    const proposal = dispatchedBody.suggestions[0];
    expect(proposal.enrichment_action).toBe('ADD');
    expect(proposal.target_entity).toBe('deal');
    expect(proposal.payload.side).toBe('DEMANDA');
    expect(proposal.payload.intention).toBe('compra');
    expect(proposal.payload.neighborhood).toBe('Leblon');
    expect(proposal.payload.targetValue).toBe('2500000');
    expect(proposal.payload.timing).toBe('immediate');
  });

  it('2. Captura de oferta do proprietario (captação) -> emite proposta ADD deal com propertyDraft enriquecido', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, count: 1, inserted: 1, duplicates: 0 }),
    });

    const turnPayload = {
      tenant_id: TENANT_ID,
      conversation_id: 'conv-owner-offer-002',
      provider: 'whatsapp',
      callback_url: PILOTCRM_CALLBACK_URL,
      callback_token: PILOTCRM_CALLBACK_TOKEN,
      messages: [
        {
          external_message_id: 'wamid_owner_002',
          sender_id: '5511988887777',
          sender_name: 'Carlos Corretor',
          raw_text: 'Sou proprietário e quero vender meu apartamento de 120m² em Pinheiros por R$ 1.800.000. Condomínio R$ 1.500 e IPTU R$ 3.800.',
          timestamp: '2026-11-10T11:00:00Z',
          direction: 'inbound' as const,
        },
      ],
    };

    const result = await ingestWhatsappTurn(turnPayload, {
      storage,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    expect(result.status).toBe(201);
    expect(result.outboundResult?.dispatched).toBe(true);

    const [, requestInit] = mockFetch.mock.calls[0];
    const dispatchedBody = JSON.parse(requestInit.body);
    const parsed = PilotCrmAiSuggestionsIngestPayloadSchema.safeParse(dispatchedBody);
    expect(parsed.success).toBe(true);

    const proposal = dispatchedBody.suggestions.find(
      (s: any) => s.enrichment_action === 'ADD' && s.target_entity === 'deal'
    );
    expect(proposal).toBeDefined();
    expect(proposal.payload.side).toBe('CAPTACAO');
    expect(proposal.payload.intention).toBe('venda');
    expect(proposal.payload.neighborhood).toBe('Pinheiros');
    expect(proposal.payload.targetValue).toBe('1800000');
    expect(proposal.payload.propertyDraft).toBeDefined();
    expect(proposal.payload.propertyDraft.price).toBe(1800000);
    expect(proposal.payload.propertyDraft.neighborhood).toBe('Pinheiros');
    expect(proposal.payload.propertyDraft.area_sqm).toBe(120);
  });

  it('3. Opt-out explícito do cliente -> emite proposta SUPPRESS contact (D-09, CT-07)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, count: 1, inserted: 1, duplicates: 0 }),
    });

    const turnPayload = {
      tenant_id: TENANT_ID,
      conversation_id: 'conv-opt-out-003',
      provider: 'whatsapp',
      callback_url: PILOTCRM_CALLBACK_URL,
      callback_token: PILOTCRM_CALLBACK_TOKEN,
      messages: [
        {
          external_message_id: 'wamid_opt_out_003',
          sender_id: '5511977776666',
          sender_name: 'Usuário Indignado',
          raw_text: 'Por favor, não me mande mais mensagens. Remova meu número da lista.',
          timestamp: '2026-11-10T12:00:00Z',
          direction: 'inbound' as const,
        },
      ],
    };

    const result = await ingestWhatsappTurn(turnPayload, {
      storage,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    expect(result.status).toBe(201);
    expect(result.envelope.do_not_contact).toBe(true);

    const [, requestInit] = mockFetch.mock.calls[0];
    const dispatchedBody = JSON.parse(requestInit.body);
    const proposal = dispatchedBody.suggestions[0];

    expect(proposal.enrichment_action).toBe('SUPPRESS');
    expect(proposal.target_entity).toBe('contact');
    expect(proposal.payload.do_not_contact).toBe(true);
    expect(proposal.payload.recommended_action).toBe('suppress_commercial_followup');
  });

  it('4. Idempotência: reenvio do mesmo turno não dispara requisição HTTP duplicada ao PilotCRM', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, count: 1, inserted: 1, duplicates: 0 }),
    });

    const turnPayload = {
      tenant_id: TENANT_ID,
      conversation_id: 'conv-idemp-004',
      provider: 'whatsapp',
      callback_url: PILOTCRM_CALLBACK_URL,
      callback_token: PILOTCRM_CALLBACK_TOKEN,
      messages: [
        {
          external_message_id: 'wamid_idemp_004',
          sender_id: '5511955554444',
          sender_name: 'Ana Paula',
          raw_text: 'Procuro apartamento para locação nos Jardins até R$ 5.000.',
          timestamp: '2026-11-10T13:00:00Z',
          direction: 'inbound' as const,
        },
      ],
    };

    // First delivery -> processes & dispatches
    const firstResult = await ingestWhatsappTurn(turnPayload, {
      storage,
      fetchFn: mockFetch as unknown as typeof fetch,
    });
    expect(firstResult.status).toBe(201);
    expect(firstResult.duplicate).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second delivery (e.g. network retry) -> recognized as duplicate, NO outbound dispatch
    const secondResult = await ingestWhatsappTurn(turnPayload, {
      storage,
      fetchFn: mockFetch as unknown as typeof fetch,
    });
    expect(secondResult.status).toBe(200);
    expect(secondResult.duplicate).toBe(true);
    // Fetch should NOT have been called a second time
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
