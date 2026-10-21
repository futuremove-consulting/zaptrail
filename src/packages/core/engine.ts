import {
  DomainPack,
  StoragePort,
  TurnWindow,
  UniversalInterpretationEnvelope,
  UniversalInterpretationEnvelopeSchema,
  ReviewItem,
} from './types';
import {
  applyValueEvolution,
  sanitizeActionRecommendation,
  evaluateConfidenceBand,
} from './confidence-policy';

export class UniversalInterpretationEngine<TDomainEntities = unknown> {
  private inMemoryProcessedKeys = new Set<string>();

  constructor(
    private readonly domainPack: DomainPack<TDomainEntities>,
    private readonly storagePort?: StoragePort
  ) {}

  private makeIdempotencyKey(
    tenantId: string,
    provider: string,
    externalMessageId: string
  ): string {
    return `${tenantId}:${provider}:${externalMessageId}`;
  }

  private async isMessageProcessed(
    tenantId: string,
    provider: string,
    externalMessageId: string
  ): Promise<boolean> {
    if (this.storagePort) {
      return await this.storagePort.isProcessed(
        tenantId,
        provider,
        externalMessageId
      );
    }
    return this.inMemoryProcessedKeys.has(
      this.makeIdempotencyKey(tenantId, provider, externalMessageId)
    );
  }

  private async markMessageProcessed(
    tenantId: string,
    provider: string,
    externalMessageId: string
  ): Promise<void> {
    if (this.storagePort) {
      await this.storagePort.markProcessed(tenantId, provider, externalMessageId);
    }
    this.inMemoryProcessedKeys.add(
      this.makeIdempotencyKey(tenantId, provider, externalMessageId)
    );
  }

  /**
   * Interprets an incoming TurnWindow through the plugged domain pack
   * with idempotency verification, epistemic value evolution, confidence gating,
   * and action recommendation safety sanitization.
   */
  async interpretTurn(
    turnWindow: TurnWindow
  ): Promise<UniversalInterpretationEnvelope> {
    // 1. Check idempotency for all messages in the turn window
    const messageStatuses = await Promise.all(
      turnWindow.messages.map((m) =>
        this.isMessageProcessed(m.tenant_id, m.provider, m.external_message_id)
      )
    );

    const allAlreadyProcessed =
      messageStatuses.length > 0 && messageStatuses.every(Boolean);

    if (allAlreadyProcessed) {
      const duplicateEnvelope: UniversalInterpretationEnvelope = {
        envelope_id: `dup-${turnWindow.turn_id}`,
        tenant_id: turnWindow.tenant_id,
        conversation_id: turnWindow.conversation_id,
        turn_id: turnWindow.turn_id,
        domain_key: this.domainPack.domain_key,
        parser_version: this.domainPack.parser_version,
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
      };
      return UniversalInterpretationEnvelopeSchema.parse(duplicateEnvelope);
    }

    // 2. Invoke the domain pack
    const result = await this.domainPack.interpretTurnWindow(turnWindow);

    // 3. Apply historical value evolution
    const historicalValues =
      turnWindow.existing_values ??
      (this.storagePort
        ? await this.storagePort.getHistoricalValues(
            turnWindow.tenant_id,
            turnWindow.conversation_id
          )
        : []);
    const evolvedValues = applyValueEvolution(historicalValues, result.values);

    // 4. Sanitize actions (prevent autonomous external actions)
    const sanitizedActions = result.actions.map((act) =>
      sanitizeActionRecommendation(act)
    );

    // 5. Evaluate confidence bands & synthesize review items
    const reviewItems: ReviewItem[] = [...result.review_items];
    const existingTargetIds = new Set(reviewItems.map((r) => r.target_id));

    // Audit observations and opportunities for medium/low confidence
    const candidateCollections = [
      ...result.intents.map((item) => ({
        id: item.intent_id,
        kind: 'intent',
        confidence: item.confidence,
        evidence: item.evidence_refs,
      })),
      ...result.facts.map((item) => ({
        id: item.fact_id,
        kind: 'fact',
        confidence: item.confidence,
        evidence: item.evidence_refs,
      })),
      ...result.values.map((item) => ({
        id: item.value_id,
        kind: 'value',
        confidence: item.confidence,
        evidence: item.evidence_refs,
      })),
      ...result.opportunities.map((item) => ({
        id: item.opportunity_id,
        kind: 'opportunity',
        confidence: item.confidence,
        evidence: item.evidence_refs,
      })),
    ];

    for (const cand of candidateCollections) {
      const evalBand = evaluateConfidenceBand(cand.confidence, true);
      if (evalBand.reviewRequired && !existingTargetIds.has(cand.id)) {
        reviewItems.push({
          review_id: `rev-${cand.id}`,
          reason: `Confidence ${cand.confidence.toFixed(2)} (${evalBand.band} band) requires human confirmation.`,
          severity: evalBand.band === 'low' ? 'high' : 'medium',
          target_id: cand.id,
          evidence_refs: cand.evidence,
        });
        existingTargetIds.add(cand.id);
      }
    }

    const doNotContact =
      result.do_not_contact ??
      result.intents.some((i) => i.intent_label.includes('do_not_contact'));

    const envelope: UniversalInterpretationEnvelope = {
      envelope_id: `env-${turnWindow.turn_id}-${Date.now()}`,
      tenant_id: turnWindow.tenant_id,
      conversation_id: turnWindow.conversation_id,
      turn_id: turnWindow.turn_id,
      domain_key: this.domainPack.domain_key,
      parser_version: this.domainPack.parser_version,
      duplicate: false,
      review_required: reviewItems.length > 0,
      do_not_contact: doNotContact,
      participants: result.participants,
      intents: result.intents,
      facts: result.facts,
      values: evolvedValues,
      relationships: result.relationships,
      conditions: result.conditions,
      opportunities: result.opportunities,
      actions: sanitizedActions,
      media_results: result.media_results,
      evidence_refs: result.evidence_refs,
      review_items: reviewItems,
      domain_entities: result.domain_entities,
    };

    const validatedEnvelope =
      UniversalInterpretationEnvelopeSchema.parse(envelope);

    // 6. Record idempotency markers
    for (const m of turnWindow.messages) {
      await this.markMessageProcessed(
        m.tenant_id,
        m.provider,
        m.external_message_id
      );
    }

    if (this.storagePort) {
      await this.storagePort.saveEnvelope(validatedEnvelope);
    }

    return validatedEnvelope;
  }
}
