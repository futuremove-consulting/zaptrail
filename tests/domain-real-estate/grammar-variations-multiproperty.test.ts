import { describe, it, expect } from 'vitest';
import { ConversationMessage, TurnWindow } from '../../src/packages/core/types';
import {
  extractMonetaryValuesPtBr,
  extractPropertyMetricsPtBr,
  extractReferredContactPtBr,
} from '../../src/packages/domain-real-estate/normalizer-ptbr';
import {
  classifyPartyRole,
  classifyRealEstateIntents,
  detectRealEstateConditions,
} from '../../src/packages/domain-real-estate/role-intent-rules';
import {
  RealEstateDomainPack,
  interpretRealEstateTurn,
} from '../../src/packages/domain-real-estate/opportunity-orchestrator';

function createMockMessage(text: string, msgId = 'msg-test-01'): ConversationMessage {
  return {
    message_id: msgId,
    external_message_id: `ext-${msgId}`,
    tenant_id: 'tenant-test',
    provider: 'whatsapp',
    conversation_id: 'conv-ptbr-01',
    sender_id: 'user-01',
    direction: 'inbound',
    raw_text: text,
    normalized_text: text,
    timestamp: '2026-10-21T17:00:00.000Z',
    attachments: [],
  };
}

function createMockTurn(text: string, seededContext?: Record<string, unknown>): TurnWindow {
  const msg = createMockMessage(text);
  return {
    turn_id: 'turn-test-01',
    tenant_id: 'tenant-test',
    provider: 'whatsapp',
    conversation_id: 'conv-ptbr-01',
    messages: [msg],
    consolidated_text: text,
    seeded_context: seededContext,
  };
}

describe('Grammar Variations pt-BR & Multi-Property Extractions', () => {
  describe('1. Brazilian Portuguese Monetary & Metric Grammar Variations', () => {
    it('normalizes formatted currency without "mil": "venda por R$ 1.500.000"', () => {
      const msg = createMockMessage('Estou com venda por R$ 1.500.000 do meu imóvel de Moema');
      const vals = extractMonetaryValuesPtBr(msg);
      expect(vals.length).toBeGreaterThanOrEqual(1);
      const saleVal = vals.find((v) => v.field_key === 'sale_asking_price');
      expect(saleVal).toBeDefined();
      expect(saleVal?.amount).toBe(1500000);
      expect(saleVal?.currency).toBe('BRL');
      expect(saleVal?.evidence_refs[0].char_start).toBeGreaterThanOrEqual(0);
    });

    it('extracts abbreviated million notation with decimal comma: "2,5 milhões" and "1,8 mi"', () => {
      const msg1 = createMockMessage('O valor de venda é 2,5 milhões');
      const vals1 = extractMonetaryValuesPtBr(msg1);
      expect(vals1.find((v) => v.field_key === 'sale_asking_price')?.amount).toBe(2500000);

      const msg2 = createMockMessage('Quero 1,8 mi na casa');
      const vals2 = extractMonetaryValuesPtBr(msg2);
      expect(vals2.find((v) => v.field_key === 'sale_asking_price')?.amount).toBe(1800000);
    });

    it('extracts colloquial thousand notation with "k": "4.5k de aluguel" vs "800k de venda"', () => {
      const rentMsg = createMockMessage('Alugo o apartamento por 4.5k de aluguel');
      const rentVals = extractMonetaryValuesPtBr(rentMsg);
      const rentVal = rentVals.find((v) => v.field_key === 'rent_asking_price');
      expect(rentVal?.amount).toBe(4500);

      const saleMsg = createMockMessage('Preço de venda: 800k');
      const saleVals = extractMonetaryValuesPtBr(saleMsg);
      const saleVal = saleVals.find((v) => v.field_key === 'sale_asking_price');
      expect(saleVal?.amount).toBe(800000);
    });

    it('correctly associates condomínio and IPTU with lower/upper cases and prefixes', () => {
      const msg = createMockMessage('Aluguel de 3.200, cond R$ 750 e IPTU de R$ 180');
      const vals = extractMonetaryValuesPtBr(msg);
      
      const condo = vals.find((v) => v.field_key === 'condo_fee');
      expect(condo?.amount).toBe(750);
      expect(condo?.unit).toBe('BRL/month');

      const iptu = vals.find((v) => v.field_key === 'iptu_amount');
      expect(iptu?.amount).toBe(180);
      expect(iptu?.unit).toBe('BRL/year');
    });

    it('normalizes bedroom numbers and area metrics: "3 quartos e 85 m2"', () => {
      const msg1 = createMockMessage('Apartamento lindo com 3 quartos e 85 m2');
      const metrics1 = extractPropertyMetricsPtBr(msg1);
      expect(metrics1.property_type).toBe('apartment');
      expect(metrics1.bedrooms).toBe(3);
      expect(metrics1.area_m2).toBe(85);

      const msg2 = createMockMessage('Casa com 4 quartos e 220 m²');
      const metrics2 = extractPropertyMetricsPtBr(msg2);
      expect(metrics2.property_type).toBe('house');
      expect(metrics2.bedrooms).toBe(4);
      expect(metrics2.area_m2).toBe(220);
    });
  });

  describe('2. Multi-Property Capture (Primary Rejection + Secondary Alternative)', () => {
    it('accurately parses primary property refusal and secondary commercial property capture with pricing', async () => {
      const text = 'Esse da Paulista eu não vendo, mas tenho uma sala comercial para alugar por 2.500 no Itaim';
      const turn = createMockTurn(text, {
        seeded_property_candidates: [
          { external_property_id: 'seed-apt-1', address_line: 'Av. Paulista, 1000', listing_type: 'sale' },
        ],
      });

      const pack = new RealEstateDomainPack();
      const res = await pack.interpretTurnWindow(turn);

      expect(res.intents.some((i) => i.intent_label === 'intent.not_interested_property')).toBe(true);
      expect(res.intents.some((i) => i.intent_label === 'intent.capture_other_property')).toBe(true);

      const candidates = res.domain_entities?.property_candidates;
      expect(candidates).toHaveLength(2);

      const primary = candidates?.find((c) => c.property_key === 'property_primary');
      expect(primary?.origin_kind).toBe('seeded_primary');
      expect(primary?.label).toBe('Av. Paulista, 1000');

      const secondary = candidates?.find((c) => c.property_key === 'property_secondary');
      expect(secondary?.origin_kind).toBe('offered_alternative');
      expect(secondary?.property_type).toBe('commercial');
      expect(secondary?.rent_asking_price).toBe(2500);

      // Verifies capture_rent opportunity was generated from secondary property offering
      const rentOpp = res.opportunities.find((o) => o.opportunity_type === 'real_estate.capture_rent');
      expect(rentOpp).toBeDefined();
    });

    it('extracts discrete prices for primary vs secondary property when both are mentioned in one turn', () => {
      const text = 'Quero vender o apartamento por 750 mil, mas tenho outro imóvel pra alugar por 3 mil';
      const msg = createMockMessage(text);
      const vals = extractMonetaryValuesPtBr(msg);

      const primarySale = vals.find((v) => v.field_key === 'sale_asking_price' && v.target_entity_key === 'property_primary');
      expect(primarySale).toBeDefined();
      expect(primarySale?.amount).toBe(750000);

      const secondaryRent = vals.find((v) => v.field_key === 'rent_asking_price' && v.target_entity_key === 'property_secondary');
      expect(secondaryRent).toBeDefined();
      expect(secondaryRent?.amount).toBe(3000);
    });
  });

  describe('3. Grammatical Nuances in Roles, Contacts & Conditions', () => {
    it('identifies referred third party with family kinship: "fala com Carlos no 11988887777"', () => {
      const msg = createMockMessage('Não sou o proprietário, fala com Carlos no 11988887777 que ele cuida da venda');
      const contact = extractReferredContactPtBr(msg);
      expect(contact.referred_name).toBe('Carlos');
      expect(contact.referred_phone).toBe('11988887777');
      expect(contact.relationship_type).toBe('family_member');
    });

    it('detects sale_before_purchase condition with colloquial phrasing: "preciso vender antes de fechar qualquer compra"', () => {
      const turn = createMockTurn('Tenho interesse no apto de 600 mil, mas preciso vender antes de fechar qualquer compra');
      const conditions = detectRealEstateConditions(turn);
      const saleBeforeBuy = conditions.find((c) => c.condition_type === 'sale_before_purchase');
      expect(saleBeforeBuy).toBeDefined();
      expect(saleBeforeBuy?.description).toContain('condicionada');
    });

    it('detects family_approval condition with marital phrasing: "minha esposa disse que não aprova esse valor"', () => {
      const turn = createMockTurn('Gostei do imóvel, mas minha esposa disse que não aprova esse valor');
      const conditions = detectRealEstateConditions(turn);
      const famApproval = conditions.find((c) => c.condition_type === 'family_approval');
      expect(famApproval).toBeDefined();
      expect(famApproval?.epistemic_status).toBe('declared');
    });

    it('detects exclusivity constraint: "trabalho com exclusividade"', () => {
      const turn = createMockTurn('Pode anunciar sim por 890 mil, trabalho com exclusividade');
      const conditions = detectRealEstateConditions(turn);
      const exclusivity = conditions.find((c) => c.condition_type === 'exclusivity_constraint');
      expect(exclusivity).toBeDefined();
      expect(exclusivity?.evidence_refs[0].exact_quote).toContain('com exclusividade');
    });
  });

  describe('4. End-to-End interpretRealEstateTurn with Brazilian Grammatical Variations', () => {
    it('executes interpretRealEstateTurn on compound dialogue with colloquial phrasing and produces compliant envelope', async () => {
      const turn = createMockTurn('Sou proprietário e quero vender meu apartamento por 1,35 milhão com cond 800 e IPTU 250, moro nele atualmente');
      const envelope = await interpretRealEstateTurn(turn);

      expect(envelope.tenant_id).toBe('tenant-test');
      expect(envelope.participants.some((p) => p.role_label === 'owner')).toBe(true);
      expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);

      const priceObs = envelope.values.find((v) => v.field_key === 'sale_asking_price');
      expect(priceObs).toBeDefined();
      expect(priceObs?.amount).toBe(1350000);

      // Verify action recommendation
      const qualAct = envelope.actions.find((a) => a.action_type === 'qualify_property');
      expect(qualAct).toBeDefined();
      expect(qualAct?.execution_mode).toBe('assist');
      expect(qualAct?.requires_human_approval).toBe(true);
    });
  });

  describe('5. Grammatical Gaps & Edge Cases Documented for Phase 1 / Milestone Refinement', () => {
    it('documents Stage 1 fallback to "unknown" when definite article is used ("sou o proprietário")', () => {
      // In Stage 1 role-intent-rules.ts line 163, the regex is /(?:sou\s+(?:o\s+)?dono|...|sou\s+propriet[áa]ri[oa])/
      // Notice "sou proprietário" matches, but "sou o proprietário" (with "o ") falls through to "unknown".
      const turnWithArticle = createMockTurn('Olá, sou o proprietário do imóvel');
      const { participant: partWithArticle } = classifyPartyRole(turnWithArticle);
      expect(partWithArticle.role_label).toBe('unknown'); // Documented Phase 1 gap
      expect(partWithArticle.confidence).toBeLessThan(0.85);

      const turnWithoutArticle = createMockTurn('Olá, sou proprietário do imóvel');
      const { participant: partWithoutArticle } = classifyPartyRole(turnWithoutArticle);
      expect(partWithoutArticle.role_label).toBe('owner');
      expect(partWithoutArticle.confidence).toBe(0.95);
    });

    it('documents capture_rent opportunity entity_key assignment during CAPTURE_OTHER_PROPERTY', async () => {
      // In opportunity-orchestrator.ts line 238, capture_rent opportunity defaults to 'property_primary'
      // while property_candidates correctly defines 'property_secondary' as the alternative commercial space.
      const text = 'Esse da Paulista eu não vendo, mas tenho uma sala comercial para alugar por 2.500 no Itaim';
      const turn = createMockTurn(text, {
        seeded_property_candidates: [
          { external_property_id: 'seed-apt-1', address_line: 'Av. Paulista, 1000', listing_type: 'sale' },
        ],
      });

      const pack = new RealEstateDomainPack();
      const res = await pack.interpretTurnWindow(turn);

      const rentOpp = res.opportunities.find((o) => o.opportunity_type === 'real_estate.capture_rent');
      expect(rentOpp).toBeDefined();
      // Documented Phase 1 gap: currently points to property_primary rather than property_secondary
      expect(rentOpp?.entity_key).toBe('property_primary');
      expect(res.domain_entities?.property_candidates[1].property_key).toBe('property_secondary');
    });
  });
});

