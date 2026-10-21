import { describe, test, expect, beforeEach } from 'vitest';
import {
  ingestWhatsappTurn,
  IngestWhatsappPayloadSchema,
  resolveDomainPack,
  setDefaultStoragePort,
  getDefaultStoragePort,
} from '../../src/packages/api/ingest-handler';
import { SupabaseStoragePort, InMemorySupabaseTableClient } from '../../src/packages/core/supabase-storage';
import { RealEstateDomainPack } from '../../src/packages/domain-real-estate/opportunity-orchestrator';

describe('WhatsApp Ingest Pipeline (API-01)', () => {
  let inMemoryClient: InMemorySupabaseTableClient;
  let storage: SupabaseStoragePort;

  beforeEach(() => {
    inMemoryClient = new InMemorySupabaseTableClient();
    storage = new SupabaseStoragePort(inMemoryClient);
    setDefaultStoragePort(storage);
  });

  describe('Validation & Tenant Isolation (E-04-01)', () => {
    test('rejects payload with missing tenant_id', async () => {
      const invalidPayload = {
        provider: 'whatsapp',
        conversation_id: 'conv-123',
        messages: [
          {
            external_message_id: 'msg-001',
            sender_id: '5511999999999',
            body: 'Quero vender meu apartamento',
          },
        ],
      };

      await expect(ingestWhatsappTurn(invalidPayload as any, { storage })).rejects.toThrow();
    });

    test('rejects payload with empty string tenant_id', async () => {
      const emptyTenantPayload = {
        tenant_id: '   ',
        provider: 'whatsapp',
        conversation_id: 'conv-123',
        messages: [
          {
            external_message_id: 'msg-001',
            sender_id: '5511999999999',
            body: 'Quero vender meu apartamento',
          },
        ],
      };

      await expect(ingestWhatsappTurn(emptyTenantPayload, { storage })).rejects.toThrow();
    });

    test('rejects malformed messages payload (empty array or missing required fields)', async () => {
      const emptyMessagesPayload = {
        tenant_id: 'tenant-demo',
        provider: 'whatsapp',
        conversation_id: 'conv-123',
        messages: [],
      };
      await expect(ingestWhatsappTurn(emptyMessagesPayload, { storage })).rejects.toThrow();

      const missingBodyPayload = {
        tenant_id: 'tenant-demo',
        provider: 'whatsapp',
        conversation_id: 'conv-123',
        messages: [
          {
            external_message_id: 'msg-002',
            sender_id: '5511999999999',
          },
        ],
      };
      await expect(ingestWhatsappTurn(missingBodyPayload as any, { storage })).rejects.toThrow();

      const missingIdPayload = {
        tenant_id: 'tenant-demo',
        provider: 'whatsapp',
        conversation_id: 'conv-123',
        messages: [
          {
            sender_id: '5511999999999',
            body: 'Olá',
          },
        ],
      };
      await expect(ingestWhatsappTurn(missingIdPayload as any, { storage })).rejects.toThrow();
    });
  });

  describe('Turn Ingestion & Domain Interpretation (API-01)', () => {
    test('successfully ingests single inbound message returning UniversalInterpretationEnvelope with 201', async () => {
      const payload = {
        tenant_id: 'tenant-real-estate-1',
        provider: 'whatsapp',
        conversation_id: 'conv-single-001',
        messages: [
          {
            external_message_id: 'wamid-001',
            sender_id: '5511988887777',
            sender_name: 'Carlos Oliveira',
            body: 'Sou o dono sim, estou vendendo por 1,2 milhão.',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const result = await ingestWhatsappTurn(payload, { storage });

      expect(result.status).toBe(201);
      expect(result.duplicate).toBe(false);
      expect(result.envelope).toBeDefined();
      expect(result.envelope.tenant_id).toBe('tenant-real-estate-1');
      expect(result.envelope.conversation_id).toBe('conv-single-001');
      expect(result.envelope.domain_key).toBe('real_estate');

      // Domain expectations for real estate sale
      expect(result.envelope.participants.some((p) => p.role_label === 'owner')).toBe(true);
      expect(result.envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);
      expect(result.envelope.values.some((v) => v.amount === 1200000)).toBe(true);
      expect(result.envelope.opportunities.some((o) => o.opportunity_type === 'real_estate.capture_sale')).toBe(true);
    });

    test('coalesces multiple rapid messages into a single coherent turn', async () => {
      const now = Date.now();
      const payload = {
        tenant_id: 'tenant-coalesce-1',
        provider: 'whatsapp',
        conversation_id: 'conv-multi-002',
        messages: [
          {
            external_message_id: 'wamid-multi-1',
            sender_id: '5511977776666',
            body: 'Boa tarde',
            timestamp: new Date(now).toISOString(),
          },
          {
            external_message_id: 'wamid-multi-2',
            sender_id: '5511977776666',
            body: 'Sou o proprietário',
            timestamp: new Date(now + 2000).toISOString(),
          },
          {
            external_message_id: 'wamid-multi-3',
            sender_id: '5511977776666',
            body: 'Quero alugar por 4.500, condomínio 900 e IPTU 250',
            timestamp: new Date(now + 5000).toISOString(),
          },
        ],
      };

      const result = await ingestWhatsappTurn(payload, { storage });

      expect(result.status).toBe(201);
      expect(result.duplicate).toBe(false);
      expect(result.envelope.participants.some((p) => p.role_label === 'owner')).toBe(true);
      expect(result.envelope.intents.some((i) => i.intent_label === 'intent.capture_for_rent')).toBe(true);
      expect(result.envelope.values.some((v) => v.field_key === 'rent_asking_price' && v.amount === 4500)).toBe(true);
      expect(result.envelope.values.some((v) => v.field_key === 'condo_fee' && v.amount === 900)).toBe(true);
      expect(result.envelope.values.some((v) => v.field_key === 'iptu_amount' && v.amount === 250)).toBe(true);
    });

    test('enriches TurnWindow with outbound campaign seeded context', async () => {
      const payload = {
        tenant_id: 'tenant-seeded-1',
        provider: 'whatsapp',
        conversation_id: 'conv-seed-003',
        messages: [
          {
            external_message_id: 'wamid-seed-001',
            sender_id: '5511966665555',
            body: 'Sim, aceito vender!',
            timestamp: new Date().toISOString(),
          },
        ],
        seeded_context: {
          seeded_property_candidates: [
            {
              property_key: 'property_primary',
              address_line: 'Rua Oscar Freire, 1000 - Apto 42',
              expected_price: 1500000,
              listing_type: 'sale',
              outbound_message_text: 'Olá Carlos, temos compradores para o seu imóvel na Rua Oscar Freire. Tem interesse em vender?',
            },
          ],
        },
      };

      const result = await ingestWhatsappTurn(payload, { storage });

      expect(result.status).toBe(201);
      const domainEntities = result.envelope.domain_entities as any;
      expect(domainEntities?.property_candidates?.[0]?.label).toContain('Rua Oscar Freire');
      expect(domainEntities?.property_candidates?.[0]?.sale_asking_price).toBe(1500000);
    });
  });

  describe('Strict Idempotency Guard (E-04-02)', () => {
    test('submitting identical webhook payload returns HTTP 200 with duplicate: true and cached envelope', async () => {
      const payload = {
        tenant_id: 'tenant-idemp-1',
        provider: 'whatsapp',
        conversation_id: 'conv-idemp-004',
        messages: [
          {
            external_message_id: 'wamid-idemp-001',
            sender_id: '5511955554444',
            body: 'Estou vendendo por 950 mil ou locação por 4.200.',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // 1. Initial turn ingestion -> 201 created
      const firstResult = await ingestWhatsappTurn(payload, { storage });
      expect(firstResult.status).toBe(201);
      expect(firstResult.duplicate).toBe(false);
      expect(firstResult.envelope.envelope_id).toBeDefined();

      // 2. Duplicate submission -> 200 OK, duplicate: true, cached envelope
      const secondResult = await ingestWhatsappTurn(payload, { storage });
      expect(secondResult.status).toBe(200);
      expect(secondResult.duplicate).toBe(true);
      expect(secondResult.envelope.duplicate).toBe(true);
      expect(secondResult.envelope.tenant_id).toBe('tenant-idemp-1');
      expect(secondResult.envelope.conversation_id).toBe('conv-idemp-004');
      expect(secondResult.envelope.envelope_id).toBe(firstResult.envelope.envelope_id);

      // Verify no extra extraction runs or processed markers were created
      const runs = await storage.getExtractionRuns('tenant-idemp-1', 'conv-idemp-004');
      expect(runs).toHaveLength(1);
    });
  });

  describe('Domain Pack Resolution (E-04-03)', () => {
    test('resolves real_estate pack by default or explicitly', () => {
      const defaultPack = resolveDomainPack();
      expect(defaultPack).toBeInstanceOf(RealEstateDomainPack);
      expect(defaultPack.domain_key).toBe('real_estate');

      const explicitPack = resolveDomainPack('real_estate');
      expect(explicitPack).toBeInstanceOf(RealEstateDomainPack);
      expect(explicitPack.domain_key).toBe('real_estate');
    });

    test('falls back gracefully to real_estate for unknown domain key', () => {
      const fallbackPack = resolveDomainPack('unknown_vertical');
      expect(fallbackPack).toBeInstanceOf(RealEstateDomainPack);
      expect(fallbackPack.domain_key).toBe('real_estate');
    });
  });
});
