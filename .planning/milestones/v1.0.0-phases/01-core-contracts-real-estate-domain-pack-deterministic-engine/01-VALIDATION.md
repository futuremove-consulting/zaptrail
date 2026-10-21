---
phase: "1"
slug: "core-contracts-real-estate-domain-pack-deterministic-engine"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-21"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `^2.1.0` |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx tsc --noEmit` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | CORE-01, CORE-02 | — | Strict Zod validation & domain-agnostic types | unit | `npx vitest run tests/core/universal-core.test.ts` | ❌ W1 | ⬜ pending |
| 1-01-02 | 01 | 1 | CORE-03, CORE-04, CORE-05 | — | Deterministic `exact_quote` offsets & confidence policy | unit | `npx vitest run tests/core/universal-core.test.ts` | ❌ W1 | ⬜ pending |
| 1-02-01 | 02 | 2 | RE-01, RE-02, RE-05 | — | Role, intent & pt-BR currency/area normalization | unit | `npx vitest run tests/domain-real-estate/parser-units.test.ts` | ❌ W2 | ⬜ pending |
| 1-02-02 | 02 | 2 | RE-03, RE-04, RE-06 | — | Multi-property, conditional opportunities & idempotency | unit | `npx vitest run tests/domain-real-estate/parser-units.test.ts` | ❌ W2 | ⬜ pending |
| 1-03-01 | 03 | 3 | CRM-01 | — | `PilotCRMAdapter` `enrichment_action_ck` compliance | unit | `npx vitest run tests/domain-real-estate/pilotcrm-adapter.test.ts` | ❌ W3 | ⬜ pending |
| 1-03-02 | 03 | 3 | QA-01 | — | All 20 Golden Cases (`CT-01`..`CT-20`) + core boundary check | integration | `npx vitest run tests/domain-real-estate/golden-cases.test.ts` | ❌ W3 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json`, `tsconfig.json`, `vitest.config.ts` — criados no Plan 01-01 Task 1
- [ ] `tests/core/universal-core.test.ts` — testes unitários do core universal
- [ ] `tests/domain-real-estate/golden-cases.test.ts` — suíte dos 20 Casos-Ouro (`CT-01`..`CT-20`)

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-21
