# Phase 4 Specification: Standalone Spin-Out Surface (REST API & MCP Server)

**Phase:** `04-standalone-spin-out-surface-rest-api-mcp-server`
**Requirements:** `API-01`, `MCP-01`
**Status:** Approved for Planning

---

## 1. Objective

Deliver the standalone spin-out surface of ZapTrail consisting of:
1. REST API endpoint `POST /api/v1/ingest/whatsapp` for webhook ingestion, turn coalescing, and idempotent semantic interpretation.
2. Model Context Protocol (MCP) Server exposing tools `analyze_conversation`, `get_entity_memory`, and `resolve_review_item` for integration with external AI assistants and CRMs.

---

## 2. In-Scope Deliverables

1. **REST Ingest Endpoint (`API-01`)**:
   - `src/packages/api/ingest-handler.ts`: Core ingest pipeline logic supporting payload validation (`IngestWhatsappPayloadSchema`), idempotency check, `TurnWindow` consolidation, domain pack execution, storage persistence, and review queue integration.
   - `src/app/api/v1/ingest/whatsapp/route.ts`: Next.js App Router route handling HTTP requests, extracting headers (`x-zaptrail-tenant-id` / Bearer token), invoking `ingestWhatsappTurn`, and returning status `200` (duplicate) or `201` (newly processed envelope).
   - `tests/api/ingest-whatsapp.test.ts`: Complete unit and integration test suite.
2. **Model Context Protocol (MCP) Server (`MCP-01`)**:
   - `src/packages/mcp/server.ts`: JSON-RPC 2.0 stdio MCP server implementing `initialize`, `tools/list`, and `tools/call`.
   - Tool `analyze_conversation`: Ingests messages and returns `UniversalInterpretationEnvelope`.
   - Tool `get_entity_memory`: Queries historical values and observations by `tenant_id` and `conversation_id`.
   - Tool `resolve_review_item`: Resolves review items via `ReviewInboxService` (`approve`, `edit`, `reject`) returning audit record.
   - `src/packages/mcp/index.ts`: Re-exporting MCP runner, schema, and tool definitions.
   - `tests/mcp/mcp-server.test.ts`: Automated test suite simulating stdio JSON-RPC requests.

---

## 3. Edge Coverage

- **E-04-01 (Missing Tenant Scope in API Payload)**: Requests to `/api/v1/ingest/whatsapp` without `tenant_id` in body or `x-zaptrail-tenant-id` header must return HTTP `400` with clear diagnostic error before processing.
- **E-04-02 (Duplicate Webhook Idempotency in API)**: Reprocessing an already-processed `(tenant_id, provider, external_message_id)` returns HTTP `200` with `{ duplicate: true, envelope: ... }` and does not create duplicate database rows.
- **E-04-03 (Unsupported Domain Pack Fallback)**: If a request specifies an unknown `domain_key`, the handler falls back gracefully to `real_estate` or returns HTTP `400` with supported domain keys list.
- **E-04-04 (MCP JSON-RPC Protocol Conformance)**: The MCP server handles `initialize`, `ping`, unknown method errors (code `-32601`), invalid parameter errors (code `-32602`), and tool execution errors gracefully.
- **E-04-05 (MCP Tool Error Propagation)**: When `resolve_review_item` receives a non-existent `review_id`, it returns `{ isError: true, content: [{ type: 'text', text: 'Review item not found' }] }` per MCP specification.

---

## 4. Prohibitions (must-NOT)

- **MUST NOT** accept ingest payloads without a valid, non-empty `tenant_id`.
- **MUST NOT** execute autonomous outbound actions during webhook ingestion.
- **MUST NOT** crash or terminate the MCP server process on malformed JSON-RPC payloads.
- **MUST NOT** exceed 350 lines in any production source file or introduce real-estate vocabulary into `@futuremove/zaptrail-core`.
