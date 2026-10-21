import { EvidenceRef, ExtractorType } from './types';

/**
 * Normalizes message text by trimming leading/trailing whitespace
 * and collapsing internal runs of horizontal whitespace to a single space,
 * while preserving line breaks.
 */
export function normalizeMessageText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .trim();
}

export interface BuildEvidenceRefParams {
  message_id: string;
  conversation_id: string;
  exact_quote: string;
  raw_text?: string;
  normalized_text?: string;
  timestamp: string;
  extractor_type: ExtractorType;
  parser_version: string;
  confidence: number;
  evidence_id?: string;
}

/**
 * Builds an EvidenceRef deterministically calculating char_start and char_end
 * based on exact_quote location in the normalized message text.
 * Throws an Error with 'EXACT_QUOTE_NOT_FOUND' if exact_quote is not in normalized text.
 */
export function buildEvidenceRef(params: BuildEvidenceRefParams): EvidenceRef {
  const {
    message_id,
    conversation_id,
    exact_quote,
    raw_text,
    normalized_text,
    timestamp,
    extractor_type,
    parser_version,
    confidence,
    evidence_id,
  } = params;

  if (!exact_quote || exact_quote.trim().length === 0) {
    throw new Error('EXACT_QUOTE_NOT_FOUND: exact_quote cannot be empty.');
  }

  const textToSearch =
    normalized_text !== undefined
      ? normalized_text
      : normalizeMessageText(raw_text ?? '');

  let char_start = textToSearch.indexOf(exact_quote);
  let matchedLength = exact_quote.length;

  if (char_start === -1) {
    // Case-insensitive fallback
    const lowerText = textToSearch.toLowerCase();
    const lowerQuote = exact_quote.toLowerCase();
    char_start = lowerText.indexOf(lowerQuote);
  }

  if (char_start === -1) {
    throw new Error(
      `EXACT_QUOTE_NOT_FOUND: Could not find quote "${exact_quote}" in normalized text: "${textToSearch}"`
    );
  }

  const char_end = char_start + matchedLength;

  return {
    evidence_id:
      evidence_id ?? `ev-${message_id}-${char_start}-${char_end}`,
    message_id,
    conversation_id,
    exact_quote,
    char_start,
    char_end,
    timestamp,
    extractor_type,
    parser_version,
    confidence,
  };
}
