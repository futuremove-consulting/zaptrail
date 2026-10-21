<!-- generated-by: gsd-doc-writer -->
# Development Guide

This document describes the engineering practices, quality gates, and development workflows for contributors to ZapTrail.

---

## Core Engineering Mindset

ZapTrail follows strict software engineering discipline:

1. **Test-Driven Development (The Iron Law)**:
   ```
   NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
   ```
   Always author the minimal test specifying expected behavior (Red), run it to verify failure, implement minimal code (Green), and refactor.

2. **The 350-Line Ceiling (`quality/max-lines`)**:
   - Every production file in `src/packages/`, `src/app/api/`, and `src/components/` must remain **at or below 350 lines**.
   - This rule is enforced automatically by tests in `tests/domain-real-estate/golden-cases.test.ts`.

3. **Architectural Boundary Isolation**:
   - Prohibited domain vocabulary (`iptu`, `condo_fee`, `aluguel`, `imovel`, `locacao`, `corretor`) is barred from `@futuremove/zaptrail-core` and `@futuremove/zaptrail-mcp`.
   - Never import from domain packages inside core.

---

## Package Structure & Boundaries

```
src/packages/
├── core/                  # Universal semantic contracts, engine, storage, quote validator
├── domain-real-estate/    # Real estate rules, pt-BR normalizers, PilotCRM adapter
├── api/                   # Webhook ingest handler & schemas
└── mcp/                   # Model Context Protocol stdio server
```

### Dependency Rules:
- `core` cannot import from `domain-real-estate`, `api`, `mcp`, or Next.js `app`.
- `mcp` depends only on `core` and `api` interfaces; it contains zero domain logic.
- `domain-real-estate` implements `DomainPack` and `CRMAdapter` defined by `core`.

---

## Useful Development Commands

```bash
# Run full Vitest test suite
npm test

# Run Vitest in watch mode
npx vitest

# Run TypeScript static analysis
npm run typecheck

# Run a specific test suite
npx vitest run tests/domain-real-estate/golden-cases.test.ts
```

*Note for Windows users:* In PowerShell, execute single commands or join with `;` rather than `&&`.

---

## Git Conventions & Operating System Notes

- **Commit Messages**: Conventional Commits format:
  - `feat(core): implement value evolution`
  - `fix(adapter-pilotcrm): correct enrichment_action mapping`
  - `test(golden-cases): verify CT-08 multi-property capture`
  - `docs(api): update webhook documentation`
- **Windows NTFS Compatibility**: Never create or checkout branch files containing colons (`:`) in filenames, as Windows NTFS prohibits this character.
