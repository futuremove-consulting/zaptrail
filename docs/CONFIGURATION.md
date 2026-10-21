<!-- generated-by: gsd-doc-writer -->
# Configuration Guide

ZapTrail is configured using environment variables, TypeScript configuration files, and Supabase PostgreSQL Row Level Security (RLS) policies.

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Database & Auth Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional LLM Provider API Keys (Stage 2 Fallback)
# <!-- VERIFY: Active LLM API key provider for live production fallback -->
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Environment Variable Details

| Variable | Required | Description | Scope |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | REST and Postgres endpoint URL for Supabase instance | Public / Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon JWT token for client-side queries respecting RLS | Public / Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Admin service role key for system ingest and migrations | Server-only (Private) |
| `OPENAI_API_KEY` | Optional | API key for OpenAI LLM fallback execution | Server-only |
| `GEMINI_API_KEY` | Optional | API key for Google Gemini structured extraction | Server-only |
| `PORT` | Optional | Port for Next.js HTTP server (defaults to `3000`) | Server-only |

---

## Multi-Tenant Scoping Configuration

Every request entering ZapTrail must identify its tenant scope to ensure complete data isolation:

- **Via HTTP Header (Recommended):**  
  `x-zaptrail-tenant-id: <tenant_id>`
- **Via Bearer Authorization:**  
  `Authorization: Bearer <tenant_token_or_id>`
- **Via Payload Body:**  
  Include `"tenant_id": "<tenant_id>"` in the root of the JSON payload.

Any call to storage or review services without a valid tenant scope immediately throws an `Error('Invalid tenant scope: tenantId is required and cannot be empty.')` via `assertTenantScope()`.

---

## Database Migrations & RLS Policies

Database schemas are located in `supabase/migrations/`:

1. `001-workspace-schema.sql` — Base tables: `workspaces`, `memberships`, `onboarding_state`.
2. `002-messages-schema.sql` — Messaging tables: `messages`, `conversation_participants`, `message_attachments`, `inbound_events`.
3. `003-management-objects-schema.sql` — Business objects table: `management_objects`.
4. `004-zaptrail-audit-and-review-schema.sql` — Core audit trail tables: `origin_messages`, `extraction_runs`, `evidence_spans`, `review_queue`.

### Applying Migrations Locally

If using the Supabase CLI:

```bash
supabase db reset
# or apply migrations individually:
# supabase migration up
```

All 11 tables have explicit `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` directives and isolation policies scoped to `memberships.workspace_id = auth.uid()`.

---

## Tooling Configuration Files

- **`tsconfig.json`:**  
  Strict TypeScript configuration (`"strict": true`, `"moduleResolution": "NodeNext"`) with path aliases for packages (`@futuremove/zaptrail-core`, `@futuremove/zaptrail-domain-real-estate`, `@futuremove/zaptrail-mcp`).
- **`vitest.config.ts`:**  
  Vitest test runner configuration targeting `.test.ts` files across `tests/` and `src/`.
- **`package.json`:**  
  Project manifest declaring dependencies (`zod`), development tools (`typescript`, `vitest`), and npm run scripts.
