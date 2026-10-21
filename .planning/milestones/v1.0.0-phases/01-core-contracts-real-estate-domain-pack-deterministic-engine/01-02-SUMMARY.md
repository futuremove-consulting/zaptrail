---
phase: 01-core-contracts-real-estate-domain-pack-deterministic-engine
plan: 02
status: complete
type: execute
subsystem: domain-real-estate
tags: [typescript, zod, vitest, domain-pack, real-estate, ptbr-normalizer, multi-property, conditional-opportunities]
requires:
  - "01-01"
provides:
  - "@futuremove/zaptrail-domain-real-estate package"
  - "Real estate taxonomy schemas (PartyRole, IntentLabel, ConditionType, OpportunityType, ActionType, PropertyCandidate, DemandProfile)"
  - "Deterministic pt-BR colloquial normalizer (monetary, metrics, referred contacts)"
  - "Rule classifiers for roles, intents, and conditions"
  - "Multi-property orchestrator (CAPTURE_OTHER_PROPERTY) and conditional opportunity linker (sale_before_purchase)"
  - "TurnWindow coalescer and RealEstateDomainPack implementation"
affects:
  - "01-03-PLAN (PilotCRM Adapter & Golden Cases E2E)"
key-files:
  - src/packages/domain-real-estate/types.ts
  - src/packages/domain-real-estate/normalizer-ptbr.ts
  - src/packages/domain-real-estate/role-intent-rules.ts
  - src/packages/domain-real-estate/opportunity-orchestrator.ts
  - src/packages/domain-real-estate/index.ts
  - tests/domain-real-estate/parser-units.test.ts
coverage:
  - id: RE-01
    description: "Classification of party roles (owner, spouse, family referral, broker, unrelated third party) and third-party referral data"
    requirement: RE-01
    verification:
      - kind: unit
        ref: "tests/domain-real-estate/parser-units.test.ts#RE-01, D-04: Party Role Classification"
        status: pass
    human_judgment: false
  - id: RE-02
    description: "Classification of real estate intents, strict distinction between property refusal, general wrong number, and explicit opt-out, plus context-aware short answers"
    requirement: RE-02
    verification:
      - kind: unit
        ref: "tests/domain-real-estate/parser-units.test.ts#RE-02, D-09, D-10: Intent Classification"
        status: pass
    human_judgment: false
  - id: RE-03
    description: "Multi-property candidate builder supporting CAPTURE_OTHER_PROPERTY with independent secondary property candidate and opportunity"
    requirement: RE-03
    verification:
      - kind: unit
        ref: "tests/domain-real-estate/parser-units.test.ts#RE-03 & D-07: Multi-Property Candidate Orchestration (CAPTURE_OTHER_PROPERTY)"
        status: pass
    human_judgment: false
  - id: RE-04
    description: "Conditional purchase and sale linking (sale_before_purchase) creating two opportunities connected via ConditionObservation and recommending link_conditional_opportunities"
    requirement: RE-04
    verification:
      - kind: unit
        ref: "tests/domain-real-estate/parser-units.test.ts#RE-04 & D-08: Conditional Opportunities Linkage"
        status: pass
    human_judgment: false
  - id: RE-05
    description: "Deterministic pt-BR colloquial normalizer for monetary values, property metrics, and media attachments with exact quote spans"
    requirement: RE-05
    verification:
      - kind: unit
        ref: "tests/domain-real-estate/parser-units.test.ts#RE-05 & D-05: Colloquial pt-BR Monetary Normalizer"
        status: pass
    human_judgment: false
  - id: RE-06
    description: "TurnWindow coalescing for rapid consecutive messages, idempotency replay protection, and price evolution superseding older values"
    requirement: RE-06
    verification:
      - kind: unit
        ref: "tests/domain-real-estate/parser-units.test.ts#RE-06 & D-06: TurnWindow Coalescing, Idempotency & Value Evolution"
        status: pass
    human_judgment: false
---

# Phase 01 Plan 02: Real Estate Domain Pack & Deterministic Engine Summary

**Domain pack `@futuremove/zaptrail-domain-real-estate` with deterministic pt-BR normalizers, rule-based role/intent/condition classifiers, multi-property orchestration, conditional opportunity linkage, and TurnWindow coalescing.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-10-21T14:33:10Z
- **Completed:** 2026-10-21T14:48:00Z
- **Tasks:** 2
- **Files created/modified:** 6

## Accomplishments

- Implemented real estate domain schemas and types in `src/packages/domain-real-estate/types.ts` (`RealEstatePartyRole`, `RealEstateIntentLabel`, `RealEstateConditionType`, `RealEstateOpportunityType`, `RealEstateActionType`, `RealEstatePropertyType`, `RealEstateOccupancyStatus`, `RealEstatePropertyCandidate`, `RealEstateDemandProfile`, `RealEstateDomainEntities`).
- Implemented deterministic pt-BR colloquial normalizer in `src/packages/domain-real-estate/normalizer-ptbr.ts` extracting millions (`1,2 milhão`, `1,2 mi`, `1,35 milhão`, `2 milhões`, `1,5 mi`), thousands (`950 mil`, `850 mil`, `980 mil`, `380 mil`), k-notation (`3.5k de aluguel`), formatted punctuation (`4.500`, `4.200`), condo fees (`condomínio 900`, `cond 900`), IPTU (`IPTU 250`), property metrics (bedrooms, area m², occupancy, property types), and third-party referral contact details (`Carlos`, `11 98888-7777`) with exact `char_start`/`char_end` evidence offsets.
- Implemented deterministic role, intent, and condition classifiers in `src/packages/domain-real-estate/role-intent-rules.ts` honoring decisions `D-04`, `D-07`, `D-08`, `D-09`, and `D-10` (strict opt-out detection with `>= 0.95` confidence, general wrong number distinction, outbound question context for short answers like "Sim", and spousal/broker/family detection).
- Implemented `coalesceTurnWindow`, `RealEstateDomainPack`, and `interpretRealEstateTurn` in `src/packages/domain-real-estate/opportunity-orchestrator.ts`:
  - Supports `CAPTURE_OTHER_PROPERTY` (`D-07`, `CT-08`) creating two distinct `RealEstatePropertyCandidate`s (`property_primary` and `property_secondary`).
  - Supports conditional purchase and sale linking (`D-08`, `CT-10`) binding `real_estate.capture_sale` and `real_estate.demand_buy` via `ConditionObservation` (`sale_before_purchase`) and emitting `link_conditional_opportunities`.
  - Supports media attachments (`CT-19`) mapping to `MediaUnderstandingResult` and `property_primary.media_attachment_ids`.
  - Supports spousal conflict review routing (`CT-20`) emitting `review_required: true`, `ReviewItem`, and `human_review` action.
  - Supports TurnWindow coalescing (`CT-17`) and replay idempotency (`CT-18`).
- Strict quality ceiling enforced: every production file has `<= 350` lines (`types.ts`: 140, `normalizer-ptbr.ts`: 270, `role-intent-rules.ts`: 310, `opportunity-orchestrator.ts`: 325, `index.ts`: 4).
- 32 unit tests passing in `tests/domain-real-estate/parser-units.test.ts` (49 total passing tests across the repository) with 0 compiler errors via `tsc --noEmit`.

## Files Created/Modified

- `src/packages/domain-real-estate/types.ts`: Domain schemas and types conforming to `docs/spec.md §3`.
- `src/packages/domain-real-estate/normalizer-ptbr.ts`: Colloquial pt-BR monetary, metric, and referral extractors.
- `src/packages/domain-real-estate/role-intent-rules.ts`: Role, intent, and condition classifiers.
- `src/packages/domain-real-estate/opportunity-orchestrator.ts`: TurnWindow coalescer, multi-property orchestrator, and `RealEstateDomainPack`.
- `src/packages/domain-real-estate/index.ts`: Public barrel export.
- `tests/domain-real-estate/parser-units.test.ts`: Comprehensive unit test suite covering `RE-01` through `RE-06`.

## Verification Results

- `npx vitest run tests/domain-real-estate/parser-units.test.ts`: 32/32 tests passed (100%).
- `npx vitest run`: 49/49 tests passed (100%).
- `npx tsc --noEmit`: 0 errors.
- Line counts: all production files `<= 350` lines.
