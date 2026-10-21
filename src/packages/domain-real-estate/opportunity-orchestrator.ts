import {
  DomainPack,
  DomainInterpretationResult,
  TurnWindow,
  ConversationMessage,
  MediaUnderstandingResult,
  OpportunityAssessment,
  ActionRecommendation,
  ReviewItem,
  EvidenceRef,
  UniversalInterpretationEnvelope,
} from '../core/types';
import { normalizeMessageText, buildEvidenceRef } from '../core/evidence';
import { UniversalInterpretationEngine } from '../core/engine';
import {
  RealEstateDomainEntities,
  RealEstatePropertyCandidate,
  RealEstateDemandProfile,
  RealEstateOpportunityType,
  RealEstateActionType,
  SeededPropertyCandidate,
} from './types';
import {
  extractMonetaryValuesPtBr,
  extractPropertyMetricsPtBr,
} from './normalizer-ptbr';
import {
  classifyPartyRole,
  classifyRealEstateIntents,
  detectRealEstateConditions,
} from './role-intent-rules';
import {
  CoalesceTurnWindowParams,
  coalesceTurnWindow,
} from './turn-window-coalescer';

export { CoalesceTurnWindowParams, coalesceTurnWindow };

const PARSER_VERSION = '1.0.0';

function makeOpp(id: string, type: RealEstateOpportunityType, entityKey: string, stage: OpportunityAssessment['stage'], conf: number, evidence: EvidenceRef[]): OpportunityAssessment {
  return { opportunity_id: id, opportunity_type: type, entity_key: entityKey, stage, epistemic_status: 'declared', confidence: conf, linked_condition_ids: [], attributes: {}, evidence_refs: evidence };
}

function makeAct(id: string, type: RealEstateActionType, targetKey?: string, oppId?: string, mode: 'auto' | 'assist' | 'manual' = 'assist', reqApproval = true, conf = 0.9, evidence: EvidenceRef[] = [], payload: Record<string, unknown> = {}): ActionRecommendation {
  return { action_id: id, action_type: type, target_entity_key: targetKey, target_opportunity_id: oppId, execution_mode: mode, requires_human_approval: reqApproval, epistemic_status: 'declared', confidence: conf, payload, evidence_refs: evidence };
}

export class RealEstateDomainPack implements DomainPack<RealEstateDomainEntities> {
  readonly domain_key = 'real_estate';
  readonly parser_version = PARSER_VERSION;

  async interpretTurnWindow(
    turnWindow: TurnWindow
  ): Promise<DomainInterpretationResult<RealEstateDomainEntities>> {
    const tid = turnWindow.turn_id;
    const { participant, relationship } = classifyPartyRole(turnWindow);
    const participants = [participant];
    const relationships = relationship ? [relationship] : [];
    const intents = classifyRealEstateIntents(turnWindow);
    const conditions = detectRealEstateConditions(turnWindow);

    const values = turnWindow.messages.flatMap((m) => extractMonetaryValuesPtBr(m));
    const allMetrics = turnWindow.messages.map((m) => extractPropertyMetricsPtBr(m));

    const property_type = allMetrics.map((m) => m.property_type).find(Boolean);
    const occupancy_status = allMetrics.map((m) => m.occupancy_status).find(Boolean);
    const bedrooms = allMetrics.map((m) => m.bedrooms).find((b) => b !== undefined);
    const area_m2 = allMetrics.map((m) => m.area_m2).find((a) => a !== undefined);
    const sec_type = allMetrics.map((m) => m.secondary_property_type).find(Boolean);
    const sec_occ = allMetrics.map((m) => m.secondary_occupancy_status).find(Boolean);
    const demand_types = allMetrics.map((m) => m.demand_property_types).find(Boolean);
    const demand_bed = allMetrics.map((m) => m.demand_bedrooms_min).find((b) => b !== undefined);

    const media_results: MediaUnderstandingResult[] = [];
    const mediaIds: string[] = [];
    for (const msg of turnWindow.messages) {
      for (const att of msg.attachments) {
        mediaIds.push(att.attachment_id);
        const quote = att.caption || msg.normalized_text || 'anexo';
        media_results.push({
          attachment_id: att.attachment_id,
          mime_type: att.mime_type,
          media_kind: att.media_kind,
          caption: att.caption,
          linked_entity_key: 'property_primary',
          confidence: 0.95,
          evidence_refs: [buildEvidenceRef({
            message_id: msg.message_id,
            conversation_id: msg.conversation_id,
            exact_quote: quote,
            normalized_text: msg.normalized_text || quote,
            timestamp: msg.timestamp,
            extractor_type: 'rule',
            parser_version: PARSER_VERSION,
            confidence: 0.95,
          })],
        });
      }
    }

    const hasCaptureOther = intents.some((i) => i.intent_label === 'intent.capture_other_property');
    const property_candidates: RealEstatePropertyCandidate[] = [];
    const demand_profiles: RealEstateDemandProfile[] = [];
    const seeds = (turnWindow.seeded_context?.seeded_property_candidates as SeededPropertyCandidate[]) || [];
    const primarySeed = seeds[0];
    const defaultEv = participant.evidence_refs;
    const findVal = (k: string, t?: string) => values.find((v) => v.field_key === k && (!t || v.target_entity_key === t))?.amount;

    property_candidates.push({
      property_key: 'property_primary',
      origin_kind: 'seeded_primary',
      label: primarySeed?.address_line ?? 'Imóvel Principal',
      property_type: property_type ?? 'apartment',
      occupancy_status: occupancy_status ?? 'unknown',
      bedrooms,
      area_m2,
      sale_asking_price: findVal('sale_asking_price', 'property_primary') ?? (primarySeed?.listing_type !== 'rent' ? primarySeed?.expected_price : undefined),
      rent_asking_price: findVal('rent_asking_price', 'property_primary') ?? (primarySeed?.listing_type === 'rent' ? primarySeed?.expected_price : undefined),
      condo_fee: findVal('condo_fee'),
      iptu_amount: findVal('iptu_amount'),
      media_attachment_ids: mediaIds,
      epistemic_status: 'declared',
      confidence: 0.9,
      evidence_refs: defaultEv,
    });

    if (hasCaptureOther) {
      const otherInt = intents.find((i) => i.intent_label === 'intent.capture_other_property');
      property_candidates.push({
        property_key: 'property_secondary',
        origin_kind: 'offered_alternative',
        label: 'Imóvel Alternativo',
        property_type: sec_type ?? 'commercial',
        occupancy_status: sec_occ ?? 'unknown',
        sale_asking_price: findVal('sale_asking_price', 'property_secondary'),
        rent_asking_price: findVal('rent_asking_price', 'property_secondary'),
        media_attachment_ids: [],
        epistemic_status: 'declared',
        confidence: 0.9,
        evidence_refs: otherInt?.evidence_refs ?? defaultEv,
      });
    }

    if (intents.some((i) => i.intent_label === 'intent.buy_demand')) {
      const buyEv = intents.find((i) => i.intent_label === 'intent.buy_demand')?.evidence_refs ?? defaultEv;
      demand_profiles.push({
        demand_key: 'demand_primary',
        demand_kind: 'buy',
        property_types: demand_types ?? ['house'],
        bedrooms_min: demand_bed,
        budget_max: findVal('budget_max'),
        linked_condition_ids: conditions.filter((c) => c.condition_type === 'sale_before_purchase').map((c) => c.condition_id),
        epistemic_status: 'declared',
        confidence: 0.88,
        evidence_refs: buyEv,
      });
    }

    const opportunities: OpportunityAssessment[] = [];
    const actions: ActionRecommendation[] = [];
    const review_items: ReviewItem[] = [];

    const optOut = intents.find((i) => i.intent_label === 'intent.do_not_contact');
    if (optOut) {
      actions.push(makeAct(`act-${tid}-suppress`, 'suppress_commercial_followup', 'property_primary', undefined, 'auto', false, 0.98, optOut.evidence_refs));
      return {
        participants, intents, facts: [], values, relationships, conditions, opportunities: [],
        actions, media_results, evidence_refs: optOut.evidence_refs, review_items: [],
        do_not_contact: true, domain_entities: { property_candidates, demand_profiles, seeded_candidates: seeds },
      };
    }

    if (participant.role_label === 'unrelated_third_party' && intents.some((i) => i.intent_label === 'intent.not_interested_general')) {
      return {
        participants, intents, facts: [], values, relationships, conditions, opportunities: [],
        actions: [], media_results, evidence_refs: participant.evidence_refs, review_items: [],
        do_not_contact: false, domain_entities: { property_candidates, demand_profiles, seeded_candidates: seeds },
      };
    }

    const refer = intents.find((i) => i.intent_label === 'intent.refer_third_party');
    if (refer) {
      const opp = makeOpp(`opp-${tid}-disc`, 'real_estate.owner_discovery', 'property_primary', 'detected', 0.92, refer.evidence_refs);
      opportunities.push(opp);
      const payload: Record<string, unknown> = {};
      if (relationship?.referred_name) payload.referred_name = relationship.referred_name;
      if (relationship?.referred_phone) payload.referred_phone = relationship.referred_phone;
      actions.push(makeAct(`act-${tid}-req-owner`, 'request_owner_contact', 'property_primary', opp.opportunity_id, 'assist', true, 0.92, refer.evidence_refs, payload));
    }

    const saleRent = intents.find((i) => i.intent_label === 'intent.capture_for_sale_and_rent');
    if (saleRent) {
      const opp = makeOpp(`opp-${tid}-sr`, 'real_estate.capture_sale_and_rent', 'property_primary', 'detected', 0.92, saleRent.evidence_refs);
      opportunities.push(opp);
      actions.push(makeAct(`act-${tid}-qual`, 'qualify_property', 'property_primary', opp.opportunity_id, 'assist', true, 0.92, saleRent.evidence_refs));
    }

    const sale = intents.find((i) => i.intent_label === 'intent.capture_for_sale');
    let saleOpp: OpportunityAssessment | undefined;
    if (sale && !saleRent) {
      const targetKey = hasCaptureOther ? 'property_secondary' : 'property_primary';
      const fam = conditions.find((c) => c.condition_type === 'family_approval');
      const conf = fam ? 0.62 : 0.9;
      saleOpp = makeOpp(`opp-${tid}-sale`, 'real_estate.capture_sale', targetKey, 'detected', conf, sale.evidence_refs);
      opportunities.push(saleOpp);
      if (fam) {
        review_items.push({
          review_id: `rev-${saleOpp.opportunity_id}`,
          reason: 'Conflito de interesse conjugal ou aprovação familiar pendente',
          severity: 'high',
          target_id: saleOpp.opportunity_id,
          evidence_refs: fam.evidence_refs,
        });
        actions.push(makeAct(`act-${tid}-rev`, 'human_review', targetKey, saleOpp.opportunity_id, 'manual', true, 0.88, fam.evidence_refs));
      } else {
        actions.push(makeAct(`act-${tid}-qual`, 'qualify_property', targetKey, saleOpp.opportunity_id, 'assist', true, conf, sale.evidence_refs));
      }
    }

    const rent = intents.find((i) => i.intent_label === 'intent.capture_for_rent');
    if (rent && !saleRent) {
      const opp = makeOpp(`opp-${tid}-rent`, 'real_estate.capture_rent', 'property_primary', 'detected', 0.9, rent.evidence_refs);
      opportunities.push(opp);
      actions.push(makeAct(`act-${tid}-qual-rent`, 'qualify_property', 'property_primary', opp.opportunity_id, 'assist', true, 0.9, rent.evidence_refs));
    }

    if (intents.some((i) => i.intent_label === 'intent.buy_demand')) {
      const buyInt = intents.find((i) => i.intent_label === 'intent.buy_demand')!;
      const buyOpp = makeOpp(`opp-${tid}-buy`, 'real_estate.demand_buy', 'demand_primary', 'detected', 0.88, buyInt.evidence_refs);
      opportunities.push(buyOpp);
      actions.push(makeAct(`act-${tid}-buy`, 'open_buyer_search', 'demand_primary', buyOpp.opportunity_id, 'assist', true, 0.88, buyInt.evidence_refs));

      const sbb = conditions.find((c) => c.condition_type === 'sale_before_purchase');
      if (sbb && saleOpp) {
        sbb.source_opportunity_id = buyOpp.opportunity_id;
        sbb.prerequisite_opportunity_id = saleOpp.opportunity_id;
        buyOpp.linked_condition_ids = [sbb.condition_id];
        saleOpp.linked_condition_ids = [sbb.condition_id];
        buyOpp.stage = 'conditional';
        actions.push(makeAct(`act-${tid}-link`, 'link_conditional_opportunities', 'demand_primary', buyOpp.opportunity_id, 'assist', true, 0.9, sbb.evidence_refs, { prerequisite_opportunity_id: saleOpp.opportunity_id }));
      }
    }

    const future = intents.find((i) => i.intent_label === 'intent.future_interest');
    if (future) {
      const opp = makeOpp(`opp-${tid}-nurture`, 'real_estate.future_nurture', 'property_primary', 'nurture', 0.85, future.evidence_refs);
      opportunities.push(opp);
      actions.push(makeAct(`act-${tid}-followup`, 'register_future_followup', 'property_primary', opp.opportunity_id, 'assist', true, 0.85, future.evidence_refs));
    }

    const ambig = intents.find((i) => i.intent_label === 'intent.ambiguous_or_open');
    if (ambig && opportunities.length === 0) {
      actions.push(makeAct(`act-${tid}-qual-ambig`, 'qualify_property', 'property_primary', undefined, 'assist', true, 0.65, ambig.evidence_refs));
    }

    const allEv = [
      ...participants.flatMap((p) => p.evidence_refs),
      ...intents.flatMap((i) => i.evidence_refs),
      ...values.flatMap((v) => v.evidence_refs),
    ];

    return {
      participants, intents, facts: [], values, relationships, conditions,
      opportunities, actions, media_results, evidence_refs: allEv, review_items,
      do_not_contact: false, domain_entities: { property_candidates, demand_profiles, seeded_candidates: seeds },
    };
  }
}

export async function interpretRealEstateTurn(
  turnWindow: TurnWindow,
  engine?: UniversalInterpretationEngine<RealEstateDomainEntities>
): Promise<UniversalInterpretationEnvelope> {
  const pack = new RealEstateDomainPack();
  const activeEngine = engine ?? new UniversalInterpretationEngine(pack);
  return activeEngine.interpretTurn(turnWindow);
}
