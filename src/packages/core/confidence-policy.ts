import { ActionRecommendation, EpistemicStatus, ValueObservation } from './types';

export const EXTERNAL_OUTBOUND_ACTIONS = new Set<string>([
  'send_whatsapp_followup',
  'send_external_message',
  'dispatch_campaign_message',
]);

export interface ConfidenceEvaluation {
  band: 'high' | 'medium' | 'low';
  autoUpdateAllowed: boolean;
  reviewRequired: boolean;
  recommendedEpistemicStatus: EpistemicStatus;
  preserveConfirmedData?: boolean;
}

/**
 * Evaluates the confidence score into operational governance bands
 * per docs/spec.md §2.5 and D-04.
 */
export function evaluateConfidenceBand(
  confidence: number,
  affectsCriticalEntity = true
): ConfidenceEvaluation {
  if (confidence >= 0.85) {
    return {
      band: 'high',
      autoUpdateAllowed: true,
      reviewRequired: false,
      recommendedEpistemicStatus: 'declared',
    };
  }

  if (confidence >= 0.65) {
    return {
      band: 'medium',
      autoUpdateAllowed: false,
      reviewRequired: affectsCriticalEntity,
      recommendedEpistemicStatus: 'inferred',
    };
  }

  return {
    band: 'low',
    autoUpdateAllowed: false,
    reviewRequired: true,
    recommendedEpistemicStatus: 'inferred',
    preserveConfirmedData: true,
  };
}

const ACTIVE_STATUSES: Set<EpistemicStatus> = new Set([
  'declared',
  'inferred',
  'validated_external',
  'validated_human',
]);

/**
 * Applies epistemic value evolution per CORE-04 and D-06:
 * When a new value arrives for an entity+field, marks prior active values
 * as 'superseded' with superseded_by_value_id, keeping the complete historical audit trail.
 */
export function applyValueEvolution(
  existingValues: ValueObservation[],
  incomingValues: ValueObservation[]
): ValueObservation[] {
  const result: ValueObservation[] = [...existingValues];

  for (const incoming of incomingValues) {
    // Check if there is an existing active value for the same entity and field
    for (let i = 0; i < result.length; i++) {
      const existing = result[i];
      if (
        existing.target_entity_key === incoming.target_entity_key &&
        existing.field_key === incoming.field_key &&
        ACTIVE_STATUSES.has(existing.epistemic_status) &&
        existing.amount !== incoming.amount
      ) {
        // Clone and supersede prior value
        result[i] = {
          ...existing,
          epistemic_status: 'superseded',
          superseded_by_value_id: incoming.value_id,
        };
      }
    }

    result.push(incoming);
  }

  return result;
}

/**
 * Assesses whether an action recommendation can be automatically dispatched
 * without human confirmation.
 * External outbound communication is strictly prohibited from autonomous dispatch.
 */
export function canAutoExecuteAction(
  actionType: string,
  executionMode: 'auto' | 'assist' | 'manual',
  confidence: number
): boolean {
  if (EXTERNAL_OUTBOUND_ACTIONS.has(actionType)) {
    return false;
  }
  if (executionMode !== 'auto') {
    return false;
  }
  return confidence >= 0.85;
}

/**
 * Sanitizes action recommendations to enforce human-in-the-loop governance
 * on external communication actions.
 */
export function sanitizeActionRecommendation(
  action: ActionRecommendation
): ActionRecommendation {
  if (EXTERNAL_OUTBOUND_ACTIONS.has(action.action_type)) {
    return {
      ...action,
      execution_mode: 'manual',
      requires_human_approval: true,
    };
  }
  return action;
}
