# Phase 6 Technical Research: PilotCRM 3 Ingest Triggers Integration

## Architecture & Integration Points

### 1. Ingest Contract on ZapTrail Surface

Endpoint: `POST /api/v1/ingest/whatsapp` (running on configured `endpoint_url`, e.g. `http://localhost:3000/api/v1/ingest/whatsapp`).

Payload (`IngestWhatsappPayload` from `src/packages/api/ingest-handler.ts`):
```json
{
  "tenant_id": "uuid-or-string",
  "provider": "waba" | "openwa" | "baileys" | "uazapi" | "whatsapp",
  "conversation_id": "remoteJid-or-internal-id",
  "messages": [
    {
      "external_message_id": "msg_123",
      "sender_id": "5511999999999",
      "sender_name": "João Silva",
      "raw_text": "Quero vender meu apto em Moema por 1.2M",
      "timestamp": "2026-10-22T10:00:00.000Z",
      "direction": "inbound"
    }
  ],
  "seeded_context": {},
  "domain_key": "real_estate"
}
```

Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <decrypted_api_token>`
- `x-zaptrail-tenant-id: <tenant_id>`

### 2. PilotCRM Client (`zaptrail-client.ts`)

Must reside in `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts`.
Dependencies:
- `getZapTrailCredentials` from `@/lib/integrations/zaptrail-settings`
- `drizzleSettingsRepo` from `@/lib/integrations/zaptrail-settings-repo`
- `isModuleEnabled` from `@/lib/module-flags/service`
- `logger` from `@/lib/logger`

Behavior:
1. `isModuleEnabled("zaptrail", tenantId)`: If false, exit early with `{ skipped: true, reason: "module_disabled" }`.
2. `getZapTrailCredentials(repo, tenantId)`: If null or incomplete, exit early with `{ skipped: true, reason: "not_configured" }`.
3. Fetch with `AbortController` (8000ms timeout).
4. Return structured response `{ success: boolean, duplicate?: boolean, envelope?: unknown, error?: string, skipped?: boolean }`.
5. Non-throwing: Catch all network/timeout/parse errors, log with `logger.warn`/`logger.error` without exposing token, and return `{ success: false, error: err.message }`.

### 3. Trigger 1: Realtime Webhook Hook (`route.ts`)

File: `apps/pilotcrm/src/app/api/crm/whatsapp/webhook/route.ts` (currently 310 lines, max 350 lines).
Location: In `POST`, inside `after(async () => { ... })`:
```typescript
after(async () => {
  try {
    await processPendingConversations({ tenantId, session: accountType, batchSize: 50, trigger: "realtime" });
  } catch (error) {
    logger.error(`[WhatsApp canonical engine]: ${error}`);
  }

  // ZapTrail Integration Dispatch
  try {
    await dispatchRealtimeMessageToZapTrail({
      tenantId,
      normalized,
      accountType,
    });
  } catch (error) {
    logger.error(`[ZapTrail realtime dispatch]: ${error}`);
  }
});
```
To keep `route.ts` well below 350 lines, encapsulate the helper logic in `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts` (`dispatchRealtimeMessageToZapTrail`).

### 4. Trigger 2: Cron Jobs Hook

Files:
- `apps/pilotcrm/src/app/api/cron/whatsapp-sync/route.ts`
- `apps/pilotcrm/src/app/api/cron/whatsapp-analysis/route.ts`

When these crons run, if `zaptrail` is enabled for `tenantId`:
- Fetch unanalyzed / recent messages for active conversations.
- Dispatch to ZapTrail via `dispatchBatchToZapTrail({ tenantId, batchSize })`.
- Return execution metrics in the cron JSON response.

### 5. Trigger 3: CTAs sob Demanda

Files:
- `apps/pilotcrm/src/app/api/crm/whatsapp/sync-conversations/route.ts` (called by `ConversationList.tsx`)
- `apps/pilotcrm/src/app/api/crm/whatsapp/analyze-now/route.ts` (called by `WhatsAppRadarCard.tsx`)

In `analyze-now`:
- When `zaptrail` is active, call `dispatchBatchToZapTrail({ tenantId, limit, trigger: "cta" })`.
- Return ZapTrail results in `{ success: true, zaptrail: { dispatched, processed } }`.
- Update `WhatsAppRadarCard.tsx` status display to mention ZapTrail intelligence analysis.

### 6. Security & Threat Model (ASVS Level 1)

- **T-06-01**: Sensitive Data Leak in Logs — Never log `apiToken` in plaintext. Mask before logging.
- **T-06-02**: Denial of Service via Slow ZapTrail Endpoint — Enforce 8000ms timeout via `AbortSignal.timeout(8000)` so PilotCRM threads are never starved.
- **T-06-03**: Cross-Tenant Poisoning — Always pass `tenantId` authenticated from the request / session context.
