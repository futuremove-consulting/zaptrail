---
last_mapped_commit: d06d9de5054ef27c22c9de54b94404fea0708adb
last_mapped_at: 2026-10-21
---
# Technology Stack

**Analysis Date:** 2026-10-21

## Languages

**Primary:**
- TypeScript 5.6+ - 100% of core packages, adapters, API routes, tests and UI components (`tsconfig.json`, `src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- SQL (PostgreSQL 15+) - Database schemas, RLS policies, indexes and triggers (`supabase/migrations/*.sql`)

## Runtime

**Environment:**
- Node.js 20+ LTS (ESM modules: `"type": "module"` in `package.json`)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- Next.js 14+ (App Router) - Webhooks ingest API (`src/app/api/v1/ingest/whatsapp/route.ts`), management objects API (`src/app/api/management-objects/route.tsx`) and UI pages (`src/app/(app)/`)
- React 18+ - UI timeline and conversation review components (`src/components/timeline/TimelineDual.tsx`, `src/components/conversations/ConversationList.tsx`)

**Testing:**
- Vitest 2.1+ - Test runner and assertion library (`vitest.config.ts`, 14 test suites, 214 automated tests)

**Validation & Schema:**
- Zod 3.23+ - Canonical data validation schemas for Universal Semantic Envelope, real estate domain entities, PilotCRM enrichment actions, WhatsApp webhooks and MCP tool arguments

**Protocol & Agent Integration:**
- Model Context Protocol (MCP) JSON-RPC 2.0 (protocol version `2024-11-05`) - Standard stdio transport for AI agents (`src/packages/mcp/`)

## Key Dependencies

**Critical:**
- `zod` (^3.23.8) - Runtime validation, type inference and JSON schema conversion for LLM structured outputs across all packages.
- `@types/node` (^20.14.0) - Node.js type definitions for streams, readline and buffer operations.

**Development:**
- `typescript` (^5.6.0) - Static type checking (`npm run typecheck` / `tsc --noEmit`).
- `vitest` (^2.1.0) - Fast ESM-native test runner (`npm test` / `vitest run`).

## Configuration

**TypeScript (`tsconfig.json`):**
- Target: `ES2022`, Module: `NodeNext` / `ESNext`, Strict: `true`.
- Path aliases: `@futuremove/zaptrail-core` (`./src/packages/core`), `@futuremove/zaptrail-domain-real-estate` (`./src/packages/domain-real-estate`), `@futuremove/zaptrail-mcp` (`./src/packages/mcp`), `@/*` (`./src/*`).

**Vitest (`vitest.config.ts`):**
- Environment: `node`.
- Test path glob: `tests/**/*.test.ts`, `src/**/*.test.ts`.

## Platform Requirements

**Development:**
- Node.js 20+ on Linux, macOS, or Windows (tested on Windows PowerShell with `.cmd` shims).

**Production:**
- Vercel (Edge/Serverless Next.js functions for REST API).
- Supabase (PostgreSQL 15 with Row Level Security).
- Local stdio / Docker container for MCP Server (`@futuremove/zaptrail-mcp`).

---

*Stack analysis: 2026-10-21*
