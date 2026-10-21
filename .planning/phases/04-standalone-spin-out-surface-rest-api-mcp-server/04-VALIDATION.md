---
phase: 04-standalone-spin-out-surface-rest-api-mcp-server
status: ready
nyquist_compliant: true
test_framework: vitest
---

# Phase 4 Validation Strategy

## 1. Automated Verification Commands

| Requirement | Test File | Command | Expected Signal |
|---|---|---|---|
| `API-01` (REST Ingest Endpoint & Idempotency) | `tests/api/ingest-whatsapp.test.ts` | `npx.cmd vitest run tests/api/ingest-whatsapp.test.ts` | Exit code `0`, 100% tests passing for validation, idempotency, envelope returns |
| `MCP-01` (MCP Server & Tools) | `tests/mcp/mcp-server.test.ts` | `npx.cmd vitest run tests/mcp/mcp-server.test.ts` | Exit code `0`, 100% JSON-RPC 2.0 & tools execution tests passing |
| Full Workspace & Regression | All test files | `npx.cmd vitest run && npx.cmd tsc --noEmit` | Exit code `0`, zero type or test regressions across all 4 phases |

## 2. Quality & Security Invariants

1. Every production source file strictly `<= 350` lines (`quality/max-lines`).
2. Zero real-estate vocabulary inside `@futuremove/zaptrail-core` or `@futuremove/zaptrail-mcp`.
3. Mandatory `tenant_id` validation on both REST API and MCP tool calls.
