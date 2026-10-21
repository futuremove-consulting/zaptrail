import { describe, it, expect, beforeEach } from 'vitest';
import {
  SupabaseStoragePort,
  assertTenantScope,
  InMemorySupabaseTableClient,
} from '../../src/packages/core/supabase-storage';
import { UniversalInterpretationEnvelope, ValueObservation } from '../../src/packages/core/types';

describe('SupabaseStoragePort & Tenant Isolation Test Suite (DB-01)', () => {
  let client: InMemorySupabaseTableClient;
  let storage: SupabaseStoragePort;

  beforeEach(() => {
    client = new InMemorySupabaseTableClient();
    storage = new SupabaseStoragePort(client);
  });

  describe('assertTenantScope (E-03-02)', () => {
    it('should throw an error for empty, null, undefined or whitespace-only tenantId', () => {
      expect(() => assertTenantScope('')).toThrow(/tenantId is required/i);
      expect(() => assertTenantScope('   ')).toThrow(/tenantId is required/i);
      // @ts-expect-error testing invalid inputs at runtime
      expect(() => assertTenantScope(null)).toThrow(/tenantId is required/i);
      // @ts-expect-error testing invalid inputs at runtime
      expect(() => assertTenantScope(undefined)).toThrow(/tenantId is required/i);
    });

    it('should return trimmed tenantId when valid', () => {
      expect(assertTenantScope('tenant-123')).toBe('tenant-123');
      expect(assertTenantScope('  tenant-abc  ')).toBe('tenant-abc');
    });

    it('should reject all StoragePort methods if tenantId is missing or empty', async () => {
      await expect(storage.isProcessed('', 'meta', 'msg-1')).rejects.toThrow(/tenantId is required/i);
      await expect(storage.markProcessed('  ', 'meta', 'msg-1')).rejects.toThrow(/tenantId is required/i);
      await expect(storage.getHistoricalValues('', 'conv-1')).rejects.toThrow(/tenantId is required/i);

      const invalidEnvelope = {
        envelope_id: 'env-empty-tenant',
        tenant_id: '   ',
        conversation_id: 'conv-1',
        turn_id: 'turn-1',
        domain_key: 'general',
        parser_version: '1.0.0',
        duplicate: false,
        review_required: false,
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
        evidence_refs: [],
        review_items: [],
      } as unknown as UniversalInterpretationEnvelope;

      await expect(storage.saveEnvelope(invalidEnvelope)).rejects.toThrow(/tenantId is required/i);
    });
  });

  describe('isProcessed & markProcessed idempotency (E-03-05)', () => {
    it('should return false before processing and true after markProcessed', async () => {
      const tenant = 'tenant-alpha';
      const provider = 'whatsapp';
      const messageId = 'msg-ext-001';

      expect(await storage.isProcessed(tenant, provider, messageId)).toBe(false);

      await storage.markProcessed(tenant, provider, messageId);
      expect(await storage.isProcessed(tenant, provider, messageId)).toBe(true);

      // Repeated marking should be idempotent
      await storage.markProcessed(tenant, provider, messageId);
      expect(await storage.isProcessed(tenant, provider, messageId)).toBe(true);
    });

    it('should keep processed messages isolated per tenant', async () => {
      const provider = 'whatsapp';
      const messageId = 'msg-shared-id';

      await storage.markProcessed('tenant-1', provider, messageId);

      expect(await storage.isProcessed('tenant-1', provider, messageId)).toBe(true);
      expect(await storage.isProcessed('tenant-2', provider, messageId)).toBe(false);
    });
  });

  describe('saveEnvelope audit trail & review queue persistence', () => {
    const makeSampleEnvelope = (
      envelopeId: string,
      tenantId: string,
      conversationId: string
    ): UniversalInterpretationEnvelope => ({
      envelope_id: envelopeId,
      tenant_id: tenantId,
      conversation_id: conversationId,
      turn_id: 'turn-101',
      domain_key: 'sales_core',
      parser_version: '1.2.0',
      extractor_type: 'hybrid',
      llm_invoked: true,
      llm_error: false,
      duplicate: false,
      review_required: true,
      do_not_contact: false,
      participants: [],
      intents: [],
      facts: [],
      values: [
        {
          value_id: `val-${envelopeId}`,
          field_key: 'transaction_amount',
          amount: 5000,
          currency: 'BRL',
          raw_expression: 'R$ 5.000,00',
          target_entity_key: 'contract_01',
          epistemic_status: 'inferred',
          confidence: 0.72,
          evidence_refs: [
            {
              evidence_id: `ev-val-${envelopeId}`,
              message_id: 'msg-01',
              conversation_id: conversationId,
              exact_quote: 'R$ 5.000,00',
              char_start: 10,
              char_end: 21,
              timestamp: '2026-10-21T10:00:00Z',
              extractor_type: 'hybrid',
              parser_version: '1.2.0',
              confidence: 0.72,
            },
          ],
        },
      ],
      relationships: [],
      conditions: [],
      opportunities: [],
      actions: [],
      media_results: [],
      evidence_refs: [
        {
          evidence_id: `ev-top-${envelopeId}`,
          message_id: 'msg-01',
          conversation_id: conversationId,
          exact_quote: 'vamos fechar em R$ 5.000,00',
          char_start: 0,
          char_end: 26,
          timestamp: '2026-10-21T10:00:00Z',
          extractor_type: 'hybrid',
          parser_version: '1.2.0',
          confidence: 0.88,
        },
      ],
      review_items: [
        {
          review_id: `rev-${envelopeId}`,
          reason: 'Ambiguous pricing condition',
          severity: 'high',
          target_id: `val-${envelopeId}`,
          evidence_refs: [
            {
              evidence_id: `ev-val-${envelopeId}`,
              message_id: 'msg-01',
              conversation_id: conversationId,
              exact_quote: 'R$ 5.000,00',
              char_start: 10,
              char_end: 21,
              timestamp: '2026-10-21T10:00:00Z',
              extractor_type: 'hybrid',
              parser_version: '1.2.0',
              confidence: 0.72,
            },
          ],
        },
      ],
    });

    it('persists extraction_run, evidence_spans and review_queue idempotently', async () => {
      const envelope = makeSampleEnvelope('env-1', 'tenant-org-1', 'conv-100');

      await storage.saveEnvelope(envelope);

      const runs = await storage.getExtractionRuns('tenant-org-1', 'conv-100');
      expect(runs).toHaveLength(1);
      expect(runs[0].envelope_id).toBe('env-1');
      expect(runs[0].domain_key).toBe('sales_core');

      const spans = await storage.getEvidenceSpans('tenant-org-1');
      expect(spans.length).toBeGreaterThanOrEqual(2);
      expect(spans.some((s) => s.exact_quote === 'R$ 5.000,00')).toBe(true);

      const reviews = await storage.getReviewQueue('tenant-org-1');
      expect(reviews).toHaveLength(1);
      expect(reviews[0].review_id).toBe('rev-env-1');
      expect(reviews[0].status).toBe('pending');
      expect(reviews[0].severity).toBe('high');

      // Re-saving the same envelope should NOT duplicate records
      await storage.saveEnvelope(envelope);

      const runsAfter = await storage.getExtractionRuns('tenant-org-1', 'conv-100');
      expect(runsAfter).toHaveLength(1);

      const reviewsAfter = await storage.getReviewQueue('tenant-org-1');
      expect(reviewsAfter).toHaveLength(1);
    });

    it('strictly isolates historical values and records across tenants (E-03-02)', async () => {
      const envTenantA = makeSampleEnvelope('env-A', 'tenant-A', 'conv-common');
      const envTenantB = makeSampleEnvelope('env-B', 'tenant-B', 'conv-common');

      await storage.saveEnvelope(envTenantA);
      await storage.saveEnvelope(envTenantB);

      // getHistoricalValues for tenant-A must never return tenant-B values
      const histA = await storage.getHistoricalValues('tenant-A', 'conv-common');
      expect(histA).toHaveLength(1);
      expect(histA[0].value_id).toBe('val-env-A');

      const histB = await storage.getHistoricalValues('tenant-B', 'conv-common');
      expect(histB).toHaveLength(1);
      expect(histB[0].value_id).toBe('val-env-B');

      // Tenant C with same conversation has zero values
      const histC = await storage.getHistoricalValues('tenant-C', 'conv-common');
      expect(histC).toHaveLength(0);

      // Verify audit tables cross-tenant isolation
      const runsA = await storage.getExtractionRuns('tenant-A');
      expect(runsA.every((r) => r.tenant_id === 'tenant-A')).toBe(true);

      const reviewsB = await storage.getReviewQueue('tenant-B');
      expect(reviewsB.every((r) => r.tenant_id === 'tenant-B')).toBe(true);
    });
  });

  describe('upsertOriginMessage and getOriginMessages', () => {
    it('persists and retrieves origin messages with tenant scoping', async () => {
      await storage.upsertOriginMessage({
        tenant_id: 'tenant-omega',
        provider: 'meta-cloud',
        external_message_id: 'ext-999',
        conversation_id: 'conv-55',
        sender_id: 'user-1',
        direction: 'inbound',
        raw_text: 'Olá mundo',
        normalized_text: 'ola mundo',
      });

      const msgs = await storage.getOriginMessages('tenant-omega', 'conv-55');
      expect(msgs).toHaveLength(1);
      expect(msgs[0].raw_text).toBe('Olá mundo');

      // Different tenant must receive empty array
      const otherMsgs = await storage.getOriginMessages('tenant-diff', 'conv-55');
      expect(otherMsgs).toHaveLength(0);
    });
  });
});
