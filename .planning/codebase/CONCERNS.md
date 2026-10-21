---
last_mapped_commit: d06d9de5054ef27c22c9de54b94404fea0708adb
last_mapped_at: 2026-10-21
---
# Codebase Concerns

**Analysis Date:** 2026-10-21

## Tech Debt

**`InMemorySupabaseTableClient` Test Double:**
- Issue: In-memory table client in `src/packages/core/supabase-storage.ts` provides complete table simulation for Vitest tests, but does not execute live PostgreSQL RLS evaluation in local unit runs.
- Files: `src/packages/core/supabase-storage.ts`
- Impact: RLS policies are validated via static SQL inspection (`tests/core/supabase-migrations-rls.test.ts`), but full E2E live database tests require a live Supabase or Docker Postgres instance.
- Fix approach: Add an optional integration test suite against local Supabase CLI or Testcontainers in CI.

**Legacy Spike Files:**
- Issue: Older spike tests exist in `src/providers/whatsapp/uazapi.spike.test.ts` and `src/spikes/uazapi.spike.test.ts` from initial exploratory prototyping.
- Files: `src/providers/whatsapp/`, `src/spikes/`
- Impact: Does not affect the new package-first engine, but clutters the directory tree.
- Fix approach: Prune legacy spike folders in Milestone v1.1.0 maintenance.

## Fragile Areas & Historical Risks

**Windows NTFS Colon in Filenames:**
- Symptom: A historical commit on `origin/master` (`d276146`) contains filenames with `:` (colon character), which Windows NTFS rejects during full git checkout.
- Workaround: Maintain active development on `master` with normal commits; never perform unrestricted checkout of that specific historical commit on Windows.

## Security Considerations

**Multi-Tenant Data Isolation:**
- Risk: Cross-tenant data leakage if an endpoint or storage method omits `tenant_id`.
- Current mitigation:
  1. `assertTenantScope(tenantId)` is called at the entry of every storage method in `SupabaseStoragePort`.
  2. Next.js routes require either `tenant_id` in body, `x-zaptrail-tenant-id` header, or `Authorization: Bearer <token>`.
  3. Supabase SQL migrations 001-004 have explicit `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and policies checking `memberships.workspace_id`.
- Recommendations: Enforce automated linter preventing direct calls to Supabase client without tenant scoping.

**Prevention of Autonomous External Outbound Dispatches:**
- Risk: An AI engine could autonomously spam WhatsApp contacts with unvalidated follow-ups.
- Current mitigation: `canAutoExecuteAction` in `src/packages/core/confidence-policy.ts` returns `false` for any external action recommendation (e.g. `send_whatsapp_followup`), downgrading it to `ReviewItem` for human confirmation.

## Performance Bottlenecks & Optimization

**Debounce Window Coalescence:**
- Current capacity: 120-second sliding debounce window consolidates bursts of 10+ rapid messages cleanly into a single `TurnWindow`.
- Scaling path: When processing thousands of concurrent conversations per minute, back turn coalescing with a distributed Redis queue rather than in-process timer.

**Fast-Path Token Conservation:**
- Clear turns (~80%) resolve deterministically in Stage 1 with <10ms response time and 0 LLM token cost. Only ambiguous turns trigger Stage 2 LLM extraction.

## Missing Features (Roadmap to v1.1.0)

**Multi-Domain Pack Expansion (`DOM-01`):**
- Real estate is the only production domain pack today. Secondary domains (Healthcare/Clinics or B2B Consulting) are planned for Milestone v1.1.0.

**Active Outbound Dispatch (`AGT-01`):**
- Currently, actions like `send_whatsapp_followup` create proposals or review items. Direct 1-click dispatch to WhatsApp Cloud API will be added in v1.1.0.

---

*Concerns analysis: 2026-10-21*
