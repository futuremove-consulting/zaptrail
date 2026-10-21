<!-- generated-by: gsd-doc-writer -->
# ZapTrail Testing Strategy & Suite Guide

ZapTrail enforces a strict Test-Driven Development (TDD) engineering discipline. The entire codebase is verified by an automated test suite executed via Vitest and TypeScript.

---

## 1. Test Philosophy & Quality Gates

ZapTrail adheres to three fundamental testing tenets:

1. **Iron Law of TDD**: No production code without a failing test first. Every capability across Core, Domain Packs, Persistence, REST API, and MCP was authored red-green-refactor.
2. **Boundary Isolation Assertions**: Automated tests verify architectural boundaries, ensuring that `@futuremove/zaptrail-core` and `@futuremove/zaptrail-mcp` remain 100% domain-agnostic with zero domain vocabulary leakage.
3. **Deterministic Evidence Verification**: Every observation and extracted entity must match verbatim text in the origin message with exact character offsets (`char_start`, `char_end`), preventing LLM hallucinations.
4. **Line-Count Governance**: Automated tests verify that all production source files remain under the 350-line ceiling (`quality/max-lines`).

---

## 2. Test Suite Distribution

As of Milestone **v1.0.0**, the test suite comprises **14 test suites** containing **214 passing tests** with 0 failures:

| Test File | Tests | Package / Layer | Primary Focus |
|---|:---:|---|---|
| `tests/core/universal-core.test.ts` | 17 | Core | Universal Semantic Envelope, evidence indexing, value evolution, confidence gating, action recommendation sanitization |
| `tests/core/hybrid-engine.test.ts` | 13 | Core | Hybrid interpretation routing, fast-path bypassing, Stage 2 triggers, error fallback |
| `tests/core/quote-validator.test.ts` | 13 | Core | Anti-hallucination quote validator, offset calculation, epistemic status downgrade (`inferred`), review triggering |
| `tests/core/supabase-storage.test.ts` | 8 | Core / Storage | `SupabaseStoragePort`, multi-tenant isolation (`tenant_id`), idempotency tracking, audit trail persistence |
| `tests/core/supabase-migrations-rls.test.ts` | 8 | Database / SQL | Migration SQL validation, explicit RLS enablement across all 12 tables, multi-tenant workspace policies |
| `tests/core/review-inbox.test.ts` | 15 | Core / Review | `ReviewInboxService`, review queue lifecycle (approve, edit, reject), dual-timeline link and substring generator |
| `tests/domain-real-estate/parser-units.test.ts` | 32 | Real Estate Domain | Brazilian Portuguese normalizers (BRL currency, areas, rooms, contacts), party roles, intent classification, conditions |
| `tests/domain-real-estate/coalescer-seeding.test.ts` | 11 | Real Estate Domain | 120s turn window debouncer, outbound message & property seeding (`SeededPropertyCandidate`), relative affirmation |
| `tests/domain-real-estate/real-estate-llm.test.ts` | 11 | Real Estate Domain | Structured output Zod schemas, pt-BR prompts, mock LLM provider, hybrid merge orchestration |
| `tests/domain-real-estate/pilotcrm-adapter.test.ts` | 10 | Adapter | `PilotCRMAdapter`, `enrichment_action_ck` compliance, proposal mapping, suppression of `create_deal` |
| `tests/domain-real-estate/golden-cases.test.ts` | 24 | Domain / E2E / QA | All 20 canonical golden cases (`CT-01` to `CT-20`), boundary isolation assertion, 350-line file ceiling check |
| `src/app/api/management-objects/management-objects.test.ts` | 17 | REST API | Management objects CRUD, strict workspace scope enforcement, human review audit metadata persistence |
| `tests/api/ingest-whatsapp.test.ts` | 15 | REST API | `POST /api/v1/ingest/whatsapp`, header fallback (`x-zaptrail-tenant-id`), turn deduplication, 201/200 responses |
| `tests/mcp/mcp-server.test.ts` | 20 | MCP Protocol | JSON-RPC 2.0 handshake, tool schema validation, `analyze_conversation`, `get_entity_memory`, `resolve_review_item`, stdio stream |
| **Total** | **214** | **All Layers** | **100% Passing** |

---

## 3. Mocking & Test Doubles Strategy

To maintain sub-3-second test execution and enable deterministic offline verification, ZapTrail avoids heavy external infrastructure dependencies in test suites through three robust test doubles:

### `InMemorySupabaseTableClient`
- **Location**: `src/packages/core/supabase-storage.ts`
- **Behavior**: Emulates Supabase's PostgREST query chain (`.from().select().eq().order().limit().insert().update()`) in-memory.
- **Guarantee**: Validates tenant scoping (`tenant_id`), uniqueness constraints, and record state transitions without requiring a live Postgres instance.

### `MockLLMProvider`
- **Location**: `src/packages/domain-real-estate/llm/mock-llm-provider.ts`
- **Behavior**: Implements the `LLMProvider` interface from `@futuremove/zaptrail-core`.
- **Capabilities**:
  - Programmable deterministic responses for specific prompts.
  - Fault injection: simulates network timeouts and API errors to verify graceful degradation to Stage 1.
  - Hallucination injection: injects invented quotes not present in the user text to verify that `quote-validator.ts` flags them.
  - Token tracking: records call counts and simulated token usage.

### `stream.PassThrough`
- **Location**: Node.js `node:stream`
- **Behavior**: Used in `tests/mcp/mcp-server.test.ts` to test `runMcpStdio` over standard I/O streams without spawning sub-processes or manipulating OS file descriptors.

---

## 4. The 20 Golden Cases (`CT-01` to `CT-20`)

The canonical validation benchmark of ZapTrail is defined in `docs/spec.md §4 / §21.2` and implemented in `src/packages/domain-real-estate/golden-fixtures.ts`:

- **CT-01**: Simple purchase intent with price budget.
- **CT-02**: Rental inquiry with property reference.
- **CT-03**: Direct property owner listing for sale (`intent.capture_for_sale`).
- **CT-04**: Owner offering property for rent.
- **CT-05**: Ambiguous message requiring Stage 2 LLM resolution.
- **CT-06**: Explicit opt-out / do not contact (`intent.do_not_contact`).
- **CT-07**: Third-party broker contact referral.
- **CT-08**: Multi-property conversation — rejection of initial property, offering 2nd property (`CAPTURE_OTHER_PROPERTY`).
- **CT-09**: Conditional purchase dependent on prior sale (`sale_before_purchase`).
- **CT-10**: Price renegotiation / update (prior value marked `superseded`).
- **CT-11**: Family approval dependency condition (`family_approval`).
- **CT-12**: Exclusivity constraint inquiry (`exclusivity_constraint`).
- **CT-13**: Outbound campaign response with relative affirmation ("Sim, esse mesmo").
- **CT-14**: Financial budget revision with price evolution history.
- **CT-15**: Multi-sentence turn with compound intent (sell current home + buy apartment).
- **CT-16**: Informal Brazilian Portuguese slang and colloquial number formats ("800k", "500 paus").
- **CT-17**: Commercial property inquiry with rental value and condo fee.
- **CT-18**: Disjointed turn window needing 120s debouncing coalescence.
- **CT-19**: Audio/image media message payload handling.
- **CT-20**: Spousal disagreement conflict routed to human review inbox.

All 20 cases run end-to-end through `interpretRealEstateTurn` and `PilotCRMAdapter` in `tests/domain-real-estate/golden-cases.test.ts`.

---

## 5. Architectural Invariant & Quality Checks

ZapTrail includes specialized automated assertions that enforce system-wide architectural integrity:

### Domain Leakage Check (`QA-01`)
`tests/domain-real-estate/golden-cases.test.ts` reads all source files in `src/packages/core/` and `src/packages/mcp/` and asserts that zero real-estate domain terms appear in code or schemas:
```typescript
const FORBIDDEN_TOKENS = [
  'imovel', 'imóvel', 'iptu', 'condominio', 'condomínio',
  'aluguel', 'locacao', 'locação', 'dormitorio', 'dormitório',
  'suite', 'suíte', 'corretor', 'proprietario', 'proprietário'
];
```

### 350-Line Ceiling Check
`tests/domain-real-estate/golden-cases.test.ts` checks every `.ts` and `.tsx` file in `src/packages/` to ensure no production source file exceeds 350 lines, enforcing component modularity and focused single-responsibility design.

---

## 6. Running Tests

### Execute Entire Test Suite
```bash
npx vitest run
```

### Run Tests in Watch Mode
```bash
npx vitest
```

### Run a Specific Test Suite
```bash
npx vitest run tests/core/universal-core.test.ts
npx vitest run tests/domain-real-estate/golden-cases.test.ts
npx vitest run tests/mcp/mcp-server.test.ts
```

### Run with Coverage
```bash
npx vitest run --coverage
```

### Type Checking
```bash
npx tsc --noEmit
```
