# Plan 02-02 Summary: Real Estate LLM Schema, Pt-BR Prompts, TurnWindow Coalescer & Hybrid Integration

**Phase:** 02-hybrid-stage-2-structured-llm-fallback-outbound-context  
**Plan:** 02  
**Status:** Completed  
**Completed At:** 2026-10-21  

---

## 1. Objectives & Overview

Delivered the complete Stage 2 domain integration for Brazilian real estate, combining WhatsApp burst message temporal coalescing, outbound campaign candidate seeding, structured LLM extraction schemas, pt-BR anti-hallucination prompts, and end-to-end hybrid execution:
1. **TurnWindow Coalescing & Campaign Seeding (`ING-01`, `E-02-04`, `E-02-05`, `T-02-03`, `T-02-04`)**: `turn-window-coalescer.ts` merges rapid sequential messages within a configurable debounce window (default 120s), preserving all individual message IDs, timestamps, and media payloads, while supporting injection and relative resolution of `SeededPropertyCandidate` items.
2. **Real Estate Structured Output Schema & pt-BR Prompts (`LLM-01`, `LLM-02`)**: `real-estate-llm-schema.ts` and `real-estate-prompt.ts` defining strict Zod schemas for roles, intents, multi-property candidates, demand profiles, and conditions, enforcing verbatim `exact_quote` extraction.
3. **Deterministic Mock LLM Provider (`mock-llm-provider.ts`)**: Supports deterministic test execution, token usage accounting, simulated network failures, and intentional hallucination injection for safety verification.
4. **Hybrid Orchestrator Integration (`opportunity-orchestrator.ts`)**: `interpretRealEstateTurnHybrid` orchestrates Stage 1 deterministic parsing with Stage 2 LLM fallback, deterministic exact quote validation via core `quote-validator`, and candidate merging.

---

## 2. Implemented Components & Verification

### A. TurnWindow Coalescer & Campaign Seeding (`src/packages/domain-real-estate/turn-window-coalescer.ts`)
- **Temporal Debounce (`coalesceTurnWindowWithDebounce`, `partitionMessagesByDebounce`)**: Coalesces bursts of user messages sent in close succession (< 120s) into a unified text representation while retaining all original individual message IDs, timestamps, and media attachments (`ING-01`, `E-02-04`).
- **Idempotence & Anti-Race Condition (`T-02-04`)**: Groups burst messages under a single unified turn key, preventing concurrent duplicate CRM creations.
- **Seeded Property Context Binding (`bindSeededPropertyCandidates`)**: Associates outbound campaign details (`external_property_id`, `address_line`, `expected_price`, `outbound_message_text`) to the `TurnWindow`.
- **Relative Affirmation Resolution (`E-02-05`)**: Short affirmations ("Sim", "Pode anunciar esse mesmo") correctly resolve to the seeded property (`origin_kind: 'seeded_primary'`) with `role=owner` and `intent.capture_for_sale`.
- **Alternative Property Separation (`E-02-06`, `T-02-03`)**: Negative response to the seeded property ("Esse do centro já vendi") combined with an offer of a second property ("mas tenho um nos Jardins para vender por 1 milhão") instantiates `property_secondary` (`offered_alternative`) with `intent.capture_other_property`, avoiding context confusion.

### B. Real Estate LLM Schema & Converter (`src/packages/domain-real-estate/llm/`)
- **Zod Schema (`real-estate-llm-schema.ts`)**: Validates `detected_role`, `intents`, `properties`, `demand_profile`, `conditions`, and `summary`.
- **pt-BR Prompts (`real-estate-prompt.ts`)**: Detailed system instructions covering Brazilian real estate taxonomy, colloquialisms, and the iron rule of verbatim `exact_quote`.
- **Payload Converter (`real-estate-llm-converter.ts`)**: Maps structured LLM output to core observation structures (`ParticipantObservation`, `IntentObservation`, `ValueObservation`, `ConditionObservation`, `OpportunityAssessment`) without computing string offsets in LLM space.
- **Deterministic Mock LLM (`mock-llm-provider.ts`)**: Simulates structured extraction, tracks token usage, and provides fault injection.

### C. Hybrid Orchestration (`src/packages/domain-real-estate/opportunity-orchestrator.ts`)
- **Fast-Path Stage 1 Bypass (`E-02-01`)**: Decisive turns (CT-01, CT-06, CT-07) resolve in < 5ms via deterministic rules with `llm_invoked: false`.
- **Selective Stage 2 Fallback (`E-02-02`)**: Ambiguous or complex turns trigger the LLM provider; output is converted and verified against original text.
- **Hallucination Detection (`LLM-02`, `E-02-03`)**: If a model invents or paraphrases an `exact_quote`, `quote-validator` rejects the citation, marks `hallucination_detected: true`, clears offsets, downgrades confidence, and generates a high-severity `ReviewItem` requiring human review.
- **Graceful Failure Recovery (`E-02-07`)**: Catches network timeouts/exceptions and falls back to Stage 1 observations with `llm_error: true` and an explicit review item.

---

## 3. Quality & Line Count Gates

Every production file in `src/packages/` strictly adheres to the 350-line ceiling rule (`quality/max-lines`):

| File | Lines | Status |
|---|---|---|
| `src/packages/domain-real-estate/opportunity-orchestrator.ts` | 311 lines | PASS (<= 350) |
| `src/packages/core/hybrid-engine.ts` | 308 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/llm/real-estate-llm-converter.ts` | 307 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/role-intent-rules.ts` | 295 lines | PASS (<= 350) |
| `src/packages/core/types.ts` | 276 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/golden-fixtures.ts` | 275 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/normalizer-ptbr.ts` | 245 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/turn-window-coalescer.ts` | 230 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts` | 202 lines | PASS (<= 350) |
| `src/packages/core/engine.ts` | 196 lines | PASS (<= 350) |
| `src/packages/core/quote-validator.ts` | 166 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/types.ts` | 143 lines | PASS (<= 350) |
| `src/packages/core/confidence-policy.ts` | 117 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/llm/mock-llm-provider.ts` | 115 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/llm/real-estate-prompt.ts` | 99 lines | PASS (<= 350) |
| `src/packages/core/evidence.ts` | 79 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/llm/real-estate-llm-schema.ts` | 51 lines | PASS (<= 350) |
| `src/packages/domain-real-estate/index.ts` | 11 lines | PASS (<= 350) |
| `src/packages/core/index.ts` | 6 lines | PASS (<= 350) |

---

## 4. Test Verification

Automated test execution (`npx.cmd vitest run ; npx.cmd tsc --noEmit`):
- `tests/domain-real-estate/coalescer-seeding.test.ts`: 8 passed (100%)
- `tests/domain-real-estate/real-estate-llm.test.ts`: 11 passed (100%)
- `tests/domain-real-estate/golden-cases.test.ts`: 23 passed (100%)
- `tests/domain-real-estate/parser-units.test.ts`: 32 passed (100%)
- `tests/domain-real-estate/pilotcrm-adapter.test.ts`: 10 passed (100%)
- `tests/core/quote-validator.test.ts`: 10 passed (100%)
- `tests/core/hybrid-engine.test.ts`: 11 passed (100%)
- `tests/core/universal-core.test.ts`: 17 passed (100%)
- **Total Test Suite:** 122 tests passed across 8 files (0 failed).
- **TypeScript Typecheck:** 0 errors (`tsc --noEmit` exited with code 0).

---

## 5. Atomic Git Commits

1. `d6f56e4`: `feat(domain-re): implement TurnWindow coalescer and outbound campaign seeding (ING-01)`
2. `9d05b33`: `feat(domain-re): implement Real Estate LLM schema, pt-BR prompts and hybrid integration (LLM-01, LLM-02)`
