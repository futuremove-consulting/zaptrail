import { z } from 'zod';
import {
  CRMAdapter,
  CRMProposal,
  CRMAdapterResult,
  UniversalInterpretationEnvelope,
  EvidenceRefSchema,
  EpistemicStatusSchema,
} from '../../core/types';

export const PILOTCRM_ENRICHMENT_ACTIONS = [
  'NO_CHANGE',
  'CONFIRM',
  'UPDATE',
  'ADD',
  'RELATE',
  'CONTRADICT',
  'INVALIDATE',
  'SUPPRESS',
  'DEFER',
  'REVIEW',
] as const;

export const PilotCRMEnrichmentActionSchema = z.enum(PILOTCRM_ENRICHMENT_ACTIONS);
export type PilotCRMEnrichmentAction = z.infer<typeof PilotCRMEnrichmentActionSchema>;

export const PilotCRMTargetEntitySchema = z.enum([
  'deal',
  'property',
  'contact',
  'relationship',
  'conversation',
]);
export type PilotCRMTargetEntity = z.infer<typeof PilotCRMTargetEntitySchema>;

export const PilotCRMProposalSchema = z.object({
  proposal_id: z.string(),
  tenant_id: z.string(),
  conversation_id: z.string(),
  enrichment_action: PilotCRMEnrichmentActionSchema,
  target_entity: PilotCRMTargetEntitySchema,
  target_key: z.string(),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  requires_human_review: z.boolean(),
  payload: z.record(z.unknown()),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
  entity_type: z.string(),
  action: z.string(),
  record_id: z.string().optional(),
});
export type PilotCRMProposal = z.infer<typeof PilotCRMProposalSchema>;

function makeProposal(
  env: UniversalInterpretationEnvelope,
  id: string,
  action: PilotCRMEnrichmentAction,
  entity: PilotCRMTargetEntity,
  targetKey: string,
  epistemic: 'declared' | 'inferred' | 'validated_external' | 'validated_human' | 'superseded' | 'rejected',
  confidence: number,
  requiresReview: boolean,
  payload: Record<string, unknown>,
  evidenceRefs: typeof EvidenceRefSchema._type[]
): PilotCRMProposal {
  return PilotCRMProposalSchema.parse({
    proposal_id: id,
    tenant_id: env.tenant_id,
    conversation_id: env.conversation_id,
    enrichment_action: action,
    target_entity: entity,
    target_key: targetKey,
    epistemic_status: epistemic,
    confidence,
    requires_human_review: requiresReview,
    payload,
    evidence_refs: evidenceRefs,
    entity_type: entity,
    action,
  });
}

/**
 * PilotCRM Adapter implementing CRMAdapter<PilotCRMProposal>.
 * Strictly adheres to enrichment_action_ck constraint (CRM-01, D-11).
 * Never emits create_deal as action.
 */
export class PilotCRMAdapter implements CRMAdapter<PilotCRMProposal> {
  readonly adapter_id = 'pilotcrm';
  readonly adapterName = 'pilotcrm';

  static toProposals(envelope: UniversalInterpretationEnvelope): PilotCRMProposal[] {
    return new PilotCRMAdapter().toProposals(envelope);
  }

  translateEnvelope(envelope: UniversalInterpretationEnvelope): PilotCRMProposal[] {
    return this.toProposals(envelope);
  }

  toProposals(envelope: UniversalInterpretationEnvelope): PilotCRMProposal[] {
    if (envelope.duplicate) return [];

    const proposals: PilotCRMProposal[] = [];
    const envId = envelope.envelope_id;
    const defaultEv = envelope.evidence_refs.length > 0
      ? envelope.evidence_refs
      : (envelope.participants[0]?.evidence_refs ?? []);

    // 1. Opt-out (D-09, CT-07)
    if (envelope.do_not_contact) {
      const optOut = envelope.intents.find((i) => i.intent_label === 'intent.do_not_contact');
      proposals.push(makeProposal(
        envelope, `prop-${envId}-suppress`, 'SUPPRESS', 'contact', 'contact_primary',
        'declared', 0.98, false,
        { do_not_contact: true, recommended_action: 'suppress_commercial_followup' },
        optOut?.evidence_refs ?? defaultEv
      ));
      return proposals;
    }

    // 2. Unrelated third party + not interested (D-09, CT-06)
    const isUnrelated = envelope.participants.some((p) => p.role_label === 'unrelated_third_party');
    const notGen = envelope.intents.find((i) => i.intent_label === 'intent.not_interested_general');
    if (isUnrelated && notGen) {
      proposals.push(makeProposal(
        envelope, `prop-${envId}-invalidate`, 'INVALIDATE', 'contact', 'contact_primary',
        'declared', 0.9, false,
        { reason: 'unrelated_third_party', not_interested_general: true },
        notGen.evidence_refs.length > 0 ? notGen.evidence_refs : defaultEv
      ));
      return proposals;
    }

    const isReview = envelope.review_required || envelope.actions.some((a) => a.action_type === 'human_review');

    // 3. Opportunities
    for (const opp of envelope.opportunities) {
      if (opp.opportunity_type === 'real_estate.future_nurture') {
        proposals.push(makeProposal(
          envelope, `prop-${envId}-defer-${opp.opportunity_id}`, 'DEFER', 'deal', opp.entity_key,
          opp.epistemic_status, opp.confidence, false,
          { opportunity_type: opp.opportunity_type, recommended_action: 'register_future_followup', attributes: opp.attributes },
          opp.evidence_refs
        ));
      } else if (isReview && opp.confidence < 0.65) {
        proposals.push(makeProposal(
          envelope, `prop-${envId}-review-${opp.opportunity_id}`, 'REVIEW', 'deal', opp.entity_key,
          opp.epistemic_status, opp.confidence, true,
          { opportunity_type: opp.opportunity_type, recommended_action: 'human_review', review_reasons: envelope.review_items.map((r) => r.reason), attributes: opp.attributes },
          opp.evidence_refs
        ));
      } else {
        let recAction = 'qualify_property';
        const matchAct = envelope.actions.find((a) => a.target_opportunity_id === opp.opportunity_id);
        if (matchAct) recAction = matchAct.action_type;
        else if (opp.opportunity_type === 'real_estate.owner_discovery') recAction = 'request_owner_contact';
        else if (opp.opportunity_type.startsWith('real_estate.demand_')) recAction = 'open_buyer_search';

        proposals.push(makeProposal(
          envelope, `prop-${envId}-add-${opp.opportunity_id}`, 'ADD', 'deal', opp.entity_key,
          opp.epistemic_status, opp.confidence, false,
          { opportunity_type: opp.opportunity_type, recommended_action: recAction, attributes: opp.attributes },
          opp.evidence_refs
        ));
      }
    }

    // 4. Conditions: sale_before_purchase (D-08, CT-10)
    for (const cond of envelope.conditions) {
      if (cond.condition_type === 'sale_before_purchase') {
        proposals.push(makeProposal(
          envelope, `prop-${envId}-relate-${cond.condition_id}`, 'RELATE', 'relationship', cond.condition_id,
          cond.epistemic_status, cond.confidence, false,
          { condition_type: cond.condition_type, description: cond.description, source_opportunity_id: cond.source_opportunity_id, prerequisite_opportunity_id: cond.prerequisite_opportunity_id, recommended_action: 'link_conditional_opportunities' },
          cond.evidence_refs
        ));
      }
    }

    // 5. Value updates (D-06, CT-13)
    for (const sup of envelope.values.filter((v) => v.epistemic_status === 'superseded')) {
      const active = envelope.values.find((v) => v.value_id === sup.superseded_by_value_id);
      proposals.push(makeProposal(
        envelope, `prop-${envId}-update-${sup.value_id}`, 'UPDATE', 'property', active ? active.target_entity_key : sup.target_entity_key,
        active ? active.epistemic_status : 'declared', active ? active.confidence : sup.confidence, false,
        { field_key: sup.field_key, amount: active?.amount, currency: active?.currency ?? sup.currency, superseded_value_id: sup.value_id, superseded_amount: sup.amount },
        active?.evidence_refs ?? sup.evidence_refs
      ));
    }

    // 6. Standalone review proposal if review_required but no opp was flagged
    if (isReview && envelope.opportunities.length === 0 && proposals.every((p) => p.enrichment_action !== 'REVIEW')) {
      const revEv = envelope.review_items[0]?.evidence_refs ?? defaultEv;
      if (revEv.length > 0) {
        proposals.push(makeProposal(
          envelope, `prop-${envId}-review`, 'REVIEW', 'conversation', envelope.conversation_id,
          'declared', 0.8, true,
          { recommended_action: 'human_review', review_reasons: envelope.review_items.map((r) => r.reason) },
          revEv
        ));
      }
    }

    // 7. Fallback NO_CHANGE
    if (proposals.length === 0 && defaultEv.length > 0) {
      proposals.push(makeProposal(
        envelope, `prop-${envId}-no-change`, 'NO_CHANGE', 'conversation', envelope.conversation_id,
        'declared', 1.0, false,
        { reason: 'no_change_detected' },
        defaultEv
      ));
    }

    return proposals;
  }

  async applyProposals(proposals: PilotCRMProposal[]): Promise<CRMAdapterResult> {
    for (const proposal of proposals) {
      PilotCRMProposalSchema.parse(proposal);
    }
    return { applied_count: proposals.length, rejected_count: 0 };
  }
}
