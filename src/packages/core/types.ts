import { z } from 'zod';

export const EpistemicStatusSchema = z.enum([
  'declared',
  'inferred',
  'validated_external',
  'validated_human',
  'superseded',
  'rejected',
]);
export type EpistemicStatus = z.infer<typeof EpistemicStatusSchema>;

export const ExtractorTypeSchema = z.enum(['rule', 'llm', 'hybrid', 'human']);
export type ExtractorType = z.infer<typeof ExtractorTypeSchema>;

export const EvidenceRefSchema = z.object({
  evidence_id: z.string(),
  message_id: z.string(),
  conversation_id: z.string(),
  exact_quote: z.string().min(1),
  char_start: z.number().int().nonnegative().optional(),
  char_end: z.number().int().nonnegative().optional(),
  timestamp: z.string(),
  extractor_type: ExtractorTypeSchema,
  parser_version: z.string(),
  confidence: z.number().min(0).max(1),
  hallucination_detected: z.boolean().optional(),
});
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

export const MediaAttachmentSchema = z.object({
  attachment_id: z.string(),
  mime_type: z.string(),
  media_kind: z.string(),
  caption: z.string().optional(),
  url: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type MediaAttachment = z.infer<typeof MediaAttachmentSchema>;

export const MediaUnderstandingResultSchema = z.object({
  attachment_id: z.string(),
  mime_type: z.string(),
  media_kind: z.string(),
  caption: z.string().optional(),
  extracted_text: z.string().optional(),
  summary: z.string().optional(),
  linked_entity_key: z.string().optional(),
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).default([]),
});
export type MediaUnderstandingResult = z.infer<typeof MediaUnderstandingResultSchema>;

export const ConversationMessageSchema = z.object({
  message_id: z.string(),
  external_message_id: z.string(),
  tenant_id: z.string(),
  provider: z.string(),
  conversation_id: z.string(),
  direction: z.enum(['inbound', 'outbound']),
  sender_id: z.string(),
  sender_name: z.string().optional(),
  raw_text: z.string(),
  normalized_text: z.string(),
  timestamp: z.string(),
  attachments: z.array(MediaAttachmentSchema).default([]),
});
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

export const ParticipantObservationSchema = z.object({
  participant_id: z.string(),
  role_label: z.string(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type ParticipantObservation = z.infer<typeof ParticipantObservationSchema>;

export const IntentObservationSchema = z.object({
  intent_id: z.string(),
  intent_label: z.string(),
  target_entity_key: z.string().optional(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type IntentObservation = z.infer<typeof IntentObservationSchema>;

export const FactObservationSchema = z.object({
  fact_id: z.string(),
  fact_key: z.string(),
  fact_value: z.unknown(),
  target_entity_key: z.string().optional(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type FactObservation = z.infer<typeof FactObservationSchema>;

export const ValueObservationSchema = z.object({
  value_id: z.string(),
  field_key: z.string(),
  amount: z.number(),
  currency: z.string().default('BRL'),
  unit: z.string().optional(),
  raw_expression: z.string(),
  target_entity_key: z.string(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  superseded_by_value_id: z.string().optional(),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type ValueObservation = z.infer<typeof ValueObservationSchema>;

export const RelationshipObservationSchema = z.object({
  relationship_id: z.string(),
  source_participant_id: z.string(),
  target_entity_key: z.string(),
  relation_type: z.string(),
  referred_name: z.string().optional(),
  referred_phone: z.string().optional(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type RelationshipObservation = z.infer<typeof RelationshipObservationSchema>;

export const ConditionObservationSchema = z.object({
  condition_id: z.string(),
  condition_type: z.string(),
  source_opportunity_id: z.string().optional(),
  prerequisite_opportunity_id: z.string().optional(),
  description: z.string(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type ConditionObservation = z.infer<typeof ConditionObservationSchema>;

export const OpportunityAssessmentSchema = z.object({
  opportunity_id: z.string(),
  opportunity_type: z.string(),
  entity_key: z.string(),
  stage: z.enum(['detected', 'qualified', 'conditional', 'nurture', 'closed_lost']),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  linked_condition_ids: z.array(z.string()).default([]),
  attributes: z.record(z.unknown()).default({}),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type OpportunityAssessment = z.infer<typeof OpportunityAssessmentSchema>;

export const ActionRecommendationSchema = z.object({
  action_id: z.string(),
  action_type: z.string(),
  target_entity_key: z.string().optional(),
  target_opportunity_id: z.string().optional(),
  execution_mode: z.enum(['auto', 'assist', 'manual']),
  requires_human_approval: z.boolean(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  payload: z.record(z.unknown()).default({}),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type ActionRecommendation = z.infer<typeof ActionRecommendationSchema>;

export const ReviewItemSchema = z.object({
  review_id: z.string(),
  reason: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  target_id: z.string(),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

export const TurnWindowSchema = z.object({
  turn_id: z.string(),
  tenant_id: z.string(),
  provider: z.string(),
  conversation_id: z.string(),
  messages: z.array(ConversationMessageSchema).min(1),
  prior_outbound_message: ConversationMessageSchema.optional(),
  consolidated_text: z.string(),
  seeded_context: z.record(z.unknown()).optional(),
  existing_values: z.array(ValueObservationSchema).optional(),
});
export type TurnWindow = z.infer<typeof TurnWindowSchema>;

export const UniversalInterpretationEnvelopeSchema = z.object({
  envelope_id: z.string(),
  tenant_id: z.string(),
  conversation_id: z.string(),
  turn_id: z.string(),
  domain_key: z.string(),
  parser_version: z.string(),
  extractor_type: ExtractorTypeSchema.optional(),
  llm_invoked: z.boolean().optional(),
  llm_error: z.boolean().optional(),
  duplicate: z.boolean().default(false),
  review_required: z.boolean().default(false),
  do_not_contact: z.boolean().default(false),
  participants: z.array(ParticipantObservationSchema).default([]),
  intents: z.array(IntentObservationSchema).default([]),
  facts: z.array(FactObservationSchema).default([]),
  values: z.array(ValueObservationSchema).default([]),
  relationships: z.array(RelationshipObservationSchema).default([]),
  conditions: z.array(ConditionObservationSchema).default([]),
  opportunities: z.array(OpportunityAssessmentSchema).default([]),
  actions: z.array(ActionRecommendationSchema).default([]),
  media_results: z.array(MediaUnderstandingResultSchema).default([]),
  evidence_refs: z.array(EvidenceRefSchema).default([]),
  review_items: z.array(ReviewItemSchema).default([]),
  domain_entities: z.unknown().optional(),
});
export type UniversalInterpretationEnvelope = z.infer<typeof UniversalInterpretationEnvelopeSchema>;

export interface DomainInterpretationResult<TDomainEntities = unknown> {
  participants: ParticipantObservation[];
  intents: IntentObservation[];
  facts: FactObservation[];
  values: ValueObservation[];
  relationships: RelationshipObservation[];
  conditions: ConditionObservation[];
  opportunities: OpportunityAssessment[];
  actions: ActionRecommendation[];
  media_results: MediaUnderstandingResult[];
  evidence_refs: EvidenceRef[];
  review_items: ReviewItem[];
  do_not_contact?: boolean;
  domain_entities?: TDomainEntities;
}

export interface DomainPack<TDomainEntities = unknown> {
  readonly domain_key: string;
  readonly parser_version: string;
  interpretTurnWindow(turnWindow: TurnWindow): Promise<DomainInterpretationResult<TDomainEntities>>;
}

export interface CRMProposal {
  entity_type: string;
  action: string;
  record_id?: string;
  payload: Record<string, unknown>;
}

export interface CRMAdapterResult {
  applied_count: number;
  rejected_count: number;
  errors?: string[];
}

export interface CRMAdapter<TProposal extends CRMProposal = CRMProposal> {
  readonly adapter_id: string;
  translateEnvelope(envelope: UniversalInterpretationEnvelope): TProposal[];
  applyProposals(proposals: TProposal[]): Promise<CRMAdapterResult>;
}

export interface StoragePort {
  isProcessed(tenantId: string, provider: string, externalMessageId: string): Promise<boolean>;
  markProcessed(tenantId: string, provider: string, externalMessageId: string): Promise<void>;
  saveEnvelope(envelope: UniversalInterpretationEnvelope): Promise<void>;
  getHistoricalValues(tenantId: string, conversationId: string): Promise<ValueObservation[]>;
}

export interface LLMExtractionRequest<T = unknown> {
  systemPrompt?: string;
  prompt: string;
  schema?: z.ZodType<T> | Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMExtractionResponse<T = unknown> {
  data: T;
  rawText?: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  readonly name: string;
  extractStructured<T>(req: LLMExtractionRequest<T>): Promise<LLMExtractionResponse<T>>;
}

export interface QuoteValidationResult {
  quote: string;
  valid: boolean;
  normalized_quote: string;
  char_start?: number;
  char_end?: number;
  hallucination_detected?: boolean;
}

export interface HybridRouterOptions {
  minStage1Confidence?: number;
  forceStage2?: boolean;
  skipStage2?: boolean;
}

