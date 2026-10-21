<!-- generated-by: gsd-doc-writer -->
# ZapTrail

> Conversational intelligence engine transforming WhatsApp turns into auditable, idempotent, evidence-backed business objects for real estate and multi-domain operations.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-green.svg)](https://vitest.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen.svg)](https://nodejs.org/)
[![Protocol](https://img.shields.io/badge/MCP-JSON--RPC%202.0-purple.svg)](https://modelcontextprotocol.io/)

ZapTrail is built around a **Package-First ("Spin-Out Ready")** modular architecture. It decodes complex, fragmented Brazilian Portuguese real estate messages—resolving multiple properties in the same dialogue, conditional buying/selling dependencies, colloquial monetary amounts, and participant roles—with zero hallucination, strict epistemic tracking, and direct integration with PilotCRM, REST webhooks, and AI agent platforms via Model Context Protocol (MCP).

---

## Key Capabilities

- **Universal Semantic Core (`@futuremove/zaptrail-core`)**: Domain-agnostic semantic envelope (`UniversalInterpretationEnvelope`) providing deterministic character offsets (`char_start`, `char_end`) strictly verified against source text.
- **Real Estate Domain Pack (`@futuremove/zaptrail-domain-real-estate`)**: Deterministic pt-BR normalizers (`1,2 mi` → `1200000`), second-property capture (`CAPTURE_OTHER_PROPERTY`), conditional links (`sale_before_purchase`), and 100% pass on all 20 canonical Golden Cases (`CT-01` to `CT-20`).
- **PilotCRM Adapter (`PilotCRMAdapter`)**: Strict compliance with database check constraint `enrichment_action_ck` (`NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`), permanently fixing the P0 `create_deal` error.
- **Hybrid 80/20 Pipeline**: Fast-path deterministic Stage 1 resolves unambiguous turns in <10ms with zero LLM token cost. Ambiguous turns activate Stage 2 LLM extraction guarded by strict `exact_quote` verification.
- **Audit Trail & Human Review Inbox**: PostgreSQL RLS persistence in Supabase, immutable historical value tracking (`superseded`), and Dual Timeline UI with exact substring highlighting ("Mostrar na conversa").
- **Standalone Spin-Out Surface**: Idempotent REST webhook endpoint (`/api/v1/ingest/whatsapp`) and stdio JSON-RPC 2.0 MCP server (`@futuremove/zaptrail-mcp`) for direct consumption by Claude Desktop, Cursor, and custom AI agents.

---

## Installation

Ensure you have Node.js 20+ installed.

```bash
git clone https://github.com/futuremove-consulting/zaptrail.git
cd zaptrail
npm install
```

---

## Quick Start

### 1. Verify the Engine and Test Suite

Run the full automated test suite (14 suites, 214 tests):

```bash
npm test
# or: npx vitest run
```

Run TypeScript compilation check:

```bash
npm run typecheck
# or: npx tsc --noEmit
```

### 2. Ingest a WhatsApp Turn via REST API

Start the Next.js development server:

```bash
npm run dev
```

Submit a conversation turn to the ingest endpoint:

```bash
curl -X POST http://localhost:3000/api/v1/ingest/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-zaptrail-tenant-id: pilotcrm-demo" \
  -d '{
    "conversation_id": "conv-5511999998888",
    "provider": "whatsapp",
    "messages": [
      {
        "external_message_id": "msg-001",
        "sender_id": "5511999998888",
        "sender_name": "Carlos Silva",
        "body": "Não quero vender o apartamento da Paulista, mas aceito alugar a casa no Morumbi por 4.500.",
        "direction": "inbound"
      }
    ]
  }'
```

### 3. Connect as an MCP Server (AI Agents)

In your Claude Desktop or Cursor configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "zaptrail": {
      "command": "node",
      "args": ["dist/packages/mcp/index.js"]
    }
  }
}
```

---

## Documentation

Comprehensive project documentation is available in the [`docs/`](docs/) directory:

- [**Architecture**](docs/ARCHITECTURE.md) — Hexagonal package design, 2-stage hybrid pipeline, and data flow.
- [**Getting Started**](docs/GETTING-STARTED.md) — Prerequisites, environment setup, and first run walkthrough.
- [**API & MCP Reference**](docs/API.md) — REST ingest endpoint, payloads, schemas, and MCP tools.
- [**Configuration Guide**](docs/CONFIGURATION.md) — Environment variables, Supabase credentials, and tuning.
- [**Development Workflow**](docs/DEVELOPMENT.md) — Monorepo organization, 350-line rule, and conventions.
- [**Testing Guide**](docs/TESTING.md) — Vitest patterns, 20 Golden Cases, mocks, and boundary tests.
- [**MVP Technical Specification**](docs/spec.md) — Full normative spec v1.0.0 with golden cases `CT-01`..`CT-20`.

---

## License

Private / Proprietary. Copyright © 2026 Futuremove Consulting. All rights reserved.