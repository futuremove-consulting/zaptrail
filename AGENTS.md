# ZapTrail — Agent Engineering Harness & Architecture Guide

> **Canonical Engineering Contract** aligned with the **PilotCRM Harness**. Every AI coding agent (Antigravity, Claude Code, Cline, Codex, Cursor) MUST obey these boundaries and quality gates.

## 1. Architecture & Bounded Contexts

ZapTrail is a decoupled conversational intelligence spin-out engine with a **Universal Core** and pluggable **Domain Packs** (starting with **Real Estate** and the **PilotCRM Hexagonal Adapter**):

1. **`src/packages/core/` (Universal Core — Zero Domain Leakage):**
   - Domain-agnostic semantic contracts (`UniversalInterpretationEnvelope`, `TurnWindow`, `EvidenceRef`, `ValueObservation`, `OpportunityAssessment`, `ActionRecommendation`).
   - `HybridInterpretationEngine` (Stage 1 deterministic rules + Stage 2 structured LLM fallback with `quote-validator` anti-hallucination guard).
   - `SupabaseStoragePort` + `PostgrestSupabaseClient` (persists to `zaptrail_*` tables isolated by `tenant_id` without colliding with PilotCRM's `messages` / `conversations` tables, with automatic in-memory fallback in unit tests).
   - **Strict Rule:** `src/packages/core/` and `src/packages/mcp/` MUST NEVER contain real-estate domain tokens (`iptu`, `condominio`, `sale_asking_price`, `corretor`, etc.).
2. **`src/packages/domain-real-estate/` (Real Estate Domain Pack + 7-Layer Classifier + PilotCRM Adapter):**
   - `RealEstateDomainPack` (`opportunity-orchestrator.ts`, `normalizer-ptbr.ts`, `role-intent-rules.ts`, `opportunity-attributes-builder.ts`).
   - Integrates the 7-layer deterministic extraction rules (property type/subtype, transaction, BRL monetary values, neighborhood, physical metrics, supply vs. buyer demand, and temporal urgency).
   - `PilotCRMAdapter` (`adapters/pilotcrm-adapter.ts`): translates `UniversalInterpretationEnvelope` into `ai_suggestions` proposals strictly conforming to PilotCRM's `enrichment_action_ck` (`ADD`, `UPDATE`, `CONFIRM`, `NO_CHANGE`, `SUPPRESS`, `RELATE`, `REVIEW`, `DEFER`, `CONTRADICT`, `INVALIDATE`) and `ProposalPayload` (`side`, `intention`, `targetValue`, `neighborhood`, `phone`, `contactName`, `timing`, `title`, `propertyDraft`).
3. **`src/packages/api/` & `src/app/api/v1/ingest/whatsapp/route.ts` (Standalone REST Surface):**
   - `POST /api/v1/ingest/whatsapp`: validates `Authorization: Bearer <token>` via `timingSafeEqual` when `ZAPTRAIL_API_TOKEN` is configured, coalesces turns, runs hybrid interpretation, and asynchronously dispatches outbound suggestions to PilotCRM (`/api/crm/whatsapp/ai-suggestions/ingest`).
4. **`src/packages/mcp/` (MCP Server Surface):**
   - Exposes `analyze_conversation`, `get_entity_memory`, and `resolve_review_item` over JSON-RPC stdio.

---

## 2. Non-Negotiable Quality Gates

1. **350-Line Ceiling (`quality/max-lines`):** Every production `.ts`/`.tsx` file MUST have $\le 350$ lines.
2. **TDD Iron Law:** No production code without a failing test first.
3. **Security (OWASP ASVS L1):**
   - Never commit hardcoded secrets or service role keys.
   - Always validate Bearer tokens with `timingSafeEqual` when `ZAPTRAIL_API_TOKEN` is set.
   - Never leak workspace trash (`.pyc`, `.log`, `_bak_*`) into Git branches.
4. **Next.js 16 Compatibility:** Route handlers receiving `params` MUST support `params: Promise<...>` (`await Promise.resolve(context.params)`).

---

## 3. Canonical Verification Commands

Before claiming any task is complete or committing:

```bash
node scripts/check-quality-gates.mjs
npx.cmd tsc --noEmit
npx.cmd vitest run
```
