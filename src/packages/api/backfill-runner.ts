import { z } from 'zod';
import { SupabaseStoragePort } from '../core/supabase-storage';
import { HybridInterpretationEngine } from '../core/hybrid-engine';
import { ingestWhatsappTurn, IngestWhatsappPayloadSchema } from './ingest-handler';
import { dispatchOutboundSuggestions } from './outbound-dispatcher';

export type BackfillTurnInput = z.input<typeof IngestWhatsappPayloadSchema>;

export interface BackfillErrorDetail {
  conversation_id?: string;
  stage: 'ingest' | 'outbound';
  message: string;
}

export interface HistoricalBackfillOptions {
  turns: BackfillTurnInput[];
  callbackUrl?: string;
  callbackToken?: string;
  storage?: SupabaseStoragePort;
  engine?: HybridInterpretationEngine;
  fetchFn?: typeof fetch;
  onProgress?: (current: number, total: number) => void;
}

export interface HistoricalBackfillSummary {
  totalTurns: number;
  processedNew: number;
  duplicatesSkipped: number;
  opportunitiesExtracted: number;
  outboundDispatched: number;
  outboundFailures: number;
  errors: number;
  errorDetails: BackfillErrorDetail[];
}

function redactSecret(text: string, secret?: string): string {
  if (!secret || !secret.trim()) return text;
  return text.split(secret.trim()).join('[REDACTED]');
}

/**
 * Canonical TypeScript Historical Backfill Runner.
 * Replaces the legacy Python mining script (scripts/mine_opportunities_v2.py)
 * by running historical conversation turns through the 7-layer + hybrid engine,
 * persisting audit records in zaptrail_* tables, and dispatching enriched proposals
 * to PilotCRM's /api/crm/whatsapp/ai-suggestions/ingest endpoint.
 */
export async function runHistoricalBackfill(
  options: HistoricalBackfillOptions
): Promise<HistoricalBackfillSummary> {
  const storage = options.storage ?? new SupabaseStoragePort();
  const total = options.turns.length;
  const summary: HistoricalBackfillSummary = {
    totalTurns: total,
    processedNew: 0,
    duplicatesSkipped: 0,
    opportunitiesExtracted: 0,
    outboundDispatched: 0,
    outboundFailures: 0,
    errors: 0,
    errorDetails: [],
  };

  for (let idx = 0; idx < total; idx++) {
    const turn = options.turns[idx];
    const targetCallbackToken = options.callbackToken || turn.callback_token;
    try {
      const result = await ingestWhatsappTurn(
        {
          ...turn,
          // Prevent double callback inside ingestWhatsappTurn when custom fetchFn is injected
          callback_url: undefined,
          callback_token: undefined,
        },
        {
          storage,
          engine: options.engine,
        }
      );

      if (result.duplicate) {
        summary.duplicatesSkipped++;
        options.onProgress?.(idx + 1, total);
        continue;
      }

      summary.processedNew++;
      summary.opportunitiesExtracted += result.envelope.opportunities?.length ?? 0;

      const targetCallbackUrl = options.callbackUrl || turn.callback_url;
      if (targetCallbackUrl) {
        const dispatchRes = await dispatchOutboundSuggestions({
          envelope: result.envelope,
          callbackUrl: targetCallbackUrl,
          callbackToken: targetCallbackToken,
          fetchFn: options.fetchFn,
        });
        if (dispatchRes.dispatched) {
          summary.outboundDispatched += dispatchRes.count ?? 0;
        } else if (dispatchRes.error) {
          summary.outboundFailures++;
          summary.errorDetails.push({
            conversation_id: turn.conversation_id,
            stage: 'outbound',
            message: redactSecret(dispatchRes.error, targetCallbackToken),
          });
        }
      }
    } catch (err: unknown) {
      summary.errors++;
      const rawMsg = err instanceof Error ? err.message : String(err);
      summary.errorDetails.push({
        conversation_id: turn?.conversation_id,
        stage: 'ingest',
        message: redactSecret(rawMsg, targetCallbackToken),
      });
    }
    options.onProgress?.(idx + 1, total);
  }

  return summary;
}
