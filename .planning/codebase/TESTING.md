---
last_mapped_commit: d06d9de5054ef27c22c9de54b94404fea0708adb
last_mapped_at: 2026-10-21
---
# Testing Patterns

**Analysis Date:** 2026-10-21

## Test Framework

**Runner & Assertion Library:**
- Vitest 2.1+ (`vitest.config.ts`)
- TypeScript integration with native ESM support and zero build pre-compilation step.

**Run Commands:**

```bash

# Run all automated tests

npx vitest run

# Run specific test file

npx vitest run tests/domain-real-estate/golden-cases.test.ts

# Watch mode during TDD development

npx vitest

# Windows PowerShell equivalent

npx.cmd vitest run
```

## Test Suite Distribution (14 Suites, 214 Tests)

| Test File | Category | Focus | Tests |
|---|---|---|---|
| `tests/core/universal-core.test.ts` | Core Contracts | Universal envelope, evidence calculation, confidence gating | 17 |
| `tests/core/quote-validator.test.ts` | Anti-Hallucination | Exact quote validation, unicode punctuation, offset recalculation | 13 |
| `tests/core/hybrid-engine.test.ts` | Hybrid Pipeline | Smart trigger fast-path, Stage 2 fallback, LLM error recovery | 13 |
| `tests/core/supabase-migrations-rls.test.ts` | Security & SQL | Static inspection of RLS enablement in migrations 001-004 | 8 |
| `tests/core/supabase-storage.test.ts` | Persistence | Multi-tenant isolation, idempotency, envelope persistence | 8 |
| `tests/core/review-inbox.test.ts` | Human Review | Queue enqueuing, approval/edit/reject, highlight link generator | 15 |
| `tests/domain-real-estate/parser-units.test.ts` | Real Estate Unit | pt-BR normalizers, roles, intents, conditions | 32 |
| `tests/domain-real-estate/coalescer-seeding.test.ts` | Ingestion | Turn window debouncing, outbound campaign candidate binding | 11 |
| `tests/domain-real-estate/real-estate-llm.test.ts` | LLM Domain | Structured schema parsing, pt-BR prompts, hybrid integration | 11 |
| `tests/domain-real-estate/pilotcrm-adapter.test.ts` | CRM Adapter | Constraint compliance (`enrichment_action_ck`), no `create_deal` | 10 |
| `tests/domain-real-estate/golden-cases.test.ts` | End-to-End | 20 Golden Cases `CT-01`..`CT-20` + architectural boundaries + 350-line rule | 24 |
| `src/app/api/management-objects/management-objects.test.ts` | REST API | Tenant scoping, CRUD operations, review status updates | 17 |
| `tests/api/ingest-whatsapp.test.ts` | Ingest Pipeline | Webhook ingestion, bearer tokens, deduplication guards | 15 |
| `tests/mcp/mcp-server.test.ts` | Protocol | MCP JSON-RPC 2.0 handshake, tools/list, tools/call, stdio streams | 20 |

## Mocking & Test Doubles

**Test Doubles:**
- `InMemorySupabaseTableClient` (`src/packages/core/supabase-storage.ts`): In-memory array-backed table client simulating Supabase REST queries without network dependencies.
- `MockLLMProvider` (`src/packages/domain-real-estate/llm/mock-llm-provider.ts`): Configurable mock returning pre-programmed structured outputs, simulated network latency, or deliberate hallucinations for quote-validator testing.
- `PassThrough` streams (`tests/mcp/mcp-server.test.ts`): Node.js `stream.PassThrough` streams to test stdio line-by-line protocol execution without spawning subprocesses.

**What to Mock:**
- Network round-trips to remote databases or external APIs.
- Third-party LLM inference APIs (ensuring tests run deterministically in <5s offline).

**What NOT to Mock:**
- Parsing algorithms, normalizers, and Zod schemas.
- Offsets and substring index calculations (`char_start`, `char_end`).
- Database SQL migrations (inspected via AST/regex assertions in `supabase-migrations-rls.test.ts`).

## Golden Fixtures Pattern

**Location:** `src/packages/domain-real-estate/golden-fixtures.ts`
- Encapsulates all 20 canonical real estate scenarios (`CT-01` to `CT-20`) defined in `docs/spec.md §21.2`.
- Every test in `golden-cases.test.ts` asserts:
  1. Offsets `char_start` and `char_end` slice the exact verbatim quote from the turn window text.
  2. Every generated proposal validates against `PilotCRMEnrichmentActionSchema`.
  3. No proposal emits `action_type: "create_deal"`.

## Architectural Boundary & Quality Assertions

- `QA-01 Architectural Boundary`: Automated test reading all `.ts` files in `src/packages/core/` and `src/packages/mcp/` to guarantee zero occurrences of prohibited domain tokens (`iptu`, `condo_fee`, `aluguel`, `imovel`, `locacao`, `corretor`).
- `QA-01 Quality Rule`: Automated test reading every production source file across `src/packages/`, `src/app/api/`, and `src/components/` asserting line count `<= 350`.

---

*Testing analysis: 2026-10-21*
