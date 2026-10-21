# Codebase Structure

**Analysis Date:** 2026-10-21

## Directory Layout

```
dazzling-goodall/
├── .planning/                              # GSD planning, milestone archives, codebase intel
│   ├── codebase/                           # Codebase architectural and convention documents
│   ├── milestones/                         # Archived milestone files (ROADMAP, REQUIREMENTS, AUDIT, phases)
│   ├── MILESTONES.md                       # Historical ledger of shipped releases
│   ├── PROJECT.md                          # Living project state and requirements
│   ├── ROADMAP.md                          # Milestone groupings and roadmap phases
│   └── STATE.md                            # Real-time orchestrator progress state
├── src/
│   ├── app/                                # Next.js App Router (UI routes & REST APIs)
│   │   ├── (app)/onboarding/               # Onboarding interface pages
│   │   ├── api/
│   │   │   ├── management-objects/         # Management objects CRUD API
│   │   │   └── v1/ingest/whatsapp/         # WhatsApp webhook ingest endpoint
│   │   ├── layout.tsx                      # Root layout
│   │   └── page.tsx                        # Home entry page
│   ├── components/                         # React UI components
│   │   ├── conversations/                  # Conversation listings
│   │   └── timeline/                       # TimelineDual ("Mostrar na conversa")
│   └── packages/                           # Modular Package-First Architecture
│       ├── api/                            # REST Ingest Pipeline handler & schemas
│       ├── core/                           # Universal Semantic Envelope, Engine & Storage
│       ├── domain-real-estate/             # Real Estate Domain Pack & PilotCRM Adapter
│       │   ├── adapters/                   # CRM adapters (PilotCRMAdapter)
│       │   └── llm/                        # Real estate LLM schemas, prompts & mock
│       └── mcp/                            # Model Context Protocol stdio server & tools
├── supabase/
│   └── migrations/                         # PostgreSQL SQL schemas (001-004) with RLS
├── tests/                                  # Automated Vitest test suites
│   ├── api/                                # REST API route and ingest pipeline tests
│   ├── core/                               # Core engine, storage, quote-validator tests
│   ├── domain-real-estate/                 # Parser, normalizer, golden cases tests
│   ├── mcp/                                # MCP JSON-RPC 2.0 handshake & tool tests
│   └── shims/                              # Test mocks for Next.js and Supabase
├── package.json                            # Root package manifest
├── tsconfig.json                           # TypeScript configuration
└── vitest.config.ts                        # Vitest test runner configuration
```

## Directory Purposes

**`src/packages/core/`:**
- Purpose: Universal Semantic Core contracts and engine.
- Contains: Types (`types.ts`), evidence calculation (`evidence.ts`), confidence policy (`confidence-policy.ts`), universal engine (`engine.ts`), hybrid engine (`hybrid-engine.ts`), quote validator (`quote-validator.ts`), review inbox service (`review-inbox.ts`), and Supabase storage port (`supabase-storage.ts`).
- Constraint: 100% domain-agnostic; zero real estate vocabulary.

**`src/packages/domain-real-estate/`:**
- Purpose: Brazilian real estate domain pack and CRM adapters.
- Contains: Domain types (`types.ts`), pt-BR normalizers (`normalizer-ptbr.ts`), role/intent/condition rules (`role-intent-rules.ts`), multi-property orchestrator (`opportunity-orchestrator.ts`), turn coalescer (`turn-window-coalescer.ts`), golden fixtures (`golden-fixtures.ts`), and `PilotCRMAdapter`.

**`src/packages/mcp/`:**
- Purpose: Model Context Protocol (MCP) server for AI agent integrations.
- Contains: MCP server (`server.ts`) and stdio line runner (`index.ts`).

**`src/packages/api/`:**
- Purpose: Webhook and API ingest pipeline abstraction.
- Contains: Payload schema validation, domain pack resolution, deduplication guards (`ingest-handler.ts`).

## Key File Locations

**Entry Points:**
- REST Webhook API: `src/app/api/v1/ingest/whatsapp/route.ts`
- MCP Server Stdio: `src/packages/mcp/index.ts`
- Core Package Barrel: `src/packages/core/index.ts`
- Domain Real Estate Barrel: `src/packages/domain-real-estate/index.ts`

**Configuration:**
- Root Dependencies: `package.json`
- Compiler Options: `tsconfig.json`
- Test Runner: `vitest.config.ts`

**Database Schema:**
- Supabase SQL Migrations: `supabase/migrations/001-workspace-schema.sql` through `004-zaptrail-audit-and-review-schema.sql`

## Naming Conventions

**Files:**
- Kebab-case for TypeScript utilities, services, and tests: `turn-window-coalescer.ts`, `quote-validator.test.ts`.
- PascalCase for React UI components: `TimelineDual.tsx`, `ConversationList.tsx`.
- Standard Next.js conventions: `route.ts`, `layout.tsx`, `page.tsx`.

**Code Identifiers:**
- 100% English for code symbols, types, functions, and comments: `classifyPartyRole`, `applyValueEvolution`, `UniversalInterpretationEnvelope`.
- Portuguese only inside prompt templates, regex matching pt-BR user messages, and UI display strings.

## Where to Add New Code

**Adding a New Domain Pack (e.g. Healthcare, B2B Sales):**
- Create directory: `src/packages/domain-<name>/`
- Implement `DomainPack<TDomainEntities>` from `@futuremove/zaptrail-core`
- Export from barrel `src/packages/domain-<name>/index.ts`
- Register pack identifier in `src/packages/api/ingest-handler.ts` (`resolveDomainPack`)

**Adding a New CRM Adapter (e.g. HubSpot, Salesforce):**
- Place in `src/packages/domain-<domain>/adapters/<crm>-adapter.ts`
- Implement `CRMAdapter<TProposal>` from `@futuremove/zaptrail-core`
- Add unit tests in `tests/domain-<domain>/<crm>-adapter.test.ts`

**Adding a New MCP Tool:**
- Define tool declaration in `MCP_TOOLS` in `src/packages/mcp/server.ts`
- Add handler method in `ZapTrailMcpServer`
- Add test coverage in `tests/mcp/mcp-server.test.ts`

---

*Structure analysis: 2026-10-21*
