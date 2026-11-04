import {
  ConversationMessage,
  ValueObservation,
  EvidenceRef,
} from '../core/types';
import { buildEvidenceRef } from '../core/evidence';
import { RealEstatePropertyType, RealEstateOccupancyStatus } from './types';

const PARSER_VERSION = '1.0.0';

export interface PropertyMetricsResult {
  property_type?: RealEstatePropertyType;
  property_subtype?: string;
  occupancy_status?: RealEstateOccupancyStatus;
  bedrooms?: number;
  area_m2?: number;
  neighborhood?: string;
  timing?: 'immediate' | 'short_term' | 'medium_term' | 'flexible';
  secondary_property_type?: RealEstatePropertyType;
  secondary_occupancy_status?: RealEstateOccupancyStatus;
  secondary_bedrooms?: number;
  secondary_area_m2?: number;
  demand_property_types?: RealEstatePropertyType[];
  demand_bedrooms_min?: number;
  evidence_refs: EvidenceRef[];
}

export interface ReferredContactResult {
  referred_name?: string;
  referred_phone?: string;
  relationship_type?: string;
  evidence_refs: EvidenceRef[];
}

interface SpanMatch {
  start: number;
  end: number;
}

function hasOverlap(spans: SpanMatch[], start: number, end: number): boolean {
  return spans.some((s) => Math.max(s.start, start) < Math.min(s.end, end));
}

function makeVal(
  msg: ConversationMessage,
  seq: number,
  field_key: string,
  amount: number,
  rawQuote: string,
  target_entity_key: string,
  unit?: string
): ValueObservation {
  return {
    value_id: `val-${msg.message_id}-${seq}`,
    field_key,
    amount,
    currency: 'BRL',
    unit,
    raw_expression: rawQuote,
    target_entity_key,
    epistemic_status: 'declared',
    confidence: 0.95,
    evidence_refs: [
      buildEvidenceRef({
        message_id: msg.message_id,
        conversation_id: msg.conversation_id,
        exact_quote: rawQuote,
        normalized_text: msg.normalized_text,
        timestamp: msg.timestamp,
        extractor_type: 'rule',
        parser_version: PARSER_VERSION,
        confidence: 0.95,
      }),
    ],
  };
}

/**
 * Extracts normalized monetary values from colloquial pt-BR message text.
 */
export function extractMonetaryValuesPtBr(
  message: ConversationMessage,
  defaultTargetKey = 'property_primary'
): ValueObservation[] {
  const text = message.normalized_text;
  if (!text) return [];

  const results: ValueObservation[] = [];
  const claimedSpans: SpanMatch[] = [];

  const splitMatch = /(?:mas\s+tenho|tenho\s+(?:uma\s+sala|outro|um\s+outro)|outro\s+im[oó]vel)/i.exec(text);
  const secondarySplitIndex = splitMatch ? splitMatch.index : -1;
  const isSec = (start: number) => secondarySplitIndex !== -1 && start >= secondarySplitIndex;

  // 1. Condo fees: "condomínio 900", "cond 900"
  const condoRegex = /(?:condom[ií]nio|cond)\s*(?:de\s*)?(?:R\$\s*)?(\d[\d.,]*)/gi;
  let match: RegExpExecArray | null;
  while ((match = condoRegex.exec(text)) !== null) {
    const rawQuote = match[0];
    const start = match.index;
    const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    if (isNaN(amount)) continue;
    claimedSpans.push({ start, end: start + rawQuote.length });
    const target = isSec(start) ? 'property_secondary' : defaultTargetKey;
    results.push(makeVal(message, results.length + 1, 'condo_fee', amount, rawQuote, target, 'BRL/month'));
  }

  // 2. IPTU: "IPTU 250"
  const iptuRegex = /\bIPTU\s*(?:de\s*)?(?:R\$\s*)?(\d[\d.,]*)/gi;
  while ((match = iptuRegex.exec(text)) !== null) {
    const rawQuote = match[0];
    const start = match.index;
    const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    if (isNaN(amount)) continue;
    claimedSpans.push({ start, end: start + rawQuote.length });
    const target = isSec(start) ? 'property_secondary' : defaultTargetKey;
    results.push(makeVal(message, results.length + 1, 'iptu_amount', amount, rawQuote, target, 'BRL/year'));
  }

  // 3. Millions: "1,2 milhão", "1,35 milhão", "1,2 mi", "2 milhões", "1,5 mi"
  const millionRegex = /(\d+(?:[.,]\d+)?)\s*(?:milh(?:[ãa]o|oes|[õo]es)|mi\b)/gi;
  while ((match = millionRegex.exec(text)) !== null) {
    const rawQuote = match[0];
    const start = match.index;
    const end = start + rawQuote.length;
    if (hasOverlap(claimedSpans, start, end)) continue;
    claimedSpans.push({ start, end });
    const amount = Math.round(parseFloat(match[1].replace(',', '.')) * 1_000_000);
    const prefix = text.slice(Math.max(0, start - 50), start).toLowerCase();
    const isDemand = /\b(?:procuro|procurando|procura|or[çc]amento|at[eé]|comprar|compra|busca|buscando)\b/.test(prefix);
    const target = isDemand ? 'demand_primary' : isSec(start) ? 'property_secondary' : defaultTargetKey;
    results.push(makeVal(message, results.length + 1, isDemand ? 'budget_max' : 'sale_asking_price', amount, rawQuote, target));
  }

  // 4. Thousands with 'k': "3.5k", "3.5k de aluguel"
  const kRegex = /(\d+(?:[.,]\d+)?)\s*k\b(?:\s*de\s*(?:aluguel|loca[çc][ãa]o))?/gi;
  while ((match = kRegex.exec(text)) !== null) {
    const rawQuote = match[0];
    const start = match.index;
    const end = start + rawQuote.length;
    if (hasOverlap(claimedSpans, start, end)) continue;
    claimedSpans.push({ start, end });
    const amount = Math.round(parseFloat(match[1].replace(',', '.')) * 1000);
    const before = text.slice(Math.max(0, start - 30), start).toLowerCase();
    const isRent = /aluguel|loca[çc][ãa]o/i.test(rawQuote) || /aluguel|loca[çc][ãa]o|alugar/i.test(before);
    const target = isSec(start) ? 'property_secondary' : defaultTargetKey;
    results.push(makeVal(message, results.length + 1, isRent ? 'rent_asking_price' : 'sale_asking_price', amount, rawQuote, target));
  }

  // 5. Thousands with 'mil': "950 mil", "850 mil", "380 mil"
  const milRegex = /(\d+(?:[.,]\d+)?)\s*mil\b/gi;
  while ((match = milRegex.exec(text)) !== null) {
    const rawQuote = match[0];
    const start = match.index;
    const end = start + rawQuote.length;
    if (hasOverlap(claimedSpans, start, end)) continue;
    claimedSpans.push({ start, end });
    const amount = Math.round(parseFloat(match[1].replace(',', '.')) * 1000);
    const before = text.slice(Math.max(0, start - 50), start).toLowerCase();
    const after = text.slice(end, Math.min(text.length, end + 25)).toLowerCase();
    let field = 'sale_asking_price';
    if (/\b(?:procuro|procurando|comprar|or[çc]amento|at[eé]|busca|buscando)\b/.test(before)) {
      field = 'budget_max';
    } else if (/venda|vender/.test(before)) {
      field = 'sale_asking_price';
    } else if (/aluguel|loca[çc][ãa]o|alugar/.test(before) || /de\s*aluguel/.test(after)) {
      field = 'rent_asking_price';
    }
    const target = field === 'budget_max' ? 'demand_primary' : isSec(start) ? 'property_secondary' : defaultTargetKey;
    results.push(makeVal(message, results.length + 1, field, amount, rawQuote, target));
  }

  // 6. Formatted thousands for rent/sale without 'mil': e.g. "por 4.500", "locação por 4.200"
  const thousandsRegex = /(?:alugar\s+(?:por\s+)?|loca[çc][ãa]o\s+(?:por\s+)?|venda\s+(?:por\s+)?|vender\s+(?:por\s+)?|fecho\s+por\s+|por\s+)(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+|\d{4,})\b/gi;
  while ((match = thousandsRegex.exec(text)) !== null) {
    const numDigits = match[1];
    const numStart = match.index + match[0].indexOf(numDigits);
    const numEnd = numStart + numDigits.length;
    if (hasOverlap(claimedSpans, numStart, numEnd)) continue;
    claimedSpans.push({ start: numStart, end: numEnd });
    const amount = parseInt(numDigits.replace(/\./g, ''), 10);
    const isRent = /alugar|loca[çc][ãa]o/i.test(match[0]);
    const target = isSec(numStart) ? 'property_secondary' : defaultTargetKey;
    results.push(makeVal(message, results.length + 1, isRent ? 'rent_asking_price' : 'sale_asking_price', amount, numDigits, target));
  }

  return results;
}

/**
 * Extracts property types, subtypes, occupancy status, bedrooms, area, neighborhood and timing (7-layer engine).
 */
export function extractPropertyMetricsPtBr(message: ConversationMessage): PropertyMetricsResult {
  const text = message.normalized_text;
  const evidence_refs: EvidenceRef[] = [];
  const result: PropertyMetricsResult = { evidence_refs };
  if (!text) return result;

  const splitMatch = /(?:mas\s+tenho|tenho\s+(?:uma\s+sala|outro|um\s+outro)|outro\s+im[oó]vel)/i.exec(text);
  const secIdx = splitMatch ? splitMatch.index : -1;

  if (/moro\s+nele|morando\s+nele|uso\s+pr[oó]prio/i.test(text)) result.occupancy_status = 'owner_occupied';
  else if (/est[áa]\s+alugado|com\s+inquilino/i.test(text)) result.occupancy_status = 'tenant_occupied';
  else if (/desocupado|vazio/i.test(text)) result.occupancy_status = 'vacant';

  const commMatch = /\b(?:sala\s+comercial|loja|escrit[oó]rio|galp[ãa]o|pr[ée]dio\s+comercial|ponto\s+comercial)\b/i.exec(text);
  if (commMatch) {
    if (secIdx !== -1 && commMatch.index >= secIdx) result.secondary_property_type = 'commercial';
    else result.property_type = 'commercial';
  }
  const landMatch = /\b(?:terreno|lote|ch[áa]cara|s[íi]tio)\b/i.exec(text);
  if (landMatch && !result.property_type) {
    result.property_type = 'land';
    result.property_subtype = landMatch[0].toLowerCase();
  }
  const houseMatch = /\b(?:casa|sobrado)\b/i.exec(text);
  if (houseMatch) {
    const pfx = text.slice(Math.max(0, houseMatch.index - 35), houseMatch.index).toLowerCase();
    if (/procuro|procurando|comprar|busca|buscando/.test(pfx)) result.demand_property_types = ['house'];
    else result.property_type = 'house';
  }
  const subtypeMatch = /\b(duplex|triplex|cobertura|studio|kitnet|loft|flat|garden)\b/i.exec(text);
  if (subtypeMatch) {
    result.property_subtype = subtypeMatch[1].toLowerCase();
    const pfx = text.slice(Math.max(0, subtypeMatch.index - 35), subtypeMatch.index).toLowerCase();
    if (/procuro|procurando|comprar|busca|buscando/.test(pfx)) result.demand_property_types = ['apartment'];
    else if (!result.property_type) result.property_type = 'apartment';
  }
  if (/\b(?:apartamento|apto)\b/i.test(text) && !result.property_type) result.property_type = 'apartment';

  const bRegex = /(\d+)\s*quartos?/gi;
  let bMatch: RegExpExecArray | null;
  while ((bMatch = bRegex.exec(text)) !== null) {
    const count = parseInt(bMatch[1], 10);
    const before = text.slice(Math.max(0, bMatch.index - 30), bMatch.index).toLowerCase();
    if (/comprar|procuro|procurando|busca|buscando/.test(before)) result.demand_bedrooms_min = count;
    else result.bedrooms = count;
  }

  const aMatch = /(\d+(?:[.,]\d+)?)\s*m(?:2|²)/i.exec(text);
  if (aMatch) result.area_m2 = parseFloat(aMatch[1].replace(',', '.'));

  // Layer 4: Neighborhood extraction ("no Batel", "em Moema", "no Água Verde")
  const nbMatch = /\b(?:no\s+bairro\s+|bairro\s+|no\s+|na\s+|em\s+)([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+)?)/.exec(text);
  if (nbMatch && !/^(?:Brasil|Mar[çc]o|Janeiro|Dezembro|Valor|Total|Condom[íi]nio|Ano|M[êe]s)$/i.test(nbMatch[1])) {
    result.neighborhood = nbMatch[1].trim();
  }

  // Layer 7: Temporal urgency extraction
  if (/\b(?:urgente|imediato|imediata|mudan[çc]a\s+imediata|o\s+quanto\s+antes)\b/i.test(text)) result.timing = 'immediate';
  else if (/\b(?:m[êe]s\s+que\s+vem|pr[óo]ximo\s+m[êe]s|em\s+(?:15|30|45|60)\s+dias|este\s+m[êe]s)\b/i.test(text)) result.timing = 'short_term';
  else if (/\b(?:at[eé]\s+dezembro|ano\s+que\s+vem|pr[óo]ximo\s+ano|depois\s+de\s+mar[çc]o)\b/i.test(text)) result.timing = 'medium_term';
  else if (/\b(?:sem\s+pressa|s[óo]\s+pesquisando|avaliando)\b/i.test(text)) result.timing = 'flexible';

  return result;
}

/**
 * Extracts referred contact name and phone number for third-party referrals.
 */
export function extractReferredContactPtBr(message: ConversationMessage): ReferredContactResult {
  const text = message.normalized_text;
  const evidence_refs: EvidenceRef[] = [];
  const result: ReferredContactResult = { evidence_refs };
  if (!text) return result;

  const phoneMatch = /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-\s]?\d{4}\b/.exec(text);
  if (phoneMatch) {
    result.referred_phone = phoneMatch[0].trim();
    evidence_refs.push(buildEvidenceRef({
      message_id: message.message_id,
      conversation_id: message.conversation_id,
      exact_quote: result.referred_phone,
      normalized_text: text,
      timestamp: message.timestamp,
      extractor_type: 'rule',
      parser_version: PARSER_VERSION,
      confidence: 0.95,
    }));
  }

  const nameMatch = /(?:do\s+meu\s+irm[ãa]o|da\s+minha\s+irm[ãa]|do\s+meu\s+pai|da\s+minha\s+m[ãa]e|fala\s+com\s+(?:o|a|ele|ela)?)\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+)/.exec(text);
  if (nameMatch) {
    result.referred_name = nameMatch[1];
    result.relationship_type = 'family_member';
    evidence_refs.push(buildEvidenceRef({
      message_id: message.message_id,
      conversation_id: message.conversation_id,
      exact_quote: result.referred_name,
      normalized_text: text,
      timestamp: message.timestamp,
      extractor_type: 'rule',
      parser_version: PARSER_VERSION,
      confidence: 0.95,
    }));
  }

  return result;
}
