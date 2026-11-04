import { UniversalInterpretationEnvelope } from '../core/types';
import { PilotCRMAdapter, PilotCRMProposal } from '../domain-real-estate/adapters/pilotcrm-adapter';

export interface OutboundDispatcherInput {
  envelope: UniversalInterpretationEnvelope;
  callbackUrl?: string;
  callbackToken?: string;
  fetchFn?: typeof fetch;
}

export interface OutboundDispatcherResult {
  dispatched: boolean;
  status?: number;
  count?: number;
  reason?: 'no_callback_url' | 'duplicate_envelope' | 'no_suggestions' | string;
  error?: string;
}

export interface OutboundSuggestionsPayload {
  tenant_id: string;
  conversation_id: string;
  source: 'zaptrail';
  suggestions: PilotCRMProposal[];
}

/**
 * Dispatches AI suggestions derived from UniversalInterpretationEnvelope
 * to an external webhook (PilotCRM / client callback) via HTTP POST.
 *
 * Security & Reliability:
 * - T-07-03: AbortSignal with 8000ms timeout prevents starvation.
 * - T-07-04: Callback tokens are strictly masked / never exposed in plaintext logs.
 * - Idempotency: Duplicate envelopes are rejected without HTTP traffic.
 * - Non-blocking: Network failures, timeouts or 5xx responses are caught gracefully.
 */
function redactToken(text: string, token?: string): string {
  if (!token || !token.trim()) return text;
  return text.split(token.trim()).join('[REDACTED]');
}

export async function dispatchOutboundSuggestions(
  input: OutboundDispatcherInput
): Promise<OutboundDispatcherResult> {
  const { envelope, callbackUrl, callbackToken } = input;
  const fetchClient = input.fetchFn ?? fetch;

  if (!callbackUrl || callbackUrl.trim().length === 0) {
    return { dispatched: false, reason: 'no_callback_url' };
  }

  if (envelope.duplicate) {
    return { dispatched: false, reason: 'duplicate_envelope' };
  }

  try {
    const proposals = PilotCRMAdapter.toProposals(envelope);
    if (proposals.length === 0) {
      return { dispatched: false, reason: 'no_suggestions' };
    }

    const payload: OutboundSuggestionsPayload = {
      tenant_id: envelope.tenant_id,
      conversation_id: envelope.conversation_id,
      source: 'zaptrail',
      suggestions: proposals,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-zaptrail-tenant-id': envelope.tenant_id,
    };

    if (callbackToken && callbackToken.trim().length > 0) {
      headers['Authorization'] = `Bearer ${callbackToken.trim()}`;
    }

    // 8-second timeout guard against outbound starvation (T-07-03)
    const signal = AbortSignal.timeout(8000);

    const response = await fetchClient(callbackUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorText =
        typeof response.text === 'function'
          ? await response.text().catch(() => '')
          : '';
      return {
        dispatched: false,
        status: response.status,
        error: redactToken(`Outbound webhook failed with status ${response.status}: ${errorText}`, callbackToken),
      };
    }

    return {
      dispatched: true,
      status: response.status,
      count: proposals.length,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      dispatched: false,
      error: redactToken(`Outbound webhook dispatch error: ${errorMessage}`, callbackToken),
    };
  }
}
