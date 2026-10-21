---
phase: 03-supabase-rls-persistence-audit-trail-review-inbox
status: ready
nyquist_compliant: true
test_framework: vitest
---

# Phase 3 Validation Strategy

## 1. Automated Verification Commands

| Requirement | Test File | Command | Expected Signal |
|---|---|---|---|
| `DB-01` (SQL & RLS Migrations) | `tests/core/supabase-migrations-rls.test.ts` | `npx.cmd vitest run tests/core/supabase-migrations-rls.test.ts` | Exit code `0`, 100% SQL table RLS & policy checks passing |
| `DB-01` (SupabaseStoragePort & Tenant Isolation) | `tests/core/supabase-storage.test.ts` | `npx.cmd vitest run tests/core/supabase-storage.test.ts` | Exit code `0`, idempotency, envelope persistence & tenant guard tests passing |
| `REV-01` (Human Review Inbox & Dual Timeline) | `tests/core/review-inbox.test.ts` | `npx.cmd vitest run tests/core/review-inbox.test.ts` | Exit code `0`, approve/edit/reject audit trail & "Mostrar na conversa" highlight tests passing |
| `DB-01`, `REV-01` (Management Objects API & Workspace Guard) | `src/app/api/management-objects/management-objects.test.ts` | `npx.cmd vitest run src/app/api/management-objects/management-objects.test.ts` | Exit code `0`, workspace guard & CRUD tests passing |
| Full Suite & Typecheck | All test files | `npx.cmd vitest run && npx.cmd tsc --noEmit` | Exit code `0`, zero type or test regressions |

## 2. Quality & Security Invariants

1. Zero occurrences of `alter table enable row level security;` (without table name) across `supabase/migrations/*.sql`.
2. Zero real-estate-specific tokens inside `src/packages/core/`.
3. Every production source file strictly `<= 350` lines (`quality/max-lines`).
