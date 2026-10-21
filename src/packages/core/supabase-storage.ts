import {
  StoragePort,
  UniversalInterpretationEnvelope,
  ValueObservation,
  EvidenceRef,
} from './types';

export function assertTenantScope(tenantId: string): string {
  if (typeof tenantId !== 'string' || !tenantId.trim()) {
    throw new Error('Invalid tenant scope: tenantId is required and cannot be empty.');
  }
  return tenantId.trim();
}

export interface OriginMessageRecord {
  id?: string;
  workspace_id?: string;
  tenant_id: string;
  provider: string;
  external_message_id: string;
  conversation_id: string;
  sender_id: string;
  direction: 'inbound' | 'outbound';
  raw_text: string;
  normalized_text: string;
  metadata?: Record<string, unknown>;
  sent_at?: string;
  created_at?: string;
}

export interface ExtractionRunRecord {
  id?: string;
  envelope_id: string;
  workspace_id?: string;
  tenant_id: string;
  conversation_id: string;
  turn_id: string;
  domain_key: string;
  parser_version: string;
  extractor_type: string;
  llm_invoked: boolean;
  llm_error: boolean;
  review_required: boolean;
  envelope_payload: UniversalInterpretationEnvelope;
  created_at?: string;
}

export interface EvidenceSpanRecord {
  id?: string;
  workspace_id?: string;
  tenant_id: string;
  extraction_run_id?: string;
  origin_message_id?: string;
  external_message_id: string;
  target_id: string;
  exact_quote: string;
  char_start?: number;
  char_end?: number;
  epistemic_status: string;
  confidence: number;
  hallucination_detected?: boolean;
  created_at?: string;
}

export interface ReviewQueueRecord {
  id?: string;
  review_id: string;
  workspace_id?: string;
  tenant_id: string;
  conversation_id: string;
  extraction_run_id?: string;
  origin_message_id?: string;
  target_id: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  status: 'pending' | 'approved' | 'edited' | 'rejected';
  original_payload: Record<string, unknown>;
  resolved_payload?: Record<string, unknown>;
  evidence_refs: EvidenceRef[];
  reviewer_id?: string;
  reviewer_notes?: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class InMemorySupabaseTableClient {
  public originMessages = new Map<string, OriginMessageRecord>();
  public extractionRuns = new Map<string, ExtractionRunRecord>();
  public evidenceSpans = new Map<string, EvidenceSpanRecord>();
  public reviewQueue = new Map<string, ReviewQueueRecord>();
  public processedEvents = new Set<string>();

  public clear(): void {
    this.originMessages.clear();
    this.extractionRuns.clear();
    this.evidenceSpans.clear();
    this.reviewQueue.clear();
    this.processedEvents.clear();
  }
}

export class SupabaseStoragePort implements StoragePort {
  private readonly client: InMemorySupabaseTableClient;

  constructor(client?: InMemorySupabaseTableClient) {
    this.client = client ?? new InMemorySupabaseTableClient();
  }

  public async isProcessed(tenantId: string, provider: string, externalMessageId: string): Promise<boolean> {
    const validTenant = assertTenantScope(tenantId);
    const key = `${validTenant}:${provider}:${externalMessageId}`;
    return this.client.processedEvents.has(key);
  }

  public async markProcessed(tenantId: string, provider: string, externalMessageId: string): Promise<void> {
    const validTenant = assertTenantScope(tenantId);
    const key = `${validTenant}:${provider}:${externalMessageId}`;
    this.client.processedEvents.add(key);
  }

  public async saveEnvelope(envelope: UniversalInterpretationEnvelope): Promise<void> {
    const validTenant = assertTenantScope(envelope.tenant_id);

    // 1. Extraction run audit persistence (idempotent by envelope_id)
    const runKey = `${validTenant}:${envelope.envelope_id}`;
    if (!this.client.extractionRuns.has(runKey)) {
      this.client.extractionRuns.set(runKey, {
        envelope_id: envelope.envelope_id,
        tenant_id: validTenant,
        conversation_id: envelope.conversation_id,
        turn_id: envelope.turn_id,
        domain_key: envelope.domain_key,
        parser_version: envelope.parser_version,
        extractor_type: envelope.extractor_type ?? 'rule',
        llm_invoked: Boolean(envelope.llm_invoked),
        llm_error: Boolean(envelope.llm_error),
        review_required: Boolean(envelope.review_required),
        envelope_payload: envelope,
        created_at: new Date().toISOString(),
      });
    }

    // 2. Fine-grained evidence spans persistence
    const collectedEvidences: Array<{ targetId: string; evidence: EvidenceRef }> = [];

    for (const ev of envelope.evidence_refs || []) {
      collectedEvidences.push({ targetId: envelope.envelope_id, evidence: ev });
    }
    for (const p of envelope.participants || []) {
      for (const ev of p.evidence_refs || []) collectedEvidences.push({ targetId: p.participant_id, evidence: ev });
    }
    for (const i of envelope.intents || []) {
      for (const ev of i.evidence_refs || []) collectedEvidences.push({ targetId: i.intent_id, evidence: ev });
    }
    for (const f of envelope.facts || []) {
      for (const ev of f.evidence_refs || []) collectedEvidences.push({ targetId: f.fact_id, evidence: ev });
    }
    for (const v of envelope.values || []) {
      for (const ev of v.evidence_refs || []) collectedEvidences.push({ targetId: v.value_id, evidence: ev });
    }
    for (const o of envelope.opportunities || []) {
      for (const ev of o.evidence_refs || []) collectedEvidences.push({ targetId: o.opportunity_id, evidence: ev });
    }
    for (const a of envelope.actions || []) {
      for (const ev of a.evidence_refs || []) collectedEvidences.push({ targetId: a.action_id, evidence: ev });
    }
    for (const r of envelope.review_items || []) {
      for (const ev of r.evidence_refs || []) collectedEvidences.push({ targetId: r.review_id, evidence: ev });
    }

    for (const { targetId, evidence } of collectedEvidences) {
      const spanKey = `${validTenant}:${envelope.envelope_id}:${evidence.evidence_id}:${targetId}`;
      if (!this.client.evidenceSpans.has(spanKey)) {
        this.client.evidenceSpans.set(spanKey, {
          tenant_id: validTenant,
          external_message_id: evidence.message_id,
          target_id: targetId,
          exact_quote: evidence.exact_quote,
          char_start: evidence.char_start,
          char_end: evidence.char_end,
          epistemic_status: 'inferred',
          confidence: evidence.confidence,
          hallucination_detected: evidence.hallucination_detected ?? false,
          created_at: evidence.timestamp || new Date().toISOString(),
        });
      }
    }

    // 3. Review queue items enqueueing (idempotent by tenant_id + review_id)
    for (const item of envelope.review_items || []) {
      const reviewKey = `${validTenant}:${item.review_id}`;
      if (!this.client.reviewQueue.has(reviewKey)) {
        this.client.reviewQueue.set(reviewKey, {
          review_id: item.review_id,
          tenant_id: validTenant,
          conversation_id: envelope.conversation_id,
          target_id: item.target_id,
          severity: item.severity,
          reason: item.reason,
          status: 'pending',
          original_payload: {
            envelope_id: envelope.envelope_id,
            target_id: item.target_id,
            reason: item.reason,
          },
          evidence_refs: item.evidence_refs,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  public async getHistoricalValues(tenantId: string, conversationId: string): Promise<ValueObservation[]> {
    const validTenant = assertTenantScope(tenantId);
    const historicalValues: ValueObservation[] = [];

    for (const run of this.client.extractionRuns.values()) {
      if (run.tenant_id === validTenant && run.conversation_id === conversationId) {
        if (run.envelope_payload.values && Array.isArray(run.envelope_payload.values)) {
          historicalValues.push(...run.envelope_payload.values);
        }
      }
    }

    return historicalValues;
  }

  public async getExtractionRuns(tenantId: string, conversationId?: string): Promise<ExtractionRunRecord[]> {
    const validTenant = assertTenantScope(tenantId);
    const runs: ExtractionRunRecord[] = [];

    for (const run of this.client.extractionRuns.values()) {
      if (run.tenant_id === validTenant) {
        if (!conversationId || run.conversation_id === conversationId) {
          runs.push(run);
        }
      }
    }

    return runs;
  }

  public async getEvidenceSpans(tenantId: string, targetId?: string): Promise<EvidenceSpanRecord[]> {
    const validTenant = assertTenantScope(tenantId);
    const spans: EvidenceSpanRecord[] = [];

    for (const span of this.client.evidenceSpans.values()) {
      if (span.tenant_id === validTenant) {
        if (!targetId || span.target_id === targetId) {
          spans.push(span);
        }
      }
    }

    return spans;
  }

  public async getReviewQueue(tenantId: string, status?: string): Promise<ReviewQueueRecord[]> {
    const validTenant = assertTenantScope(tenantId);
    const items: ReviewQueueRecord[] = [];

    for (const item of this.client.reviewQueue.values()) {
      if (item.tenant_id === validTenant) {
        if (!status || item.status === status) {
          items.push(item);
        }
      }
    }

    return items;
  }

  public async getReviewItem(tenantId: string, reviewId: string): Promise<ReviewQueueRecord | null> {
    const validTenant = assertTenantScope(tenantId);
    const key = `${validTenant}:${reviewId}`;
    return this.client.reviewQueue.get(key) || null;
  }

  public async updateReviewItem(tenantId: string, item: ReviewQueueRecord): Promise<void> {
    const validTenant = assertTenantScope(tenantId);
    const key = `${validTenant}:${item.review_id}`;
    this.client.reviewQueue.set(key, {
      ...item,
      tenant_id: validTenant,
      updated_at: new Date().toISOString(),
    });
  }

  public async upsertOriginMessage(record: OriginMessageRecord): Promise<void> {
    const validTenant = assertTenantScope(record.tenant_id);
    const key = `${validTenant}:${record.provider}:${record.external_message_id}`;
    this.client.originMessages.set(key, {
      ...record,
      tenant_id: validTenant,
      created_at: record.created_at || new Date().toISOString(),
    });
  }

  public async getOriginMessages(tenantId: string, conversationId?: string): Promise<OriginMessageRecord[]> {
    const validTenant = assertTenantScope(tenantId);
    const messages: OriginMessageRecord[] = [];

    for (const msg of this.client.originMessages.values()) {
      if (msg.tenant_id === validTenant) {
        if (!conversationId || msg.conversation_id === conversationId) {
          messages.push(msg);
        }
      }
    }

    return messages;
  }
}
