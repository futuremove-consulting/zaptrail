<!-- generated-by: gsd-doc-writer -->
# Architecture

ZapTrail is architected according to a **Package-First ("Spin-Out Ready")** modular pattern, following hexagonal (ports and adapters) principles. The system decouples universal conversational semantic parsing from domain-specific rules and CRM-specific constraints.

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

---

## Component Responsibilities

1. **`@futuremove/zaptrail-core` (`src/packages/core/`)**:
   - Universal Envelope: Defines `UniversalInterpretationEnvelope`, `EvidenceRef`, and `EpistemicStatus`.
   - Offsets & Normalization: Deterministically calculates `char_start` and `char_end` based on literal `exact_quote` findings.
   - Confidence Gating: Enforces confidence thresholds (`>= 0.85` safe, `0.65-0.84` review required, `< 0.65` hypothesis) and prevents autonomous external actions.
   - Zero Domain Term Guarantee: 100% agnostic; zero real estate vocabulary.

2. **`@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate/`)**:
   - Colloquial Portuguese Normalizer: Extracts monetary values (`1,2 mi`, `850k`, `3.5k`), condominium fees, IPTU, and room metrics.
   - Rules & Classifiers: Maps participants (`owner`, `spouse_or_partner`, `broker_or_intermediary`), commercial intents, and conditional dependencies (`sale_before_purchase`).
   - Multi-Property Orchestrator: Disentangles multiple properties in a single dialogue (`CAPTURE_OTHER_PROPERTY`).
   - PilotCRM Adapter: Emits proposals conforming to `enrichment_action_ck`.

3. **`@futuremove/zaptrail-mcp` (`src/packages/mcp/`)**:
   - Protocol Compliance: Implements Model Context Protocol JSON-RPC 2.0 over stdio streams.
   - Agent Toolset: Exposes `analyze_conversation`, `get_entity_memory`, and `resolve_review_item`.

4. **Persistence & UI Services (`src/app/`, `src/components/`, `supabase/`)**:
   - PostgreSQL RLS: Strict workspace/tenant isolation in Supabase migrations (001-004).
   - Dual Timeline: Interactive view highlighting verbatim evidence substrings (`<mark>`) in conversation history.

---

## Data Flow

### 1. Primary Ingestion Flow (Webhook to CRM Proposal)

```
[Inbound Webhook]
       │
       ▼
1. Validate payload schema & verify tenant scope (assertTenantScope)
       │
       ▼
2. Check storage deduplication (storage.isProcessed)
       ├─ Duplicate? -> Return cached envelope (HTTP 200)
       └─ New? -> Proceed
       │
       ▼
3. Coalesce rapid consecutive turns into TurnWindow with 120s debounce
       │
       ▼
4. Run Stage 1 deterministic rules (RealEstateDomainPack)
       ├─ Confident (>= 0.85)? -> Finalize envelope
       └─ Ambiguous (< 0.85)? -> Trigger Stage 2 LLM extraction
       │
       ▼
5. Quote validation (quote-validator.ts rejects or flags hallucinated text)
       │
       ▼
6. Persist envelope, runs, and evidence spans (SupabaseStoragePort)
       │
       ▼
7. Map opportunities to PilotCRM proposals (PilotCRMAdapter)
       │
       ▼
[HTTP 201 Response with Envelope]
```

### 2. Human Review Loop ("Mostrar na conversa")

```
[Ambiguous Turn / Flagged Quote]
       │
       ▼
1. Envelope marked with review_required: true
       │
       ▼
2. Enqueued in review_queue table (ReviewInboxService.enqueueFromEnvelope)
       │
       ▼
3. Operator loads item in TimelineDual.tsx
       │
       ▼
4. buildTimelineHighlightSegments computes exact before / highlighted / after text slices
       │
       ▼
5. Operator inspects yellow <mark> and submits decision (approve / edit / reject)
       │
       ▼
6. Item updated: epistemic_status = validated_human, original_payload preserved intact
```

---

## Key Abstractions

| Interface / Class | Location | Purpose |
|---|---|---|
| `DomainPack<TDomainEntities>` | `src/packages/core/types.ts` | Extensibility contract for industry verticals |
| `CRMAdapter<TProposal>` | `src/packages/core/types.ts` | Target CRM proposal generation contract |
| `StoragePort` | `src/packages/core/types.ts` | Persistent storage and deduplication abstraction |
| `LLMProvider` | `src/packages/core/types.ts` | Structured extraction provider contract |
| `ReviewInboxService` | `src/packages/core/review-inbox.ts` | Review queue operations and audit resolution |
| `SupabaseStoragePort` | `src/packages/core/supabase-storage.ts` | PostgreSQL implementation with tenant RLS isolation |

---

## Directory Structure Rationale

- `src/packages/core`: Kept strictly domain-agnostic to enable future SaaS spin-out across non-real-estate verticals (e.g. healthcare, B2B services).
- `src/packages/domain-real-estate`: Encapsulates Brazilian real estate taxonomy, pt-BR colloquial expressions, and CRM constraints.
- `src/packages/mcp`: Decoupled from web frameworks to allow running as a standalone CLI or container process.
- `src/app/api`: Next.js REST API routes providing HTTP ingest and management objects endpoints.
- `tests/`: Organized mirroring the package structure, with dedicated suites for golden cases, protocol compliance, and boundary enforcement.
