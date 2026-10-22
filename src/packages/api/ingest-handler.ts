import { z } from 'zod';
import {
  DomainPack,
  StoragePort,
  UniversalInterpretationEnvelope,
  UniversalInterpretationEnvelopeSchema,
  ConversationMessageSchema,
  MediaAttachmentSchema,
} from '../core/types';
import { HybridInterpretationEngine } from '../core/hybrid-engine';
import { SupabaseStoragePort } from '../core/supabase-storage';
import { RealEstateDomainPack } from '../domain-real-estate/opportunity-orchestrator';
import {
  coalesceTurnWindowWithDebounce,
  bindSeededPropertyCandidates,
} from '../domain-real-estate/turn-window-coalescer';
import { SeededPropertyCandidate } from '../domain-real-estate/types';
import {
  dispatchOutboundSuggestions,
  OutboundDispatcherResult,
} from './outbound-dispatcher';

export const IngestWhatsappMessageSchema = z
  .object({
    external_message_id: z.string().min(1, 'external_message_id is required and cannot be empty'),
    message_id: z.string().optional(),
    sender_id: z.string().min(1, 'sender_id is required and cannot be empty'),
    sender_name: z.string().optional(),
    body: z.string().optional(),
    raw_text: z.string().optional(),
    timestamp: z.union([z.string(), z.number()]).optional(),
    direction: z.enum(['inbound', 'outbound']).optional().default('inbound'),
    attachments: z.array(MediaAttachmentSchema).optional().default([]),
  })
  .refine(
    (msg) =>
      (typeof msg.body === 'string' && msg.body.trim().length > 0) ||
      (typeof msg.raw_text === 'string' && msg.raw_text.trim().length > 0) ||
      (Array.isArray(msg.attachments) && msg.attachments.length > 0),
    {
      message: 'Each message must contain non-empty body, raw_text, or attachments',
    }
  );

export type IngestWhatsappMessage = z.infer<typeof IngestWhatsappMessageSchema>;

export const IngestWhatsappPayloadSchema = z.object({
  tenant_id: z
    .string({ required_error: 'tenant_id is required' })
    .trim()
    .min(1, 'tenant_id cannot be empty'),
  provider: z.string().trim().min(1).default('whatsapp'),
  conversation_id: z
    .string({ required_error: 'conversation_id is required' })
    .trim()
    .min(1, 'conversation_id cannot be empty'),
  messages: z
    .array(IngestWhatsappMessageSchema)
    .min(1, 'messages must contain at least one valid message'),
  prior_outbound_message: ConversationMessageSchema.optional(),
  seeded_context: z.record(z.unknown()).optional(),
  domain_key: z.string().optional().default('real_estate'),
  callback_url: z.string().url().optional(),
  callback_token: z.string().optional(),
});

export type IngestWhatsappPayload = z.infer<typeof IngestWhatsappPayloadSchema>;

export interface IngestTurnOptions {
  engine?: HybridInterpretationEngine;
  storage?: StoragePort;
  domainPack?: DomainPack;
  fetchFn?: typeof fetch;
}

export interface IngestTurnResult {
  status: 200 | 201;
  envelope: UniversalInterpretationEnvelope;
  duplicate: boolean;
  outboundResult?: OutboundDispatcherResult;
}

let activeStorageInstance: StoragePort = new SupabaseStoragePort();

export function setDefaultStoragePort(storage: StoragePort): void {
  activeStorageInstance = storage;
}

export function getDefaultStoragePort(): StoragePort {
  return activeStorageInstance;
}

/**
 * Resolves the appropriate domain pack based on domainKey.
 * Defaults to RealEstateDomainPack; falls back gracefully for unknown keys (E-04-03).
 */
export function resolveDomainPack(domainKey?: string): DomainPack {
  if (!domainKey || domainKey === 'real_estate') {
    return new RealEstateDomainPack();
  }
  return new RealEstateDomainPack();
}

/**
 * Reusable WhatsApp webhook turn ingestion pipeline.
 * Performs validation, idempotency checks by (tenant_id, provider, external_message_id),
 * message coalescing, domain pack execution, and storage persistence.
 */
export async function ingestWhatsappTurn(
  rawPayload: unknown,
  options?: IngestTurnOptions
): Promise<IngestTurnResult> {
  const payload = IngestWhatsappPayloadSchema.parse(rawPayload);
  const tenantId = payload.tenant_id;
  const provider = payload.provider;
  const conversationId = payload.conversation_id;

  const storage = options?.storage ?? getDefaultStoragePort();
  const domainPack = options?.domainPack ?? resolveDomainPack(payload.domain_key);

  const inboundMessages = payload.messages.filter(
    (m) => (m.direction ?? 'inbound') === 'inbound'
  );
  const targetMessages = inboundMessages.length > 0 ? inboundMessages : payload.messages;

  // 1. Idempotency verification (E-04-02 / T-04-02)
  const processedStatuses = await Promise.all(
    targetMessages.map((m) =>
      storage.isProcessed(tenantId, provider, m.external_message_id)
    )
  );

  const isDuplicate =
    processedStatuses.length > 0 && processedStatuses.every(Boolean);

  if (isDuplicate) {
    let cachedEnvelope: UniversalInterpretationEnvelope | null = null;

    if (typeof (storage as any).getExtractionRuns === 'function') {
      const runs = await (storage as any).getExtractionRuns(tenantId, conversationId);
      if (runs && runs.length > 0) {
        const latestRun = runs[runs.length - 1];
        if (latestRun?.envelope_payload) {
          cachedEnvelope = {
            ...latestRun.envelope_payload,
            duplicate: true,
          };
        }
      }
    }

    if (!cachedEnvelope) {
      cachedEnvelope = UniversalInterpretationEnvelopeSchema.parse({
        envelope_id: `dup-${conversationId}-${targetMessages[0]?.external_message_id}`,
        tenant_id: tenantId,
        conversation_id: conversationId,
        turn_id: `turn-dup-${targetMessages[0]?.external_message_id}`,
        domain_key: domainPack.domain_key,
        parser_version: domainPack.parser_version,
        duplicate: true,
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
      });
    }

    return {
      status: 200,
      duplicate: true,
      envelope: cachedEnvelope,
    };
  }

  // 2. Coalesce inbound messages into a TurnWindow
  const mappedMessages = payload.messages.map((m) => {
    const rawText = (m.raw_text ?? m.body ?? '').trim();
    return {
      message_id: m.message_id ?? m.external_message_id,
      external_message_id: m.external_message_id,
      tenant_id: tenantId,
      provider,
      conversation_id: conversationId,
      direction: m.direction ?? 'inbound',
      sender_id: m.sender_id,
      sender_name: m.sender_name,
      raw_text: rawText,
      timestamp: m.timestamp,
      attachments: m.attachments ?? [],
    };
  });

  let turnWindow = coalesceTurnWindowWithDebounce(mappedMessages, 120, {
    tenant_id: tenantId,
    provider,
    conversation_id: conversationId,
    prior_outbound_message: payload.prior_outbound_message,
    seeded_context: payload.seeded_context,
  });

  if (
    payload.seeded_context?.seeded_property_candidates &&
    Array.isArray(payload.seeded_context.seeded_property_candidates)
  ) {
    turnWindow = bindSeededPropertyCandidates(
      turnWindow,
      payload.seeded_context.seeded_property_candidates as SeededPropertyCandidate[]
    );
  }

  // 3. Execute semantic interpretation engine
  const engine =
    options?.engine ??
    new HybridInterpretationEngine({
      domainPack,
      storagePort: storage,
    });

  const envelope = await engine.interpretTurnHybrid(turnWindow);

  const duplicate = Boolean(envelope.duplicate);
  const status = duplicate ? 200 : 201;

  let outboundResult: OutboundDispatcherResult | undefined;
  if (status === 201 && !duplicate && payload.callback_url) {
    try {
      outboundResult = await dispatchOutboundSuggestions({
        envelope,
        callbackUrl: payload.callback_url,
        callbackToken: payload.callback_token,
        fetchFn: options?.fetchFn,
      });
    } catch {
      // Outbound dispatch failures must not break the main ingestion response
    }
  }

  return {
    status,
    duplicate,
    envelope,
    ...(outboundResult ? { outboundResult } : {}),
  };
}
