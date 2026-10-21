import { describe, it, expect } from 'vitest';
import {
  validateExactQuote,
  validateLlmQuotes,
  sanitizeEvidenceRefWithQuoteCheck,
} from '../../src/packages/core/quote-validator';
import { EvidenceRef } from '../../src/packages/core/types';

describe('QuoteValidator Anti-Hallucination Guard (LLM-02)', () => {
  const sampleMessage =
    'Sou o proprietário sim, estou vendendo esse apartamento por 1,2 milhão.';

  describe('validateExactQuote', () => {
    it('finds exact quote with deterministic character offsets', () => {
      const quote = '1,2 milhão';
      const result = validateExactQuote(sampleMessage, quote);

      expect(result.valid).toBe(true);
      expect(result.char_start).toBeDefined();
      expect(result.char_end).toBeDefined();
      expect(sampleMessage.slice(result.char_start!, result.char_end!)).toBe(quote);
    });

    it('finds quote case-insensitively', () => {
      const quote = 'sou o proprietário';
      const result = validateExactQuote(sampleMessage, quote);

      expect(result.valid).toBe(true);
      expect(result.char_start).toBe(0);
      expect(result.char_end).toBe(18);
    });

    it('normalizes internal spacing differences', () => {
      const messyQuote = 'vendendo    esse   apartamento';
      const result = validateExactQuote(sampleMessage, messyQuote);

      expect(result.valid).toBe(true);
      expect(result.normalized_quote).toBe('vendendo esse apartamento');
      expect(result.char_start).toBeDefined();
      expect(result.char_end).toBeDefined();
      expect(sampleMessage.slice(result.char_start!, result.char_end!)).toBe(
        'vendendo esse apartamento'
      );
    });

    it('matches when quote has minor accent variation (unaccented quote)', () => {
      const unaccentedQuote = '1,2 milhao';
      const result = validateExactQuote(sampleMessage, unaccentedQuote);

      expect(result.valid).toBe(true);
      expect(result.char_start).toBeDefined();
      expect(result.char_end).toBeDefined();
      // Slice from original message should give the accented original text
      expect(sampleMessage.slice(result.char_start!, result.char_end!)).toBe('1,2 milhão');
    });

    it('rejects hallucinated or paraphrased quotes that do not exist verbatim', () => {
      const hallucinated = 'o dono quer um milhão e duzentos mil';
      const result = validateExactQuote(sampleMessage, hallucinated);

      expect(result.valid).toBe(false);
      expect(result.char_start).toBeUndefined();
      expect(result.char_end).toBeUndefined();
    });

    it('rejects empty or whitespace-only quotes', () => {
      expect(validateExactQuote(sampleMessage, '').valid).toBe(false);
      expect(validateExactQuote(sampleMessage, '   ').valid).toBe(false);
    });

    it('rejects quote when message text is empty', () => {
      expect(validateExactQuote('', '1,2 milhão').valid).toBe(false);
    });

    it('rejects adversarial word-boundary violations (partial word truncation)', () => {
      // "interessado" should NOT match "desinteressado"
      const result = validateExactQuote('estou desinteressado no momento', 'interessado');
      expect(result.valid).toBe(false);
      expect(result.char_start).toBeUndefined();

      // "vendo" should NOT match "revendo"
      const result2 = validateExactQuote('estou revendo o preço', 'vendo');
      expect(result2.valid).toBe(false);
    });

    it('handles unicode NFD vs NFC and zero-width spaces without offset drift', () => {
      const nfdMessage = 'São Paulo com vista panorâmica'.normalize('NFD');
      const result = validateExactQuote(nfdMessage, 'São Paulo');
      expect(result.valid).toBe(true);
      expect(result.char_start).toBe(0);
      expect(result.char_end).toBe(9);

      // Zero-width space embedded in WhatsApp pasted text
      const zwspMessage = 'estou vendendo\u200B por 1,2 milhão';
      const zwspResult = validateExactQuote(zwspMessage, 'estou vendendo por 1,2 milhão');
      expect(zwspResult.valid).toBe(true);
    });

    it('normalizes smart/curly quotes and dashes', () => {
      const messageWithSmartQuotes = 'apartamento “alto padrão” — Moema';
      const result = validateExactQuote(
        messageWithSmartQuotes,
        'apartamento "alto padrão" - Moema'
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('validateLlmQuotes', () => {
    it('validates a batch of quotes and aggregates valid and invalid counts', () => {
      const quotes = [
        'Sou o proprietário',
        'estou vendendo',
        'imóvel quitado em cartório', // hallucinated
        '1,2 milhão',
      ];

      const batch = validateLlmQuotes(sampleMessage, quotes);

      expect(batch.valid_count).toBe(3);
      expect(batch.invalid_count).toBe(1);
      expect(batch.results).toHaveLength(4);

      const invalidItem = batch.results.find(
        (r) => r.quote === 'imóvel quitado em cartório'
      );
      expect(invalidItem).toBeDefined();
      expect(invalidItem?.valid).toBe(false);
      expect(invalidItem?.hallucination_detected).toBe(true);
      expect(invalidItem?.char_start).toBeUndefined();
    });
  });

  describe('sanitizeEvidenceRefWithQuoteCheck', () => {
    const baseRef: EvidenceRef = {
      evidence_id: 'ev-test-1',
      message_id: 'msg-01',
      conversation_id: 'conv-01',
      exact_quote: '1,2 milhão',
      char_start: 999, // bogus index from untrusted source
      char_end: 1009,
      timestamp: '2026-10-21T12:00:00Z',
      extractor_type: 'llm',
      parser_version: '2.0.0',
      confidence: 0.9,
    };

    it('recalculates correct char offsets for valid LLM quotes and marks reviewRequired: false', () => {
      const { ref, reviewRequired, reviewReason } =
        sanitizeEvidenceRefWithQuoteCheck(sampleMessage, baseRef);

      expect(reviewRequired).toBe(false);
      expect(reviewReason).toBeUndefined();
      expect(ref.hallucination_detected).toBe(false);
      expect(ref.char_start).toBe(60);
      expect(ref.char_end).toBe(70);
      expect(sampleMessage.slice(ref.char_start!, ref.char_end!)).toBe('1,2 milhão');
    });

    it('flags hallucinated quote, strips char offsets, downgrades confidence, and requires review', () => {
      const hallucinatedRef: EvidenceRef = {
        ...baseRef,
        evidence_id: 'ev-hallucinated',
        exact_quote: 'cliente aceita permuta em carro',
        confidence: 0.95,
      };

      const { ref, reviewRequired, reviewReason } =
        sanitizeEvidenceRefWithQuoteCheck(sampleMessage, hallucinatedRef);

      expect(reviewRequired).toBe(true);
      expect(reviewReason).toMatch(/Citação não encontrada/i);
      expect(ref.hallucination_detected).toBe(true);
      expect(ref.char_start).toBeUndefined();
      expect(ref.char_end).toBeUndefined();
      expect(ref.confidence).toBeLessThan(0.65);
    });
  });
});
