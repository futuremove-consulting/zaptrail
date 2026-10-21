# Phase 4 Technical Research: Standalone Spin-Out Surface (REST API & MCP Server)

**Phase:** `04-standalone-spin-out-surface-rest-api-mcp-server`
**Date:** 2026-10-21
**Requirements Covered:** `API-01`, `MCP-01`

---

## 1. Context & Objectives

The goal of Phase 4 is to establish ZapTrail as a standalone, domain-agnostic semantic operating system accessible through two distinct interfaces:
1. **REST Ingest Endpoint (`API-01`)**:
   - `POST /api/v1/ingest/whatsapp` accepting webhook payloads or consolidated `TurnWindowInput`.
   - Supports tenant authorization via header (`x-zaptrail-tenant-id` or `Authorization: Bearer <token>`).
   - Executes `TurnWindowCoalescer` and `HybridInterpretationEngine` with the registered domain pack (defaulting to `real_estate`), records message provenance in `SupabaseStoragePort`, enqueues review items if needed, and returns a verified `UniversalInterpretationEnvelope`.
   - Guarantees strict idempotency by `(tenant_id, provider, external_message_id)`: duplicate payloads return `duplicate: true` and the previously saved envelope.
2. **Model Context Protocol (MCP) Server (`MCP-01`)**:
   - A standalone MCP server module (`@futuremove/zaptrail-mcp`) communicating over stdio using JSON-RPC 2.0.
   - Exposes three core MCP tools:
     - `analyze_conversation`: Analyzes conversation messages or a turn window, returning structured observations, intents, facts, opportunities, actions, and review items.
     - `get_entity_memory`: Retrieves historical values, entity facts, and timeline for a given `tenant_id` and `conversation_id`.
     - `resolve_review_item`: Resolves human review queue items (`approve`, `edit`, `reject`) with immutable audit trail.
   - Allows external AI agents (such as Claude Code, Cursor, custom agents, or PilotCRM assistants) to interact with ZapTrail's semantic memory and human review loop seamlessly.

---

## 2. Architecture & Design Decisions

### 2.1 REST Ingest Handler (`API-01`)
- **Location:** `src/packages/api/ingest-handler.ts` (reusable core logic) and `src/app/api/v1/ingest/whatsapp/route.ts` (Next.js route).
- **Schema & Validation:**
  - `IngestWhatsappPayloadSchema` defining:
    - `tenant_id`: Non-empty string.
    - `provider`: String (e.g. `uazapi`, `z-api`, `evolution`, `mock`).
    - `conversation_id`: String.
    - `messages`: Array of messages with `external_message_id`, `sender_id`, `body`, `timestamp`, optional `media_url` and `direction`.
    - `prior_outbound_message`: Optional previous outbound message.
    - `seeded_context`: Optional campaign or property seeds.
    - `domain_key`: Optional domain key (defaults to `real_estate`).
- **Processing Flow:**
  1. Validate payload with Zod.
  2. Check idempotency via `storage.isProcessed(tenant_id, provider, external_message_id)`.
  3. If processed, return cached envelope with `duplicate: true` and HTTP 200.
  4. If new, coalesce messages into `TurnWindow`, run `HybridInterpretationEngine`, persist via `storage.saveEnvelope(envelope)`, and return the envelope with HTTP 201.

### 2.2 Model Context Protocol (MCP) Server (`MCP-01`)
- **Location:** `src/packages/mcp/server.ts` and `src/packages/mcp/index.ts`.
- **Protocol:** Standard JSON-RPC 2.0 over stdio (MCP specification).
  - Handles `initialize`, `ping`, `tools/list`, and `tools/call`.
- **Tools Exposed:**
  1. `analyze_conversation`:
     - Parameters: `tenant_id`, `conversation_id`, `messages`, optional `domain_key`, optional `seeded_context`.
     - Output: `UniversalInterpretationEnvelope`.
  2. `get_entity_memory`:
     - Parameters: `tenant_id`, `conversation_id`.
     - Output: Historical values (`ValueObservation[]`), extraction runs, and active opportunities.
  3. `resolve_review_item`:
     - Parameters: `tenant_id`, `review_id`, `decision` (`approve` | `edit` | `reject`), `reviewer_id`, optional `updated_payload`, optional `notes`.
     - Output: Updated `ReviewQueueRecord` and audit details.

---

## 3. Quality & Constraints

1. Keep all production files strictly `<= 350` lines (`quality/max-lines`).
2. Keep `@futuremove/zaptrail-core` 100% domain-agnostic.
3. Zero network calls in tests; full deterministic test coverage.
