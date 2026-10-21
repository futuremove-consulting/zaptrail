import { EvidenceRef, QuoteValidationResult } from './types';

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips diacritical accents from Latin characters while preserving string code unit length.
 */
function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Canonicalizes unicode, smart punctuation, zero-width characters, and non-breaking spaces.
 */
function cleanUnicode(str: string): string {
  return str
    .normalize('NFC')
    .replace(/[\u200B\uFEFF\u200C\u200D\u200E\u200F]/g, '')
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00A0/g, ' ');
}

function isWordChar(char: string | undefined): boolean {
  if (!char) return false;
  return /[a-zA-Z0-9À-ÿ]/.test(char);
}

function satisfiesWordBoundaries(text: string, start: number, end: number, quote: string): boolean {
  const startsWithWord = isWordChar(quote[0]);
  const endsWithWord = isWordChar(quote[quote.length - 1]);

  if (startsWithWord && start > 0 && isWordChar(text[start - 1])) {
    return false;
  }
  if (endsWithWord && end < text.length && isWordChar(text[end])) {
    return false;
  }
  return true;
}

function findWordBoundaryMatch(
  text: string,
  target: string,
  caseInsensitive = false
): { start: number; end: number } | null {
  const haystack = caseInsensitive ? text.toLowerCase() : text;
  const needle = caseInsensitive ? target.toLowerCase() : target;
  let fromIndex = 0;

  while (fromIndex <= haystack.length - needle.length) {
    const idx = haystack.indexOf(needle, fromIndex);
    if (idx === -1) break;
    const end = idx + needle.length;
    if (satisfiesWordBoundaries(text, idx, end, target)) {
      return { start: idx, end };
    }
    fromIndex = idx + 1;
  }
  return null;
}

function mapIndexToRaw(raw: string, cleaned: string, cleanIndex: number): number {
  if (raw.length === cleaned.length) return cleanIndex;
  let rawIdx = 0;
  let cleanIdx = 0;
  while (rawIdx < raw.length && cleanIdx < cleanIndex) {
    if (/[\u200B\uFEFF\u200C\u200D\u200E\u200F]/.test(raw[rawIdx]!)) {
      rawIdx++;
    } else {
      rawIdx++;
      cleanIdx++;
    }
  }
  return rawIdx;
}

/**
 * Validates deterministically whether a quote exists within a message.
 * Calculates character offsets (char_start, char_end) deterministically.
 * Enforces word boundaries, unicode canonicalization, and accent-insensitivity.
 */
export function validateExactQuote(
  rawMessage: string,
  quote: string
): { valid: boolean; normalized_quote: string; char_start?: number; char_end?: number } {
  if (!rawMessage || !quote || quote.trim().length === 0) {
    return { valid: false, normalized_quote: (quote ?? '').trim() };
  }

  const normalizedQuote = quote.replace(/\s+/g, ' ').trim();

  // 1. Direct exact match with word boundaries
  let match = findWordBoundaryMatch(rawMessage, quote);
  if (match) {
    return {
      valid: true,
      normalized_quote: quote,
      char_start: match.start,
      char_end: match.end,
    };
  }

  // 2. Direct match of normalizedQuote with word boundaries
  match = findWordBoundaryMatch(rawMessage, normalizedQuote);
  if (match) {
    return {
      valid: true,
      normalized_quote: normalizedQuote,
      char_start: match.start,
      char_end: match.end,
    };
  }

  // 3. Case-insensitive match with word boundaries
  match = findWordBoundaryMatch(rawMessage, normalizedQuote, true);
  if (match) {
    return {
      valid: true,
      normalized_quote: normalizedQuote,
      char_start: match.start,
      char_end: match.end,
    };
  }

  // 4. Unicode-cleaned & typographic punctuation match
  const cleanRaw = cleanUnicode(rawMessage);
  const cleanQuote = cleanUnicode(normalizedQuote);
  match = findWordBoundaryMatch(cleanRaw, cleanQuote, true);
  if (match) {
    const char_start = mapIndexToRaw(rawMessage, cleanRaw, match.start);
    const char_end = mapIndexToRaw(rawMessage, cleanRaw, match.end);
    return {
      valid: true,
      normalized_quote: normalizedQuote,
      char_start,
      char_end,
    };
  }

  // 5. Whitespace-flexible and accent-insensitive match
  try {
    const strippedRaw = stripAccents(cleanRaw);
    const strippedQuote = stripAccents(cleanQuote);
    const words = strippedQuote.split(' ').filter(Boolean).map(escapeRegex);
    if (words.length > 0) {
      const pattern = new RegExp(`(?<=^|[^a-zA-Z0-9À-ÿ])${words.join('\\s+')}(?=[^a-zA-Z0-9À-ÿ]|$)`, 'i');
      const regMatch = pattern.exec(strippedRaw);
      if (regMatch && regMatch.index !== undefined) {
        const raw_start = mapIndexToRaw(rawMessage, cleanRaw, regMatch.index);
        const raw_end = mapIndexToRaw(rawMessage, cleanRaw, regMatch.index + regMatch[0].length);
        return {
          valid: true,
          normalized_quote: normalizedQuote,
          char_start: raw_start,
          char_end: raw_end,
        };
      }
    }
  } catch {
    // Fallback if regex compilation fails
  }

  return {
    valid: false,
    normalized_quote: normalizedQuote,
  };
}

/**
 * Validates a batch of quotes returned by an LLM against the raw turn message.
 */
export function validateLlmQuotes(
  rawMessage: string,
  quotes: string[]
): { valid_count: number; invalid_count: number; results: Array<QuoteValidationResult> } {
  const results: QuoteValidationResult[] = [];
  let valid_count = 0;
  let invalid_count = 0;

  for (const quote of quotes) {
    const validation = validateExactQuote(rawMessage, quote);
    if (validation.valid) {
      valid_count++;
      results.push({
        quote,
        valid: true,
        normalized_quote: validation.normalized_quote,
        char_start: validation.char_start,
        char_end: validation.char_end,
        hallucination_detected: false,
      });
    } else {
      invalid_count++;
      results.push({
        quote,
        valid: false,
        normalized_quote: validation.normalized_quote,
        char_start: undefined,
        char_end: undefined,
        hallucination_detected: true,
      });
    }
  }

  return {
    valid_count,
    invalid_count,
    results,
  };
}

/**
 * Sanitizes an EvidenceRef generated by an LLM:
 * - Recalculates exact char_start/char_end deterministically in TypeScript.
 * - Flags hallucination_detected: true, removes char offsets, downgrades confidence,
 *   and marks reviewRequired: true if the quote does not exist verbatim.
 */
export function sanitizeEvidenceRefWithQuoteCheck(
  messageText: string,
  ref: EvidenceRef
): { ref: EvidenceRef; reviewRequired: boolean; reviewReason?: string } {
  const validation = validateExactQuote(messageText, ref.exact_quote);

  if (
    validation.valid &&
    validation.char_start !== undefined &&
    validation.char_end !== undefined
  ) {
    const sanitizedRef: EvidenceRef = {
      ...ref,
      char_start: validation.char_start,
      char_end: validation.char_end,
      hallucination_detected: false,
    };
    return {
      ref: sanitizedRef,
      reviewRequired: false,
    };
  }

  // Hallucination detected
  const downgradedRef: EvidenceRef = {
    ...ref,
    char_start: undefined,
    char_end: undefined,
    hallucination_detected: true,
    confidence: Math.min(ref.confidence, 0.5),
  };

  return {
    ref: downgradedRef,
    reviewRequired: true,
    reviewReason: `Citação não encontrada no texto original: "${ref.exact_quote}" (possível alucinação de evidência pelo LLM).`,
  };
}
