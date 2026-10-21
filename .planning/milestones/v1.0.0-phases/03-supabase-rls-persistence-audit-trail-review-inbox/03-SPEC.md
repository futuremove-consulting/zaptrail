# Phase 3 Specification: Supabase RLS Persistence, Audit Trail & Review Inbox

**Phase:** `03-supabase-rls-persistence-audit-trail-review-inbox`
**Requirements:** `DB-01`, `REV-01`
**Status:** Approved for Planning

---

## 1. Objective

Repair all broken SQL migrations in `supabase/migrations/*.sql`, introduce the semantic persistence and audit tables (`origin_messages`, `evidence_spans`, `extraction_runs`, `management_objects`, `review_queue`) with strict Row-Level Security (`workspace_id`/`tenant_id`), implement `SupabaseStoragePort`, fix `/api/management-objects` tenant isolation, and deliver the Human Review Inbox service + Dual Timeline ("Mostrar na conversa") evidence navigation.

---

## 2. In-Scope Deliverables

1. **SQL Migrations & RLS Repair (`DB-01`)**:
   - Fix `supabase/migrations/001-workspace-schema.sql`, `002-messages-schema.sql`, and `003-management-objects-schema.sql` so every `ENABLE ROW LEVEL SECURITY` statement names its target table explicitly (`ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`) and all RLS policies reference valid columns (`workspace_id`, `role`, `status`).
   - Create `supabase/migrations/004-zaptrail-audit-and-review-schema.sql` with tables `origin_messages`, `extraction_runs`, `evidence_spans`, and `review_queue`, all protected by explicit RLS and `workspace_id`/`tenant_id` isolation policies.
2. **Tenant-Scoped `SupabaseStoragePort` (`DB-01`)**:
   - `src/packages/core/supabase-storage.ts` implementing `StoragePort` from `@futuremove/zaptrail-core`, persisting envelopes into `origin_messages`, `extraction_runs`, `evidence_spans`, and `review_queue` with mandatory `tenant_id`/`workspace_id` validation (`assertTenantScope`).
3. **Human Review Inbox & Audit Trail (`REV-01`)**:
   - `src/packages/core/review-inbox.ts` providing `ReviewInboxService` to list `review_required` items, resolve items (`approve`, `edit`, `reject`) updating `EpistemicStatus` to `validated_human` or `rejected` with full audit trail (`reviewer_id`, `resolved_at`, `reviewer_notes`, `resolved_payload`), and generate Dual Timeline "Mostrar na conversa" highlight descriptors (`buildShowInConversationLink`).
4. **API Route & Dual Timeline Integration (`DB-01`, `REV-01`)**:
   - Refactor `src/app/api/management-objects/route.tsx` to enforce explicit `workspace_id` validation, remove unscoped top-level `SUPABASE_SERVICE_ROLE_KEY` bypass, and support review resolution actions.
   - Update `src/components/timeline/TimelineDual.tsx` to use deterministic character-offset highlights (`char_start`, `char_end`, `exact_quote`) for "Mostrar na conversa".

---

## 3. Edge Coverage

- **E-03-01 (Malformed SQL `ENABLE ROW LEVEL SECURITY`)**: Every table created in `supabase/migrations/*.sql` must have an explicit `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` statement and at least one tenant/workspace policy.
- **E-03-02 (Cross-Tenant Data Leakage)**: Any call to `SupabaseStoragePort`, `ReviewInboxService`, or `/api/management-objects` without a valid non-empty `tenant_id`/`workspace_id` must throw a deterministic error or return HTTP `400`/`403` before touching storage.
- **E-03-03 (Human Review Edit Preserving Original Value)**: When an operator edits an extracted value in `ReviewInboxService.resolveReviewItem`, the original extracted payload is preserved in `original_payload`, the new value is stored in `resolved_payload` with `epistemic_status: 'validated_human'`, and the prior value observation is marked `superseded`.
- **E-03-04 (Dual Timeline Exact Substring Highlighting)**: `buildShowInConversationLink` slices the original message using `char_start` and `char_end` (falling back to `validateExactQuote` if needed) so the UI highlights the exact substring in "Mostrar na conversa".
- **E-03-05 (Idempotent Review Queue Enqueueing)**: Re-saving or re-processing the same `(tenant_id, review_id)` does not create duplicate pending rows in `review_queue`.

---

## 4. Prohibitions (must-NOT)

- **MUST NOT** leave any `alter table enable row level security;` statement without an explicit table name in `supabase/migrations/*.sql`.
- **MUST NOT** execute queries in `/api/management-objects` or `SupabaseStoragePort` using `SUPABASE_SERVICE_ROLE_KEY` without an explicit `workspace_id` / `tenant_id` filter guard.
- **MUST NOT** overwrite or delete `original_payload` or original `EvidenceRef` when a human operator edits or rejects an item in `review_queue`.
- **MUST NOT** introduce any real-estate-specific vocabulary into `src/packages/core/` (`supabase-storage.ts`, `review-inbox.ts`) or exceed 350 lines in any production file.
