import { describe, expect, it } from 'vitest';
import { interpretRealEstateTurn, coalesceTurnWindow, PilotCRMAdapter } from '../../src/packages/domain-real-estate';

describe('Decision 1 & 3: 7-Layer Real Estate Classifier + PilotCRM ProposalPayload Contract', () => {
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
});
