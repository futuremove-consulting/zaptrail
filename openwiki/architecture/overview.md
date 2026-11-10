---
type: "Reference"
title: "Architecture & Bounded Contexts"
openwiki_generated: true
verified:
  - by: openwiki/0.9.0
    at: 2026-11-10T22:22:09.496Z
sources:
  - id: openwiki-source-e4319984664f9ce812f3f1a3
    resource: repo://src/packages/core/types.ts
  - id: openwiki-source-0f3f10eec8d46ca1a0b5fbfa
    resource: repo://src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts
generated: { by: "antigravity", at: "2026-11-10T22:22:09.496Z" }
---

# Architecture & Bounded Contexts

ZapTrail is an asynchronous conversational intelligence engine designed to turn raw conversational streams (such as WhatsApp broker interactions) into structured, semantically verified business opportunities. It is architected with a decoupled **Universal Core** and pluggable **Domain Packs**, connected to host CRMs through hexagonal adapters (starting with the PilotCRM adapter).

## Architectural Boundaries

The system is organized into four strictly segregated bounded contexts:

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
graph TD
    Client[WhatsApp Inbound / API Consumers] --> API[src/packages/api<br/>REST & Webhook Surface]
    API --> Coalescer[src/packages/domain-real-estate<br/>TurnWindow Coalescer]
    Coalescer --> CoreEngine[src/packages/core<br/>HybridInterpretationEngine]
    CoreEngine --> DomainPack[Pluggable Domain Packs<br/>e.g., RealEstateDomainPack]
    DomainPack --> Adapter[PilotCRMAdapter<br/>Hexagonal Outbound Adapter]
    Adapter --> OutboundDispatcher[Outbound Dispatcher]
    OutboundDispatcher --> PilotCRM[PilotCRM Webhook<br/>/api/crm/whatsapp/ai-suggestions/ingest]
    CoreEngine --> Storage[SupabaseStoragePort<br/>Multi-Tenant Storage]
```

### 1. Universal Core (`src/packages/core/`)
- **Domain Agnostic:** Contains zero domain-specific tokens or concepts (no references to real estate, IPTU, rent, or specific broker jargon).
- **Core Semantic Types:** Defines `UniversalInterpretationEnvelope`, `TurnWindow`, `EvidenceRef`, `ValueObservation`, `OpportunityAssessment`, and `ActionRecommendation`.
- **Hybrid Engine:** Orchestrates Stage 1 deterministic parsing rules and Stage 2 structured LLM fallback with strict `quote-validator` anti-hallucination verification.
- **Persistence Layer:** Exposes `StoragePort` implemented by `SupabaseStoragePort` with multi-tenant row-level security (`zaptrail_*` tables) and seamless in-memory fallback for testing.

### 2. Domain Packs (`src/packages/domain-real-estate/`)
- Encapsulates industry-specific intelligence without polluting the Universal Core.
- The **Real Estate Domain Pack** implements a 7-layer deterministic classifier:
  1. Property type and subtype classification (apartment, house, penthouse, duplex, etc.).
  2. Transaction classification (sale, rent, simultaneous sale/rent).
  3. BRL monetary value normalization (`sale_asking_price`, `rent_asking_price`, `condo_fee`, `iptu_amount`).
  4. Neighborhood and geographic entity extraction.
  5. Physical metrics (bedrooms, suites, parking spots, square meters).
  6. Supply vs. buyer demand role detection (`CAPTACAO` vs. `DEMANDA`).
  7. Urgency and temporal commitment analysis (`immediate`, `short_term`, `flexible`).
- Dynamic registry (`DomainRegistry`) allows runtime registration and lookup of custom domain packs.

### 3. Hexagonal Adapters (`src/packages/domain-real-estate/adapters/`)
- **PilotCRMAdapter:** Translates `UniversalInterpretationEnvelope` into proposals strictly obeying PilotCRM's database check constraint `enrichment_action_ck` (`ADD`, `UPDATE`, `CONFIRM`, `NO_CHANGE`, `SUPPRESS`, `RELATE`, `REVIEW`, `DEFER`, `CONTRADICT`, `INVALIDATE`).
- Guarantees that actions like `create_deal` are normalized to valid enrichment actions (e.g. `ADD` with target entity `deal`).

### 4. API & Webhook Layer (`src/packages/api/` & Next.js App Router)
- `POST /api/v1/ingest/whatsapp`: Secure ingest route protected by Bearer token authentication via timing-safe comparison (`timingSafeEqual`).
- `dispatchOutboundSuggestions`: Asynchronously dispatches normalized proposals to host CRM webhook URLs with an 8-second starvation guard and masked credential logging.

## Architectural Principles & Quality Invariants
1. **350-Line Limit:** Every production file must remain at or below 350 lines of code.
2. **Zero Domain Leakage:** The core and MCP packages must never import or reference real-estate specific terms.
3. **Evidence Requirement:** Every extraction and proposal requires verifiable `EvidenceRef` pointing to exact text quotes in the source conversation.
4. **Idempotency:** Re-ingesting identical message IDs is intercepted at the storage layer without re-running pipelines or generating duplicate outbound webhooks.
