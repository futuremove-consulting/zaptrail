---
phase: 01-core-contracts-real-estate-domain-pack-deterministic-engine
verified: 2026-10-21T12:15:00Z
status: passed
score: 14/14 must-haves verified
covered_files:
  - ".planning/phases/01-core-contracts-real-estate-domain-pack-deterministic-engine/01-01-PLAN.md"
  - ".planning/phases/01-core-contracts-real-estate-domain-pack-deterministic-engine/01-01-SUMMARY.md"
  - ".planning/phases/01-core-contracts-real-estate-domain-pack-deterministic-engine/01-02-PLAN.md"
  - ".planning/phases/01-core-contracts-real-estate-domain-pack-deterministic-engine/01-02-SUMMARY.md"
  - ".planning/phases/01-core-contracts-real-estate-domain-pack-deterministic-engine/01-03-PLAN.md"
  - ".planning/phases/01-core-contracts-real-estate-domain-pack-deterministic-engine/01-03-SUMMARY.md"
  - "package.json"
  - "src/packages/core/confidence-policy.ts"
  - "src/packages/core/engine.ts"
  - "src/packages/core/evidence.ts"
  - "src/packages/core/index.ts"
  - "src/packages/core/types.ts"
  - "src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts"
  - "src/packages/domain-real-estate/golden-fixtures.ts"
  - "src/packages/domain-real-estate/index.ts"
  - "src/packages/domain-real-estate/normalizer-ptbr.ts"
  - "src/packages/domain-real-estate/opportunity-orchestrator.ts"
  - "src/packages/domain-real-estate/role-intent-rules.ts"
  - "src/packages/domain-real-estate/types.ts"
  - "tests/core/universal-core.test.ts"
  - "tests/domain-real-estate/golden-cases.test.ts"
  - "tests/domain-real-estate/parser-units.test.ts"
  - "tests/domain-real-estate/pilotcrm-adapter.test.ts"
  - "tsconfig.json"
  - "vitest.config.ts"
covered_digest: "v3:sha256:c1b1090feb9d997d71f230a99dbb5a5d97d04cf20d2711f3bc4fde87c32ee7b6"
behavior_unverified: 0
overrides_applied: 0
---

# Phase 01: Core Contracts, Real Estate Domain Pack & Deterministic Engine Verification Report

**Phase Goal:** Entregar a fundação executável do repositório (`package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`), o núcleo universal `@futuremove/zaptrail-core` (100% agnóstico de domínio), o pacote `@futuremove/zaptrail-domain-real-estate` (parser determinístico de papéis, intenções, valores pt-BR, 2º imóvel `CAPTURE_OTHER_PROPERTY`, condições `sale_before_purchase` / `family_approval` / `exclusivity_constraint`), o `PilotCRMAdapter` compatível com `enrichment_action_ck`, e passar 100% dos 20 Casos-Ouro (`CT-01` a `CT-20` de `docs/spec.md §21.2`).
**Verified:** 2026-10-21T12:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | Quando `exact_quote` é encontrada em `normalized_text`, `char_start` e `char_end` correspondem exatamente aos índices da substring (CORE-03, D-05) | ✓ VERIFIED | `src/packages/core/evidence.ts#buildEvidenceRef` testado em `tests/core/universal-core.test.ts` e `tests/domain-real-estate/golden-cases.test.ts`. |
| 2 | Atualização de preço posterior marca o `ValueObservation` anterior como `superseded` mantendo-o no histórico sem apagá-lo (CORE-04, D-06) | ✓ VERIFIED | `src/packages/core/confidence-policy.ts#applyValueEvolution` testado em `tests/core/universal-core.test.ts` e `tests/domain-real-estate/parser-units.test.ts`. |
| 3 | O desenvolvedor executa `npx vitest run tests/core/universal-core.test.ts` e valida o `UniversalInterpretationEnvelope`, `EvidenceRef` determinístico, status epistêmico e política de confiança com zero chamadas externas (CORE-01, D-01, D-03, D-04, D-05, D-06) | ✓ VERIFIED | Vitest executado: 17/17 testes aprovados em 16ms sem dependências de rede. |
| 4 | O pacote `@futuremove/zaptrail-core` exporta `DomainPack`, `CRMAdapter` e `StoragePort` sem conter nenhum campo exclusivo do domínio imobiliário (CORE-01, CORE-02, D-02, D-03) | ✓ VERIFIED | `tests/domain-real-estate/golden-cases.test.ts` asserta ausência estrita de termos como `iptu`, `condo_fee`, `bedrooms`, `property_type`, `matricula` em `src/packages/core/`. |
| 5 | Observações com confiança >= 0.85 habilitam atualização segura, 0.65-0.84 exigem confirmação humana via `ReviewItem` e < 0.65 permanecem como hipótese sem sobrescrever dados confirmados, bloqueando disparo autônomo de `send_whatsapp_followup` (CORE-05, D-04) | ✓ VERIFIED | `src/packages/core/confidence-policy.ts#evaluateConfidenceBand` e `canAutoExecuteAction` testados em `tests/core/universal-core.test.ts`. |
| 6 | Reprocessar o mesmo `(tenant_id, provider, external_message_id)` retorna `duplicate: true` sem duplicar oportunidades ou ações (RE-06, CT-18) | ✓ VERIFIED | `src/packages/domain-real-estate/opportunity-orchestrator.ts` testado em `parser-units.test.ts` e no fixture CT-18 de `golden-cases.test.ts`. |
| 7 | O motor identifica papéis imobiliários, extrai terceiro indicado (`refer_third_party -> real_estate.owner_discovery + request_owner_contact`) e normaliza valores coloquiais pt-BR (`1,2 milhão -> 1200000`, `850 mil -> 850000`, `3.5k -> 3500`, condomínio, IPTU) e anexos de mídia (RE-01, RE-05, D-01, D-04, D-05) | ✓ VERIFIED | `src/packages/domain-real-estate/normalizer-ptbr.ts` e `role-intent-rules.ts` cobrem CT-01, CT-02, CT-06, CT-07, CT-15, CT-19 com 100% de sucesso. |
| 8 | O motor separa recusa do imóvel perguntado (`intent.not_interested_property`), número errado (`intent.not_interested_general`, D-09), opt-out explícito (`intent.do_not_contact -> suppress_commercial_followup`, D-09) e respostas curtas dependentes da pergunta outbound da TurnWindow (`Sim -> intent.ambiguous_or_open + qualify_property`, RE-02, D-10) | ✓ VERIFIED | Cobertura validada nos testes CT-03, CT-08, CT-10, CT-11, CT-12 de `golden-cases.test.ts`. |
| 9 | Quando o contato recusa o Imóvel A mas oferece um Imóvel B na mesma conversa (`CAPTURE_OTHER_PROPERTY`), o motor registra `intent.not_interested_property` no Imóvel A e cria um segundo `RealEstatePropertyCandidate` independente com oportunidade `real_estate.capture_sale` ou `real_estate.capture_rent` (RE-03, D-07) | ✓ VERIFIED | Validado no fixture CT-04 em `tests/domain-real-estate/golden-cases.test.ts`. |
| 10 | Quando o contato manifesta demanda de compra condicionada à venda do imóvel atual, o motor cria duas oportunidades (`real_estate.capture_sale` e `real_estate.demand_buy`), conecta-as via `ConditionObservation` (`sale_before_purchase`) e recomenda a ação `link_conditional_opportunities` (RE-04, D-08) | ✓ VERIFIED | Validado no fixture CT-05 em `tests/domain-real-estate/golden-cases.test.ts`. |
| 11 | Mensagens fragmentadas consecutivas na mesma TurnWindow são consolidadas em uma única extração coerente e atualizações posteriores de preço marcam o valor anterior como superseded (RE-06, D-06) | ✓ VERIFIED | `coalesceTurnWindow` validado nos fixtures CT-09 e CT-17 em `tests/domain-real-estate/golden-cases.test.ts`. |
| 12 | Toda proposta gerada pelo `PilotCRMAdapter` pertence estritamente ao enum `enrichment_action_ck` (`NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`), nunca emitindo `create_deal` (CRM-01, D-11) | ✓ VERIFIED | `PilotCRMAdapter` validado em `tests/domain-real-estate/pilotcrm-adapter.test.ts` e em todas as 20 execuções de `golden-cases.test.ts`. |
| 13 | A suíte `npx vitest run tests/domain-real-estate/golden-cases.test.ts` executa e aprova 100% dos 20 Casos-Ouro obrigatórios (`CT-01` a `CT-20` de `docs/spec.md §21.2`), validando D-01 a D-11 (QA-01) | ✓ VERIFIED | 23/23 testes de Casos-Ouro e limites aprovados em 43ms. |
| 14 | O teste de fronteira arquitetural confirma que nenhum arquivo em `src/packages/core/` contém termos exclusivos do domínio imobiliário e que todos os arquivos de produção em `src/packages/` possuem <= 350 linhas (QA-01, D-01, D-02) | ✓ VERIFIED | Verificado em `golden-cases.test.ts`: 0 violações de léxico de domínio no core e tamanho máximo de arquivo de 295 linhas (abaixo do teto de 350). |

**Score:** 14/14 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `package.json` | Toolchain root com scripts e deps (typescript, zod, vitest) | ✓ VERIFIED | Presente e funcional |
| `tsconfig.json` | Configuração TypeScript strict ES2022 | ✓ VERIFIED | Compilação com `tsc --noEmit` retorna 0 erros |
| `vitest.config.ts` | Configuração do test runner | ✓ VERIFIED | Executa as 4 suítes |
| `src/packages/core/types.ts` | Contratos agnósticos universais | ✓ VERIFIED | 238 linhas (teto <= 350) |
| `src/packages/core/evidence.ts` | Builder determinístico de EvidenceRef | ✓ VERIFIED | 79 linhas (teto <= 350) |
| `src/packages/core/confidence-policy.ts` | Política de confiança e bloqueio de automação externa | ✓ VERIFIED | 117 linhas (teto <= 350) |
| `src/packages/core/engine.ts` | Motor universal desacoplado | ✓ VERIFIED | 196 linhas (teto <= 350) |
| `src/packages/core/index.ts` | Barrel export do core | ✓ VERIFIED | 4 linhas |
| `src/packages/domain-real-estate/types.ts` | Taxonomia de dados imobiliários | ✓ VERIFIED | 130 linhas (teto <= 350) |
| `src/packages/domain-real-estate/normalizer-ptbr.ts` | Normalizador pt-BR de moeda e dimensões | ✓ VERIFIED | 245 linhas (teto <= 350) |
| `src/packages/domain-real-estate/role-intent-rules.ts` | Regras determinísticas de papel e intenção | ✓ VERIFIED | 275 linhas (teto <= 350) |
| `src/packages/domain-real-estate/opportunity-orchestrator.ts` | Orquestrador imobiliário e TurnWindow | ✓ VERIFIED | 295 linhas (teto <= 350) |
| `src/packages/domain-real-estate/golden-fixtures.ts` | 20 fixtures canônicos (CT-01 a CT-20) | ✓ VERIFIED | 275 linhas (teto <= 350) |
| `src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts` | Adaptador compatível com enrichment_action_ck | ✓ VERIFIED | 202 linhas (teto <= 350) |
| `src/packages/domain-real-estate/index.ts` | Barrel export do domínio imobiliário | ✓ VERIFIED | 6 linhas |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts` | `src/packages/core/index.ts` | Implementa `CRMAdapter` e consome `UniversalInterpretationEnvelope` | ✓ VERIFIED | Tipagem estrita e validação Zod |
| `src/packages/domain-real-estate/opportunity-orchestrator.ts` | `src/packages/core/index.ts` | Implementa interface `DomainPack` | ✓ VERIFIED | Pluggável no `UniversalInterpretationEngine` |
| `tests/domain-real-estate/golden-cases.test.ts` | `src/packages/domain-real-estate/` | Executa orquestrador imobiliário e adaptador PilotCRM sobre os fixtures CT-01..CT-20 | ✓ VERIFIED | 20/20 casos de teste ponta a ponta validados |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Core unit tests | `npx.cmd vitest run tests/core/universal-core.test.ts` | 17 passed | ✓ VERIFIED |
| Domain RE parser tests | `npx.cmd vitest run tests/domain-real-estate/parser-units.test.ts` | 32 passed | ✓ VERIFIED |
| PilotCRM adapter tests | `npx.cmd vitest run tests/domain-real-estate/pilotcrm-adapter.test.ts` | 10 passed | ✓ VERIFIED |
| Golden cases & boundary tests | `npx.cmd vitest run tests/domain-real-estate/golden-cases.test.ts` | 23 passed | ✓ VERIFIED |
| TypeScript type checking | `npx.cmd tsc --noEmit` | 0 errors | ✓ VERIFIED |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| CORE-01 | 01-01-PLAN.md | Universal Envelope & Separation of Concerns | ✓ VERIFIED | `src/packages/core/types.ts` & `tests/core/` |
| CORE-02 | 01-01-PLAN.md | Zero domain leakage in core contracts | ✓ VERIFIED | `tests/domain-real-estate/golden-cases.test.ts` |
| CORE-03 | 01-01-PLAN.md | Deterministic EvidenceRef with exact character spans | ✓ VERIFIED | `src/packages/core/evidence.ts` & unit tests |
| CORE-04 | 01-01-PLAN.md | Epistemic status & value evolution (superseded) | ✓ VERIFIED | `src/packages/core/confidence-policy.ts` |
| CORE-05 | 01-01-PLAN.md | Multi-tier confidence bands & review item gating | ✓ VERIFIED | `src/packages/core/confidence-policy.ts` |
| RE-01 | 01-02-PLAN.md | Real estate party roles taxonomy & discovery | ✓ VERIFIED | `src/packages/domain-real-estate/role-intent-rules.ts` |
| RE-02 | 01-02-PLAN.md | Negative & ambiguous intent classification | ✓ VERIFIED | `src/packages/domain-real-estate/role-intent-rules.ts` |
| RE-03 | 01-02-PLAN.md | Multi-property candidate orchestration (Imóvel B) | ✓ VERIFIED | `opportunity-orchestrator.ts` & CT-04 |
| RE-04 | 01-02-PLAN.md | Condition observation & conditional opportunity linking | ✓ VERIFIED | `opportunity-orchestrator.ts` & CT-05 |
| RE-05 | 01-02-PLAN.md | Brazilian real estate values & metrics normalizer | ✓ VERIFIED | `normalizer-ptbr.ts` & unit tests |
| RE-06 | 01-02-PLAN.md | TurnWindow consolidation & idempotency cache | ✓ VERIFIED | `opportunity-orchestrator.ts` & CT-09, CT-18 |
| CRM-01 | 01-03-PLAN.md | PilotCRMAdapter strictly adhering to enrichment_action_ck | ✓ VERIFIED | `pilotcrm-adapter.ts` & unit tests |
| QA-01 | 01-03-PLAN.md | 20 Golden Cases test suite & boundary checks | ✓ VERIFIED | `golden-cases.test.ts` (82/82 total tests) |

---

_Verified: 2026-10-21T12:15:00Z_
_Verifier: gsd-verifier (Antigravity)_
