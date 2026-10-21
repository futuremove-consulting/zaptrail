---
phase: 01-core-contracts-real-estate-domain-pack-deterministic-engine
plan: 01
status: complete
type: execute
subsystem: core
tags: [typescript, zod, vitest, universal-contracts, evidence-ref, epistemic-status]
requires: []
provides:
  - "@futuremove/zaptrail-core package contracts"
  - "UniversalInterpretationEnvelope schema and types"
  - "Deterministic buildEvidenceRef with exact char_start/char_end"
  - "Epistemic status value evolution (superseded) and confidence policy"
  - "UniversalInterpretationEngine with idempotency and action guards"
affects:
  - "01-02-PLAN (Real estate domain pack & PilotCRM adapter)"
key-files:
  - package.json
  - tsconfig.json
  - vitest.config.ts
  - src/packages/core/types.ts
  - src/packages/core/evidence.ts
  - src/packages/core/confidence-policy.ts
  - src/packages/core/engine.ts
  - src/packages/core/index.ts
  - tests/core/universal-core.test.ts
coverage:
  - id: D1
    description: "UniversalInterpretationEnvelope validates all observation categories and rejects missing evidence_refs"
    requirement: CORE-01
    verification:
      - kind: unit
        ref: "tests/core/universal-core.test.ts#CORE-01 & CORE-02: Universal Semantic Contracts"
        status: pass
    human_judgment: false
  - id: D2
    description: "DomainPack, CRMAdapter, and StoragePort interfaces are 100% domain-agnostic with zero real estate terms"
    requirement: CORE-02
    verification:
      - kind: unit
        ref: "tests/core/universal-core.test.ts#Boundary Isolation: Zero Real-Estate Tokens in Core"
        status: pass
    human_judgment: false
  - id: D3
    description: "buildEvidenceRef calculates exact char_start/char_end deterministically on normalized_text"
    requirement: CORE-03
    verification:
      - kind: unit
        ref: "tests/core/universal-core.test.ts#CORE-03: Deterministic EvidenceRef Offset Calculation"
        status: pass
    human_judgment: false
  - id: D4
    description: "Posterior value update marks prior active value observation as superseded preserving full history"
    requirement: CORE-04
    verification:
      - kind: unit
        ref: "tests/core/universal-core.test.ts#CORE-04: Epistemic Status & Value Evolution"
        status: pass
    human_judgment: false
  - id: CORE-05
    description: "Confidence gating (>=0.85, 0.65-0.84, <0.65), ReviewItem generation, and external action auto-execution blocking"
    requirement: CORE-05
    verification:
      - kind: unit
        ref: "tests/core/universal-core.test.ts#CORE-05: Confidence Policy & Action Guards"
        status: pass
    human_judgment: false
---

# Phase 01 Plan 01: Core Contracts & Deterministic Engine Summary

**Root TypeScript/Vitest toolchain and domain-agnostic `@futuremove/zaptrail-core` package with deterministic evidence spans, epistemic value evolution, confidence gating, and action guards.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-10-21T14:20:18Z
- **Completed:** 2026-10-21T14:32:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Bootstrapped root workspace toolchain with `package.json`, `tsconfig.json`, `vitest.config.ts`, and `.gitignore`.
- Created `@futuremove/zaptrail-core` contracts in `src/packages/core/types.ts` defining `UniversalInterpretationEnvelopeSchema`, `EpistemicStatusSchema`, `EvidenceRefSchema`, observation schemas (`Participant`, `Intent`, `Fact`, `Value`, `Relationship`, `Condition`), `OpportunityAssessmentSchema`, `ActionRecommendationSchema`, `ReviewItemSchema`, and pluggable interfaces (`DomainPack`, `CRMAdapter`, `StoragePort`).
- Implemented `normalizeMessageText` and `buildEvidenceRef` in `src/packages/core/evidence.ts` calculating exact `char_start` and `char_end` deterministically from `exact_quote` in `normalized_text` (with case-insensitive fallback and `EXACT_QUOTE_NOT_FOUND` error handling).
- Implemented `evaluateConfidenceBand`, `applyValueEvolution` (marking prior values as `superseded` preserving complete history), `canAutoExecuteAction`, and `sanitizeActionRecommendation` in `src/packages/core/confidence-policy.ts` (strictly blocking autonomous outbound actions like `send_whatsapp_followup`).
- Implemented `UniversalInterpretationEngine` in `src/packages/core/engine.ts` with turn window orchestration, message idempotency by `(tenant_id, provider, external_message_id)`, confidence gating into `ReviewItem`s, and envelope validation.
- All 5 files in `src/packages/core/` strictly obey the `<= 350` lines ceiling (`types.ts`: 261, `engine.ts`: 216, `confidence-policy.ts`: 129, `evidence.ts`: 89, `index.ts`: 4).
- Verified boundary isolation: zero occurrences of forbidden real estate tokens (`iptu`, `condo_fee`, `condominio`, `bedrooms`, `matricula`) in `src/packages/core/`.
- 17 unit tests passing with 100% pass rate in `tests/core/universal-core.test.ts` and `tsc --noEmit` passing with 0 errors.

## Files Created/Modified

- `package.json` - Root package manifesto with scripts (`test`, `typecheck`) and dependencies (`zod`, `vitest`, `typescript`, `@types/node`).
- `tsconfig.json` - Strict TypeScript compiler configuration targeting ES2022.
- `vitest.config.ts` - Vitest configuration for `tests/**/*.test.ts`.
- `.gitignore` - Exclusions for `node_modules/`, `dist/`, `.next/`, `.env*`.
- `src/packages/core/types.ts` - Universal semantic schemas and pluggable interfaces.
- `src/packages/core/evidence.ts` - Deterministic text normalizer and EvidenceRef span builder.
- `src/packages/core/confidence-policy.ts` - Confidence bands, epistemic value evolution, and action safety guards.
- `src/packages/core/engine.ts` - UniversalInterpretationEngine with idempotency and review gates.
- `src/packages/core/index.ts` - Public barrel exports for `@futuremove/zaptrail-core`.
- `tests/core/universal-core.test.ts` - Comprehensive unit tests for CORE-01..CORE-05.

## Decisions Made

- Focused `tsconfig.json` include path on `src/packages/**/*.ts` and `tests/**/*.ts` to isolate new engine packages from unmigrated legacy prototype code in `src/app` and `src/semantic`.
- Enforced strict case-insensitive fallback in `buildEvidenceRef` to ensure robust token matching across casing variations while strictly verifying substring existence.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scoped tsconfig include to src/packages and tests**
- **Found during:** Task 2 (TypeScript typecheck with `tsc --noEmit`)
- **Issue:** Legacy uncompiled prototype `src/semantic/agent.ts` contained unconfigured JSX syntax without react types.
- **Fix:** Pointed `tsconfig.json` `include` to `["src/packages/**/*.ts", "tests/**/*.ts"]` which directly matches Phase 1 boundaries.
- **Files modified:** `tsconfig.json`
- **Verification:** `npx.cmd tsc --noEmit` exits with code 0.
- **Committed in:** `a15295d` (Task 2 commit)

---

**Total deviations:** 1 auto-fix (blocking)
**Impact on plan:** None. All acceptance criteria and phase boundaries met.

## Issues Encountered

None.

## Next Phase Readiness

- `@futuremove/zaptrail-core` is complete and tested.
- Ready for Plan 01-02: Real estate domain pack (`@futuremove/zaptrail-domain-real-estate`), 20 Golden Cases (`CT-01`..`CT-20`), and `PilotCRMAdapter`.

---
*Phase: 01-core-contracts-real-estate-domain-pack-deterministic-engine*
*Completed: 2026-10-21*
