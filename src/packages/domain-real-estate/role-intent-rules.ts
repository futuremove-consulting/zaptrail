import {
  TurnWindow,
  ParticipantObservation,
  RelationshipObservation,
  IntentObservation,
  ConditionObservation,
  ConversationMessage,
  EvidenceRef,
  EpistemicStatus,
} from '../core/types';
import { buildEvidenceRef } from '../core/evidence';
import { extractReferredContactPtBr } from './normalizer-ptbr';
import { RealEstateIntentLabel, RealEstateConditionType } from './types';

const PARSER_VERSION = '1.0.0';

export interface PartyRoleClassification {
  participant: ParticipantObservation;
  relationship?: RelationshipObservation;
}

function findMatch(
  turnWindow: TurnWindow,
  regex: RegExp
): { message: ConversationMessage; match: RegExpExecArray } | null {
  for (const msg of turnWindow.messages) {
    const m = regex.exec(msg.normalized_text);
    if (m) return { message: msg, match: m };
  }
  return null;
}

function makeEv(msg: ConversationMessage, quote: string, conf: number): EvidenceRef {
  return buildEvidenceRef({
    message_id: msg.message_id,
    conversation_id: msg.conversation_id,
    exact_quote: quote,
    normalized_text: msg.normalized_text,
    timestamp: msg.timestamp,
    extractor_type: 'rule',
    parser_version: PARSER_VERSION,
    confidence: conf,
  });
}

function pushIntent(
  arr: IntentObservation[],
  turnId: string,
  suffix: string,
  label: RealEstateIntentLabel,
  target: string,
  msg: ConversationMessage,
  quote: string,
  conf: number,
  status: EpistemicStatus = 'declared'
) {
  arr.push({
    intent_id: `int-${turnId}-${suffix}`,
    intent_label: label,
    target_entity_key: target,
    epistemic_status: status,
    confidence: conf,
    evidence_refs: [makeEv(msg, quote, conf)],
  });
}

function pushCond(
  arr: ConditionObservation[],
  turnId: string,
  suffix: string,
  type: RealEstateConditionType,
  desc: string,
  msg: ConversationMessage,
  quote: string,
  conf: number
) {
  arr.push({
    condition_id: `cond-${turnId}-${suffix}`,
    condition_type: type,
    description: desc,
    epistemic_status: 'declared',
    confidence: conf,
    evidence_refs: [makeEv(msg, quote, conf)],
  });
}

/**
 * Deterministically classifies the party role of the conversation interlocutor.
 */
export function classifyPartyRole(turnWindow: TurnWindow): PartyRoleClassification {
  const tid = turnWindow.turn_id;

  // 1. Spousal role (CT-04, CT-20)
  const spouse = findMatch(turnWindow, /(?:meu\s+e\s+do\s+meu\s+marido|minha\s+e\s+da\s+minha\s+esposa|meu\s+marido\s+disse|minha\s+esposa\s+disse|meu\s+marido|minha\s+esposa)/i);
  if (spouse) {
    return {
      participant: {
        participant_id: `part-${tid}`,
        role_label: 'spouse_or_partner',
        epistemic_status: 'declared',
        confidence: 0.9,
        evidence_refs: [makeEv(spouse.message, spouse.match[0], 0.9)],
      },
    };
  }

  // 2. Family referral (CT-05)
  const family = findMatch(turnWindow, /(?:do\s+meu\s+irm[ãa]o|da\s+minha\s+irm[ãa]|do\s+meu\s+pai|da\s+minha\s+m[ãa]e)/i);
  if (family) {
    const ref = extractReferredContactPtBr(family.message);
    const ev = makeEv(family.message, family.match[0], 0.9);
    return {
      participant: {
        participant_id: `part-${tid}`,
        role_label: 'family_member',
        epistemic_status: 'declared',
        confidence: 0.9,
        evidence_refs: [ev],
      },
      relationship: {
        relationship_id: `rel-${tid}`,
        source_participant_id: `part-${tid}`,
        target_entity_key: 'property_primary',
        relation_type: 'family_member',
        referred_name: ref.referred_name,
        referred_phone: ref.referred_phone,
        epistemic_status: 'declared',
        confidence: 0.9,
        evidence_refs: ref.evidence_refs.length > 0 ? ref.evidence_refs : [ev],
      },
    };
  }

  // 3. Broker (CT-14)
  const broker = findMatch(turnWindow, /(?:sou\s+corretor|sou\s+corretora|sou\s+da\s+imobili[áa]ria|tenho\s+a\s+exclusividade)/i);
  if (broker) {
    return {
      participant: {
        participant_id: `part-${tid}`,
        role_label: 'broker_or_intermediary',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [makeEv(broker.message, broker.match[0], 0.95)],
      },
    };
  }

  // 4. Unrelated third party (CT-06)
  const unrelated = findMatch(turnWindow, /(?:engano|n[ãa]o\s+tenho\s+im[oó]vel\s+nenhum|n[úu]mero\s+errado)/i);
  if (unrelated) {
    return {
      participant: {
        participant_id: `part-${tid}`,
        role_label: 'unrelated_third_party',
        epistemic_status: 'declared',
        confidence: 0.9,
        evidence_refs: [makeEv(unrelated.message, unrelated.match[0], 0.9)],
      },
    };
  }

  // 5. Owner (CT-01, CT-02, CT-17)
  const owner = findMatch(turnWindow, /(?:sou\s+(?:o\s+)?dono|sou\s+(?:a\s+)?dona|sou\s+propriet[áa]ri[oa]|o\s+im[oó]vel\s+[ée]\s+meu)/i);
  if (owner) {
    return {
      participant: {
        participant_id: `part-${tid}`,
        role_label: 'owner',
        epistemic_status: 'declared',
        confidence: 0.95,
        evidence_refs: [makeEv(owner.message, owner.match[0], 0.95)],
      },
    };
  }

  const first = turnWindow.messages[0];
  const q = first.normalized_text.slice(0, Math.min(20, first.normalized_text.length)) || 'conversa';
  return {
    participant: {
      participant_id: `part-${tid}`,
      role_label: 'unknown',
      epistemic_status: 'inferred',
      confidence: 0.4,
      evidence_refs: [makeEv(first, q, 0.4)],
    },
  };
}

/**
 * Deterministically classifies real estate intents honoring D-07, D-08, D-09, and D-10.
 */
export function classifyRealEstateIntents(turnWindow: TurnWindow): IntentObservation[] {
  const intents: IntentObservation[] = [];
  const tid = turnWindow.turn_id;
  const text = turnWindow.consolidated_text;

  // 1. Explicit opt-out (D-09, CT-07)
  const optOut = findMatch(turnWindow, /(?:pare\s+de\s+me\s+mandar\s+mensagem|n[ãa]o\s+me\s+mande\s+mais|remover\s+meu\s+n[úu]mero|bloqueia|tire\s+da\s+lista|descadastrar)/i);
  if (optOut) {
    pushIntent(intents, tid, 'optout', 'intent.do_not_contact', 'property_primary', optOut.message, optOut.match[0], 0.98);
    return intents;
  }

  // 2. Not interested general (D-09, CT-06)
  const notGen = findMatch(turnWindow, /(?:engano|n[ãa]o\s+tenho\s+im[oó]vel\s+nenhum|n[úu]mero\s+errado)/i);
  if (notGen) {
    pushIntent(intents, tid, 'notgen', 'intent.not_interested_general', 'property_primary', notGen.message, notGen.match[0], 0.9);
    return intents;
  }

  // 3. Refer third party (CT-05)
  const refer = findMatch(turnWindow, /(?:fala\s+com\s+ele|fala\s+com\s+ela|contato\s+dele|ligue\s+para)/i);
  if (refer) pushIntent(intents, tid, 'refer', 'intent.refer_third_party', 'property_primary', refer.message, refer.match[0], 0.92);

  // 4. Capture other property (D-07, CT-08)
  const otherProp = findMatch(turnWindow, /(?:esse\s+(?:da\s+.*?\s+)?eu\s+n[ãa]o\s+vendo|esse\s+eu\s+n[ãa]o\s+vendo|n[ãa]o\s+vendo\s+esse).*?(?:mas\s+tenho|tenho\s+(?:uma\s+sala|outro|um\s+outro))/i);
  if (otherProp) {
    pushIntent(intents, tid, 'notprop-prim', 'intent.not_interested_property', 'property_primary', otherProp.message, otherProp.match[0], 0.9);
    pushIntent(intents, tid, 'cap-other', 'intent.capture_other_property', 'property_secondary', otherProp.message, otherProp.match[0], 0.88);
    const postMatch = otherProp.message.normalized_text.slice(otherProp.match.index + otherProp.match[0].length);
    const vMatch = /(?:para\s+)?vender|venda/i.exec(postMatch);
    if (vMatch) {
      pushIntent(intents, tid, 'sale-sec', 'intent.capture_for_sale', 'property_secondary', otherProp.message, vMatch[0], 0.9);
    }
    const rMatch = /(?:para\s+)?alugar|loca[çc][ãa]o/i.exec(postMatch);
    if (rMatch) {
      pushIntent(intents, tid, 'rent-sec', 'intent.capture_for_rent', 'property_secondary', otherProp.message, rMatch[0], 0.9);
    }
  }

  // 5. Not interested in property (CT-09)
  const notSellBuy = findMatch(turnWindow, /(?:n[ãa]o\s+quero\s+vender\s+o\s+meu).*?(?:procurando\s+(?:uma\s+casa|um\s+apto)|quero\s+comprar)/i);
  if (notSellBuy) pushIntent(intents, tid, 'notprop', 'intent.not_interested_property', 'property_primary', notSellBuy.message, notSellBuy.match[0], 0.92);

  // 6. Buy demand (CT-09, CT-10)
  const buy = findMatch(turnWindow, /(?:quero\s+comprar|procurando\s+(?:uma\s+casa|um\s+apartamento|comprar)|busco\s+comprar)/i);
  if (buy) pushIntent(intents, tid, 'buy', 'intent.buy_demand', 'demand_primary', buy.message, buy.match[0], 0.88);

  // 7. Simultaneous sale and rent (CT-03)
  const saleAndRent = findMatch(turnWindow, /(?:venda\s+.*?\s+ou\s+loca[çc][ãa]o|vender\s+ou\s+alugar|loca[çc][ãa]o\s+ou\s+venda)/i);
  if (saleAndRent) {
    pushIntent(intents, tid, 'sale-rent', 'intent.capture_for_sale_and_rent', 'property_primary', saleAndRent.message, saleAndRent.match[0], 0.92);
  } else {
    // 8. Capture for sale (CT-01, CT-04, CT-10, CT-13, CT-17)
    if (!otherProp) {
      const sale = findMatch(turnWindow, /(?:estou\s+vendendo|quero\s+vender|pensando\s+em\s+vender|vender\s+o\s+meu|subi\s+o\s+valor|se\s+chegar\s+em\s+.*?eu\s+conven[çc]o|(?<!n[ãa]o\s+)vendo\s+(?:por\s+)?)/i);
      if (sale) pushIntent(intents, tid, 'sale', 'intent.capture_for_sale', 'property_primary', sale.message, sale.match[0], 0.9);
    } else if (/vender\s+o\s+meu/i.test(text)) {
      const sale = findMatch(turnWindow, /vender\s+o\s+meu/i);
      if (sale) pushIntent(intents, tid, 'sale-cond', 'intent.capture_for_sale', 'property_primary', sale.message, sale.match[0], 0.9);
    }

    // 9. Capture for rent (CT-02)
    const rent = findMatch(turnWindow, /(?:quero\s+alugar|estou\s+alugando|para\s+loca[çc][ãa]o)/i);
    if (rent) pushIntent(intents, tid, 'rent', 'intent.capture_for_rent', 'property_primary', rent.message, rent.match[0], 0.9);
  }

  // 10. Future interest (CT-11)
  const future = findMatch(turnWindow, /(?:s[óo]\s+penso\s+em\s+vender\s+depois|depois\s+de\s+mar[çc]o)/i);
  if (future) pushIntent(intents, tid, 'future', 'intent.future_interest', 'property_primary', future.message, future.match[0], 0.85);

  // 11. Price update (CT-13, D-06)
  const update = findMatch(turnWindow, /(?:subi\s+o\s+valor|mudei\s+o\s+pre[çc]o|agora\s+n[ãa]o\s+fecho\s+por\s+menos)/i);
  if (update) pushIntent(intents, tid, 'update', 'intent.price_or_condition_update', 'property_primary', update.message, update.match[0], 0.9);

  // 12. Conditional interest (CT-10, CT-16)
  const cond = findMatch(turnWindow, /(?:s[óo]\s+consigo\s+se|depende\s+da\s+proposta|quanto\s+est[ãa]o\s+pagando)/i);
  if (cond) pushIntent(intents, tid, 'cond', 'intent.conditional_interest', 'property_primary', cond.message, cond.match[0], 0.8);

  // 13. Ambiguous / open answer (CT-15, CT-16, D-10)
  const isShortAff = /^(?:sim|tenho\s+sim|pode\s+ser|com\s+certeza)[.!]?$/i.test(turnWindow.consolidated_text.trim());
  const outboundIsDual = turnWindow.prior_outbound_message && /vender\s+ou\s+alugar/i.test(turnWindow.prior_outbound_message.normalized_text);
  if (isShortAff && outboundIsDual) {
    const first = turnWindow.messages[0];
    pushIntent(intents, tid, 'ambig', 'intent.ambiguous_or_open', 'property_primary', first, first.normalized_text, 0.65, 'inferred');
  } else if (/depende\s+da\s+proposta|quanto\s+est[ãa]o\s+pagando/i.test(text)) {
    const amb = findMatch(turnWindow, /depende\s+da\s+proposta|quanto\s+est[ãa]o\s+pagando/i);
    if (amb) pushIntent(intents, tid, 'ambig-probe', 'intent.ambiguous_or_open', 'property_primary', amb.message, amb.match[0], 0.65, 'inferred');
  }

  return intents;
}

/**
 * Deterministically detects real estate conditions.
 */
export function detectRealEstateConditions(turnWindow: TurnWindow): ConditionObservation[] {
  const conditions: ConditionObservation[] = [];
  const tid = turnWindow.turn_id;

  const sbb = findMatch(turnWindow, /(?:s[óo]\s+consigo\s+se\s+vender\s+o\s+meu|preciso\s+vender\s+antes|vender\s+o\s+meu\s+atual.*?antes)/i);
  if (sbb) pushCond(conditions, tid, 'sbb', 'sale_before_purchase', 'Compra condicionada à venda do imóvel atual', sbb.message, sbb.match[0], 0.9);

  const fam = findMatch(turnWindow, /(?:meu\s+marido\s+disse\s+que\s+n[ãa]o\s+vende,\s*mas|minha\s+esposa\s+disse|eu\s+conven[çc]o\s+ele)/i);
  if (fam) pushCond(conditions, tid, 'fam', 'family_approval', 'Decisão sujeita à aprovação do cônjuge', fam.message, fam.match[0], 0.88);

  const excl = findMatch(turnWindow, /(?:tenho\s+a\s+exclusividade|com\s+exclusividade)/i);
  if (excl) pushCond(conditions, tid, 'excl', 'exclusivity_constraint', 'Corretor possui exclusividade', excl.message, excl.match[0], 0.95);

  const comm = findMatch(turnWindow, /(?:parceria\s+fifty-fifty|50\/50|cinquenta\s+cinquenta)/i);
  if (comm) pushCond(conditions, tid, 'comm', 'broker_commission_condition', 'Divisão 50/50 de comissão', comm.message, comm.match[0], 0.95);

  const ten = findMatch(turnWindow, /(?:agora\s+est[áa]\s+alugado|inquilino)/i);
  if (ten) pushCond(conditions, tid, 'tenant', 'tenant_vacating', 'Imóvel locado, aguarda desocupação', ten.message, ten.match[0], 0.9);

  const date = findMatch(turnWindow, /(?:depois\s+de\s+mar[çc]o\s+do\s+ano\s+que\s+vem|ano\s+que\s+vem)/i);
  if (date) pushCond(conditions, tid, 'date', 'date_or_timeframe', 'Janela temporal futura', date.message, date.match[0], 0.9);

  return conditions;
}
