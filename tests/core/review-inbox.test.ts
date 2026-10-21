import { describe, it, expect, beforeEach } from 'vitest';
import {
  ReviewInboxService,
  buildShowInConversationLink,
  ReviewQueueRecordSchema,
  ReviewResolutionInputSchema,
} from '../../src/packages/core/review-inbox';
import { SupabaseStoragePort } from '../../src/packages/core/supabase-storage';
import {
  UniversalInterpretationEnvelope,
  EvidenceRef,
} from '../../src/packages/core/types';

describe('ReviewInboxService & Dual Timeline Link Generator (REV-01)', () => {
  let storage: SupabaseStoragePort;
  let service: ReviewInboxService;

  const sampleEvidence: EvidenceRef = {
    evidence_id: 'ev-test-01',
    message_id: 'msg-101',
    conversation_id: 'conv-999',
    exact_quote: 'proposta de 500 mil',
    char_start: 11,
    char_end: 30,
    timestamp: '2026-10-21T12:00:00Z',
    extractor_type: 'hybrid',
    parser_version: '1.0.0',
    confidence: 0.85,
  };

  const makeEnvelope = (
    envelopeId: string,
    tenantId: string,
    conversationId: string,
    reviewItemsCount = 1
  ): UniversalInterpretationEnvelope => ({
    envelope_id: envelopeId,
    tenant_id: tenantId,
    conversation_id: conversationId,
    turn_id: 'turn-01',
    domain_key: 'general_sales',
    parser_version: '1.0.0',
    duplicate: false,
    review_required: reviewItemsCount > 0,
    do_not_contact: false,
    participants: [],
    intents: [],
    facts: [],
    values: [],
    relationships: [],
    conditions: [],
    opportunities: [],
    actions: [],
    media_results: [],
    evidence_refs: [sampleEvidence],
    review_items: Array.from({ length: reviewItemsCount }, (_, idx) => ({
      review_id: `rev-${envelopeId}-${idx + 1}`,
      reason: `Ambiguous value observation ${idx + 1}`,
      severity: 'high' as const,
      target_id: `target-${idx + 1}`,
      evidence_refs: [sampleEvidence],
    })),
  });

  beforeEach(() => {
    storage = new SupabaseStoragePort();
    service = new ReviewInboxService(storage);
  });

  describe('Schemas validation', () => {
    it('validates a valid ReviewQueueRecord', () => {
      const validRecord = {
        review_id: 'rev-01',
        tenant_id: 'tenant-1',
        conversation_id: 'conv-1',
        target_id: 'target-1',
        severity: 'high' as const,
        reason: 'Ambiguous entity',
        status: 'pending' as const,
        original_payload: { amount: 5000 },
        evidence_refs: [sampleEvidence],
      };
      const parsed = ReviewQueueRecordSchema.parse(validRecord);
      expect(parsed.review_id).toBe('rev-01');
      expect(parsed.status).toBe('pending');
    });

    it('validates ReviewResolutionInputSchema', () => {
      const validResolution = {
        decision: 'approve' as const,
        reviewer_id: 'user-op-1',
        reviewer_notes: 'Verified against audio recording',
      };
      const parsed = ReviewResolutionInputSchema.parse(validResolution);
      expect(parsed.decision).toBe('approve');
      expect(parsed.reviewer_id).toBe('user-op-1');

      expect(() =>
        ReviewResolutionInputSchema.parse({
          decision: 'invalid_decision',
          reviewer_id: 'user-1',
        })
      ).toThrow();
    });
  });

  describe('Tenant Isolation & Scope Guards (E-03-02)', () => {
    it('rejects calls without non-empty tenant_id', async () => {
      await expect(service.listReviews({ tenantId: '' })).rejects.toThrow(/tenant/i);
      await expect(service.listReviews({ tenantId: '   ' })).rejects.toThrow(/tenant/i);
      await expect(
        service.resolveReviewItem('', 'rev-1', {
          decision: 'approve',
          reviewer_id: 'user-1',
        })
      ).rejects.toThrow(/tenant/i);
    });

    it('isolates review queues strictly between tenants', async () => {
      const envTenantA = makeEnvelope('env-A', 'tenant-alpha', 'conv-1');
      const envTenantB = makeEnvelope('env-B', 'tenant-beta', 'conv-1');

      await service.enqueueFromEnvelope(envTenantA);
      await service.enqueueFromEnvelope(envTenantB);

      const itemsA = await service.listReviews({ tenantId: 'tenant-alpha' });
      expect(itemsA).toHaveLength(1);
      expect(itemsA[0].review_id).toBe('rev-env-A-1');

      const itemsB = await service.listReviews({ tenantId: 'tenant-beta' });
      expect(itemsB).toHaveLength(1);
      expect(itemsB[0].review_id).toBe('rev-env-B-1');
    });
  });

  describe('enqueueFromEnvelope & Idempotency (E-03-05)', () => {
    it('enqueues review items as pending and preserves evidence_refs', async () => {
      const env = makeEnvelope('env-10', 'tenant-alpha', 'conv-10', 2);
      await service.enqueueFromEnvelope(env);

      const pending = await service.listPendingReviews('tenant-alpha');
      expect(pending).toHaveLength(2);
      expect(pending[0].status).toBe('pending');
      expect(pending[0].severity).toBe('high');
      expect(pending[0].evidence_refs).toHaveLength(1);
      expect(pending[0].evidence_refs[0].exact_quote).toBe('proposta de 500 mil');
    });

    it('is idempotent when re-enqueuing the same envelope (tenant_id, review_id)', async () => {
      const env = makeEnvelope('env-11', 'tenant-alpha', 'conv-11', 1);

      await service.enqueueFromEnvelope(env);
      const firstRun = await service.listReviews({ tenantId: 'tenant-alpha' });
      expect(firstRun).toHaveLength(1);

      // Re-enqueuing should NOT duplicate items
      await service.enqueueFromEnvelope(env);
      const secondRun = await service.listReviews({ tenantId: 'tenant-alpha' });
      expect(secondRun).toHaveLength(1);
    });
  });

  describe('listReviews filtering', () => {
    beforeEach(async () => {
      const env1 = makeEnvelope('env-f1', 'tenant-filter', 'conv-A', 1);
      const env2 = makeEnvelope('env-f2', 'tenant-filter', 'conv-B', 1);
      await service.enqueueFromEnvelope(env1);
      await service.enqueueFromEnvelope(env2);
    });

    it('filters by status, severity, and conversation_id', async () => {
      // Resolve one item to test status filter
      await service.resolveReviewItem('tenant-filter', 'rev-env-f1-1', {
        decision: 'approve',
        reviewer_id: 'operator-1',
      });

      const pending = await service.listReviews({
        tenantId: 'tenant-filter',
        status: 'pending',
      });
      expect(pending).toHaveLength(1);
      expect(pending[0].review_id).toBe('rev-env-f2-1');

      const approved = await service.listReviews({
        tenantId: 'tenant-filter',
        status: 'approved',
      });
      expect(approved).toHaveLength(1);
      expect(approved[0].review_id).toBe('rev-env-f1-1');

      const convA = await service.listReviews({
        tenantId: 'tenant-filter',
        conversation_id: 'conv-A',
      });
      expect(convA).toHaveLength(1);
      expect(convA[0].conversation_id).toBe('conv-A');
    });
  });

  describe('resolveReviewItem — approve, edit, reject (REV-01, E-03-03)', () => {
    beforeEach(async () => {
      const env = makeEnvelope('env-res', 'tenant-resolve', 'conv-res', 1);
      await service.enqueueFromEnvelope(env);
    });

    it('approves item: status approved, validated_human, preserves original_payload', async () => {
      const resolved = await service.resolveReviewItem('tenant-resolve', 'rev-env-res-1', {
        decision: 'approve',
        reviewer_id: 'auditor-1',
        reviewer_notes: 'Valor confirmado com áudio original',
      });

      expect(resolved.status).toBe('approved');
      expect(resolved.reviewer_id).toBe('auditor-1');
      expect(resolved.reviewer_notes).toBe('Valor confirmado com áudio original');
      expect(resolved.resolved_at).toBeDefined();
      expect(resolved.original_payload).toBeDefined();
      expect(resolved.resolved_payload).toMatchObject({
        epistemic_status: 'validated_human',
      });

      // Fetch again to verify persistence
      const item = await service.getReviewItem('tenant-resolve', 'rev-env-res-1');
      expect(item?.status).toBe('approved');
    });

    it('edits item: status edited, records new payload, marks prior superseded, preserves original_payload (E-03-03)', async () => {
      const originalItem = await service.getReviewItem('tenant-resolve', 'rev-env-res-1');
      const originalPayloadCopy = JSON.parse(JSON.stringify(originalItem?.original_payload));

      const resolved = await service.resolveReviewItem('tenant-resolve', 'rev-env-res-1', {
        decision: 'edit',
        reviewer_id: 'auditor-2',
        reviewer_notes: 'Corrigido valor de 500k para 550k',
        resolved_payload: {
          corrected_amount: 550000,
          currency: 'BRL',
        },
      });

      expect(resolved.status).toBe('edited');
      expect(resolved.reviewer_id).toBe('auditor-2');
      expect(resolved.resolved_payload).toMatchObject({
        corrected_amount: 550000,
        currency: 'BRL',
        epistemic_status: 'validated_human',
        prior_epistemic_status: 'superseded',
      });

      // CRITICAL: original_payload must remain strictly untouched
      expect(resolved.original_payload).toEqual(originalPayloadCopy);
    });

    it('rejects item: status rejected, marks epistemic_status rejected, preserves original_payload', async () => {
      const originalItem = await service.getReviewItem('tenant-resolve', 'rev-env-res-1');
      const originalPayloadCopy = JSON.parse(JSON.stringify(originalItem?.original_payload));

      const resolved = await service.resolveReviewItem('tenant-resolve', 'rev-env-res-1', {
        decision: 'reject',
        reviewer_id: 'auditor-3',
        reviewer_notes: 'Interpretação incorreta de ruído',
      });

      expect(resolved.status).toBe('rejected');
      expect(resolved.resolved_payload).toMatchObject({
        epistemic_status: 'rejected',
      });
      expect(resolved.original_payload).toEqual(originalPayloadCopy);
    });

    it('throws error when item does not exist', async () => {
      await expect(
        service.resolveReviewItem('tenant-resolve', 'non-existent-review-id', {
          decision: 'approve',
          reviewer_id: 'auditor-1',
        })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe('buildShowInConversationLink (REV-01, E-03-04)', () => {
    const rawMessage = 'O cliente fez uma proposta de 500 mil à vista no imóvel.';

    it('generates exact highlight segments with char_start and char_end matching evidence quote', () => {
      const link = buildShowInConversationLink(sampleEvidence, rawMessage);

      expect(link.conversation_id).toBe('conv-999');
      expect(link.message_id).toBe('msg-101');
      expect(link.anchor_href).toBe('/conversations/conv-999?anchor=msg_101');
      expect(link.exact_quote).toBe('proposta de 500 mil');
      expect(link.char_start).toBe(18);
      expect(link.char_end).toBe(37);
      expect(link.highlighted_text).toBe('proposta de 500 mil');
      expect(link.before_text).toBe('O cliente fez uma ');
      expect(link.after_text).toBe(' à vista no imóvel.');

      // Exact concatenation invariant
      expect(link.before_text + link.highlighted_text + link.after_text).toBe(rawMessage);
    });

    it('recalculates offsets when char_start/char_end are missing or drifted', () => {
      const driftedEvidence: EvidenceRef = {
        ...sampleEvidence,
        char_start: undefined,
        char_end: undefined,
        exact_quote: 'proposta de 500 mil',
      };

      const link = buildShowInConversationLink(driftedEvidence, rawMessage);
      expect(link.char_start).toBe(18);
      expect(link.char_end).toBe(37);
      expect(link.highlighted_text).toBe('proposta de 500 mil');
      expect(link.before_text + link.highlighted_text + link.after_text).toBe(rawMessage);
    });

    it('handles quotes with unicode punctuation or normalization differences gracefully', () => {
      const msgWithQuotes = 'Ele disse: "proposta de 500 mil" ontem.';
      const evidenceWithQuotes: EvidenceRef = {
        ...sampleEvidence,
        exact_quote: 'proposta de 500 mil',
        char_start: undefined,
        char_end: undefined,
      };

      const link = buildShowInConversationLink(evidenceWithQuotes, msgWithQuotes);
      expect(link.highlighted_text).toBe('proposta de 500 mil');
      expect(link.before_text + link.highlighted_text + link.after_text).toBe(msgWithQuotes);
    });

    it('returns safe fallback when quote is entirely missing from message', () => {
      const missingEvidence: EvidenceRef = {
        ...sampleEvidence,
        exact_quote: 'citação inexistente no texto',
        char_start: undefined,
        char_end: undefined,
      };

      const link = buildShowInConversationLink(missingEvidence, rawMessage);
      expect(link.highlighted_text).toBe('');
      expect(link.before_text).toBe('');
      expect(link.after_text).toBe(rawMessage);
      expect(link.before_text + link.highlighted_text + link.after_text).toBe(rawMessage);
    });
  });
});
