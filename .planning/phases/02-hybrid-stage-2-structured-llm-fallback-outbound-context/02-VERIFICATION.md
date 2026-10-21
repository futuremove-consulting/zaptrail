---
phase: 02-hybrid-stage-2-structured-llm-fallback-outbound-context
verified: 2026-10-21T13:20:00Z
status: passed
score: 8/8 must-haves verified
covered_files:
  - ".planning/phases/02-hybrid-stage-2-structured-llm-fallback-outbound-context/02-01-PLAN.md"
  - ".planning/phases/02-hybrid-stage-2-structured-llm-fallback-outbound-context/02-01-SUMMARY.md"
  - ".planning/phases/02-hybrid-stage-2-structured-llm-fallback-outbound-context/02-02-PLAN.md"
  - ".planning/phases/02-hybrid-stage-2-structured-llm-fallback-outbound-context/02-02-SUMMARY.md"
  - "src/packages/core/hybrid-engine.ts"
  - "src/packages/core/index.ts"
  - "src/packages/core/quote-validator.ts"
  - "src/packages/core/types.ts"
  - "src/packages/domain-real-estate/index.ts"
  - "src/packages/domain-real-estate/llm/mock-llm-provider.ts"
  - "src/packages/domain-real-estate/llm/real-estate-llm-converter.ts"
  - "src/packages/domain-real-estate/llm/real-estate-llm-schema.ts"
  - "src/packages/domain-real-estate/llm/real-estate-prompt.ts"
  - "src/packages/domain-real-estate/opportunity-orchestrator.ts"
  - "src/packages/domain-real-estate/turn-window-coalescer.ts"
  - "src/packages/domain-real-estate/types.ts"
  - "tests/core/hybrid-engine.test.ts"
  - "tests/core/quote-validator.test.ts"
  - "tests/domain-real-estate/coalescer-seeding.test.ts"
  - "tests/domain-real-estate/real-estate-llm.test.ts"
covered_digest: "v3:sha256:acd039858bfe4a07c1fcee5a14035d54535e79e661ba8b6261be17348426431b"
behavior_unverified: 0
overrides_applied: 0
---

# Phase 02: Hybrid Stage 2 Structured LLM Fallback & Outbound Context Verification Report

**Phase Goal:** Implementar o Estágio 2 híbrido com LLM Structured Outputs (acionado apenas quando o Estágio 1 determinístico sinalizar ambiguidade ou complexidade), validação estrita de `exact_quote` contra alucinações, coalescência temporal de turnos fragmentados e injeção de candidatos pré-cadastrados (`seeded_property_candidates`) de campanhas outbound.
**Verified:** 2026-10-21T13:20:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | O validador determinístico rejeita ou rebaixa para status `inferred` qualquer citação do LLM que não exista literalmente na mensagem original do turno (LLM-02, E-02-03) | ✓ VERIFIED | `tests/core/quote-validator.test.ts` e `tests/domain-real-estate/real-estate-llm.test.ts` assertam detecção de alucinação e rebaixamento com `ReviewItem`. |
| 2 | Quando uma citação é válida, calcula deterministicamente `char_start` e `char_end` em TypeScript sem depender de índices fornecidos pelo modelo (LLM-02) | ✓ VERIFIED | `src/packages/core/quote-validator.ts` e `real-estate-llm-converter.ts` calculam offsets diretamente no texto normalizado. |
| 3 | O orquestrador híbrido executa o Estágio 1 e só aciona o Estágio 2 se o resultado determinístico for ambíguo (`confidence < 0.85`, `intent.ambiguous_or_open` ou `role: unknown`), finalizando turnos inequívocos com `llm_invoked: false` (LLM-01, E-02-01) | ✓ VERIFIED | `tests/core/hybrid-engine.test.ts` e `tests/domain-real-estate/real-estate-llm.test.ts` verificam fast path com 0 invocações de LLM para turnos claros. |
| 4 | Em caso de erro ou timeout do `LLMProvider`, o motor faz fallback gracioso para o Estágio 1, marca `llm_error: true` e cria um `ReviewItem` para operador humano (LLM-01, E-02-07) | ✓ VERIFIED | Validado em `tests/core/hybrid-engine.test.ts` com injeção de falha simulada no MockLLMProvider. |
| 5 | Mensagens rápidas do mesmo remetente recebidas em intervalo configurável (ex.: 120s) são coalescidas em um único `TurnWindow` consolidado preservando os IDs individuais de mensagem (ING-01, E-02-04) | ✓ VERIFIED | `src/packages/domain-real-estate/turn-window-coalescer.ts` testado em `tests/domain-real-estate/coalescer-seeding.test.ts`. |
| 6 | Imóveis de campanhas outbound (`seeded_property_candidates`) são vinculados ao `TurnWindow` e respostas relativas ('Sim', 'esse mesmo') herdam o imóvel da abordagem ativa com alta confiança (ING-01, E-02-05) | ✓ VERIFIED | Validado em `tests/domain-real-estate/coalescer-seeding.test.ts`. |
| 7 | O esquema Zod imobiliário (`RealEstateLLMStructuredOutputSchema`) e prompt pt-BR extraem papéis, intenções, múltiplos imóveis, valores e condições acompanhados de `exact_quote` literal (LLM-01, LLM-02, E-02-02) | ✓ VERIFIED | `src/packages/domain-real-estate/llm/real-estate-llm-schema.ts` e `real-estate-prompt.ts` testados com mock em `real-estate-llm.test.ts`. |
| 8 | A suíte completa `npx.cmd vitest run` executa todos os testes de Fase 1 e Fase 2 com 100% de sucesso e zero erros no TypeScript (LLM-01, LLM-02, ING-01) | ✓ VERIFIED | 122/122 testes aprovados em 8 arquivos em menos de 1s (`npx.cmd vitest run; npx.cmd tsc --noEmit`). |

**Score:** 8/8 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/packages/core/quote-validator.ts` | Validador de citações e detecção de alucinações | ✓ VERIFIED | 166 linhas (teto <= 350) |
| `src/packages/core/hybrid-engine.ts` | Orquestrador híbrido com fast-path determinístico | ✓ VERIFIED | 308 linhas (teto <= 350) |
| `src/packages/domain-real-estate/turn-window-coalescer.ts` | Debouncer temporal de mensagens e vinculador de campanha | ✓ VERIFIED | 230 linhas (teto <= 350) |
| `src/packages/domain-real-estate/llm/real-estate-llm-schema.ts` | Schema Zod de Structured Outputs do domínio imobiliário | ✓ VERIFIED | 51 linhas (teto <= 350) |
| `src/packages/domain-real-estate/llm/real-estate-prompt.ts` | Construtor de prompts pt-BR com diretivas de exatidão | ✓ VERIFIED | 99 linhas (teto <= 350) |
| `src/packages/domain-real-estate/llm/mock-llm-provider.ts` | Provedor mock determinístico para CI/CD | ✓ VERIFIED | 115 linhas (teto <= 350) |
| `src/packages/domain-real-estate/llm/real-estate-llm-converter.ts` | Conversor de saída estruturada para observações core | ✓ VERIFIED | 307 linhas (teto <= 350) |
| `src/packages/domain-real-estate/opportunity-orchestrator.ts` | Suporte a execução híbrida (`interpretRealEstateTurnHybrid`) | ✓ VERIFIED | 311 linhas (teto <= 350) |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `src/packages/core/hybrid-engine.ts` | `src/packages/core/quote-validator.ts` | Valida citações de retornos do LLM antes de mesclar | ✓ VERIFIED | Testado em unit tests |
| `src/packages/domain-real-estate/opportunity-orchestrator.ts` | `src/packages/core/hybrid-engine.ts` | Utiliza `HybridInterpretationEngine` para orquestração | ✓ VERIFIED | Integração validada em `real-estate-llm.test.ts` |
| `src/packages/domain-real-estate/opportunity-orchestrator.ts` | `src/packages/domain-real-estate/turn-window-coalescer.ts` | Coalesce de mensagens e injeção de candidatos de campanha | ✓ VERIFIED | Integração validada em `coalescer-seeding.test.ts` |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Core quote validator tests | `npx.cmd vitest run tests/core/quote-validator.test.ts` | 10 passed | ✓ VERIFIED |
| Core hybrid engine tests | `npx.cmd vitest run tests/core/hybrid-engine.test.ts` | 11 passed | ✓ VERIFIED |
| Real Estate coalescer & seeding tests | `npx.cmd vitest run tests/domain-real-estate/coalescer-seeding.test.ts` | 8 passed | ✓ VERIFIED |
| Real Estate LLM integration tests | `npx.cmd vitest run tests/domain-real-estate/real-estate-llm.test.ts` | 11 passed | ✓ VERIFIED |
| Full regression (Phase 1 + Phase 2) | `npx.cmd vitest run` | 122 passed | ✓ VERIFIED |
| TypeScript type check | `npx.cmd tsc --noEmit` | 0 errors | ✓ VERIFIED |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| LLM-01 | 02-01-PLAN.md, 02-02-PLAN.md | Estágio 2 acionado apenas sob ambiguidade com fast-path determinístico | ✓ VERIFIED | `hybrid-engine.ts`, `real-estate-llm.test.ts` |
| LLM-02 | 02-01-PLAN.md, 02-02-PLAN.md | Validação literal de `exact_quote`, detecção e rebaixamento de alucinações | ✓ VERIFIED | `quote-validator.ts`, `real-estate-llm-converter.ts` |
| ING-01 | 02-02-PLAN.md | Coalescência de mensagens rápidas consecutivas e injeção de campanhas outbound | ✓ VERIFIED | `turn-window-coalescer.ts`, `coalescer-seeding.test.ts` |

---

_Verified: 2026-10-21T13:20:00Z_
_Verifier: gsd-verifier (Antigravity)_
