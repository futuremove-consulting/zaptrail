# Roadmap: ZapTrail

## Milestones

- ✅ **v1.0.0 ZapTrail MVP Package-First** — Phases 1-4 (shipped 2026-10-21) — [Archive](.planning/milestones/v1.0.0-ROADMAP.md)
- 🚧 **v1.1.0 PilotCRM Native Integration & Marketplace** — Phases 5-8 (In progress)

## Phases

<details>
<summary>✅ v1.0.0 ZapTrail MVP Package-First (Phases 1-4) — SHIPPED 2026-10-21</summary>

- [x] Phase 1: Core Contracts, Real Estate Domain Pack & Deterministic Engine (3/3 plans) — completed 2026-10-21
- [x] Phase 2: Hybrid Stage 2 Structured LLM Fallback & Outbound Context (2/2 plans) — completed 2026-10-21
- [x] Phase 3: Supabase RLS Persistence, Audit Trail & Review Inbox (2/2 plans) — completed 2026-10-21
- [x] Phase 4: Standalone Spin-Out Surface (REST API & MCP Server) (2/2 plans) — completed 2026-10-21

</details>

### Milestone v1.1.0

- [x] **Phase 5: PilotCRM Module Registry & Marketplace Card** (3/3 plans) — completed 2026-10-22
- [ ] **Phase 6: PilotCRM 3 Ingest Triggers Integration** - Conexão do webhook realtime, crons 4x/dia e botões CTA com o ZapTrail
- [ ] **Phase 7: Outbound Webhook & Proposal Persistence Loop** - Despacho de webhooks e gravação de propostas no PilotCRM com conformidade estrita a enrichment_action_ck
- [ ] **Phase 8: End-to-End Cross-Repo Integration & Verification** - Validação E2E com simulação de cenários reais, deduplicação e conversão de proposta em Deal

---

## Phase Details

### Phase 5: PilotCRM Module Registry & Marketplace Card
**Goal**: Registrar o ZapTrail como módulo no PilotCRM e permitir ativação e configuração por tenant em `/crm/settings/modules`.
**Depends on**: Milestone v1.0.0
**Requirements**: PCRM-01, PCRM-02
**Success Criteria** (what must be TRUE):
  1. ZapTrail é registrado com chave, nome, categoria e flags em `apps/pilotcrm/src/lib/module-flags/types.ts`.
  2. O Card do ZapTrail é renderizado na tela de Módulos (`/crm/settings/modules`) com switches e campos de API URL e token.
  3. A ativação do módulo e credenciais persistem por workspace no banco do PilotCRM com token cifrado sem vazamento em localStorage.
**Plans**: 3 plans

Plans:
- [x] 05-01: Module Registry, Feature Flags e validação Zod no PilotCRM — completed 2026-10-21
- [x] 05-02: Card do ZapTrail e parâmetros de conexão na UI de Módulos — completed 2026-10-21
- [x] 05-03: Persistência server-side com token cifrado e eliminação de localStorage — completed 2026-10-22

### Phase 6: PilotCRM 3 Ingest Triggers Integration
**Goal**: Conectar os 3 pontos de entrada do PilotCRM (webhook realtime, crons 4x/dia e botão sob demanda) ao endpoint de ingestão do ZapTrail.
**Depends on**: Phase 5
**Requirements**: PCRM-03, PCRM-04, PCRM-05
**Success Criteria** (what must be TRUE):
  1. Webhook realtime (`/api/crm/whatsapp/webhook`) envia mensagens assincronamente via `after()` para `POST /api/v1/ingest/whatsapp` quando o módulo estiver ativo.
  2. Crons `whatsapp-sync` e `whatsapp-analysis` enviam lotes de conversas pendentes para o ZapTrail.
  3. Os CTAs "Sincronizar Conversas" no Inbox e "Analisar agora" no Radar acionam a análise no ZapTrail com feedback na UI.
**Plans**: TBD

### Phase 7: Outbound Webhook & Proposal Persistence Loop
**Goal**: Implementar o loop de retorno onde o ZapTrail despacha webhooks para o PilotCRM persistir propostas comerciais validadas.
**Depends on**: Phase 6
**Requirements**: PCRM-06, PCRM-07
**Success Criteria** (what must be TRUE):
  1. ZapTrail despacha webhook com envelope e propostas formatadas via `PilotCRMAdapter` para a URL configurada do PilotCRM.
  2. Endpoint receptor no PilotCRM autentica o webhook e grava registros em `enrichment_proposals`.
  3. Todas as propostas gravadas atendem a constraint `enrichment_action_ck` e podem ser aceitas gerando Deals sem violação de schema.
**Plans**: TBD

### Phase 8: End-to-End Cross-Repo Integration & Verification
**Goal**: Suíte E2E automatizada cobrindo o fluxo bidirecional completo entre PilotCRM e ZapTrail com garantias de idempotência e zero perda de dados.
**Depends on**: Phase 7
**Requirements**: PCRM-08
**Success Criteria** (what must be TRUE):
  1. Cenários de ponta a ponta simulam os 3 gatilhos e confirmam 100% de sucesso na ingestão no ZapTrail.
  2. Testes de estresse e deduplicação comprovam idempotência com 0 duplicações de propostas ou mensagens.
  3. Ciclo completo de aprovação de proposta na UI do PilotCRM gera Deal com todas as propriedades extraídas preenchidas.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 5. PilotCRM Module Registry & Marketplace Card | 3/3 | Completed | 2026-10-22 |
| 6. PilotCRM 3 Ingest Triggers Integration | 0/TBD | Not started | - |
| 7. Outbound Webhook & Proposal Persistence Loop | 0/TBD | Not started | - |
| 8. End-to-End Cross-Repo Integration & Verification | 0/TBD | Not started | - |

---
*See `.planning/milestones/v1.0.0-ROADMAP.md` for v1.0.0 phase details and task history.*
