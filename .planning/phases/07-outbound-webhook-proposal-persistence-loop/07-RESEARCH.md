# Phase 7 Technical Research: Outbound Webhook & AI Suggestions Loop

## Architecture & Integration Points

### 1. Adapter Contract & Transformation

Location: `src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts` in ZapTrail.
The existing `PilotCRMAdapter` maps an interpretation envelope to `PilotCRMProposal[]`:
```typescript
{
  proposal_id: string;
  tenant_id: string;
  conversation_id: string;
  enrichment_action: 'NO_CHANGE' | 'CONFIRM' | 'UPDATE' | 'ADD' | 'RELATE' | 'CONTRADICT' | 'INVALIDATE' | 'SUPPRESS' | 'DEFER' | 'REVIEW';
  target_entity: 'deal' | 'property' | 'contact' | 'relationship' | 'conversation';
  target_key: string;
  epistemic_status: EpistemicStatus;
  confidence: number;
  requires_human_review: boolean;
  payload: Record<string, unknown>;
  evidence_refs: EvidenceRef[];
  entity_type: string;
  action: string;
  record_id?: string;
}
```

Notice that `enrichment_action` matches the constraint values in PilotCRM. For creating deals, `target_entity: 'deal'`, `action_type: 'create_deal'` (or `ADD` / `CONFIRM`), with `proposed_value` containing:
- `contactId`
- `contactName`
- `phone`
- `title`
- `targetValue`
- `neighborhood`
- `intention`
- `nextAction`
- `evidenceMessageId`
- `confidence`

### 2. ZapTrail Outbound Dispatcher (`outbound-dispatcher.ts`)

Must reside in `src/packages/api/outbound-dispatcher.ts` in ZapTrail.
Function signature:
```typescript
export async function dispatchOutboundSuggestions(input: {
  envelope: UniversalInterpretationEnvelope;
  callbackUrl?: string;
  callbackToken?: string;
  fetchFn?: typeof fetch;
}): Promise<{ dispatched: boolean; status?: number; error?: string; count?: number }>
```
- Skips dispatch if `!input.callbackUrl` or if `envelope.duplicate === true` or if `envelope.opportunities.length === 0 && envelope.actions.length === 0`.
- Formats proposals using `PilotCRMAdapter`.
- Dispatches HTTP POST to `callbackUrl` with:
  - Header `Authorization: Bearer <callbackToken>`
  - Header `x-zaptrail-tenant-id: <envelope.tenant_id>`
  - Body:
    ```json
    {
      "tenant_id": "...",
      "conversation_id": "...",
      "source": "zaptrail",
      "suggestions": [ ... ]
    }
    ```
- Enforces timeout of 8000ms via `AbortSignal.timeout(8000)`.
- Never throws; catches exceptions, logs, and returns `{ dispatched: false, error: err.message }`.

### 3. PilotCRM Ingestion Service & Route

Locations:
- `apps/pilotcrm/src/lib/whatsapp/ai-suggestions-service.ts`
- `apps/pilotcrm/src/app/api/crm/whatsapp/ai-suggestions/ingest/route.ts`

Service handles:
1. Validates payload via Zod: `tenant_id`, `conversation_id`, `suggestions` array.
2. For each suggestion:
   - Sets `idempotency_key = `${conversation_id}:${action_type}:${target_entity}:${target_key}``.
   - Validates `action_type` against `enrichment_action_ck`.
   - Maps payload to `proposed_value` JSON.
   - Upserts into `enrichment_proposals` on conflict do nothing or update timestamps.
3. Returns `{ success: true, count: suggestions.length, inserted: count }`.

### 4. PilotCRM Client Callback Automatic Wiring

Location: `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts`.
When building `DispatchTurnInput`, allow passing `callbackUrl` (defaulting to `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/crm/whatsapp/ai-suggestions/ingest`).
This enables automatic callback discovery without requiring the user to type multiple URLs in the settings UI.

### 5. Threat Model & Safety (ASVS Level 1)

- **T-07-01**: Unauthorized Suggestion Injection — The ingestion endpoint in PilotCRM must verify the tenant ID and optionally validate the shared integration secret / Bearer token.
- **T-07-02**: Constraint Violation Failure (`enrichment_action_ck`) — Any suggestion with an invalid `action_type` must be sanitized or mapped before attempting database insertion, preventing SQL rollback.
- **T-07-03**: Outbound Dispatch Hang / Starvation — Outbound webhook calls from ZapTrail must be bounded by an 8-second timeout.
- **T-07-04**: Suggestion Flooding / Duplication — Enforce idempotency via unique hash or composite key on `(tenant_id, conversation_id, idempotency_key)`.
