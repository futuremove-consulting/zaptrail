# External Integrations

**Analysis Date:** 2026-10-21

## APIs & External Services

**CRM Adapters:**
- **PilotCRM:** Proprietary real estate CRM integration via `PilotCRMAdapter` (`src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts`).
  - Contract: Implements `CRMAdapter<PilotCRMProposal>`.
  - Constraint: Emits proposals strictly mapped to `enrichment_action_ck` (`NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`).
  - Safety: Hard-blocks emission of `action_type: "create_deal"`.

**LLM Providers (Pluggable):**
- **LLMProvider Interface:** Contract in `src/packages/core/types.ts` for structured JSON extraction.
  - Implemented by `MockLLMProvider` (`src/packages/domain-real-estate/llm/mock-llm-provider.ts`) for testing.
  - Ready for Google Gemini (`@google/genai`), OpenAI (`openai`), or Anthropic SDK integrations.
  - Guardrail: All LLM outputs pass through `quote-validator.ts` verifying exact substring matches before merging.

**Messaging Ingest (WhatsApp):**
- **WhatsApp Webhook Ingest:** Accepts conversation turns from WhatsApp Cloud API, Evolution API, Z-API or Typebot via `/api/v1/ingest/whatsapp`.
  - Auth: `x-zaptrail-tenant-id` header or `Authorization: Bearer <token>`.

## Data Storage

**Databases:**
- **Supabase (PostgreSQL 15):**
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Client: `SupabaseStoragePort` (`src/packages/core/supabase-storage.ts`).
  - Security: Row Level Security (RLS) enabled on all 11 tables with tenant/workspace scoping (`memberships.workspace_id = auth.uid()`).
  - Schemas:
    - Core Audit: `origin_messages`, `extraction_runs`, `evidence_spans`, `review_queue` (`supabase/migrations/004-zaptrail-audit-and-review-schema.sql`).
    - Workspaces: `workspaces`, `memberships`, `onboarding_state` (`001-workspace-schema.sql`).
    - Messages: `messages`, `conversation_participants`, `message_attachments`, `inbound_events` (`002-messages-schema.sql`).
    - CRM Objects: `management_objects` (`003-management-objects-schema.sql`).

**File Storage:**
- WhatsApp media attachments stored as reference records in `message_attachments` and referenced in `MediaUnderstandingResult`.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (`auth.uid()`) integrated via RLS policies on `memberships` table.
- Multi-Tenant Isolation: Enforced in code via `assertTenantScope(tenantId)` requiring non-empty tenant identifier on every storage and review operation.

## Monitoring & Observability

**Audit Trail:**
- Immutable append-only audit trail in PostgreSQL tables `origin_messages`, `extraction_runs`, `evidence_spans`, and `review_queue`.
- Epistemic tracking of historical values: prior values are preserved with status `superseded` rather than overwritten.

## Model Context Protocol (MCP)

**Server:**
- `@futuremove/zaptrail-mcp` (`src/packages/mcp/server.ts` and `src/packages/mcp/index.ts`).
- Transport: stdio line-delimited JSON-RPC 2.0.
- Exposed Tools:
  - `analyze_conversation`: Runs turn interpretation returning universal semantic envelope.
  - `get_entity_memory`: Retrieves historical values and observations for a conversation.
  - `resolve_review_item`: Records human review decision with full audit log.

## Webhooks & Callbacks

**Incoming:**
- `POST /api/v1/ingest/whatsapp`: Idempotent webhook receiver with deduplication guard (`isProcessed`).
- `GET / POST / PUT / DELETE /api/management-objects`: Tenant-guarded management objects endpoint.

**Outgoing:**
- None in MVP: Autonomous external outbound messaging is strictly prohibited by confidence policy (`canAutoExecuteAction` in `confidence-policy.ts`).

---

*Integration audit: 2026-10-21*
