import {
  TurnWindow,
  ParticipantObservation,
  RelationshipObservation,
  IntentObservation,
  ConditionObservation,
  ConversationMessage,
  EvidenceRef,
} from '../core/types';
import { buildEvidenceRef } from '../core/evidence';
import { extractReferredContactPtBr } from './normalizer-ptbr';
import { RealEstateIntentLabel, RealEstateConditionType } from './types';
import type { PartyRoleClassification } from './role-intent-rules';

/**
 * Stage 1 deterministic rules for short replies to the real estate capture outbound.
 * Normative outbound question: "Tenho um cliente buscando apartamento no {condominio}.
 * Voce tem interesse em vender ou alugar seu imovel?"
 * pt-BR regex literals are part of the domain contract; identifiers stay in English.
 */

const PARSER_VERSION = '1.1.0';

const CAPTURE_OUTBOUND_PATTERN = /vender|alugar|loca[çc][ãa]o|im[oó]vel|apartamento|casa|anunciar/i;

const IDENTITY_NEGATION_PATTERN = /n[ãa]o\s+me\s+chamo\b|meu\s+nome\s+n[ãa]o\s+[ée]\b|n[ãa]o\s+conhe[çc]o\s+nenhum\b|n[ãa]o\s+tem\s+nenhum\b|n[ãa]o\s+[ée]\s+comigo\b/i;

const NON_CAPTURE_GUARD_PATTERN = /meu\s+marido|minha\s+esposa|do\s+meu\s+irm[ãa]o|da\s+minha\s+irm[ãa]|do\s+meu\s+pai|da\s+minha\s+m[ãa]e|sou\s+corretor|sou\s+corretora|imobili[áa]ria|exclusividade|engano|n[úu]mero\s+errado|n[ãa]o\s+tenho\s+im[oó]vel\s+nenhum/i;

const SPOUSE_NAMED_PATTERN = /sou\s+(?:o\s+)?marido\s+d[oa]\s+\w+|sou\s+(?:a\s+)?esposa\s+d[oa]\s+\w+/i;

const FAMILY_RELATION_PATTERN = /(?<!n[ãa]o\s+)[ée]\s+(?:o\s+|a\s+)?(?:meu|minha)\s+(?:pai|m[ãa]e|padrasto|madrasta|tio|tia|primo|prima|irm[ãa]o|irm[ãa]|av[ôo]|av[óo]|sobrinho|sobrinha|cunhado|cunhada|genro|nora|filho|filha)\b/i;

const FAMILY_NAME_BEFORE_PATTERN = /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+)\s+[ée]\s+(?:o\s+|a\s+)?(?:meu|minha)\s+(?:pai|m[ãa]e|tio|tia|primo|prima|irm[ãa]o|irm[ãa]|av[ôo]|av[óo]|sobrinho|sobrinha|cunhado|cunhada|filho|filha)\b/;

const SOFT_REFUSAL_PATTERN = /n[ãa]o[,.]?\s+(?:n[ãa]o\s+)?obrigad[oa]\b|no\s+momento\s+n[ãa]o\b|n[ãa]o\s+agora\b|agora\s+n[ãa]o\b/i;

const SALE_REFUSED_PATTERN = /vender\s+n[ãa]o\b(?!\s+(?:sei|ter|ser|estar|é|e)\b)/i;
const RENT_ONLY_PATTERN = /(?:^|[,.!?\s])s[óo]\s+alugar\b|alugar[,.!]?\s+sim\b|somente\s+alugar\b/i;
const RENT_REFUSED_PATTERN = /alugar\s+n[ãa]o\b(?!\s+(?:sei|ter|ser|estar|é|e)\b)/i;
const SALE_ONLY_PATTERN = /(?:^|[,.!?\s])s[óo]\s+vender\b|somente\s+vender\b|(?:^|[,.!?\s])s[óo]\s+venda\b|somente\s+venda\b/i;

const SOLD_PATTERN = /j[áa]\s+vendi\b(?!\s+esse\b)|j[áa]\s+vendeu\b|foi\s+vendido\b/i;
const RENTED_PATTERN = /(?<!agora\s+)est[áa]\s+(?:alugado|locado)\b|tem\s+(?:um\s+)?inquilino\b|est[áa]\s+com\s+(?:um\s+)?inquilino\b/i;
const RENTED_COND_PATTERN = /(?<!agora\s+)est[áa]\s+(?:alugado|locado)\b/i;

const FUTURE_SALE_PATTERN = /colocar\s+[aàá]\s+venda\s+(?:(?:o|a)\s+)?(?:(?:im[oó]vel|apartamento|apto|casa)\s+)?(?:(?:no|para\s+o)\s+)?(?:pr[óo]ximo\s+)?(?:m[êe]s|ano)\s+que\s+vem|colocar\s+[aàá]\s+venda\s+depois\s+de\s+\S+|pretendo\s+colocar\s+[aàá]\s+venda/i;
const EXPLICIT_SALE_INTEREST_PATTERN = /tenho\s+interesse\s+em\s+vender\b/i;
const EXPLICIT_RENT_INTEREST_PATTERN = /tenho\s+interesse\s+em\s+alugar\b/i;

const CAPTURE_DATE_PATTERN = /m[êe]s\s+que\s+vem|depois\s+de\s+(?:janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b(?!\s+do\s+ano\s+que\s+vem)/i;

function findCaptureMatch(
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

function pushCaptureIntent(
  arr: IntentObservation[],
  turnId: string,
  suffix: string,
  label: RealEstateIntentLabel,
  target: string,
  msg: ConversationMessage,
  quote: string,
  conf: number,
  status: 'declared' | 'inferred'
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

function pushCaptureCond(
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

function hasCaptureContext(turnWindow: TurnWindow): boolean {
  const outbound = turnWindow.prior_outbound_message?.normalized_text;
  if (outbound && CAPTURE_OUTBOUND_PATTERN.test(outbound)) return true;
  const seeds = (turnWindow.seeded_context?.seeded_property_candidates as unknown[]) || [];
  return seeds.length > 0;
}

function ownerInferred(
  tid: string,
  msg: ConversationMessage,
  quote: string,
  conf: number
): PartyRoleClassification {
  return {
    participant: {
      participant_id: `part-${tid}`,
      role_label: 'owner',
      epistemic_status: 'inferred',
      confidence: conf,
      evidence_refs: [makeEv(msg, quote, conf)],
    },
  };
}

/**
 * Classifies the party role for capture-response vocabulary. Returns null when no
 * capture-response pattern matches, letting the legacy rules in role-intent-rules run.
 * Priority: named spouse, named family, identity negation, then owner inferences.
 */
export function classifyCapturePartyRole(turnWindow: TurnWindow): PartyRoleClassification | null {
  const tid = turnWindow.turn_id;

  // 1. Spouse identified through a named partner ("Sou a esposa do Ricardo")
  const spouse = findCaptureMatch(turnWindow, SPOUSE_NAMED_PATTERN);
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

  // 2. Family relation naming the owner ("Ricardo é meu pai", "É meu tio")
  const family = findCaptureMatch(turnWindow, FAMILY_RELATION_PATTERN);
  if (family) {
    const ref = extractReferredContactPtBr(family.message);
    const ev = makeEv(family.message, family.match[0], 0.9);
    let referredName = ref.referred_name;
    const relEvidence = [...ref.evidence_refs];
    if (!referredName) {
      const inverted = FAMILY_NAME_BEFORE_PATTERN.exec(family.message.normalized_text);
      if (inverted) {
        referredName = inverted[1];
        relEvidence.push(makeEv(family.message, referredName, 0.95));
      }
    }
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
        referred_name: referredName,
        referred_phone: ref.referred_phone,
        epistemic_status: 'declared',
        confidence: 0.9,
        evidence_refs: relEvidence.length > 0 ? relEvidence : [ev],
      },
    };
  }

  // 3. Identity negation => unrelated third party ("Não me chamo Ricardo")
  const unrelated = findCaptureMatch(turnWindow, IDENTITY_NEGATION_PATTERN);
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

  // 4. Owner inferred from short capture replies (only with capture outbound context)
  if (hasCaptureContext(turnWindow) && !NON_CAPTURE_GUARD_PATTERN.test(turnWindow.consolidated_text)) {
    const soft = findCaptureMatch(turnWindow, SOFT_REFUSAL_PATTERN);
    if (soft) return ownerInferred(tid, soft.message, soft.match[0], 0.7);

    const modality =
      findCaptureMatch(turnWindow, SALE_REFUSED_PATTERN) ??
      findCaptureMatch(turnWindow, RENT_ONLY_PATTERN) ??
      findCaptureMatch(turnWindow, RENT_REFUSED_PATTERN) ??
      findCaptureMatch(turnWindow, SALE_ONLY_PATTERN) ??
      findCaptureMatch(turnWindow, SOLD_PATTERN) ??
      findCaptureMatch(turnWindow, RENTED_PATTERN) ??
      findCaptureMatch(turnWindow, FUTURE_SALE_PATTERN);
    if (modality) return ownerInferred(tid, modality.message, modality.match[0], 0.8);

    const explicit =
      findCaptureMatch(turnWindow, EXPLICIT_SALE_INTEREST_PATTERN) ??
      findCaptureMatch(turnWindow, EXPLICIT_RENT_INTEREST_PATTERN);
    if (explicit) {
      return {
        participant: {
          participant_id: `part-${tid}`,
          role_label: 'owner',
          epistemic_status: 'declared',
          confidence: 0.9,
          evidence_refs: [makeEv(explicit.message, explicit.match[0], 0.9)],
        },
      };
    }
  }

  return null;
}

/**
 * Classifies intents for capture-response vocabulary. Identity negation short-circuits
 * to general disinterest; the remaining patterns require capture outbound context.
 */
export function classifyCaptureIntents(turnWindow: TurnWindow): IntentObservation[] {
  const intents: IntentObservation[] = [];
  const tid = turnWindow.turn_id;

  // 1. Identity negation => general disinterest
  const idNeg = findCaptureMatch(turnWindow, IDENTITY_NEGATION_PATTERN);
  if (idNeg) {
    pushCaptureIntent(intents, tid, 'cap-id-neg', 'intent.not_interested_general', 'property_primary', idNeg.message, idNeg.match[0], 0.9, 'declared');
    return intents;
  }

  if (!hasCaptureContext(turnWindow)) return intents;

  // 2. Polite refusal of the capture approach
  const soft = findCaptureMatch(turnWindow, SOFT_REFUSAL_PATTERN);
  if (soft) {
    pushCaptureIntent(intents, tid, 'cap-soft-refusal', 'intent.not_interested_property', 'property_primary', soft.message, soft.match[0], 0.7, 'inferred');
  }

  // 3. Sale refused with rent interest kept
  const saleRefused = findCaptureMatch(turnWindow, SALE_REFUSED_PATTERN);
  if (saleRefused) {
    pushCaptureIntent(intents, tid, 'cap-sale-refused', 'intent.not_interested_property', 'property_primary', saleRefused.message, saleRefused.match[0], 0.8, 'declared');
  }
  const rentOnly = findCaptureMatch(turnWindow, RENT_ONLY_PATTERN);
  if (rentOnly) {
    pushCaptureIntent(intents, tid, 'cap-rent-only', 'intent.capture_for_rent', 'property_primary', rentOnly.message, rentOnly.match[0], 0.8, 'declared');
  }

  // 4. Rent refused with sale interest kept
  const saleOnly = findCaptureMatch(turnWindow, SALE_ONLY_PATTERN);
  if (saleOnly) {
    pushCaptureIntent(intents, tid, 'cap-sale-only', 'intent.capture_for_sale', 'property_primary', saleOnly.message, saleOnly.match[0], 0.8, 'declared');
  }

  // 5. Property already sold
  const sold = findCaptureMatch(turnWindow, SOLD_PATTERN);
  if (sold) {
    pushCaptureIntent(intents, tid, 'cap-sold', 'intent.not_interested_property', 'property_primary', sold.message, sold.match[0], 0.8, 'declared');
  }

  // 6. Future interest with a timeframe
  const future = findCaptureMatch(turnWindow, FUTURE_SALE_PATTERN);
  if (future) {
    pushCaptureIntent(intents, tid, 'cap-future', 'intent.future_interest', 'property_primary', future.message, future.match[0], 0.8, 'declared');
  }

  // 7. Explicit interest declared by the owner
  const explicitSale = findCaptureMatch(turnWindow, EXPLICIT_SALE_INTEREST_PATTERN);
  if (explicitSale) {
    pushCaptureIntent(intents, tid, 'cap-explicit-sale', 'intent.capture_for_sale', 'property_primary', explicitSale.message, explicitSale.match[0], 0.9, 'declared');
  }
  const explicitRent = findCaptureMatch(turnWindow, EXPLICIT_RENT_INTEREST_PATTERN);
  if (explicitRent) {
    pushCaptureIntent(intents, tid, 'cap-explicit-rent', 'intent.capture_for_rent', 'property_primary', explicitRent.message, explicitRent.match[0], 0.9, 'declared');
  }

  return intents;
}

/**
 * Detects conditions for capture-response vocabulary. Complements the legacy rules:
 * "agora está alugado" and "ano que vem" stay in the legacy detector; this module
 * covers the remaining sold/rented/timeframe phrasings.
 */
export function detectCaptureConditions(turnWindow: TurnWindow): ConditionObservation[] {
  const conditions: ConditionObservation[] = [];
  const tid = turnWindow.turn_id;
  if (!hasCaptureContext(turnWindow)) return conditions;

  const sold = findCaptureMatch(turnWindow, SOLD_PATTERN);
  if (sold) pushCaptureCond(conditions, tid, 'cap-sold', 'property_sold', 'Imóvel já vendido pelo proprietário', sold.message, sold.match[0], 0.9);

  const rented = findCaptureMatch(turnWindow, RENTED_COND_PATTERN);
  if (rented) pushCaptureCond(conditions, tid, 'cap-rented', 'tenant_vacating', 'Imóvel locado, aguarda desocupação', rented.message, rented.match[0], 0.9);

  const date = findCaptureMatch(turnWindow, CAPTURE_DATE_PATTERN);
  if (date) pushCaptureCond(conditions, tid, 'cap-date', 'date_or_timeframe', 'Janela temporal futura', date.message, date.match[0], 0.9);

  return conditions;
}
