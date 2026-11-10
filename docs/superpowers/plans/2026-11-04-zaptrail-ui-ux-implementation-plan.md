# ZapTrail Operation Cockpit & Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir as interfaces completas de **Operação pelo Usuário** (Fila de Revisão 3-Colunas, Timeline Dual Sincronizada e Memória de Oportunidades com Peek Sheet) e de **Configuração e Administração pelo Administrador** (Canais WhatsApp, Inteligência/Limiares de Confiança, Integração PilotCRM, Reprocessamento Backfill e Workspace/MCP), seguindo as 10 Heurísticas de Nielsen e o Design System Canônico do PilotCRM.

**Architecture:** Arquitetura em 3 camadas compatível com o PilotCRM (`ui` primitivos OKLCH sem HTML interativo cru $\rightarrow$ componentes de domínio `operation/` e `admin/` $\rightarrow$ rotas App Router e endpoints REST `/api/v1/*` conectados diretamente ao `SupabaseStoragePort`, `ReviewInboxService`, `BackfillRunner` e `OutboundDispatcher`). Todas as rotas suportam operação imediata com dados de demonstração (`MockWhatsAppProvider` + 20 Casos-Ouro) e operação ao vivo (`PostgrestSupabaseClient` + `UAZAPI` + `PilotCRMAdapter`).

**Tech Stack:** TypeScript 5+, Next.js App Router, React, Tailwind CSS (Tokens OKLCH PilotCRM), Zod, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-04-zaptrail-ui-ux-design.md`](../specs/2026-11-04-zaptrail-ui-ux-design.md)

## Global Constraints

- **350-Line Ceiling (`quality/max-lines`):** Todo arquivo `.ts`/`.tsx` de produção deve ter $\le 350$ linhas (`node scripts/check-quality-gates.mjs`).
- **Zero Domain Leakage in Core/MCP:** `src/packages/core/` e `src/packages/mcp/` jamais podem conter tokens imobiliários (`iptu`, `condominio`, `sale_asking_price`, `corretor`, etc.).
- **English Code / pt-BR UI Copy:** Identificadores de código 100% em inglês; textos visíveis 100% em `pt-BR` obedecendo às 6 Leis de UI/UX Writing (CTAs de 1–2 palavras no infinitivo, zero advérbios temporais como "Agora"/"Já", zero `/` ou `&` em rótulos, zero jargão técnico).
- **PilotCRM Design System & Datum Line (`h-14`):** Cabeçalhos da Sidebar e do Main alinhados em `y = 56px` (`h-14 border-b border-border bg-card`), tokens semânticos OKLCH (`bg-primary`, `bg-card`, `bg-muted`, `text-success`, `text-warning`, `text-destructive`), *The Scrim Contract* em overlays (`bg-card shadow-2xl` + `bg-black/60 backdrop-blur-xs`) e alvos de toque $\ge 44\times 44\text{px}$.
- **Anti-Teatro & Persistência Real:** Todas as ações de UI (`Aprovar Sugestão`, `Editar Dados`, `Rejeitar Item`, `Salvar Configurações`, `Processar Conversas`) chamam rotas reais de API com isolamento por `tenant_id`.

## Review Focus

1. **Preservação de `original_payload` na edição humana:** Quando o operador edita um valor ou bairro antes de aprovar na Fila de Revisão, `original_payload` deve permanecer intacto enquanto `resolved_payload` recebe os novos campos e `epistemic_status: "validated_human"`.
2. **Offsets determinísticos no highlight `"Mostrar na Conversa"`:** Mesmo quando `char_start`/`char_end` não vierem preenchidos, `buildShowInConversationLink` deve localizar `exact_quote` sem lançar erro nem quebrar o JSX caso a citação não seja encontrada.
3. **Diferenciação entre `EmptyState` e `FilteredEmptyState`:** Quando existirem itens no banco/memória mas o filtro atual retornar vazio, a tela deve exibir obrigatoriamente o botão `Limpar Filtros` em vez de dizer que não há conversas conectadas.
4. **Mascaramento seguro de tokens no Console Admin:** `GET /api/v1/admin/config` nunca deve retornar `apiToken` ou `uazapiToken` em texto aberto — apenas versão mascarada (`zt_live_...****`) e flag `configured: true`.
5. **Compatibilidade Next.js 16 em Route Handlers:** Qualquer rota que receba `context.params` deve resolver `await Promise.resolve(context.params)`.

---

## Mapa de Ondas de Execução Paralela (Wave Formation)

| Onda (Wave) | Tasks na Onda | Escopo de Arquivos (`Files:` 100% Disjuntos) |
| :--- | :--- | :--- |
| **Wave 1: Fundação Visual & APIs Backend** | **Task 1** (Design Tokens & Primitivos UI PilotCRM)<br/>**Task 2** (APIs de Operação: Reviews, Conversations, Opportunities)<br/>**Task 3** (APIs de Administração: Config, Channels, Backfill) | `src/components/ui/*`, `src/app/globals.css`<br/>`src/app/api/v1/reviews/*`, `src/app/api/v1/conversations/*`, `src/app/api/v1/opportunities/*`<br/>`src/app/api/v1/admin/*` |
| **Wave 2: Componentes de Domínio (Operação vs. Admin)** | **Task 4** (Componentes da Fila de Revisão 3-Colunas)<br/>**Task 5** (Timeline Dual & Peek Sheet de Oportunidades)<br/>**Task 6** (Componentes do Console de Administração) | `src/components/operation/review-*`<br/>`src/components/timeline/*`, `src/components/conversations/*`, `src/components/operation/opportunity-*`<br/>`src/components/admin/*` |
| **Wave 3: Páginas AppShell, Integração & Hardening** | **Task 7** (AppShell `h-14`, Rotas `/app/*`, Onboarding & Suíte E2E) | `src/app/app/*`, `src/app/(app)/*`, `tests/ui/*` |

---

### Task 1: PilotCRM OKLCH Tokens & Canonical UI Primitives (`@repo/ui` Equivalent)

**Depends-on:** `none`
**Files:**
- Create: `src/app/globals.css`
- Create: `src/components/ui/primitives.tsx`
- Create: `src/components/ui/page-shell.tsx`
- Create: `src/components/ui/overlays.tsx`
- Test: `tests/ui/primitives-and-states.test.ts`

**Interfaces:**
- Produces:
  - `Button`, `IconButton`, `Badge`, `Card`, `Input`, `Select`, `Switch`, `Field`, `FieldLabel` in `src/components/ui/primitives.tsx`
  - `AppShell`, `PageHeader`, `EmptyState`, `FilteredEmptyState`, `ErrorState`, `SkeletonBlock` in `src/components/ui/page-shell.tsx`
  - `Sheet`, `Dialog`, `DirtyStateSaveBar` in `src/components/ui/overlays.tsx`

- [ ] **Step 1: Write the failing test in `tests/ui/primitives-and-states.test.ts`**
  Test that `AppShell` enforces the `h-14` datum line class (`h-14 border-b border-border bg-card`), `IconButton` and `Switch` require `ariaLabel: string`, `FilteredEmptyState` renders the `"Limpar Filtros"` recovery action, `ErrorState` renders `role="alert"` and `"Tentar Novamente"`, and `Sheet` applies the opaque scrim contract (`bg-card shadow-2xl` + `bg-black/60 backdrop-blur-xs`).

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx.cmd vitest run tests/ui/primitives-and-states.test.ts`
  Expected: FAIL with module not found `src/components/ui/primitives`.

- [ ] **Step 3: Implement OKLCH tokens (`src/app/globals.css`) and UI primitives (`primitives.tsx`, `page-shell.tsx`, `overlays.tsx`)**
  Copy PilotCRM's exact OKLCH CSS variables (`--primary: oklch(0.491 0.27 292.581)`, `--background`, `--card`, `--muted`, `--border`, `--success`, `--warning`, `--destructive`, `--category-*`) into `src/app/globals.css` and implement lightweight, zero-dependency React primitives strictly under 350 lines per file.

- [ ] **Step 4: Run test and quality gates**
  Run: `npx.cmd vitest run tests/ui/primitives-and-states.test.ts && node scripts/check-quality-gates.mjs`
  Expected: PASS.

---

### Task 2: User Operation REST APIs (Reviews, Conversations & Opportunities with Demo Seeding)

**Depends-on:** `none`
**Files:**
- Create: `src/packages/api/workspace-runtime.ts`
- Create: `src/app/api/v1/reviews/route.ts`
- Create: `src/app/api/v1/conversations/route.ts`
- Create: `src/app/api/v1/opportunities/route.ts`
- Test: `tests/api/operation-ui-routes.test.ts`

**Interfaces:**
- Consumes: `SupabaseStoragePort`, `ReviewInboxService`, `buildShowInConversationLink`, `RealEstateDomainPack`, `GOLDEN_CASES`
- Produces:
  - `getWorkspaceRuntime(tenantId: string)` in `src/packages/api/workspace-runtime.ts` (provides shared storage + optional auto-seed of golden real-estate fixtures in demo mode)
  - `GET /api/v1/reviews` (lists reviews by `tenantId`, `status`, `severity`, `search`) & `PATCH /api/v1/reviews` (resolves a review item via `ReviewInboxService.resolveReviewItem` with `approve | edit | reject` and supports `undo` restoration)
  - `GET /api/v1/conversations` (lists conversations with last message, extracted object counts, and full `TurnWindow` + `ShowInConversationLinkResult` when `conversationId` is passed)
  - `GET /api/v1/opportunities` (lists extracted opportunities, property drafts, historical value evolution, and PilotCRM proposal status)

- [ ] **Step 1: Write the failing test in `tests/api/operation-ui-routes.test.ts`**
  Verify:
  1. `GET /api/v1/reviews?tenantId=ws_demo&seedDemo=true` returns seeded review items with exact evidence quotes and `char_start`/`char_end`.
  2. `PATCH /api/v1/reviews` with `decision: "edit"` updates `resolved_payload`, sets `epistemic_status: "validated_human"`, and preserves `original_payload` intact.
  3. `PATCH /api/v1/reviews` with `decision: "undo"` restores the item to `status: "pending"`.
  4. `GET /api/v1/conversations?tenantId=ws_demo&conversationId=...&anchor=msg_...` returns messages, extracted objects, and exact highlight segments.
  5. `GET /api/v1/opportunities?tenantId=ws_demo` returns multi-property candidates (`CAPTURE_OTHER_PROPERTY`) and historical value observations.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx.cmd vitest run tests/api/operation-ui-routes.test.ts`
  Expected: FAIL with module not found.

- [ ] **Step 3: Implement `workspace-runtime.ts` and the 3 route handlers**
  Keep each file $\le 250$ lines, validate inputs with Zod, enforce `assertTenantScope`, and support `params: Promise<...>`.

- [ ] **Step 4: Run test and quality gates**
  Run: `npx.cmd vitest run tests/api/operation-ui-routes.test.ts && node scripts/check-quality-gates.mjs`
  Expected: PASS.

---

### Task 3: Admin & Configuration REST APIs (Channels, Confidence Policy, PilotCRM & Backfill)

**Depends-on:** `none`
**Files:**
- Create: `src/packages/api/admin-config-store.ts`
- Create: `src/app/api/v1/admin/config/route.ts`
- Create: `src/app/api/v1/admin/backfill/route.ts`
- Test: `tests/api/admin-ui-routes.test.ts`

**Interfaces:**
- Consumes: `BackfillRunner`, `OutboundDispatcher`, `ConfidencePolicy`
- Produces:
  - `TenantAdminConfigSchema` & `AdminConfigStore` in `src/packages/api/admin-config-store.ts`
  - `GET /api/v1/admin/config` (returns tenant config with masked tokens `****`) & `PUT /api/v1/admin/config` (validates URL/thresholds via Zod, ensures `autoConfirmThreshold > reviewThreshold`, saves config)
  - `POST /api/v1/admin/backfill` (executes `BackfillRunner.runBatch` on selected conversations and returns metrics + audit run logs)

- [ ] **Step 1: Write the failing test in `tests/api/admin-ui-routes.test.ts`**
  Verify:
  1. `GET /api/v1/admin/config?tenantId=ws_demo` returns default confidence thresholds (`0.85` auto, `0.65` review), active domain pack (`real_estate_ptbr`), and masked secrets.
  2. `PUT /api/v1/admin/config` rejects invalid confidence ranges (e.g., `reviewThreshold >= autoConfirmThreshold`) with HTTP 400 and human pt-BR error message, and masks saved tokens on response.
  3. `POST /api/v1/admin/backfill` runs idempotent backfill via `BackfillRunner` and returns `processedCount`, `skippedDuplicateCount`, and `extractionRuns`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx.cmd vitest run tests/api/admin-ui-routes.test.ts`
  Expected: FAIL with module not found.

- [ ] **Step 3: Implement `admin-config-store.ts`, `admin/config/route.ts`, and `admin/backfill/route.ts`**
  Enforce Zod validation, token masking, and tenant isolation.

- [ ] **Step 4: Run test and quality gates**
  Run: `npx.cmd vitest run tests/api/admin-ui-routes.test.ts && node scripts/check-quality-gates.mjs`
  Expected: PASS.

---

### Task 4: User Operation Components — 3-Column Intelligent Review Inbox

**Depends-on:** `Task 1`, `Task 2`
**Files:**
- Create: `src/components/operation/epistemic-labels.ts`
- Create: `src/components/operation/review-queue-list.tsx`
- Create: `src/components/operation/review-decision-panel.tsx`
- Create: `src/components/operation/review-inbox-workspace.tsx`
- Test: `tests/ui/review-inbox-workspace.test.ts`

**Interfaces:**
- Consumes: UI primitives from `Task 1`, review contracts from `Task 2`
- Produces:
  - `formatEpistemicStatusPtBr`, `formatIntentLabelPtBr`, `formatRoleLabelPtBr`, `formatCurrencyBrl` in `src/components/operation/epistemic-labels.ts`
  - `ReviewInboxWorkspace` (3-column layout: `ReviewQueueList` + `ConversationContextViewer` + `ReviewDecisionPanel`, keyboard shortcuts `j`/`k`/`a`/`e`/`r`/`m`/`Escape`, 8-second Undo toast, and all 5 mandatory screen states)

- [ ] **Step 1: Write the failing test in `tests/ui/review-inbox-workspace.test.ts`**
  Verify:
  1. Zero technical jargon in rendered output (`validated_human` renders as `"Validado por Você"`, `inferred` renders as `"Sugestão da IA"`, `capture_for_sale` renders as `"Captação para Venda"`).
  2. Keyboard shortcut handler maps `j`/`k` to next/previous item, `a` to approve, `e` to edit mode, `r` to reject, `m` to highlight anchor in conversation.
  3. Inline edit preserves original values in the before/after comparator and submits `decision: "edit"`.
  4. All CTA labels comply with the 6 Laws of UI/UX Writing (`Aprovar Sugestão`, `Editar Dados`, `Rejeitar Item`, `Limpar Filtros`, `Tentar Novamente`).

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx.cmd vitest run tests/ui/review-inbox-workspace.test.ts`
  Expected: FAIL.

- [ ] **Step 3: Implement `epistemic-labels.ts`, `review-queue-list.tsx`, `review-decision-panel.tsx`, and `review-inbox-workspace.tsx`**
  Ensure each file is $\le 300$ lines and uses only semantic OKLCH classes and `@repo/ui`-aligned primitives.

- [ ] **Step 4: Run test and quality gates**
  Run: `npx.cmd vitest run tests/ui/review-inbox-workspace.test.ts && node scripts/check-quality-gates.mjs`
  Expected: PASS.

---

### Task 5: User Operation Components — Timeline Dual & Opportunities Peek Sheet

**Depends-on:** `Task 1`, `Task 2`
**Files:**
- Modify: `src/components/conversations/ConversationList.tsx`
- Modify: `src/components/timeline/TimelineDual.tsx`
- Create: `src/components/operation/opportunity-peek-sheet.tsx`
- Create: `src/components/operation/opportunities-catalog.tsx`
- Test: `tests/ui/timeline-and-opportunities.test.ts`

**Interfaces:**
- Consumes: `buildShowInConversationLink`, UI primitives from `Task 1`, API routes from `Task 2`
- Produces:
  - Refactored `ConversationList` & `TimelineDual` connected to `/api/v1/conversations` and `/api/v1/reviews` (eliminating stubbed `return []` and `console.log` handlers, fixing invalid JSX syntax in `ConversationList.tsx:66`, and replacing forbidden `border-l-4` with semantic `Badge`)
  - `OpportunitiesCatalog` + `OpportunityPeekSheet` (`?inspectId=opp_...` in-place inspection without context-stripping, showing multi-property split and historical value timeline)

- [ ] **Step 1: Write the failing test in `tests/ui/timeline-and-opportunities.test.ts`**
  Verify:
  1. `TimelineDual` fetches real conversation messages and extracted objects, highlights exact character offsets via `buildTimelineHighlightSegments`, and invokes the real review API on confirm/reject/edit.
  2. `OpportunitiesCatalog` opens `OpportunityPeekSheet` in-place via `?inspectId=` while preserving active search and filter state, and renders `FilteredEmptyState` with `"Limpar Filtros"` when filters match 0 rows.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx.cmd vitest run tests/ui/timeline-and-opportunities.test.ts`
  Expected: FAIL.

- [ ] **Step 3: Refactor `ConversationList.tsx` and `TimelineDual.tsx`, and implement `opportunity-peek-sheet.tsx` and `opportunities-catalog.tsx`**
  Remove all raw `<button>` tags, `border-l-4`, and `console.log` stubs; connect to the real API layer.

- [ ] **Step 4: Run test and quality gates**
  Run: `npx.cmd vitest run tests/ui/timeline-and-opportunities.test.ts && node scripts/check-quality-gates.mjs`
  Expected: PASS.

---

### Task 6: Admin Console Components (Channels, Intelligence, PilotCRM, Backfill & Workspace)

**Depends-on:** `Task 1`, `Task 3`
**Files:**
- Create: `src/components/admin/channels-settings-section.tsx`
- Create: `src/components/admin/intelligence-settings-section.tsx`
- Create: `src/components/admin/pilotcrm-settings-section.tsx`
- Create: `src/components/admin/backfill-audit-section.tsx`
- Create: `src/components/admin/admin-console.tsx`
- Test: `tests/ui/admin-console.test.ts`

**Interfaces:**
- Consumes: UI primitives from `Task 1`, Admin APIs from `Task 3`
- Produces:
  - `AdminConsole` unified settings cockpit with 5 sections (`Canais de WhatsApp`, `Inteligência e Domínio`, `Integração PilotCRM`, `Reprocessamento e Auditoria`, `Workspace e MCP`), `DirtyStateSaveBar` on unsaved edits, connection health check, and live `BackfillRunner` execution report.

- [ ] **Step 1: Write the failing test in `tests/ui/admin-console.test.ts`**
  Verify:
  1. Editing any threshold or URL activates the `DirtyStateSaveBar` (`Descartar Alterações` | `Salvar Configurações`).
  2. `IntelligenceSettingsSection` validates that `autoConfirmThreshold` ($\ge 85\%$) is strictly greater than `reviewThreshold` ($65\%$) before saving.
  3. `PilotCrmSettingsSection` masks the Bearer token by default, provides `Mostrar token` / `Ocultar token` with `aria-label`, and triggers `Testar Conexão`.
  4. `BackfillAuditSection` displays the real button counter `Processar Conversas (N)` and renders the execution summary and anti-hallucination audit badges.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx.cmd vitest run tests/ui/admin-console.test.ts`
  Expected: FAIL.

- [ ] **Step 3: Implement the 5 admin components in `src/components/admin/`**
  Follow Archetype 3 (Settings Layout) of PilotCRM with flat `Card` containers and `Field` + `FieldLabel` accessibility.

- [ ] **Step 4: Run test and quality gates**
  Run: `npx.cmd vitest run tests/ui/admin-console.test.ts && node scripts/check-quality-gates.mjs`
  Expected: PASS.

---

### Task 7: AppShell `h-14` Routes, Onboarding Polishing & End-to-End Verification

**Depends-on:** `Task 4`, `Task 5`, `Task 6`
**Files:**
- Modify: `src/app/app/layout.tsx`
- Modify: `src/app/app/page.tsx`
- Modify: `src/app/(app)/onboarding/onboarding.page.tsx`
- Create: `src/app/app/review/page.tsx`
- Create: `src/app/app/conversations/page.tsx`
- Create: `src/app/app/opportunities/page.tsx`
- Create: `src/app/app/admin/page.tsx`
- Modify: `src/server.ts`
- Test: `tests/ui/zaptrail-cockpit-e2e.test.ts`

**Interfaces:**
- Consumes: `AppShell` (`Task 1`), `ReviewInboxWorkspace` (`Task 4`), `TimelineDual` & `OpportunitiesCatalog` (`Task 5`), `AdminConsole` (`Task 6`)
- Produces:
  - Complete Next.js App Router pages under `src/app/app/*`, fixed syntax errors in `src/app/app/page.tsx` and `src/app/(app)/onboarding/onboarding.page.tsx` (`value:value={workspaceName}` typo fixed), and mounted `/api/v1/reviews`, `/api/v1/conversations`, `/api/v1/opportunities`, `/api/v1/admin/*` routes in `src/server.ts`.

- [ ] **Step 1: Write the failing E2E integration test in `tests/ui/zaptrail-cockpit-e2e.test.ts`**
  Verify the complete user and admin loop:
  1. Admin configures confidence thresholds and PilotCRM webhook in `AdminConsole` (`PUT /api/v1/admin/config`).
  2. Admin runs historical backfill (`POST /api/v1/admin/backfill`) or ingests a WhatsApp turn (`POST /api/v1/ingest/whatsapp`).
  3. Operator opens `ReviewInboxWorkspace`, inspects the exact highlighted quote in `ConversationContextViewer`, edits the asking price, and clicks `Aprovar Sugestão` (`PATCH /api/v1/reviews`).
  4. Operator inspects the resulting opportunity in `OpportunitiesCatalog` via Peek Sheet (`?inspectId=...`) and verifies `epistemic_status === "validated_human"` with `original_payload` preserved.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx.cmd vitest run tests/ui/zaptrail-cockpit-e2e.test.ts`
  Expected: FAIL.

- [ ] **Step 3: Implement the App Router pages, fix `page.tsx` and `onboarding.page.tsx`, and mount the new API routes in `src/server.ts`**
  Ensure every file stays well below 350 lines.

- [ ] **Step 4: Run full verification suite**
  Run:
  ```bash
  node scripts/check-quality-gates.mjs
  npx.cmd tsc --noEmit
  npx.cmd vitest run
  ```
  Expected: 100% PASS with zero quality gate, typecheck, or test errors.
