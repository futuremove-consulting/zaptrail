import { z } from 'zod';
import { SupabaseStoragePort } from '../core/supabase-storage';
import { HybridInterpretationEngine } from '../core/hybrid-engine';
import { ingestWhatsappTurn, IngestWhatsappPayloadSchema } from './ingest-handler';
import { dispatchOutboundSuggestions } from './outbound-dispatcher';

export type BackfillTurnInput = z.input<typeof IngestWhatsappPayloadSchema>;

export interface HistoricalBackfillOptions {
  turns: BackfillTurnInput[];
  callbackUrl?: string;
  callbackToken?: string;
  storage?: SupabaseStoragePort;
  engine?: HybridInterpretationEngine;
  fetchFn?: typeof fetch;
}

export interface HistoricalBackfillSummary {
  totalTurns: number;
  processedNew: number;
  duplicatesSkipped: number;
  opportunitiesExtracted: number;
  outboundDispatched: number;
  errors: number;
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
  const summary: HistoricalBackfillSummary = {
    totalTurns: options.turns.length,
    processedNew: 0,
    duplicatesSkipped: 0,
    opportunitiesExtracted: 0,
    outboundDispatched: 0,
    errors: 0,
  };

  for (const turn of options.turns) {
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
        continue;
      }

      summary.processedNew++;
      summary.opportunitiesExtracted += result.envelope.opportunities?.length ?? 0;

      const targetCallbackUrl = options.callbackUrl || turn.callback_url;
      const targetCallbackToken = options.callbackToken || turn.callback_token;
      if (targetCallbackUrl) {
        const dispatchRes = await dispatchOutboundSuggestions({
          envelope: result.envelope,
          callbackUrl: targetCallbackUrl,
          callbackToken: targetCallbackToken,
          fetchFn: options.fetchFn,
        });
        if (dispatchRes.dispatched) {
          summary.outboundDispatched += dispatchRes.count ?? 0;
        }
      }
    } catch {
      summary.errors++;
    }
  }

  return summary;
}
