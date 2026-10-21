import { describe, it, expect } from 'vitest';
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
  RealEstatePartyRoleSchema,
  RealEstateIntentLabelSchema,
  RealEstateConditionTypeSchema,
  RealEstateOpportunityTypeSchema,
  RealEstateActionTypeSchema,
  RealEstatePropertyCandidateSchema,
  RealEstateDemandProfileSchema,
  RealEstateDomainEntitiesSchema,
} from '../../src/packages/domain-real-estate/types';
import type { ConversationMessage, TurnWindow } from '../../src/packages/core/types';

function createTestMessage(
  text: string,
  extra?: Partial<ConversationMessage>
): ConversationMessage {
  return {
    message_id: extra?.message_id ?? 'msg-test-1',
    external_message_id: extra?.external_message_id ?? 'ext-msg-1',
    tenant_id: extra?.tenant_id ?? 'tenant-alpha',
    provider: extra?.provider ?? 'whatsapp',
    conversation_id: extra?.conversation_id ?? 'conv-test-1',
    direction: extra?.direction ?? 'inbound',
    sender_id: extra?.sender_id ?? '5511999999999',
    raw_text: text,
    normalized_text: text.trim(),
    timestamp: extra?.timestamp ?? new Date().toISOString(),
    attachments: extra?.attachments ?? [],
  };
}

function createTestTurn(
  inboundTexts: string[],
  priorOutboundText?: string
): TurnWindow {
  const messages = inboundTexts.map((txt, idx) =>
    createTestMessage(txt, {
      message_id: `msg-${idx + 1}`,
      external_message_id: `ext-${idx + 1}`,
    })
  );

  const priorOutbound = priorOutboundText
    ? createTestMessage(priorOutboundText, {
        message_id: 'msg-out-0',
        external_message_id: 'ext-out-0',
        direction: 'outbound',
        sender_id: 'system',
      })
    : undefined;

  return {
    turn_id: 'turn-test-1',
    tenant_id: 'tenant-alpha',
    provider: 'whatsapp',
    conversation_id: 'conv-test-1',
    messages,
    prior_outbound_message: priorOutbound,
    consolidated_text: inboundTexts.join('\n'),
  };
}

describe('RE-01 & RE-05: Real Estate Schemas & Taxonomy', () => {
  it('validates party role enum members', () => {
    expect(RealEstatePartyRoleSchema.parse('owner')).toBe('owner');
    expect(RealEstatePartyRoleSchema.parse('spouse_or_partner')).toBe('spouse_or_partner');
    expect(RealEstatePartyRoleSchema.parse('family_member')).toBe('family_member');
    expect(RealEstatePartyRoleSchema.parse('broker_or_intermediary')).toBe('broker_or_intermediary');
    expect(RealEstatePartyRoleSchema.parse('unrelated_third_party')).toBe('unrelated_third_party');
    expect(RealEstatePartyRoleSchema.parse('unknown')).toBe('unknown');
  });

  it('validates intent label enum members', () => {
    expect(RealEstateIntentLabelSchema.parse('intent.capture_for_sale')).toBe('intent.capture_for_sale');
    expect(RealEstateIntentLabelSchema.parse('intent.capture_other_property')).toBe('intent.capture_other_property');
    expect(RealEstateIntentLabelSchema.parse('intent.do_not_contact')).toBe('intent.do_not_contact');
    expect(RealEstateIntentLabelSchema.parse('intent.ambiguous_or_open')).toBe('intent.ambiguous_or_open');
  });

  it('validates condition, opportunity, and action enums', () => {
    expect(RealEstateConditionTypeSchema.parse('sale_before_purchase')).toBe('sale_before_purchase');
    expect(RealEstateConditionTypeSchema.parse('family_approval')).toBe('family_approval');
    expect(RealEstateOpportunityTypeSchema.parse('real_estate.capture_sale')).toBe('real_estate.capture_sale');
    expect(RealEstateOpportunityTypeSchema.parse('real_estate.demand_buy')).toBe('real_estate.demand_buy');
    expect(RealEstateActionTypeSchema.parse('link_conditional_opportunities')).toBe('link_conditional_opportunities');
    expect(RealEstateActionTypeSchema.parse('suppress_commercial_followup')).toBe('suppress_commercial_followup');
  });

  it('validates domain entities container schema', () => {
    const valid = RealEstateDomainEntitiesSchema.parse({
      property_candidates: [
        {
          property_key: 'property_primary',
          origin_kind: 'seeded_primary',
          label: 'Apartamento Edifício Solar',
          property_type: 'apartment',
          occupancy_status: 'vacant',
          sale_asking_price: 950000,
          epistemic_status: 'declared',
          confidence: 0.95,
          evidence_refs: [
            {
              evidence_id: 'ev-1',
              message_id: 'm-1',
              conversation_id: 'c-1',
              exact_quote: '950 mil',
              char_start: 0,
              char_end: 7,
              timestamp: new Date().toISOString(),
              extractor_type: 'rule',
              parser_version: '1.0.0',
              confidence: 0.95,
            },
          ],
        },
      ],
      demand_profiles: [],
    });
    expect(valid.property_candidates).toHaveLength(1);
  });
});

describe('RE-05 & D-05: Colloquial pt-BR Monetary Normalizer', () => {
  it('normalizes millions in various colloquial forms (CT-01, CT-13, CT-20)', () => {
    const m1 = createTestMessage('Sou o dono sim, estou vendendo por 1,2 milhão.');
    const v1 = extractMonetaryValuesPtBr(m1);
    expect(v1).toHaveLength(1);
    expect(v1[0].field_key).toBe('sale_asking_price');
    expect(v1[0].amount).toBe(1200000);
    expect(v1[0].raw_expression).toBe('1,2 milhão');
    expect(v1[0].evidence_refs[0].exact_quote).toBe('1,2 milhão');
    const start1 = v1[0].evidence_refs[0].char_start;
    const end1 = v1[0].evidence_refs[0].char_end;
    expect(m1.normalized_text.slice(start1, end1)).toBe('1,2 milhão');

    const m2 = createTestMessage('Subi o valor, agora não fecho por menos de 1,35 milhão.');
    const v2 = extractMonetaryValuesPtBr(m2);
    expect(v2[0].amount).toBe(1350000);

    const m3 = createTestMessage('1,2 mi');
    const v3 = extractMonetaryValuesPtBr(m3);
    expect(v3[0].amount).toBe(1200000);

    const m4 = createTestMessage('mas se chegar em 1,5 mi eu convenço ele');
    const v4 = extractMonetaryValuesPtBr(m4);
    expect(v4[0].amount).toBe(1500000);

    const m5 = createTestMessage('estou procurando uma casa maior no mesmo bairro até 2 milhões.');
    const v5 = extractMonetaryValuesPtBr(m5);
    expect(v5[0].amount).toBe(2000000);
    expect(v5[0].field_key).toBe('budget_max');
  });

  it('normalizes thousands with mil, k, and formatted punctuation (CT-02, CT-03, CT-08, CT-12, CT-17)', () => {
    const m1 = createTestMessage('950 mil');
    const v1 = extractMonetaryValuesPtBr(m1);
    expect(v1[0].amount).toBe(950000);

    const m2 = createTestMessage('Quero alugar por 4.500, condomínio 900 e IPTU 250.');
    const v2 = extractMonetaryValuesPtBr(m2);
    expect(v2).toHaveLength(3);
    const rent = v2.find((v) => v.field_key === 'rent_asking_price');
    const cond = v2.find((v) => v.field_key === 'condo_fee');
    const iptu = v2.find((v) => v.field_key === 'iptu_amount');
    expect(rent?.amount).toBe(4500);
    expect(cond?.amount).toBe(900);
    expect(iptu?.amount).toBe(250);

    const m3 = createTestMessage('Pode trabalhar venda por 950 mil ou locação por 4.200.');
    const v3 = extractMonetaryValuesPtBr(m3);
    expect(v3.find((v) => v.field_key === 'sale_asking_price')?.amount).toBe(950000);
    expect(v3.find((v) => v.field_key === 'rent_asking_price')?.amount).toBe(4200);

    const m4 = createTestMessage('3.5k de aluguel e cond 900');
    const v4 = extractMonetaryValuesPtBr(m4);
    expect(v4.find((v) => v.field_key === 'rent_asking_price')?.amount).toBe(3500);
    expect(v4.find((v) => v.field_key === 'condo_fee')?.amount).toBe(900);

    const m5 = createTestMessage('850 mil');
    expect(extractMonetaryValuesPtBr(m5)[0].amount).toBe(850000);

    const m6 = createTestMessage('980 mil');
    expect(extractMonetaryValuesPtBr(m6)[0].amount).toBe(980000);
  });

  it('routes secondary property value to property_secondary target key (CT-08, D-07)', () => {
    const m = createTestMessage(
      'Esse da Rua X eu não vendo porque moro nele, mas tenho uma sala comercial no Centro para vender por 380 mil.'
    );
    const vals = extractMonetaryValuesPtBr(m);
    expect(vals).toHaveLength(1);
    expect(vals[0].amount).toBe(380000);
    expect(vals[0].target_entity_key).toBe('property_secondary');
  });
});

describe('RE-01 & RE-05: Metrics and Referred Contact Extractors', () => {
  it('extracts property metrics (bedrooms, area, type, occupancy)', () => {
    const m1 = createTestMessage(
      'Esse da Rua X eu não vendo porque moro nele, mas tenho uma sala comercial no Centro para vender por 380 mil.'
    );
    const metrics1 = extractPropertyMetricsPtBr(m1);
    expect(metrics1.occupancy_status).toBe('owner_occupied');
    expect(metrics1.secondary_property_type).toBe('commercial');

    const m2 = createTestMessage(
      'Quero comprar um de 3 quartos, mas só consigo se vender o meu atual de 2 quartos antes.'
    );
    const metrics2 = extractPropertyMetricsPtBr(m2);
    expect(metrics2.bedrooms).toBe(2);
    expect(metrics2.demand_bedrooms_min).toBe(3);

    const m3 = createTestMessage(
      'Agora está alugado, só penso em vender depois de março do ano que vem.'
    );
    const metrics3 = extractPropertyMetricsPtBr(m3);
    expect(metrics3.occupancy_status).toBe('tenant_occupied');
  });

  it('extracts referred contact name and phone (CT-05)', () => {
    const m = createTestMessage(
      'Não sou eu, é do meu irmão Carlos, fala com ele no 11 98888-7777.'
    );
    const ref = extractReferredContactPtBr(m);
    expect(ref.referred_name).toBe('Carlos');
    expect(ref.referred_phone).toBe('11 98888-7777');
    expect(ref.evidence_refs.length).toBeGreaterThanOrEqual(1);
  });
});

describe('RE-01, D-04: Party Role Classification', () => {
  it('classifies owner role (CT-01, CT-02)', () => {
    const turn1 = createTestTurn(['Sou o dono sim, estou vendendo por 1,2 milhão.']);
    const res1 = classifyPartyRole(turn1);
    expect(res1.participant.role_label).toBe('owner');
    expect(res1.participant.confidence).toBeGreaterThanOrEqual(0.9);

    const turn2 = createTestTurn(['Sou proprietário sim']);
    const res2 = classifyPartyRole(turn2);
    expect(res2.participant.role_label).toBe('owner');
  });

  it('classifies spouse_or_partner role (CT-04, CT-20)', () => {
    const turn1 = createTestTurn([
      'Esse apartamento é meu e do meu marido, estamos pensando em vender.',
    ]);
    const res1 = classifyPartyRole(turn1);
    expect(res1.participant.role_label).toBe('spouse_or_partner');

    const turn2 = createTestTurn([
      'Meu marido disse que não vende, mas se chegar em 1,5 mi eu convenço ele.',
    ]);
    const res2 = classifyPartyRole(turn2);
    expect(res2.participant.role_label).toBe('spouse_or_partner');
  });

  it('classifies family_member with referral relationship (CT-05)', () => {
    const turn = createTestTurn([
      'Não sou eu, é do meu irmão Carlos, fala com ele no 11 98888-7777.',
    ]);
    const res = classifyPartyRole(turn);
    expect(res.participant.role_label).toBe('family_member');
    expect(res.relationship).toBeDefined();
    expect(res.relationship?.referred_name).toBe('Carlos');
    expect(res.relationship?.referred_phone).toBe('11 98888-7777');
  });

  it('classifies broker_or_intermediary (CT-14)', () => {
    const turn = createTestTurn([
      'Sou corretor e tenho a exclusividade desse imóvel, faço parceria fifty-fifty.',
    ]);
    const res = classifyPartyRole(turn);
    expect(res.participant.role_label).toBe('broker_or_intermediary');
  });

  it('classifies unrelated_third_party for wrong number / no relation (CT-06)', () => {
    const turn = createTestTurn([
      'Engano, não tenho imóvel nenhum nesse condomínio.',
    ]);
    const res = classifyPartyRole(turn);
    expect(res.participant.role_label).toBe('unrelated_third_party');
  });
});

describe('RE-02, D-09, D-10: Intent Classification', () => {
  it('classifies capture_for_sale and capture_for_rent (CT-01, CT-02)', () => {
    const turn1 = createTestTurn(['Sou o dono sim, estou vendendo por 1,2 milhão.']);
    const intents1 = classifyRealEstateIntents(turn1);
    expect(intents1.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);

    const turn2 = createTestTurn(['Quero alugar por 4.500, condomínio 900 e IPTU 250.']);
    const intents2 = classifyRealEstateIntents(turn2);
    expect(intents2.some((i) => i.intent_label === 'intent.capture_for_rent')).toBe(true);
  });

  it('classifies capture_for_sale_and_rent (CT-03)', () => {
    const turn = createTestTurn([
      'Pode trabalhar venda por 950 mil ou locação por 4.200.',
    ]);
    const intents = classifyRealEstateIntents(turn);
    expect(
      intents.some((i) => i.intent_label === 'intent.capture_for_sale_and_rent')
    ).toBe(true);
  });

  it('separates not_interested_general and explicit do_not_contact (CT-06, CT-07, D-09)', () => {
    const turn1 = createTestTurn([
      'Engano, não tenho imóvel nenhum nesse condomínio.',
    ]);
    const intents1 = classifyRealEstateIntents(turn1);
    expect(
      intents1.some((i) => i.intent_label === 'intent.not_interested_general')
    ).toBe(true);
    expect(
      intents1.some((i) => i.intent_label === 'intent.do_not_contact')
    ).toBe(false);

    const turn2 = createTestTurn([
      'Não tenho interesse e por favor pare de me mandar mensagem.',
    ]);
    const intents2 = classifyRealEstateIntents(turn2);
    const optOut = intents2.find((i) => i.intent_label === 'intent.do_not_contact');
    expect(optOut).toBeDefined();
    expect(optOut?.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('classifies capture_other_property and not_interested_property (CT-08, D-07)', () => {
    const turn = createTestTurn([
      'Esse da Rua X eu não vendo porque moro nele, mas tenho uma sala comercial no Centro para vender por 380 mil.',
    ]);
    const intents = classifyRealEstateIntents(turn);
    expect(
      intents.some(
        (i) =>
          i.intent_label === 'intent.not_interested_property' &&
          i.target_entity_key === 'property_primary'
      )
    ).toBe(true);
    expect(
      intents.some((i) => i.intent_label === 'intent.capture_other_property')
    ).toBe(true);
    expect(
      intents.some(
        (i) =>
          i.intent_label === 'intent.capture_for_sale' &&
          i.target_entity_key === 'property_secondary'
      )
    ).toBe(true);
  });

  it('classifies buy_demand and conditional interest (CT-09, CT-10, D-08)', () => {
    const turn1 = createTestTurn([
      'Não quero vender o meu, mas estou procurando uma casa maior no mesmo bairro até 2 milhões.',
    ]);
    const intents1 = classifyRealEstateIntents(turn1);
    expect(
      intents1.some((i) => i.intent_label === 'intent.not_interested_property')
    ).toBe(true);
    expect(intents1.some((i) => i.intent_label === 'intent.buy_demand')).toBe(true);

    const turn2 = createTestTurn([
      'Quero comprar um de 3 quartos, mas só consigo se vender o meu atual de 2 quartos antes.',
    ]);
    const intents2 = classifyRealEstateIntents(turn2);
    expect(intents2.some((i) => i.intent_label === 'intent.buy_demand')).toBe(true);
    expect(intents2.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);
    expect(intents2.some((i) => i.intent_label === 'intent.conditional_interest')).toBe(true);
  });

  it('interprets short affirmative answer as ambiguous_or_open when outbound is open (CT-15, D-10)', () => {
    const turn = createTestTurn(
      ['Sim'],
      'Você tem interesse em vender ou alugar seu imóvel no Edifício Solar?'
    );
    const intents = classifyRealEstateIntents(turn);
    const amb = intents.find((i) => i.intent_label === 'intent.ambiguous_or_open');
    expect(amb).toBeDefined();
    expect(amb?.confidence).toBe(0.65);
  });

  it('interprets CT-16 as conditional_interest and ambiguous_or_open', () => {
    const turn = createTestTurn(['Depende da proposta, quanto estão pagando?']);
    const intents = classifyRealEstateIntents(turn);
    expect(
      intents.some((i) => i.intent_label === 'intent.conditional_interest')
    ).toBe(true);
    expect(
      intents.some((i) => i.intent_label === 'intent.ambiguous_or_open')
    ).toBe(true);
  });
});

describe('RE-02 & D-08: Condition Detection', () => {
  it('detects sale_before_purchase condition (CT-10)', () => {
    const turn = createTestTurn([
      'Quero comprar um de 3 quartos, mas só consigo se vender o meu atual de 2 quartos antes.',
    ]);
    const conds = detectRealEstateConditions(turn);
    expect(conds.some((c) => c.condition_type === 'sale_before_purchase')).toBe(true);
  });

  it('detects family_approval condition (CT-20)', () => {
    const turn = createTestTurn([
      'Meu marido disse que não vende, mas se chegar em 1,5 mi eu convenço ele.',
    ]);
    const conds = detectRealEstateConditions(turn);
    expect(conds.some((c) => c.condition_type === 'family_approval')).toBe(true);
  });

  it('detects exclusivity_constraint and broker_commission_condition (CT-14)', () => {
    const turn = createTestTurn([
      'Sou corretor e tenho a exclusividade desse imóvel, faço parceria fifty-fifty.',
    ]);
    const conds = detectRealEstateConditions(turn);
    expect(conds.some((c) => c.condition_type === 'exclusivity_constraint')).toBe(true);
    expect(
      conds.some((c) => c.condition_type === 'broker_commission_condition')
    ).toBe(true);
  });

  it('detects tenant_vacating and date_or_timeframe (CT-11)', () => {
    const turn = createTestTurn([
      'Agora está alugado, só penso em vender depois de março do ano que vem.',
    ]);
    const conds = detectRealEstateConditions(turn);
    expect(conds.some((c) => c.condition_type === 'tenant_vacating')).toBe(true);
    expect(conds.some((c) => c.condition_type === 'date_or_timeframe')).toBe(true);
  });
});
