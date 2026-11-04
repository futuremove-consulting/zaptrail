import { describe, expect, it, vi } from 'vitest';
import { interpretRealEstateTurn, coalesceTurnWindow, PilotCRMAdapter } from '../../src/packages/domain-real-estate';
import { convertRealEstateLlmOutputToCorePayload } from '../../src/packages/domain-real-estate/llm/real-estate-llm-converter';
import { dispatchOutboundSuggestions } from '../../src/packages/api/outbound-dispatcher';

describe('Decision 1 & 3 + Review Cycles 1, 3, 4: 7-Layer Real Estate Classifier + PilotCRM ProposalPayload Contract', () => {
  it('populates rich OpportunityAssessment.attributes and emits PilotCRM ProposalPayload fields on ADD deal (CAPTACAO)', async () => {
    const turn = coalesceTurnWindow({
      tenant_id: 'tenant-1',
      provider: 'whatsapp',
      conversation_id: 'conv-cap-1',
      raw_messages: [
        {
          message_id: 'm-1',
          external_message_id: 'ext-1',
          sender_id: '5541999991111',
          sender_name: 'Carlos Silva',
          direction: 'inbound',
          raw_text: 'Sou proprietário de uma cobertura duplex no Batel, 3 quartos, 180m2, quero vender urgente por 1,5 milhão.',
          timestamp: '2026-11-04T10:00:00Z',
        },
      ],
    });

    const envelope = await interpretRealEstateTurn(turn);
    const saleOpp = envelope.opportunities.find((o) => o.opportunity_type === 'real_estate.capture_sale');
    expect(saleOpp).toBeDefined();
    expect(saleOpp!.attributes).toBeDefined();
    expect(saleOpp!.attributes.side).toBe('CAPTACAO');
    expect(saleOpp!.attributes.intention).toBe('venda');
    expect(saleOpp!.attributes.timing).toBe('immediate');
    expect(saleOpp!.attributes.neighborhood).toBe('Batel');
    expect(['cobertura', 'duplex']).toContain(saleOpp!.attributes.property_subtype);
    expect(saleOpp!.attributes.bedrooms).toBe(3);
    expect(saleOpp!.attributes.area_m2).toBe(180);
    expect(saleOpp!.attributes.price).toBe(1500000);

    const proposals = PilotCRMAdapter.toProposals(envelope);
    const addDeal = proposals.find((p) => p.enrichment_action === 'ADD' && p.target_entity === 'deal');
    expect(addDeal).toBeDefined();
    expect(addDeal!.payload.side).toBe('CAPTACAO');
    expect(addDeal!.payload.intention).toBe('venda');
    expect(addDeal!.payload.targetValue).toBe('1500000');
    expect(addDeal!.payload.neighborhood).toBe('Batel');
    expect(addDeal!.payload.timing).toBe('immediate');
    expect(addDeal!.payload.phone).toBe('5541999991111');
    expect(typeof addDeal!.payload.title).toBe('string');
    expect((addDeal!.payload.title as string).length).toBeGreaterThan(5);
    expect(addDeal!.payload.propertyDraft).toMatchObject({
      type: 'apartment',
      price: 1500000,
      neighborhood: 'Batel',
      rooms: 3,
      area_sqm: 180,
    });
  });

  it('detects 7-layer buyer demand (procuro/cliente procurando/orçamento até) and emits DEMANDA ProposalPayload', async () => {
    const turn = coalesceTurnWindow({
      tenant_id: 'tenant-1',
      provider: 'whatsapp',
      conversation_id: 'conv-dem-1',
      raw_messages: [
        {
          message_id: 'm-2',
          external_message_id: 'ext-2',
          sender_id: '5511988882222',
          sender_name: 'Mariana Costa',
          direction: 'inbound',
          raw_text: 'Oi, procuro um studio ou loft em Moema para comprar no mês que vem, orçamento até 650 mil.',
          timestamp: '2026-11-04T10:05:00Z',
        },
      ],
    });

    const envelope = await interpretRealEstateTurn(turn);
    const buyOpp = envelope.opportunities.find((o) => o.opportunity_type === 'real_estate.demand_buy');
    expect(buyOpp).toBeDefined();
    expect(buyOpp!.attributes.side).toBe('DEMANDA');
    expect(buyOpp!.attributes.intention).toBe('compra');
    expect(buyOpp!.attributes.timing).toBe('short_term');
    expect(buyOpp!.attributes.neighborhood).toBe('Moema');
    expect(buyOpp!.attributes.budget_max).toBe(650000);

    const proposals = PilotCRMAdapter.toProposals(envelope);
    const addDeal = proposals.find((p) => p.enrichment_action === 'ADD' && p.target_entity === 'deal');
    expect(addDeal).toBeDefined();
    expect(addDeal!.payload.side).toBe('DEMANDA');
    expect(addDeal!.payload.intention).toBe('compra');
    expect(addDeal!.payload.targetValue).toBe('650000');
    expect(addDeal!.payload.neighborhood).toBe('Moema');
    expect(addDeal!.payload.timing).toBe('short_term');
  });

  it('C1-01: populates OpportunityAssessment.attributes in Stage 2 LLM converter (convertRealEstateLlmOutputToCorePayload)', () => {
    const turn = coalesceTurnWindow({
      tenant_id: 'tenant-1',
      provider: 'whatsapp',
      conversation_id: 'conv-llm-1',
      raw_messages: [
        {
          message_id: 'm-llm-1',
          external_message_id: 'ext-llm-1',
          sender_id: '5541977773333',
          sender_name: 'Roberto Almeida',
          direction: 'inbound',
          raw_text: 'Tenho um apartamento no Alto da Glória por 890 mil para venda urgente',
          timestamp: '2026-11-04T10:10:00Z',
        },
      ],
    });

    const payload = convertRealEstateLlmOutputToCorePayload(
      {
        summary: 'Apartamento no Alto da Glória para venda por 890 mil',
        detected_role: { role: 'owner', confidence: 0.9, exact_quote: 'Tenho um apartamento' },
        intents: [{ label: 'intent.capture_for_sale', confidence: 0.92, exact_quote: 'para venda' }],
        properties: [
          {
            property_index: 0,
            intent: 'intent.capture_for_sale',
            sale_asking_price: 890000,
            address_hint: 'Alto da Glória',
            exact_quote: '890 mil',
          },
        ],
        conditions: [],
      },
      turn
    );

    expect(payload.opportunities).toHaveLength(1);
    expect(payload.opportunities[0].attributes.side).toBe('CAPTACAO');
    expect(payload.opportunities[0].attributes.price).toBe(890000);
    expect(payload.opportunities[0].attributes.neighborhood).toBe('Alto da Glória');
    expect(payload.opportunities[0].attributes.phone).toBe('5541977773333');
  });

  it('C3-01 & C3-02: handles compound neighborhoods with prepositions (Jardim das Américas) and formatted demand budgets without false positives on WhatsApp/Dúvida', async () => {
    const turn = coalesceTurnWindow({
      tenant_id: 'tenant-1',
      provider: 'whatsapp',
      conversation_id: 'conv-edge-1',
      raw_messages: [
        {
          message_id: 'm-edge-1',
          external_message_id: 'ext-edge-1',
          sender_id: '5541966664444',
          direction: 'inbound',
          raw_text: 'Estou em Dúvida no WhatsApp, mas procuro casa no Jardim das Américas, orçamento até 750.000.',
          timestamp: '2026-11-04T10:15:00Z',
        },
      ],
    });

    const envelope = await interpretRealEstateTurn(turn);
    const buyOpp = envelope.opportunities.find((o) => o.opportunity_type === 'real_estate.demand_buy');
    expect(buyOpp).toBeDefined();
    expect(buyOpp!.attributes.neighborhood).toBe('Jardim das Américas');
    expect(buyOpp!.attributes.budget_max).toBe(750000);
  });

  it('C4-01: redacts callbackToken from error messages in dispatchOutboundSuggestions (T-07-04)', async () => {
    const turn = coalesceTurnWindow({
      tenant_id: 'tenant-1',
      provider: 'whatsapp',
      conversation_id: 'conv-redact-1',
      raw_messages: [
        {
          message_id: 'm-r-1',
          external_message_id: 'ext-r-1',
          sender_id: '5541999991111',
          direction: 'inbound',
          raw_text: 'Quero vender meu apartamento por 500 mil',
          timestamp: '2026-11-04T10:20:00Z',
        },
      ],
    });
    const envelope = await interpretRealEstateTurn(turn);
    const secretToken = 'secret-token-xyz-987';

    const failingFetch = vi.fn(async () => {
      throw new Error(`Connection rejected for Bearer ${secretToken}`);
    });

    const res = await dispatchOutboundSuggestions({
      envelope,
      callbackUrl: 'https://crm.example.com/ingest',
      callbackToken: secretToken,
      fetchFn: failingFetch as unknown as typeof fetch,
    });

    expect(res.dispatched).toBe(false);
    expect(res.error).not.toContain(secretToken);
    expect(res.error).toContain('[REDACTED]');
  });
});
