import { z } from 'zod';
import {
  EvidenceRef,
  EvidenceRefSchema,
  UniversalInterpretationEnvelope,
} from './types';
import {
  SupabaseStoragePort,
  assertTenantScope,
  ReviewQueueRecord,
} from './supabase-storage';
import { validateExactQuote } from './quote-validator';

export const ReviewQueueRecordSchema = z.object({
  id: z.string().optional(),
  review_id: z.string(),
  workspace_id: z.string().optional(),
  tenant_id: z.string(),
  conversation_id: z.string(),
  extraction_run_id: z.string().optional(),
  origin_message_id: z.string().optional(),
  target_id: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  reason: z.string(),
  status: z.enum(['pending', 'approved', 'edited', 'rejected']),
  original_payload: z.record(z.unknown()),
  resolved_payload: z.record(z.unknown()).optional(),
  evidence_refs: z.array(EvidenceRefSchema).default([]),
  reviewer_id: z.string().optional(),
  reviewer_notes: z.string().optional(),
  resolved_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const ReviewResolutionInputSchema = z.object({
  decision: z.enum(['approve', 'edit', 'reject']),
  reviewer_id: z.string().min(1),
  reviewer_notes: z.string().optional(),
  resolved_payload: z.record(z.unknown()).optional(),
});
export type ReviewResolutionInput = z.infer<typeof ReviewResolutionInputSchema>;

export interface ShowInConversationLinkResult {
  conversation_id: string;
  message_id: string;
  anchor_href: string;
  exact_quote: string;
  char_start: number;
  char_end: number;
  before_text: string;
  highlighted_text: string;
  after_text: string;
}

export function buildShowInConversationLink(
  evidence: {
    conversation_id: string;
    message_id: string;
    exact_quote: string;
    char_start?: number;
    char_end?: number;
  },
  messageBody: string
): ShowInConversationLinkResult {
  const quote = evidence.exact_quote || '';
  const conversation_id = evidence.conversation_id;
  const message_id = evidence.message_id;
  const anchorId = message_id.startsWith('msg_')
    ? message_id
    : message_id.startsWith('msg-')
    ? `msg_${message_id.slice(4)}`
    : `msg_${message_id}`;
  const anchor_href = `/conversations/${conversation_id}?anchor=${anchorId}`;

  let char_start = evidence.char_start;
  let char_end = evidence.char_end;

  const hasValidOffsets =
    typeof char_start === 'number' &&
    typeof char_end === 'number' &&
    char_start >= 0 &&
    char_end <= messageBody.length &&
    char_start <= char_end &&
    messageBody.slice(char_start, char_end) === quote;

  if (!hasValidOffsets) {
    const validation = validateExactQuote(messageBody, quote);
    if (validation.valid && validation.char_start !== undefined && validation.char_end !== undefined) {
      char_start = validation.char_start;
      char_end = validation.char_end;
    } else {
      const directIdx = messageBody.indexOf(quote);
      if (directIdx !== -1 && quote.length > 0) {
        char_start = directIdx;
        char_end = directIdx + quote.length;
      } else {
        char_start = 0;
        char_end = 0;
      }
    }
  }

  const validStart = char_start ?? 0;
  const validEnd = char_end ?? 0;

  const before_text = messageBody.slice(0, validStart);
  const highlighted_text = messageBody.slice(validStart, validEnd);
  const after_text = messageBody.slice(validEnd);

  return {
    conversation_id,
    message_id,
    anchor_href,
    exact_quote: quote,
    char_start: validStart,
    char_end: validEnd,
    before_text,
    highlighted_text,
    after_text,
  };
}

export interface ListReviewsFilter {
  tenantId: string;
  status?: 'pending' | 'approved' | 'edited' | 'rejected';
  severity?: 'low' | 'medium' | 'high';
  conversation_id?: string;
  conversationId?: string;
}

export interface ListReviewsOptions {
  status?: 'pending' | 'approved' | 'edited' | 'rejected';
  severity?: 'low' | 'medium' | 'high';
  conversation_id?: string;
  conversationId?: string;
}

export class ReviewInboxService {
  private readonly storage: SupabaseStoragePort;

  constructor(storage?: SupabaseStoragePort) {
    this.storage = storage ?? new SupabaseStoragePort();
  }

  public async enqueueFromEnvelope(
    envelope: UniversalInterpretationEnvelope
  ): Promise<ReviewQueueRecord[]> {
    const tenantId = assertTenantScope(envelope.tenant_id);
    await this.storage.saveEnvelope(envelope);
    const all = await this.storage.getReviewQueue(tenantId);
    return all.filter((item) =>
      envelope.review_items?.some((r) => r.review_id === item.review_id)
    );
  }

  public async listReviews(
    filterOrTenant: string | ListReviewsFilter,
    options?: ListReviewsOptions
  ): Promise<ReviewQueueRecord[]> {
    const tenantId = assertTenantScope(
      typeof filterOrTenant === 'string' ? filterOrTenant : filterOrTenant.tenantId
    );
    const filterStatus =
      typeof filterOrTenant === 'object' ? filterOrTenant.status : options?.status;
    const filterSeverity =
      typeof filterOrTenant === 'object' ? filterOrTenant.severity : options?.severity;
    const filterConv =
      typeof filterOrTenant === 'object'
        ? filterOrTenant.conversation_id || filterOrTenant.conversationId
        : options?.conversation_id || options?.conversationId;

    const all = await this.storage.getReviewQueue(tenantId, filterStatus);

    return all.filter((item) => {
      if (filterSeverity && item.severity !== filterSeverity) return false;
      if (filterConv && item.conversation_id !== filterConv) return false;
      return true;
    });
  }

  public async listPendingReviews(
    tenantId: string,
    options?: ListReviewsOptions
  ): Promise<ReviewQueueRecord[]> {
    return this.listReviews(tenantId, { ...options, status: 'pending' });
  }

  public async getReviewItem(
    tenantId: string,
    reviewId: string
  ): Promise<ReviewQueueRecord | null> {
    const validTenant = assertTenantScope(tenantId);
    return this.storage.getReviewItem(validTenant, reviewId);
  }

  public async resolveReviewItem(
    tenantId: string,
    reviewId: string,
    input: ReviewResolutionInput
  ): Promise<ReviewQueueRecord> {
    const validTenant = assertTenantScope(tenantId);
    const validatedInput = ReviewResolutionInputSchema.parse(input);

    const existing = await this.getReviewItem(validTenant, reviewId);
    if (!existing) {
      throw new Error(`Review item not found: ${reviewId} for tenant: ${validTenant}`);
    }

    const now = new Date().toISOString();
    let updatedStatus: 'approved' | 'edited' | 'rejected' = 'approved';
    let resolvedPayload: Record<string, unknown> = {};

    if (validatedInput.decision === 'approve') {
      updatedStatus = 'approved';
      resolvedPayload = {
        ...(existing.resolved_payload || existing.original_payload),
        ...(validatedInput.resolved_payload || {}),
        epistemic_status: 'validated_human',
      };
    } else if (validatedInput.decision === 'edit') {
      updatedStatus = 'edited';
      resolvedPayload = {
        ...(existing.resolved_payload || existing.original_payload),
        ...(validatedInput.resolved_payload || {}),
        epistemic_status: 'validated_human',
        prior_epistemic_status: 'superseded',
      };
    } else if (validatedInput.decision === 'reject') {
      updatedStatus = 'rejected';
      resolvedPayload = {
        ...(validatedInput.resolved_payload || {}),
        epistemic_status: 'rejected',
      };
    }

    const updatedRecord: ReviewQueueRecord = {
      ...existing,
      status: updatedStatus,
      original_payload: existing.original_payload,
      resolved_payload: resolvedPayload,
      reviewer_id: validatedInput.reviewer_id,
      reviewer_notes: validatedInput.reviewer_notes,
      resolved_at: now,
      updated_at: now,
    };

    await this.storage.updateReviewItem(validTenant, updatedRecord);
    return updatedRecord;
  }
}
