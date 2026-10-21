---
last_mapped_commit: d06d9de5054ef27c22c9de54b94404fea0708adb
last_mapped_at: 2026-10-21
---
<!-- refreshed: 2026-10-21 -->

# Architecture

**Analysis Date:** 2026-10-21

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           External Surfaces                             │
├────────────────────────────┬─────────────────────────────┬──────────────┤
│  REST Webhook API          │  MCP Server (stdio)         │  Next.js UI  │
│  `src/app/api/v1/ingest/`  │  `src/packages/mcp/`        │  `src/app/`  │
└─────────────┬──────────────┴──────────────┬──────────────┴──────┬───────┘
              │                             │                     │
              ▼                             ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API Ingest & Review Services                         │
│       `src/packages/api/ingest-handler.ts`                              │
│       `src/packages/core/review-inbox.ts`                               │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────────────────┐
│   Deterministic Stage 1      │ │      Hybrid Stage 2 Fallback           │
│   `TurnWindow` Coalescer     │ │      Structured LLM Extraction         │
│   pt-BR Normalizers & Rules  │ │      `quote-validator.ts` Anti-Halluc  │
│   `opportunity-orchestrator` │ │      `src/packages/core/hybrid-engine` │
└──────────────┬───────────────┘ └────────────────┬───────────────────────┘
               │                                  │
               └─────────────────┬────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Universal Semantic Core Engine                           │
│  `UniversalInterpretationEnvelope`, `EvidenceRef`, `ConfidencePolicy`   │
│  `src/packages/core/types.ts` & `src/packages/core/engine.ts`           │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────────────────┐
│      PilotCRM Adapter        │ │       Supabase Storage Port            │
│   `PilotCRMProposal`         │ │   PostgreSQL RLS Multi-Tenant Schema   │
│   `enrichment_action_ck`     │ │   `src/packages/core/supabase-storage` │
└──────────────────────────────┘ └────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|---|---|---|
| `UniversalInterpretationEnvelope` | Universal envelope schema (participants, intents, values, opportunities, actions) | `src/packages/core/types.ts` |
| `EvidenceRef` Builder | Deterministic calculation of `char_start` and `char_end` via `exact_quote` | `src/packages/core/evidence.ts` |
| `ConfidencePolicy` | Evaluation of confidence bands, epistemic value evolution, and action safety guards | `src/packages/core/confidence-policy.ts` |
| `HybridInterpretationEngine` | 80/20 fast-path routing; triggers LLM Stage 2 only on ambiguity | `src/packages/core/hybrid-engine.ts` |
| `quote-validator` | Anti-hallucination check verifying literal quote presence in source text | `src/packages/core/quote-validator.ts` |
| `ReviewInboxService` | Management of review queue, human approvals, edits and highlighted links | `src/packages/core/review-inbox.ts` |
| `SupabaseStoragePort` | Multi-tenant persistent storage with RLS audit trail and deduplication | `src/packages/core/supabase-storage.ts` |
| `RealEstateDomainPack` | Real estate taxonomy, pt-BR colloquial normalizers and multi-property rules | `src/packages/domain-real-estate/opportunity-orchestrator.ts` |
| `PilotCRMAdapter` | Translation of opportunities to PilotCRM proposals enforcing `enrichment_action_ck` | `src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts` |
| `ZapTrailMcpServer` | Model Context Protocol JSON-RPC 2.0 stdio server exposing 3 agent tools | `src/packages/mcp/server.ts` |
| `TimelineDual` | Dual-column UI component with exact substring highlighting ("Mostrar na conversa") | `src/components/timeline/TimelineDual.tsx` |

## Pattern Overview

**Overall:** Package-First Hexagonal (Ports & Adapters) with 2-Stage Hybrid Fallback Pipeline.

**Key Characteristics:**
- **Strict Domain Independence**: The core package (`@futuremove/zaptrail-core`) is 100% agnostic of any specific industry; all real estate terms are encapsulated in `@futuremove/zaptrail-domain-real-estate`.
- **Hybrid 80/20 Execution**: Clear turns resolve deterministically in Stage 1 with <10ms latency and zero LLM cost. Only ambiguous or complex turns activate Stage 2.
- **Literal Evidence Guarantee**: No fact, value or opportunity exists without an `EvidenceRef` containing `exact_quote` verifiable against the source turn text.
- **Epistemic Tracking**: Values evolve historically (`superseded`) rather than being destructively overwritten.

## Data Flow

### Primary Request Path (Webhook to CRM Proposal)

1. Webhook HTTP request hits entry point (`src/app/api/v1/ingest/whatsapp/route.ts`).
2. Tenant scope extracted and validated (`assertTenantScope`).
3. Payload validated by Zod schema and checked for idempotency (`storage.isProcessed`).
4. Rapid consecutive messages coalesced into `TurnWindow` (`turn-window-coalescer.ts`).
5. `HybridInterpretationEngine.interpretTurnHybrid` runs Stage 1 deterministic rules.
6. If ambiguous, Stage 2 LLM invoked, output validated with `quote-validator.ts`, and merged into envelope.
7. Storage persists envelope and spans (`storage.saveEnvelope`).
8. `PilotCRMAdapter.toProposals` converts envelope into compliant CRM proposals.
9. HTTP 201 response returned with envelope.

### Review Loop Path ("Mostrar na conversa")

1. Turn with confidence `< 0.85`, unverified quotes or spousal conflict flagged as `review_required`.
2. `ReviewInboxService.enqueueFromEnvelope` writes item to `review_queue`.
3. Operator loads review item in `TimelineDual.tsx`.
4. `buildTimelineHighlightSegments` calculates exact character slices (`before`, `highlighted`, `after`).
5. Operator inspects yellow `<mark>` highlight and submits decision (`approve`, `edit`, `reject`).
6. `ReviewInboxService.resolveReviewItem` marks `epistemic_status: validated_human`, preserves `original_payload` intact, and updates audit records.

## Key Abstractions

- **`DomainPack<TDomainEntities>`**: Abstract interface defining entity extraction, intent classification, and opportunity orchestration for any vertical (`src/packages/core/types.ts`).
- **`CRMAdapter<TProposal>`**: Abstract interface mapping semantic envelopes to any external CRM format (`src/packages/core/types.ts`).
- **`StoragePort`**: Storage abstraction for envelopes, deduplication markers and review items (`src/packages/core/types.ts`).
- **`LLMProvider`**: Pluggable structured extraction provider contract (`src/packages/core/types.ts`).

## Architectural Constraints

- **Zero Domain Leakage**: Prohibited real estate tokens (`iptu`, `condo_fee`, `aluguel`, `imovel`, `locacao`, `corretor`) are strictly barred from `src/packages/core/` and `src/packages/mcp/` (enforced by `QA-01` in `golden-cases.test.ts`).
- **350-Line Limit**: Every production source file must remain `<= 350 lines` (`quality/max-lines`).
- **Safe Outbound Actions**: Engine is forbidden from autonomously firing external outbound WhatsApp messages without human confirmation (`canAutoExecuteAction` returns `false` for `send_whatsapp_followup`).
- **Deterministic Offsets**: Offsets `char_start` and `char_end` must always be calculated in TypeScript via `indexOf(exact_quote)` rather than trusting LLM predictions.

---

*Architecture analysis: 2026-10-21*
