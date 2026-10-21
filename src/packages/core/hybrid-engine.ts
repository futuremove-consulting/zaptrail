import {
  DomainPack, StoragePort, TurnWindow, UniversalInterpretationEnvelope,
  UniversalInterpretationEnvelopeSchema, ReviewItem, LLMProvider,
  LLMExtractionRequest, HybridRouterOptions, EvidenceRef, EpistemicStatus,
  ParticipantObservation, IntentObservation, FactObservation, ValueObservation,
  RelationshipObservation, ConditionObservation, OpportunityAssessment,
  ActionRecommendation,
} from './types';
import { UniversalInterpretationEngine } from './engine';
import { sanitizeEvidenceRefWithQuoteCheck } from './quote-validator';

/**
 * Deterministically evaluates if Stage 2 (LLM structured extraction) should be triggered.
 *
 * Fast path (returns false):
 * - Turn was already marked duplicate
 * - Contact indicated do_not_contact or opt-out
 * - Envelope resolved decisively with high confidence (>= 0.85) and known role
 * - options.skipStage2 is true
 *
 * Trigger (returns true):
 * - Any intent is intent.ambiguous_or_open
 * - Role is unknown or participants empty
 * - Any key observation has confidence < 0.85
 * - options.forceStage2 is true
 */
export function shouldTriggerStage2(
  envelope: UniversalInterpretationEnvelope,
  options?: HybridRouterOptions
): boolean {
  if (options?.skipStage2) return false;
  if (options?.forceStage2) return true;
  if (envelope.duplicate) return false;

  const minConfidence = options?.minStage1Confidence ?? 0.85;

  // 1. Decisive opt-out or suppress commercial contact
  if (envelope.do_not_contact) return false;
  if (envelope.intents.some((i) => i.intent_label.includes('do_not_contact'))) {
    return false;
  }

  // 2. Explicit contradiction or review required from Stage 1 triggers Stage 2
  if (envelope.review_required || envelope.review_items.length > 0) {
    return true;
  }

  // 3. Pure negative or noise: ALL intents must be negative/noise with high confidence
  const isNegativeOrNoise = (label: string) =>
    label === 'intent.not_interested_general' ||
    label === 'intent.not_interested_property' ||
    label === 'intent.noise_or_ack';

  const allIntentsAreNegativeOrNoise =
    envelope.intents.length > 0 &&
    envelope.intents.every((i) => isNegativeOrNoise(i.intent_label));

  if (allIntentsAreNegativeOrNoise) {
    const hasHighConfidence = envelope.intents.some((i) => i.confidence >= minConfidence);
    if (hasHighConfidence) return false;
  }

  // 4. Positive triggers for Stage 2
  // a) Explicit ambiguous intent
  if (envelope.intents.some((i) => i.intent_label === 'intent.ambiguous_or_open')) {
    return true;
  }

  // b) Unknown role or no participant detected (when not pure negative/noise)
  if (
    envelope.participants.length === 0 ||
    envelope.participants.some((p) => p.role_label === 'unknown')
  ) {
    return true;
  }

  // c) Low confidence in any observation
  if (envelope.intents.length === 0) return true;
  if (envelope.intents.some((i) => i.confidence < minConfidence)) return true;
  if (envelope.participants.some((p) => p.confidence < minConfidence)) return true;
  if (envelope.values.some((v) => v.confidence < minConfidence)) return true;
  if (envelope.opportunities.some((o) => o.confidence < minConfidence)) return true;

  // 5. Decisive high-confidence resolution across all observations
  return false;
}

export interface HybridEngineConfig<TDomainEntities = unknown> {
  engine?: UniversalInterpretationEngine<TDomainEntities>;
  domainPack?: DomainPack<TDomainEntities>;
  storagePort?: StoragePort;
  llmProvider?: LLMProvider;
  routerOptions?: HybridRouterOptions;
}

/**
 * Universal hybrid interpretation engine.
 * Orchestrates Stage 1 (Deterministic) -> Trigger evaluation -> Stage 2 (LLM Fallback) ->
 * Exact quote validation -> Resilient envelope merging.
 */
export class HybridInterpretationEngine<TDomainEntities = unknown> {
  private readonly engine: UniversalInterpretationEngine<TDomainEntities>;
  private readonly llmProvider?: LLMProvider;
  private readonly routerOptions?: HybridRouterOptions;

  constructor(
    configOrEngine:
      | UniversalInterpretationEngine<TDomainEntities>
      | HybridEngineConfig<TDomainEntities>,
    llmProvider?: LLMProvider,
    routerOptions?: HybridRouterOptions
  ) {
    if ('interpretTurn' in configOrEngine) {
      this.engine = configOrEngine;
      this.llmProvider = llmProvider;
      this.routerOptions = routerOptions;
    } else {
      this.llmProvider = configOrEngine.llmProvider ?? llmProvider;
      this.routerOptions = configOrEngine.routerOptions ?? routerOptions;
      if (configOrEngine.engine) {
        this.engine = configOrEngine.engine;
      } else if (configOrEngine.domainPack) {
        this.engine = new UniversalInterpretationEngine(
          configOrEngine.domainPack,
          configOrEngine.storagePort
        );
      } else {
        throw new Error('HybridInterpretationEngine requires an engine or domainPack.');
      }
    }
  }

  /**
   * Interprets an incoming TurnWindow through Stage 1, selectively escalating to Stage 2 LLM
   * only when deterministic ambiguity or low confidence is detected.
   */
  async interpretTurnHybrid(
    window: TurnWindow,
    reqBuilder?: (window: TurnWindow) => LLMExtractionRequest<any>
  ): Promise<UniversalInterpretationEnvelope> {
    // 1. Run Stage 1 (Deterministic)
    const stage1Envelope = await this.engine.interpretTurn(window);

    // 2. Fast-path check: duplicate turns or non-triggered turns skip Stage 2
    if (stage1Envelope.duplicate) {
      return stage1Envelope;
    }

    const shouldTrigger = shouldTriggerStage2(stage1Envelope, this.routerOptions);
    if (!this.llmProvider || !shouldTrigger) {
      return UniversalInterpretationEnvelopeSchema.parse({
        ...stage1Envelope,
        extractor_type: stage1Envelope.extractor_type ?? 'rule',
        llm_invoked: false,
        llm_error: false,
      });
    }

    // 3. Stage 2: Invoke LLMProvider
    const req: LLMExtractionRequest = reqBuilder
      ? reqBuilder(window)
      : {
          systemPrompt: `Você é um extrator semântico estruturado para o domínio ${stage1Envelope.domain_key}. Extraia observações e cite trechos literais (exact_quote).`,
          prompt: window.consolidated_text,
        };

    try {
      const llmResponse = await this.llmProvider.extractStructured(req);
      return this.mergeLlmResponse(window, stage1Envelope, llmResponse.data);
    } catch (error) {
      // Graceful fallback on LLM failure / timeout
      const failureReason = error instanceof Error ? error.message : String(error);
      let fallbackEvidence: EvidenceRef | undefined = stage1Envelope.evidence_refs[0];
      if (!fallbackEvidence) {
        const anyObs = [
          ...stage1Envelope.intents,
          ...stage1Envelope.participants,
          ...stage1Envelope.values,
          ...stage1Envelope.opportunities,
        ].find((o) => o.evidence_refs?.length > 0);
        fallbackEvidence = anyObs?.evidence_refs[0];
      }

      const textSample = window.consolidated_text.trim();
      const quoteText = textSample.length > 0 ? textSample.slice(0, Math.min(textSample.length, 50)) : 'turn';
      const finalEvidence: EvidenceRef = fallbackEvidence ?? {
        evidence_id: `ev-fallback-${stage1Envelope.turn_id}`,
        message_id: window.messages[0]?.message_id ?? 'unknown-msg',
        conversation_id: stage1Envelope.conversation_id,
        exact_quote: quoteText,
        char_start: 0,
        char_end: quoteText.length,
        timestamp: window.messages[0]?.timestamp ?? new Date().toISOString(),
        extractor_type: 'rule',
        parser_version: stage1Envelope.parser_version,
        confidence: 0.5,
      };

      const reviewItem: ReviewItem = {
        review_id: `rev-llm-error-${Date.now()}`,
        reason: `Fallback acionado: Falha na extração pelo LLMProvider (${this.llmProvider.name}): ${failureReason}`,
        severity: 'high',
        target_id: stage1Envelope.turn_id,
        evidence_refs: [finalEvidence],
      };

      return UniversalInterpretationEnvelopeSchema.parse({
        ...stage1Envelope,
        review_required: true,
        llm_invoked: true,
        llm_error: true,
        extractor_type: 'rule',
        review_items: [...stage1Envelope.review_items, reviewItem],
      });
    }
  }

  private mergeLlmResponse(
    window: TurnWindow,
    stage1Envelope: UniversalInterpretationEnvelope,
    llmData: any
  ): UniversalInterpretationEnvelope {
    const rawText = window.consolidated_text;
    const additionalReviewItems: ReviewItem[] = [];

    // Helper to sanitize an observation collection with quote-validator
    const sanitizeCollection = <
      T extends {
        epistemic_status: EpistemicStatus;
        confidence: number;
        evidence_refs: EvidenceRef[];
      }
    >(
      items: T[]
    ): T[] => {
      return items.map((item) => {
        let hasHallucination = false;
        const sanitizedRefs: EvidenceRef[] = [];

        for (const ref of item.evidence_refs ?? []) {
          const checked = sanitizeEvidenceRefWithQuoteCheck(rawText, ref);
          sanitizedRefs.push(checked.ref);
          if (checked.reviewRequired) {
            hasHallucination = true;
            additionalReviewItems.push({
              review_id: `rev-hallucination-${ref.evidence_id}`,
              reason:
                checked.reviewReason ??
                `Citação não encontrada no texto original: "${ref.exact_quote}".`,
              severity: 'high',
              target_id: ref.evidence_id,
              evidence_refs: [checked.ref],
            });
          }
        }

        return {
          ...item,
          evidence_refs: sanitizedRefs,
          epistemic_status: hasHallucination ? 'inferred' : item.epistemic_status,
          confidence: hasHallucination ? Math.min(item.confidence, 0.5) : item.confidence,
        };
      });
    };

    const sanitizedParticipants = sanitizeCollection<ParticipantObservation>(Array.isArray(llmData?.participants) ? llmData.participants : []);
    const sanitizedIntents = sanitizeCollection<IntentObservation>(Array.isArray(llmData?.intents) ? llmData.intents : []);
    const sanitizedFacts = sanitizeCollection<FactObservation>(Array.isArray(llmData?.facts) ? llmData.facts : []);
    const sanitizedValues = sanitizeCollection<ValueObservation>(Array.isArray(llmData?.values) ? llmData.values : []);
    const sanitizedRelationships = sanitizeCollection<RelationshipObservation>(Array.isArray(llmData?.relationships) ? llmData.relationships : []);
    const sanitizedConditions = sanitizeCollection<ConditionObservation>(Array.isArray(llmData?.conditions) ? llmData.conditions : []);
    const sanitizedOpportunities = sanitizeCollection<OpportunityAssessment>(Array.isArray(llmData?.opportunities) ? llmData.opportunities : []);
    const sanitizedActions = sanitizeCollection<ActionRecommendation>(Array.isArray(llmData?.actions) ? llmData.actions : []);

    // Merge logic: prefer LLM if Stage 1 was unknown/ambiguous
    const participants =
      sanitizedParticipants.length > 0 &&
      sanitizedParticipants.some((p) => p.role_label !== 'unknown')
        ? sanitizedParticipants
        : stage1Envelope.participants.length > 0
        ? stage1Envelope.participants
        : sanitizedParticipants;

    const stage1Ambiguous = stage1Envelope.intents.some(
      (i) => i.intent_label === 'intent.ambiguous_or_open'
    );
    const intents =
      stage1Ambiguous && sanitizedIntents.length > 0
        ? sanitizedIntents
        : [...stage1Envelope.intents, ...sanitizedIntents];

    const facts = [...stage1Envelope.facts, ...sanitizedFacts];
    const values = [...stage1Envelope.values, ...sanitizedValues];
    const relationships = [
      ...stage1Envelope.relationships,
      ...sanitizedRelationships,
    ];
    const conditions = [...stage1Envelope.conditions, ...sanitizedConditions];
    const opportunities =
      sanitizedOpportunities.length > 0 && stage1Envelope.opportunities.length === 0
        ? sanitizedOpportunities
        : [...stage1Envelope.opportunities, ...sanitizedOpportunities];
    const actions = [...stage1Envelope.actions, ...sanitizedActions];

    const allReviewItems = [
      ...stage1Envelope.review_items,
      ...additionalReviewItems,
    ];

    const mergedEnvelope: UniversalInterpretationEnvelope = {
      ...stage1Envelope,
      extractor_type: 'hybrid',
      llm_invoked: true,
      llm_error: false,
      review_required:
        stage1Envelope.review_required || allReviewItems.length > 0,
      participants,
      intents,
      facts,
      values,
      relationships,
      conditions,
      opportunities,
      actions,
      review_items: allReviewItems,
      domain_entities: llmData?.domain_entities ?? stage1Envelope.domain_entities,
    };

    return UniversalInterpretationEnvelopeSchema.parse(mergedEnvelope);
  }
}
