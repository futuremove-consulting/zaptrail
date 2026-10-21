---
last_mapped_commit: d06d9de5054ef27c22c9de54b94404fea0708adb
last_mapped_at: 2026-10-21
---
# Coding Conventions

**Analysis Date:** 2026-10-21

## Quality Gates & Hard Limits

**The 350-Line Ceiling (`quality/max-lines`):**
- Every production source file in `src/packages/`, `src/app/api/`, and `src/components/` must remain strictly **at or below 350 lines** (AST-verified, currently maximum file length in codebase is 346 lines).
- When a file approaches 320 lines, split sub-responsibilities into co-located modules (e.g., separating schema definitions, converter functions, or adapters).
- Automated test `QA-01 Quality Rule` in `tests/domain-real-estate/golden-cases.test.ts` scans all production files and enforces this ceiling.

**Architectural Boundary Isolation:**
- Zero domain-specific vocabulary (`iptu`, `condo_fee`, `aluguel`, `imovel`, `locacao`, `corretor`) allowed inside `@futuremove/zaptrail-core` or `@futuremove/zaptrail-mcp`.
- Validated by regular expression boundary assertions in `tests/domain-real-estate/golden-cases.test.ts`.

## Naming Patterns

**Files:**
- Kebab-case for services, normalizers, rules, and utilities: `quote-validator.ts`, `turn-window-coalescer.ts`, `normalizer-ptbr.ts`.
- PascalCase for React UI components: `TimelineDual.tsx`.
- Standard Next.js route files: `route.ts`, `layout.tsx`.

**Types & Interfaces:**
- PascalCase with descriptive suffixes: `UniversalInterpretationEnvelope`, `ValueObservation`, `PilotCRMProposal`.
- Zod schemas suffixed with `Schema`: `EvidenceRefSchema`, `IngestWhatsappPayloadSchema`.

**Functions & Methods:**
- camelCase with verb-first intention: `buildEvidenceRef`, `evaluateConfidenceBand`, `classifyPartyRole`, `coalesceTurnWindowWithDebounce`.

**Language Governance:**
- 100% English for all code symbols, types, parameters, method names, and technical comments.
- Portuguese is strictly confined to user-facing prompt strings, regex pattern matching Brazilian colloquial text, and UI labels.

## Code Style & TypeScript

**Type Safety:**
- Strict mode enabled (`tsconfig.json`: `"strict": true`).
- No `any` in production domain models; unknown external payloads are parsed with Zod schemas.
- Interfaces prefer `readonly` properties for immutable data models.

**Data Immutability & Epistemic Tracking:**
- Original payloads in review items (`original_payload`) are treated as immutable and never mutated during human edits.
- Prior values are marked with `epistemic_status: 'superseded'` rather than destructively deleted.

## Import Organization

**Order:**
1. Standard Node.js built-ins (`stream`, `readline`, `path`, `fs`).
2. External packages (`zod`, `vitest`).
3. Core contracts (`../core/types`, `../core/supabase-storage`).
4. Local package modules and utilities.

**Path Aliases:**
- Use relative imports within package submodules or package name aliases defined in `tsconfig.json`.

## Error Handling

**Boundary Guards:**
- Multi-tenant boundary functions (e.g. `assertTenantScope(tenantId)`) throw immediate descriptive errors if tenant is missing, whitespace-only, or invalid.

**REST Routes:**
- Return `NextResponse.json({ error: message }, { status: 400 })` for validation failures.
- Return `NextResponse.json({ error: message }, { status: 500 })` for unexpected runtime exceptions.

**MCP Protocol:**
- Protocol-level errors return JSON-RPC 2.0 error codes (`-32700` parse error, `-32600` invalid request, `-32601` method not found, `-32602` invalid params, `-32603` internal error).
- Business tool execution errors return `{ isError: true, content: [{ type: 'text', text: errorMessage }] }`.

---

*Convention analysis: 2026-10-21*
