<!-- generated-by: gsd-doc-writer -->
# ZapTrail API & MCP Server Reference

ZapTrail exposes two external integration surfaces:
1. **REST Ingestion & Management APIs**: Built on Next.js App Router for webhook ingestion and management object lifecycle.
2. **Model Context Protocol (MCP) Server**: A JSON-RPC 2.0 compliant stdio server (`@futuremove/zaptrail-mcp`) enabling external AI agents to trigger conversation interpretation, query entity memory, and resolve human review items.

---

## 1. REST API: WhatsApp Turn Ingestion

### `POST /api/v1/ingest/whatsapp`

Accepts raw conversation turns from WhatsApp business webhooks, consolidates consecutive messages within a 120-second debouncing window, executes the two-stage interpretation engine, persists the resulting audit envelope to Supabase, and updates downstream CRM adapters.

#### Headers

| Header | Type | Description |
|---|---|---|
| `Content-Type` | `string` | Must be `application/json`. |
| `x-zaptrail-tenant-id` | `string` | *(Optional)* Fallback tenant identifier if not supplied in the request body. |
| `Authorization` | `string` | *(Optional)* Bearer token fallback for tenant identification. |

#### Request Body (`IngestWhatsappPayloadSchema`)

```json
{
  "tenant_id": "tenant-zap-01",
  "provider": "whatsapp",
  "conversation_id": "conv-5511999998888",
  "domain_key": "real_estate",
  "messages": [
    {
      "external_message_id": "wamid.HBgLMTE5OTk5...",
      "sender_id": "5511999998888",
      "sender_name": "Carlos Silva",
      "body": "Olá! Gostaria de vender meu apartamento de 3 quartos em Moema por R$ 1.200.000",
      "timestamp": "2026-10-21T14:30:00.000Z",
      "direction": "inbound",
      "attachments": []
    }
  ],
  "seeded_context": {
    "campaign_id": "camp-spring-2026"
  }
}
```

##### Field Specifications
- **`tenant_id`** (`string`, required): Non-empty tenant/workspace identifier.
- **`provider`** (`string`, optional, default: `"whatsapp"`): Communication channel identifier.
- **`conversation_id`** (`string`, required): Thread or user phone number identifier.
- **`domain_key`** (`string`, optional, default: `"real_estate"`): Registered domain pack identifier.
- **`messages`** (`array`, required): Array of message objects in chronological order:
  - `external_message_id` (`string`, required): Unique message ID from provider.
  - `sender_id` (`string`, required): Sender phone or account ID.
  - `sender_name` (`string`, optional): Display name.
  - `body` or `raw_text` (`string`, required unless attachments present): Text content.
  - `timestamp` (`string` | `number`, optional): ISO 8601 string or epoch milliseconds.
  - `direction` (`"inbound"` | `"outbound"`, optional, default: `"inbound"`).
  - `attachments` (`array`, optional): Media attachment objects (`{ type, url, mime_type }`).
- **`seeded_context`** (`object`, optional): Metadata from active marketing or outreach campaigns.

#### Response Codes

##### 201 Created (New Turn Processed)
Returned when a turn is processed for the first time.
```json
{
  "success": true,
  "duplicate": false,
  "data": {
    "envelope_id": "env-1729528200000-abc123",
    "tenant_id": "tenant-zap-01",
    "conversation_id": "conv-5511999998888",
    "observations": [
      {
        "observation_id": "obs-001",
        "entity_type": "party_role",
        "value": "owner",
        "confidence": 0.95,
        "epistemic_status": "stated",
        "evidence": {
          "source_message_id": "wamid.HBgLMTE5OTk5...",
          "exact_quote": "meu apartamento",
          "char_start": 23,
          "char_end": 38
        }
      }
    ],
    "review_items": []
  }
}
```

##### 200 OK (Duplicate Turn Detected — Idempotent)
Returned when a turn with identical `(tenant_id, provider, external_message_id)` has already been processed. The existing envelope is returned without re-executing LLM or downstream adapters.
```json
{
  "success": true,
  "duplicate": true,
  "data": {
    "envelope_id": "env-1729528200000-abc123",
    "tenant_id": "tenant-zap-01",
    "conversation_id": "conv-5511999998888"
  }
}
```

##### 400 Bad Request
Returned when `tenant_id` is missing, `messages` is empty, or the JSON payload is malformed.
```json
{
  "error": "tenant_id is required"
}
```

#### Example cURL
```bash
curl -X POST http://localhost:3000/api/v1/ingest/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-zaptrail-tenant-id: tenant-zap-01" \
  -d '{
    "conversation_id": "5511999998888",
    "messages": [
      {
        "external_message_id": "msg-001",
        "sender_id": "5511999998888",
        "body": "Tenho interesse no imóvel de Pinheiros por R$ 850.000"
      }
    ]
  }'
```

---

## 2. REST API: Management Objects

### `/api/management-objects`

Manages CRM-adjacent objects (tasks, decisions, opportunities, commitments, alerts) derived from conversation turns.

#### Scope Security Rule
Every request to `/api/management-objects` **must** supply a valid workspace identifier via the `workspace` query parameter or path parameter. Requests missing workspace scope receive `HTTP 400: Workspace scope required`.

#### Endpoints

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/management-objects` | `workspace`, `type?`, `status?`, `assignedTo?` | List management objects scoped to workspace |
| `POST` | `/api/management-objects` | `workspace` | Create a new management object |
| `PUT` | `/api/management-objects` | `workspace` | Update object status, resolve review item, and record audit trail |
| `DELETE` | `/api/management-objects` | `workspace`, `id` | Delete an object within workspace scope |

#### PUT Example (Human Review Resolution)
```json
// PUT /api/management-objects?workspace=ws-001
{
  "id": "mo-12345",
  "status": "confirmed",
  "epistemic_status": "validated_human",
  "reviewed_by": "user-reviewer-42",
  "review_notes": "Aprovado após conferência do documento",
  "metadata": {
    "asking_price": 900000
  }
}
```

---

## 3. Model Context Protocol (MCP) Server

ZapTrail includes an official Model Context Protocol server (`@futuremove/zaptrail-mcp`) implementing the JSON-RPC 2.0 protocol over standard input/output (`stdio`).

### Running the Server

#### Interactive Command-Line
```bash
npx tsx src/packages/mcp/index.ts
```

#### Programmatic Integration
```typescript
import { createMcpServer, runMcpStdio } from '@futuremove/zaptrail-mcp';

const server = createMcpServer({
  storage: myStoragePort,
  engine: myHybridEngine,
});

// Run over stdio
const cleanup = runMcpStdio(server);
```

### JSON-RPC 2.0 Tools

#### 1. `analyze_conversation`
Analyzes conversation turns and returns a structured `UniversalInterpretationEnvelope`.

**Input Schema**:
```json
{
  "tenant_id": "tenant-zap-01",
  "conversation_id": "conv-101",
  "provider": "whatsapp",
  "domain_key": "real_estate",
  "messages": [
    {
      "external_message_id": "msg-01",
      "sender_id": "user-44",
      "body": "Gostaria de agendar visita amanhã às 14h"
    }
  ]
}
```

**Output**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"envelope_id\":\"env-...\",\"observations\":[...],\"review_items\":[]}"
    }
  ]
}
```

---

#### 2. `get_entity_memory`
Queries stored entity observations, historical values, and evolution state for a specific conversation.

**Input Schema**:
```json
{
  "tenant_id": "tenant-zap-01",
  "conversation_id": "conv-101"
}
```

**Output**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "[{\"entity_type\":\"budget\",\"value\":850000,\"status\":\"active\"}]"
    }
  ]
}
```

---

#### 3. `resolve_review_item`
Records a human reviewer's decision on a pending review queue item, applying state transitions (`validated_human`, `superseded`, or `rejected`) and updating the audit log.

**Input Schema**:
```json
{
  "tenant_id": "tenant-zap-01",
  "review_id": "rev-5501",
  "decision": "approve",
  "reviewer_id": "agent-gustavo",
  "reviewer_notes": "Valores de condomínio e IPTU validados com o proprietário."
}
```

**Output**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"status\":\"approved\",\"epistemic_status\":\"validated_human\",\"resolved_at\":\"2026-10-21T15:00:00.000Z\"}"
    }
  ]
}
```

---

### Standard MCP Error Codes

The MCP server returns standard JSON-RPC 2.0 error responses:

| Code | Message | Cause |
|---|---|---|
| `-32700` | Parse error | Request body is not valid JSON. |
| `-32600` | Invalid Request | Payload does not conform to JSON-RPC 2.0. |
| `-32601` | Method not found | The requested method does not exist. |
| `-32602` | Invalid params | Missing `tenant_id`, empty message list, or schema validation failure. |
| `-32603` | Internal error | Unhandled runtime exception during processing. |
