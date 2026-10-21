import {
  TurnWindow,
  EvidenceRef,
  ParticipantObservation,
  IntentObservation,
  ValueObservation,
  ConditionObservation,
  OpportunityAssessment,
  ActionRecommendation,
} from '../../core/types';
import {
  RealEstateDomainEntities,
  RealEstatePropertyCandidate,
  RealEstateDemandProfile,
  SeededPropertyCandidate,
} from '../types';
import { RealEstateLLMStructuredOutput } from './real-estate-llm-schema';

export interface RealEstateLlmCorePayload {
  participants: ParticipantObservation[];
  intents: IntentObservation[];
  values: ValueObservation[];
  conditions: ConditionObservation[];
  opportunities: OpportunityAssessment[];
  actions: ActionRecommendation[];
  domain_entities: RealEstateDomainEntities;
}

/**
 * Converts a structured LLM extraction into core observations with exact quote references
 * and merged domain property candidates.
 */
export function convertRealEstateLlmOutputToCorePayload(
  output: RealEstateLLMStructuredOutput,
  window: TurnWindow
): RealEstateLlmCorePayload {
  const tid = window.turn_id;
  const msgId = window.messages[0]?.message_id ?? 'msg-0';
  const convId = window.conversation_id;
  const ts = window.messages[0]?.timestamp ?? new Date().toISOString();

  let evCounter = 0;
  const makeEv = (quote: string, conf: number): EvidenceRef => ({
    evidence_id: `ev-llm-${tid}-${++evCounter}`,
    message_id: msgId,
    conversation_id: convId,
    exact_quote: quote,
    timestamp: ts,
    extractor_type: 'llm',
    parser_version: '1.0.0',
    confidence: conf,
  });

  const participants: ParticipantObservation[] = [
    {
      participant_id: `part-${tid}`,
      role_label: output.detected_role?.role ?? 'unknown',
      epistemic_status: 'declared',
      confidence: output.detected_role?.confidence ?? 0.8,
      evidence_refs: [
        makeEv(
          output.detected_role?.exact_quote ?? '',
          output.detected_role?.confidence ?? 0.8
        ),
      ],
    },
  ];

  const intents: IntentObservation[] = (output.intents ?? []).map((i) => ({
    intent_id: `intent-llm-${tid}-${++evCounter}`,
    intent_label: i.label,
    target_entity_key: 'property_primary',
    epistemic_status: 'declared',
    confidence: i.confidence,
    evidence_refs: [makeEv(i.exact_quote, i.confidence)],
  }));

  const conditions: ConditionObservation[] = (output.conditions ?? []).map((c) => ({
    condition_id: `cond-llm-${tid}-${++evCounter}`,
    condition_type: c.condition_type,
    description: c.description,
    epistemic_status: 'declared',
    confidence: 0.9,
    evidence_refs: [makeEv(c.exact_quote, 0.9)],
  }));

  const values: ValueObservation[] = [];
  const opportunities: OpportunityAssessment[] = [];
  const actions: ActionRecommendation[] = [];
  const property_candidates: RealEstatePropertyCandidate[] = [];
  const demand_profiles: RealEstateDemandProfile[] = [];

  const rawSeeds =
    (window.seeded_context?.seeded_property_candidates as SeededPropertyCandidate[]) || [];
  const primarySeed = rawSeeds[0];

  const properties = output.properties ?? [];
  if (properties.length > 0) {
    for (const prop of properties) {
      const isPrimary = prop.property_index === 0;
      const entityKey = isPrimary ? 'property_primary' : 'property_secondary';
      const originKind = isPrimary ? 'seeded_primary' : 'offered_alternative';
      const label =
        prop.address_hint ??
        (isPrimary ? primarySeed?.address_line ?? 'Imóvel Principal' : 'Imóvel Alternativo');

      if (prop.sale_asking_price !== undefined) {
        values.push({
          value_id: `val-sale-${tid}-${prop.property_index}`,
          field_key: 'sale_asking_price',
          amount: prop.sale_asking_price,
          currency: 'BRL',
          raw_expression: prop.exact_quote,
          target_entity_key: entityKey,
          epistemic_status: 'declared',
          confidence: 0.92,
          evidence_refs: [makeEv(prop.exact_quote, 0.92)],
        });
      }

      if (prop.rent_asking_price !== undefined) {
        values.push({
          value_id: `val-rent-${tid}-${prop.property_index}`,
          field_key: 'rent_asking_price',
          amount: prop.rent_asking_price,
          currency: 'BRL',
          raw_expression: prop.exact_quote,
          target_entity_key: entityKey,
          epistemic_status: 'declared',
          confidence: 0.92,
          evidence_refs: [makeEv(prop.exact_quote, 0.92)],
        });
      }

      if (prop.condo_fee !== undefined) {
        values.push({
          value_id: `val-condo-${tid}-${prop.property_index}`,
          field_key: 'condo_fee',
          amount: prop.condo_fee,
          currency: 'BRL',
          raw_expression: prop.exact_quote,
          target_entity_key: entityKey,
          epistemic_status: 'declared',
          confidence: 0.92,
          evidence_refs: [makeEv(prop.exact_quote, 0.92)],
        });
      }

      if (prop.iptu_amount !== undefined) {
        values.push({
          value_id: `val-iptu-${tid}-${prop.property_index}`,
          field_key: 'iptu_amount',
          amount: prop.iptu_amount,
          currency: 'BRL',
          raw_expression: prop.exact_quote,
          target_entity_key: entityKey,
          epistemic_status: 'declared',
          confidence: 0.92,
          evidence_refs: [makeEv(prop.exact_quote, 0.92)],
        });
      }

      const hasSale =
        prop.intent === 'intent.capture_for_sale' ||
        prop.sale_asking_price !== undefined ||
        intents.some((i) => i.intent_label === 'intent.capture_for_sale');
      const hasRent =
        prop.intent === 'intent.capture_for_rent' ||
        prop.rent_asking_price !== undefined ||
        intents.some((i) => i.intent_label === 'intent.capture_for_rent');

      if (hasSale) {
        const fam = conditions.find((c) => c.condition_type === 'family_approval');
        const conf = fam ? 0.62 : 0.9;
        const oppId = `opp-llm-${tid}-sale-${prop.property_index}`;
        opportunities.push({
          opportunity_id: oppId,
          opportunity_type: 'real_estate.capture_sale',
          entity_key: entityKey,
          stage: 'detected',
          epistemic_status: 'declared',
          confidence: conf,
          linked_condition_ids: fam ? [fam.condition_id] : [],
          attributes: {},
          evidence_refs: [makeEv(prop.exact_quote, conf)],
        });

        if (fam) {
          actions.push({
            action_id: `act-llm-${tid}-rev-${prop.property_index}`,
            action_type: 'human_review',
            target_entity_key: entityKey,
            target_opportunity_id: oppId,
            execution_mode: 'manual',
            requires_human_approval: true,
            epistemic_status: 'declared',
            confidence: 0.88,
            payload: {},
            evidence_refs: [makeEv(fam.description, 0.88)],
          });
        } else {
          actions.push({
            action_id: `act-llm-${tid}-qual-${prop.property_index}`,
            action_type: 'qualify_property',
            target_entity_key: entityKey,
            target_opportunity_id: oppId,
            execution_mode: 'assist',
            requires_human_approval: true,
            epistemic_status: 'declared',
            confidence: conf,
            payload: {},
            evidence_refs: [makeEv(prop.exact_quote, conf)],
          });
        }
      }

      if (hasRent && !hasSale) {
        const oppId = `opp-llm-${tid}-rent-${prop.property_index}`;
        opportunities.push({
          opportunity_id: oppId,
          opportunity_type: 'real_estate.capture_rent',
          entity_key: entityKey,
          stage: 'detected',
          epistemic_status: 'declared',
          confidence: 0.9,
          linked_condition_ids: [],
          attributes: {},
          evidence_refs: [makeEv(prop.exact_quote, 0.9)],
        });
        actions.push({
          action_id: `act-llm-${tid}-qual-rent-${prop.property_index}`,
          action_type: 'qualify_property',
          target_entity_key: entityKey,
          target_opportunity_id: oppId,
          execution_mode: 'assist',
          requires_human_approval: true,
          epistemic_status: 'declared',
          confidence: 0.9,
          payload: {},
          evidence_refs: [makeEv(prop.exact_quote, 0.9)],
        });
      }

      property_candidates.push({
        property_key: entityKey,
        origin_kind: originKind,
        label,
        property_type: 'apartment',
        occupancy_status: 'unknown',
        sale_asking_price: prop.sale_asking_price,
        rent_asking_price: prop.rent_asking_price,
        condo_fee: prop.condo_fee,
        iptu_amount: prop.iptu_amount,
        media_attachment_ids: [],
        epistemic_status: 'declared',
        confidence: 0.9,
        evidence_refs: [makeEv(prop.exact_quote, 0.9)],
      });
    }
  } else {
    property_candidates.push({
      property_key: 'property_primary',
      origin_kind: 'seeded_primary',
      label: primarySeed?.address_line ?? 'Imóvel Principal',
      property_type: 'apartment',
      occupancy_status: 'unknown',
      sale_asking_price: primarySeed?.expected_price,
      media_attachment_ids: [],
      epistemic_status: 'declared',
      confidence: 0.85,
      evidence_refs: [makeEv(output.detected_role?.exact_quote || 'mensagem', 0.85)],
    });
  }

  if (output.demand_profile) {
    const dp = output.demand_profile;
    const kind = dp.demand_type === 'invest' ? 'investment' : dp.demand_type;
    demand_profiles.push({
      demand_key: 'demand_primary',
      demand_kind: kind,
      property_types: ['apartment'],
      budget_max: dp.max_budget,
      linked_condition_ids: [],
      epistemic_status: 'declared',
      confidence: 0.88,
      evidence_refs: [makeEv(dp.exact_quote, 0.88)],
    });

    const oppId = `opp-llm-${tid}-demand`;
    opportunities.push({
      opportunity_id: oppId,
      opportunity_type: kind === 'buy' ? 'real_estate.demand_buy' : 'real_estate.demand_rent',
      entity_key: 'demand_primary',
      stage: 'detected',
      epistemic_status: 'declared',
      confidence: 0.88,
      linked_condition_ids: [],
      attributes: {},
      evidence_refs: [makeEv(dp.exact_quote, 0.88)],
    });

    actions.push({
      action_id: `act-llm-${tid}-demand`,
      action_type: 'open_buyer_search',
      target_entity_key: 'demand_primary',
      target_opportunity_id: oppId,
      execution_mode: 'assist',
      requires_human_approval: true,
      epistemic_status: 'declared',
      confidence: 0.88,
      payload: {},
      evidence_refs: [makeEv(dp.exact_quote, 0.88)],
    });
  }

  return {
    participants,
    intents,
    values,
    conditions,
    opportunities,
    actions,
    domain_entities: {
      property_candidates,
      demand_profiles,
      seeded_candidates: rawSeeds,
    },
  };
}
