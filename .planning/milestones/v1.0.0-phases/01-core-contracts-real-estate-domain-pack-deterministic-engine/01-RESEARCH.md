# Phase 1: Core Contracts, Real Estate Domain Pack & Deterministic Engine - Research

**Researched:** 2026-10-21
**Domain:** Conversational Semantic Parsing, Real Estate Opportunity Orchestration & CRM Adapter Architecture
**Confidence:** HIGH

## Summary

A pesquisa técnica combinou a auditoria completa do repositório `futuremove-consulting/zaptrail`, a auditoria do motor em produção no `futuremove-consulting/pilotcrm` (`apps/pilotcrm/src/lib/whatsapp/canonical-conversation-processor.ts`, `canonical-taxonomy.ts`, `deterministic-parser.ts`) e a especificação normativa `docs/spec.md` (v1.0.0).

Constatou-se que o repositório `zaptrail` atual não possui `package.json`, `tsconfig.json` ou `vitest.config.ts` na raiz (foram omitidos nos commits iniciais), e seu código em `src/semantic/` é apenas um esqueleto genérico. Por outro lado, o motor do `pilotcrm` já validou em produção (631 conversas reais) padrões essenciais como distinção entre opt-out e recusa comercial, detecção de papéis de terceiros (`spouse_or_partner`, `family_member`, `broker_or_intermediary`) e contexto de perguntas outbound adjacentes, mas sofre com o bug crítico `G1` (`action_type: "create_deal"` violando a constraint `enrichment_action_ck`) e não separa segundo imóvel na mesma conversa (`CAPTURE_OTHER_PROPERTY`) nem demandas condicionadas (`sale_before_purchase`).

**Primary recommendation:** Estruturar a Fase 1 em 3 planos enxutos:
1. **Plan 01-01 (Wave 1)**: Saneamento do repositório (`package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`) e implementação do núcleo universal `@futuremove/zaptrail-core` (`src/packages/core/`) com schemas Zod, calculador determinístico de `EvidenceRef` (`char_start`/`char_end` via `exact_quote`), status epistêmicos (`declared|inferred|validated_external|validated_human|superseded|rejected`), política de confiança (`>=0.85`, `0.65-0.84`, `<0.65`) e contratos `DomainPack` / `CRMAdapter`.
2. **Plan 01-02 (Wave 2)**: Implementação do pacote `@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate/`) com normalizador numérico/monetário pt-BR (`1,2 milhão`, `850 mil`, `3.5k`), extrator determinístico de papéis, intenções, segundo imóvel (`CAPTURE_OTHER_PROPERTY`), demandas e condições (`sale_before_purchase`, `family_approval`, `exclusivity_constraint`), evolução de preço (`superseded`), idempotência de webhook e consolidação de `TurnWindow`.
3. **Plan 01-03 (Wave 3)**: Implementação do `PilotCRMAdapter` (mapeando para `enrichment_action_ck` sem nunca emitir `create_deal`) e suíte completa dos 20 Casos-Ouro obrigatórios (`CT-01` a `CT-20` de `docs/spec.md §21.2`) mais teste de fronteira arquitetural (zero vazamento imobiliário em `src/packages/core`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Universal Envelope, Evidence Spans & Confidence Policy | `@futuremove/zaptrail-core` (`src/packages/core`) | — | Deve permanecer 100% agnóstico de domínio para permitir spin-out multi-segmento |
| Real Estate Taxonomy, Colloq. pt-BR Parser & Playbooks | `@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate`) | `@futuremove/zaptrail-core` | Isola regras de captação, locação, IPTU/condomínio, 2º imóvel e condições de permuta/venda |
| PilotCRM Proposal Translation (`enrichment_action_ck`) | `PilotCRMAdapter` (`src/packages/domain-real-estate/adapters`) | `@futuremove/zaptrail-core` | Impede que peculiaridades do schema do PilotCRM vazem para o core |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `typescript` | `^5.6.0` | Tipagem estrita de ponta a ponta | Padrão Futuremove/PilotCRM |
| `zod` | `^3.23.8` | Validação de schemas e contratos universais/domínio | Já usado no PilotCRM e compatível com Structured Outputs |
| `vitest` | `^2.1.0` | Runner de testes rápidos para TDD e 20 Casos-Ouro | Execução determinística em milissegundos |

## Codebase Audit Findings

1. **Missing Root Tooling**: O diretório raiz precisa de `package.json` (com scripts `test`, `typecheck`), `tsconfig.json`, `vitest.config.ts` e `.gitignore` (ignorando `node_modules`, `.next`, `.env.local`).
2. **PilotCRM `enrichment_action_ck` Constraint (`G1`)**: No PilotCRM, a tabela `enrichment_proposals` aceita exclusivamente `NO_CHANGE | CONFIRM | UPDATE | ADD | RELATE | CONTRADICT | INVALIDATE | SUPPRESS | DEFER | REVIEW`. Portanto, novas oportunidades de captação/demanda devem produzir `enrichment_action: 'ADD'` (ou `'RELATE'` quando vinculando oportunidades condicionais, `'SUPPRESS'` em opt-out, `'REVIEW'` em conflitos de baixa confiança), armazenando o código de negócio (`qualify_property`, `open_buyer_search`, etc.) em `recommended_action` / `payload`.
3. **350-Line Ceiling (`quality/max-lines`)**: Tanto `src/packages/core` quanto `src/packages/domain-real-estate` devem ser modularizados em arquivos coesos de `100–250` linhas (ex.: `types.ts`, `evidence.ts`, `confidence-policy.ts`, `engine.ts`, `normalizer-ptbr.ts`, `role-intent-rules.ts`, `opportunity-orchestrator.ts`, `pilotcrm-adapter.ts`).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^2.1.0` |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run && npx tsc --noEmit` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CORE-01..05 | Universal envelope, deterministic `EvidenceRef` offsets, epistemic status & confidence gates | unit | `npx vitest run tests/core/universal-core.test.ts` | ❌ Wave 1 |
| RE-01..06 | Real estate deterministic parser & orchestrator | unit | `npx vitest run tests/domain-real-estate/golden-cases.test.ts` | ❌ Wave 2/3 |
| CRM-01 | `PilotCRMAdapter` `enrichment_action_ck` compliance | unit | `npx vitest run tests/domain-real-estate/pilotcrm-adapter.test.ts` | ❌ Wave 3 |
| QA-01 | 20 mandatory golden cases (`CT-01`..`CT-20`) + zero domain leakage in core | integration | `npx vitest run` | ❌ Wave 3 |

### Wave 0 / Wave 1 Requirements
- [ ] `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore` — instalados e configurados na Task 1 do Plan 01-01.
