# Phase 3 Technical Research: Supabase RLS Persistence, Audit Trail & Review Inbox

**Phase:** `03-supabase-rls-persistence-audit-trail-review-inbox`
**Date:** 2026-10-21
**Requirements Covered:** `DB-01`, `REV-01`

---

## 1. Audit of Existing SQL Migrations & API Routes

### 1.1 Broken SQL Syntax in Existing Migrations (`DB-01`)
An inspection of `supabase/migrations/` revealed critical SQL syntax and RLS bugs across all three existing migration files:
1. `supabase/migrations/001-workspace-schema.sql`:
   - Line 72 contains `alter table enable row level security;` without a table name (`workspaces` and `memberships` are never explicitly specified in `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;`).
2. `supabase/migrations/002-messages-schema.sql`:
   - Line 104 contains `alter table enable row level security;` without table names (`messages`, `conversation_participants`, `message_attachments`, `inbound_events`).
   - Line 152 references `user_id = auth.uid()` in a policy on `inbound_events`, which has `workspace_id` rather than `user_id`.
3. `supabase/migrations/003-management-objects-schema.sql`:
   - Line 37 contains `alter table enable row level security;` without `management_objects`.
   - Line 69 checks `status = 'owner'` instead of `role in ('owner', 'admin') and status = 'active'`.
4. Missing Semantic Core & Audit Tables (`DB-01`):
   - `origin_messages`, `evidence_spans`, `extraction_runs`, and `review_queue` required by `DB-01` and `docs/spec.md` are missing from `supabase/migrations/`.

### 1.2 Broken Tenant Isolation & Schema Mismatch in `/api/management-objects`
In `src/app/api/management-objects/route.tsx`:
- Instantiates `createClient(NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)` unconditionally at module load time, bypassing RLS without validating `workspace_id`/`tenant_id` authorization or active membership.
- Queries `origin_messages!inner(body, from, timestamp)` without a matching table in the migrations.

---

## 2. Architecture for Phase 3 (`DB-01` & `REV-01`)

### 2.1 Migration Repair & `004-zaptrail-audit-and-review-schema.sql` (`DB-01`)
- Fix `001-workspace-schema.sql`, `002-messages-schema.sql`, and `003-management-objects-schema.sql` so every table has an explicit `alter table <table_name> enable row level security;` and valid `workspace_id` membership policies.
- Create `supabase/migrations/004-zaptrail-audit-and-review-schema.sql` defining:
  1. `origin_messages`: Normalized immutable origin message ledger (`id`, `workspace_id`, `tenant_id`, `provider`, `external_message_id`, `conversation_id`, `sender_id`, `direction`, `raw_text`, `normalized_text`, `metadata`, `sent_at`, `created_at`) with unique constraint `(workspace_id, provider, external_message_id)`.
  2. `extraction_runs`: Audit trail of every interpretation run (`id`, `workspace_id`, `tenant_id`, `conversation_id`, `turn_id`, `domain_key`, `parser_version`, `extractor_type`, `llm_invoked`, `llm_error`, `review_required`, `envelope_payload`, `created_at`).
  3. `evidence_spans`: Immutable character-offset spans linking observations/decisions to `origin_messages` (`id`, `workspace_id`, `tenant_id`, `extraction_run_id`, `origin_message_id`, `external_message_id`, `target_id`, `exact_quote`, `char_start`, `char_end`, `epistemic_status`, `confidence`, `hallucination_detected`, `created_at`).
  4. `review_queue`: Human review inbox for items with `review_required=true` (`id`, `review_id`, `workspace_id`, `tenant_id`, `conversation_id`, `extraction_run_id`, `origin_message_id`, `target_id`, `severity`, `reason`, `status` in `('pending', 'approved', 'edited', 'rejected')`, `original_payload`, `resolved_payload`, `reviewer_id`, `reviewer_notes`, `resolved_at`, `created_at`, `updated_at`).
- All four tables enforce `alter table <table_name> enable row level security;` and strict `workspace_id` / `tenant_id` RLS policies.

### 2.2 Pluggable `SupabaseStoragePort` (`DB-01`)
- Implement `SupabaseStoragePort` (implementing `StoragePort` from `@futuremove/zaptrail-core`) in `src/packages/core/supabase-storage.ts` using a minimal, dependency-free repository client interface (`SupabaseQueryClient`) compatible with `@supabase/supabase-js` and deterministic in-memory test doubles.
- Enforce explicit `tenant_id` / `workspace_id` filtering on every read and write operation (`assertTenantScope`). Never allow unscoped queries or unscoped service-role execution.

### 2.3 Human Review Inbox & Dual Timeline "Mostrar na conversa" (`REV-01`)
- Create `src/packages/core/review-inbox.ts` providing:
  - `ReviewQueueItem`, `ReviewResolutionInput`, `ReviewAuditRecord`, `ConversationHighlightLink` types and Zod schemas.
  - `ReviewInboxService`:
    - `enqueueFromEnvelope(envelope, originMessages)`: Automatically populates `review_queue` items when `envelope.review_required === true` or `envelope.review_items.length > 0`, linking each item to its `EvidenceRef` (`message_id`, `exact_quote`, `char_start`, `char_end`).
    - `listPendingReviews(filter: { tenant_id: string; workspace_id?: string; severity?: 'low' | 'medium' | 'high'; conversation_id?: string })`: Lists review items strictly isolated by `tenant_id`/`workspace_id`.
    - `resolveReviewItem(input: ReviewResolutionInput)`: Approves (`approved`), edits (`edited` with `updated_payload`), or rejects (`rejected`) a `review_queue` item, promoting epistemic status to `validated_human` (on approve/edit) or `rejected` (on reject), and recording an immutable audit entry (`reviewer_id`, `decision`, `previous_status`, `new_status`, `resolved_at`, `notes`).
    - `buildShowInConversationLink(item, messageText)`: Builds the Dual Timeline deep-link and highlight descriptor (`conversation_id`, `message_id`, `anchor_href`, `exact_quote`, `char_start`, `char_end`, `before_text`, `highlighted_text`, `after_text`) for the "Mostrar na conversa" feature.
- Refactor `src/app/api/management-objects/route.tsx` and `src/components/timeline/TimelineDual.tsx` to enforce explicit `workspace_id` validation, eliminate naked top-level `SUPABASE_SERVICE_ROLE_KEY` usage without tenant scoping, query the aligned schema, and render exact character-span highlights in "Mostrar na conversa".

---

## 3. Validation Architecture

- **SQL Migration & RLS Linter Test (`tests/core/supabase-migrations-rls.test.ts`)**:
  - Reads all `supabase/migrations/*.sql` files.
  - Asserts zero occurrences of broken `alter table enable row level security;`.
  - Asserts every `create table if not exists <table_name>` has a matching `alter table <table_name> enable row level security;` and `create policy ... on <table_name>`.
  - Asserts existence of `origin_messages`, `evidence_spans`, `extraction_runs`, `management_objects`, and `review_queue`.
- **SupabaseStoragePort Unit Tests (`tests/core/supabase-storage.test.ts`)**:
  - Tests idempotency (`isProcessed` / `markProcessed`), `saveEnvelope` persisting `extraction_runs`, `evidence_spans`, and `review_queue`, `getHistoricalValues`, and strict rejection of missing/mismatched `tenant_id`.
- **Review Inbox & Dual Timeline Tests (`tests/core/review-inbox.test.ts` & `src/app/api/management-objects/management-objects.test.ts`)**:
  - Tests listing `review_required` items, "Mostrar na conversa" highlight slicing (`before_text`, `highlighted_text`, `after_text`), approving/editing/rejecting with immutable audit trail (`validated_human` / `rejected`), and tenant isolation in `/api/management-objects`.
