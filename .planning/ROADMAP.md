# Roadmap: ZapTrail

## Overview

Implementação do motor **ZapTrail** segundo a especificação técnica `docs/spec.md` (v1.0.0) e a arquitetura **Package-First ("Spin-Out Ready")**: um núcleo semântico universal (`@futuremove/zaptrail-core`), o pacote de domínio imobiliário (`@futuremove/zaptrail-domain-real-estate`) validado pelos 20 Casos-Ouro obrigatórios, o adaptador `PilotCRMAdapter` que resolve os bugs críticos do motor atual do PilotCRM, o estágio híbrido LLM Structured Outputs, a fila de revisão humana com RLS no Supabase e a superfície standalone API/MCP.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (1.1, 2.1): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Core Contracts, Real Estate Domain Pack & Deterministic Engine** - Núcleo universal `@futuremove/zaptrail-core`, pacote `@futuremove/zaptrail-domain-real-estate`, `PilotCRMAdapter` e 20 Casos-Ouro (`CT-01`..`CT-20`) (completed 2026-10-21)
- [ ] **Phase 2: Hybrid Stage 2 Structured LLM Fallback & Outbound Context** - Extração estruturada LLM com validação de `exact_quote`, coalescência de turnos e seed de campanhas outbound
- [ ] **Phase 3: Supabase RLS Persistence, Audit Trail & Review Inbox** - Migrações PostgreSQL/RLS corrigidas, trilha de auditoria imutável e Inbox de Revisão Humana + Timeline Dual
- [ ] **Phase 4: Standalone Spin-Out Surface (REST API & MCP Server)** - Endpoint `/api/v1/ingest/whatsapp` e servidor MCP `@futuremove/zaptrail-mcp` para operação multi-CRM e multi-domínio

## Phase Details

### Phase 1: Core Contracts, Real Estate Domain Pack & Deterministic Engine

**Goal**: Entregar a fundação executável do repositório (`package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`), o núcleo universal `@futuremove/zaptrail-core` (100% agnóstico de domínio), o pacote `@futuremove/zaptrail-domain-real-estate` (parser determinístico de papéis, intenções, valores pt-BR, 2º imóvel `CAPTURE_OTHER_PROPERTY`, condições `sale_before_purchase` / `family_approval` / `exclusivity_constraint`), o `PilotCRMAdapter` compatível com `enrichment_action_ck`, e passar 100% dos 20 Casos-Ouro (`CT-01` a `CT-20` de `docs/spec.md §21.2`).
**Depends on**: Nothing (first phase)
**Requirements**: [CORE-01, CORE-02, CORE-03, CORE-04, CORE-05, RE-01, RE-02, RE-03, RE-04, RE-05, RE-06, CRM-01, QA-01]
**Success Criteria** (what must be TRUE):
  1. `npx vitest run` executa e passa todos os 20 Casos-Ouro obrigatórios (`CT-01` a `CT-20` de `docs/spec.md §21.2`) com latência determinística e zero chamadas de rede.
  2. `src/packages/core` (`@futuremove/zaptrail-core`) exporta `UniversalInterpretationEnvelope`, `DomainPack`, `CRMAdapter`, `EvidenceRef` (com cálculo determinístico de `char_start`/`char_end` via `exact_quote`), `EpistemicStatus` (`declared|inferred|validated_external|validated_human|superseded|rejected`) e política de confiança sem conter nenhum termo exclusivo do domínio imobiliário.
  3. `src/packages/domain-real-estate` (`@futuremove/zaptrail-domain-real-estate`) resolve papéis (`owner`, `spouse_or_partner`, `family_member`, `broker_or_intermediary`, `unrelated_third_party`), intenções, normalização monetária pt-BR, segundo imóvel na mesma conversa (`CAPTURE_OTHER_PROPERTY`), demandas condicionadas (`sale_before_purchase`), evolução de preço (`superseded`), idempotência de webhook e consolidação de `TurnWindow`.
  4. `PilotCRMAdapter` mapeia oportunidades e recomendações para propostas compatíveis com `enrichment_action_ck` (`NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`), nunca emitindo `action_type: "create_deal"`.

**Plans**: 3/3 plans complete

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Root TypeScript/Vitest toolchain & `@futuremove/zaptrail-core` (`CORE-01`..`CORE-05`)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — `@futuremove/zaptrail-domain-real-estate` deterministic parser, pt-BR normalizer, multi-property & conditional orchestrator (`RE-01`..`RE-06`)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-03-PLAN.md — `PilotCRMAdapter` (`enrichment_action_ck`) & 20 Mandatory Golden Cases (`CT-01`..`CT-20`) + boundary verification (`CRM-01`, `QA-01`)

### Phase 2: Hybrid Stage 2 Structured LLM Fallback & Outbound Context

**Goal**: Implementar o Estágio 2 híbrido com LLM Structured Outputs (acionado apenas nos ~20% de turnos ambíguos/complexos), validação estrita de `exact_quote` contra alucinações, coalescência temporal de turnos e injeção de `seeded_property_candidates` de campanhas outbound.
**Depends on**: Phase 1
**Requirements**: [LLM-01, LLM-02, ING-01]
**Success Criteria** (what must be TRUE):
  1. Turnos resolvidos com alta confiança pelo Estágio 1 não invocam o provedor LLM (`llm_invoked: false`); turnos ambíguos ou complexos invocam o Estágio 2 estruturado e mesclam o resultado mantendo rastreabilidade (`extractor_type: 'hybrid'`).
  2. Qualquer `exact_quote` retornada pelo LLM que não seja substring exata da mensagem original é rejeitada ou rebaixada para `review_required: true`.
  3. Mensagens rápidas consecutivas do mesmo contato e seeds de campanha outbound (`seeded_property_candidates`) são consolidados na `TurnWindow` antes da interpretação.

**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Supabase RLS Persistence, Audit Trail & Review Inbox

**Goal**: Corrigir as migrações SQL do Supabase (`enable row level security` com nome de tabela explícito e políticas por `workspace_id`/`tenant_id`), persistir `origin_messages`, `evidence_spans`, `extraction_runs` e `review_queue`, e entregar a API + UI da Fila de Revisão Humana com Timeline Dual ("Mostrar na conversa").
**Depends on**: Phase 2
**Requirements**: [DB-01, REV-01]
**Success Criteria** (what must be TRUE):
  1. Todas as migrações em `supabase/migrations/*.sql` são SQL válido com `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` e políticas de isolamento por `workspace_id`.
  2. Nenhum endpoint da aplicação usa `SUPABASE_SERVICE_ROLE_KEY` sem filtro explícito de tenant/workspace, e a rota `/api/management-objects` consulta as tabelas reais do schema.
  3. Operadores humanos conseguem listar itens `review_required`, inspecionar o trecho exato da mensagem ("Mostrar na conversa") e aprovar/editar/rejeitar a decisão registrando auditoria.

**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Standalone Spin-Out Surface (REST API & MCP Server)

**Goal**: Expor o ZapTrail como produto independente multi-domínio via endpoint REST `/api/v1/ingest/whatsapp` e servidor Model Context Protocol (`@futuremove/zaptrail-mcp`) para integração plug-and-play com qualquer CRM ou agente de IA.
**Depends on**: Phase 3
**Requirements**: [API-01, MCP-01]
**Success Criteria** (what must be TRUE):
  1. `POST /api/v1/ingest/whatsapp` processa payloads de conversa com idempotência e retorna `UniversalInterpretationEnvelope` validado.
  2. O servidor MCP expõe `analyze_conversation`, `get_entity_memory` e `resolve_review_item` operando sobre `@futuremove/zaptrail-core`.

**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Contracts, Real Estate Domain Pack & Deterministic Engine | 3/3 | Complete    | 2026-10-21 |
| 2. Hybrid Stage 2 Structured LLM Fallback & Outbound Context | 0/2 | Not started | - |
| 3. Supabase RLS Persistence, Audit Trail & Review Inbox | 0/2 | Not started | - |
| 4. Standalone Spin-Out Surface (REST API & MCP Server) | 0/1 | Not started | - |
