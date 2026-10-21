# Phase 2: Hybrid Stage 2 Structured LLM Fallback & Outbound Context - Validation Plan

**Document:** 02-VALIDATION.md  
**Phase:** 2  
**Status:** Approved Reference  
**Created:** 2026-10-21  

---

## 1. Test Framework & Environment

- **Runner:** Vitest `^2.1.0`
- **Compiler:** TypeScript `^5.6.0` (strict mode ES2022)
- **Zero Network Flakiness:** Todos os testes de integração do Estágio 2 utilizam provedores mockados determinísticos (`MockLLMProvider`), simulando saídas estruturadas válidas, citações alucinadas, latência e falhas de rede sem dependência de chaves de API externas.

---

## 2. Test Execution Commands

### Quick Unit Tests
```bash
npx.cmd vitest run tests/core/quote-validator.test.ts tests/core/hybrid-engine.test.ts
```

### Domain Tests (Real Estate & Coalescer)
```bash
npx.cmd vitest run tests/domain-real-estate/coalescer-seeding.test.ts tests/domain-real-estate/real-estate-llm.test.ts
```

### Full Regression Suite
```bash
npx.cmd vitest run && npx.cmd tsc --noEmit
```

---

## 3. Test Suites & Coverage Targets

| Suite | Arquivo | Requisitos Cobertos | Critérios de Sucesso |
|---|---|---|---|
| **Quote Validator** | `tests/core/quote-validator.test.ts` | `LLM-02`, `CORE-03` | Validação de substrings exatas, detecção de alucinações, rebaixamento para status `inferred` e geração de `ReviewItem`. |
| **Hybrid Core Engine** | `tests/core/hybrid-engine.test.ts` | `LLM-01` | Estágio 1 decisivo encerra sem chamar LLM (`llm_invoked: false`); Estágio 1 ambíguo aciona Estágio 2 e mescla o envelope (`extractor_type: 'hybrid'`). Fallback em caso de erro no LLM. |
| **TurnWindow Coalescer & Seeding** | `tests/domain-real-estate/coalescer-seeding.test.ts` | `ING-01` | Debounce temporal de mensagens consecutivas do mesmo remetente; injeção e resolução de `seeded_property_candidates` de campanhas outbound. |
| **Real Estate LLM Structured Extractor** | `tests/domain-real-estate/real-estate-llm.test.ts` | `LLM-01`, `LLM-02`, `RE-01..05` | Prompt pt-BR com schema Zod, extração de papéis, intenções, múltiplos imóveis, valores e condições a partir do LLM. |

---

## 4. Code Quality Gate

- Todos os arquivos criados ou modificados em `src/packages/` devem ter estritamente `<= 350` linhas (`quality/max-lines`).
- Nenhum conceito imobiliário (`iptu`, `condo_fee`, `bedrooms`) permitido no `@futuremove/zaptrail-core`.
