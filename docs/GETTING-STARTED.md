<!-- generated-by: gsd-doc-writer -->
# Getting Started

This guide walks you through setting up ZapTrail locally, running the automated verification suites, and sending your first conversational turn for processing.

---

## Prerequisites

- **Node.js**: version `20.14.0` or higher (`node -v`)
- **npm**: version `10.0.0` or higher (`npm -v`)
- **Git**: installed and configured

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/futuremove-consulting/zaptrail.git
   cd zaptrail
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify the installation by running the test suite:
   ```bash
   npm test
   ```
   All 14 test suites and 214 tests should pass with code 0 in ~2 seconds.

---

## First Run & Local Usage

### Step 1: Start the Development Server

```bash
npm run dev
```

The Next.js server starts at `http://localhost:3000`.

### Step 2: Send a Conversation Turn via REST API

Open another terminal and submit a test conversation turn to `/api/v1/ingest/whatsapp`:

```bash
curl -X POST http://localhost:3000/api/v1/ingest/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-zaptrail-tenant-id: demo-tenant" \
  -d '{
    "conversation_id": "conv-demo-001",
    "provider": "whatsapp",
    "messages": [
      {
        "external_message_id": "msg-001",
        "sender_id": "5511988887777",
        "sender_name": "Ana Paula",
        "body": "Quero vender meu apartamento por 1,2 milhão ou alugar por 4.500.",
        "direction": "inbound"
      }
    ]
  }'
```

### Step 3: Inspect the Output

The endpoint responds with `HTTP 201 Created` and a JSON body containing the `UniversalInterpretationEnvelope`:

```json
{
  "success": true,
  "duplicate": false,
  "data": {
    "envelope_id": "env-...",
    "tenant_id": "demo-tenant",
    "conversation_id": "conv-demo-001",
    "participants": [
      {
        "sender_id": "5511988887777",
        "role_label": "owner",
        "confidence": 0.95
      }
    ],
    "intents": [
      {
        "intent_label": "intent.capture_for_sale_and_rent",
        "confidence": 0.95
      }
    ],
    "values": [
      {
        "field_key": "sale_asking_price",
        "amount": 1200000,
        "currency": "BRL"
      },
      {
        "field_key": "rent_asking_price",
        "amount": 4500,
        "currency": "BRL"
      }
    ]
  }
}
```

### Step 4: Verify Idempotency

Re-run the same `curl` command. The server immediately returns `HTTP 200 OK` with `"duplicate": true` and returns the cached envelope without re-executing business logic or creating duplicate records.

---

## Common Setup Issues

1. **Missing or empty `tenant_id`:**  
   If you receive HTTP 400 with `tenant_id is required`, ensure you passed `"tenant_id"` in the body or the `x-zaptrail-tenant-id` header.
2. **Windows PowerShell command chaining:**  
   In Windows PowerShell, avoid using `&&` to chain commands; use `;` instead (e.g. `npm test ; npm run typecheck`).
3. **Database connection in local tests:**  
   Automated unit tests use `InMemorySupabaseTableClient` and do not require active Supabase credentials to pass.
