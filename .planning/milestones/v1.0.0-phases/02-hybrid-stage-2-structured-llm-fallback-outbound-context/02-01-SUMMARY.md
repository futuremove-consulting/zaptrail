# Plan 02-01 Summary: Core LLMProvider Contracts, QuoteValidator & HybridInterpretationEngine

**Phase:** 02-hybrid-stage-2-structured-llm-fallback-outbound-context  
**Plan:** 01  
**Status:** Completed  
**Completed At:** 2026-10-21  

---

## 1. Objectives & Overview

Delivered the universal Stage 2 contracts and execution pipeline within `@futuremove/zaptrail-core`:
1. Universal contracts for LLM extraction (`LLMProvider`, `LLMExtractionRequest`, `LLMExtractionResponse`, `QuoteValidationResult`, `HybridRouterOptions`) in `src/packages/core/types.ts`.
2. Deterministic anti-hallucination quote validator in `src/packages/core/quote-validator.ts` (`validateExactQuote`, `validateLlmQuotes`, `sanitizeEvidenceRefWithQuoteCheck`).
3. Universal hybrid orchestrator in `src/packages/core/hybrid-engine.ts` (`HybridInterpretationEngine`, `shouldTriggerStage2`).

---

## 2. Implemented Components & Verification

### A. QuoteValidator (`src/packages/core/quote-validator.ts`)
- **Deterministic Offsets:** Finds verbatim substring matches, case-insensitive matches, whitespace-normalized matches, and accent-insensitive variants while calculating exact `char_start` and `char_end` deterministically in TypeScript without trusting model indices (`LLM-02`).
- **Hallucination Detection:** Flagging `hallucination_detected: true`, stripping offsets (`undefined`), downgrading entity epistemic status to `inferred` (confidence `< 0.65`), and requiring human confirmation (`review_required: true`, `ReviewItem`).

### B. HybridInterpretationEngine (`src/packages/core/hybrid-engine.ts`)
- **Smart Stage 2 Triggering (`shouldTriggerStage2`):**
  - **Fast-path (skips LLM):** Envelopes marked duplicate, opt-outs / `do_not_contact`, negative intent with high confidence, or decisive captures with verified role and confidence `>= 0.85`. Returns `llm_invoked: false` (`LLM-01`, `E-02-01`).
  - **Trigger path:** Activates when intent is `intent.ambiguous_or_open`, role is `unknown`, any key observation has confidence `< 0.85`, or `forceStage2: true`.
- **Resilient Fallback:** Gracefully captures LLM exceptions/timeouts (`E-02-07`), returning the Stage 1 envelope marked with `llm_invoked: true`, `llm_error: true`, and a `ReviewItem` for operator intervention.
- **Quote Sanitization & Merging:** Applies `quote-validator` to all structured observations returned by the model before merging into a unified `UniversalInterpretationEnvelope` with `extractor_type: 'hybrid'`.

---

## 3. Quality & Line Count Gates

All production files in `src/packages/core/` strictly respect the 350-line ceiling rule:

| File | Lines | Status |
|---|---|---|
| `src/packages/core/types.ts` | 305 lines | PASS (<= 350) |
| `src/packages/core/quote-validator.ts` | 182 lines | PASS (<= 350) |
| `src/packages/core/hybrid-engine.ts` | 340 lines | PASS (<= 350) |
| `src/packages/core/engine.ts` | 217 lines | PASS (<= 350) |
| `src/packages/core/evidence.ts` | 90 lines | PASS (<= 350) |
| `src/packages/core/confidence-policy.ts` | ~100 lines | PASS (<= 350) |
| `src/packages/core/index.ts` | 6 lines | PASS (<= 350) |

---

## 4. Test Verification

Automated test execution (`npx.cmd vitest run` & `npx.cmd tsc --noEmit`):
- `tests/core/quote-validator.test.ts`: 10 passed (100%)
- `tests/core/hybrid-engine.test.ts`: 11 passed (100%)
- Total test suite: 103 passed across 6 test suites (0 failures)
- TypeScript compilation: 0 errors (`tsc --noEmit` passed with exit code 0)

---

## 5. Atomic Git Commits

1. `2fbce09`: `feat(core): implement LLMProvider contracts and quote-validator anti-hallucination guard (LLM-02)`
2. `9eb5ac3`: `feat(core): implement HybridInterpretationEngine with smart trigger and fallback (LLM-01)`
