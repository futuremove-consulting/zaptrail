# Phase 1: Core Contracts, Real Estate Domain Pack & Deterministic Engine — Specification

**Created:** 2026-10-21
**Ambiguity score:** 0.08 (gate: ≤ 0.20)
**Requirements:** 13 locked

## Goal

Entregar os pacotes `@futuremove/zaptrail-core` (`src/packages/core`), `@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate`) e `PilotCRMAdapter`, passando 100% dos 20 Casos-Ouro (`CT-01` a `CT-20` de `docs/spec.md §21.2`) via `npx vitest run` com zero vazamento de termos imobiliários no core e compatibilidade total com `enrichment_action_ck`.

## Background

O repositório atual não possui `package.json`, `tsconfig.json` ou `vitest.config.ts` na raiz, e o motor em produção no PilotCRM falha ao emitir `action_type: "create_deal"` (violando `enrichment_action_ck`) e não separa segundo imóvel na mesma conversa (`CAPTURE_OTHER_PROPERTY`) nem demandas condicionadas (`sale_before_purchase`).

## Requirements

1. **Universal Core (`CORE-01`..`CORE-05`)**: Envelope universal `UniversalInterpretationEnvelope`, interfaces `DomainPack`/`CRMAdapter`/`StoragePort`, cálculo determinístico de `char_start`/`char_end` via `exact_quote`, status epistêmicos (`declared|inferred|validated_external|validated_human|superseded|rejected`) e faixas de confiança (`>=0.85`, `0.65-0.84`, `<0.65`).
   - Current: Apenas um protótipo acoplado em `src/semantic/pipeline.ts`.
   - Target: Pacote limpo em `src/packages/core/` validado com Zod e sem termos imobiliários.
   - Acceptance: `npx vitest run tests/core/universal-core.test.ts` passa com exit code 0.

2. **Real Estate Domain Pack (`RE-01`..`RE-06`)**: Parser determinístico e orquestrador imobiliário em `src/packages/domain-real-estate/` cobrindo papéis, intenções, valores coloquiais pt-BR, segundo imóvel (`CAPTURE_OTHER_PROPERTY`), condições (`sale_before_purchase`, `family_approval`, `exclusivity_constraint`), evolução de preço (`superseded`), idempotência e `TurnWindow`.
   - Current: Regras ausentes no ZapTrail e parcialmente presentes no PilotCRM.
   - Target: Pacote `src/packages/domain-real-estate/` completo e determinístico.
   - Acceptance: `npx vitest run tests/domain-real-estate/golden-cases.test.ts` passa todos os 20 casos (`CT-01`..`CT-20`).

3. **PilotCRM Adapter (`CRM-01`)**: Tradutor de propostas compatível com `enrichment_action_ck`.
   - Current: PilotCRM emite `create_deal`, quebrando a constraint do banco.
   - Target: `PilotCRMAdapter` emite exclusivamente `NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`.
   - Acceptance: `npx vitest run tests/domain-real-estate/pilotcrm-adapter.test.ts` passa com exit code 0.

## Boundaries

**In scope:**
- Configuração da raiz (`package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`)
- `src/packages/core/*` (`@futuremove/zaptrail-core`)
- `src/packages/domain-real-estate/*` (`@futuremove/zaptrail-domain-real-estate` + `PilotCRMAdapter`)
- Suíte de testes unitários e os 20 Casos-Ouro (`CT-01`..`CT-20`)

**Out of scope:**
- Integração com API externa de LLM (Fase 2)
- Migrações SQL Supabase e UI de Review Inbox (Fase 3)
- Servidor MCP e rotas HTTP `/api/v1/ingest/whatsapp` (Fase 4)

## Constraints

- Limite máximo de 350 linhas por arquivo de produção (`quality/max-lines`)
- Identificadores 100% em inglês

## Acceptance Criteria

- [ ] `npx vitest run` passa 100% dos testes (incluindo `CT-01` a `CT-20`) com exit code 0
- [ ] `npx tsc --noEmit` passa sem erros de tipagem
- [ ] Nenhum arquivo em `src/packages/core/` contém identificadores exclusivos de imóveis (`iptu`, `condominio`, `quartos`, `matricula`)
- [ ] Nenhum output do `PilotCRMAdapter` contém `action_type: "create_deal"`

## Edge Coverage

**Coverage:** 4/4 applicable edges resolved · 0 unresolved

| Category | Requirement | Status | Resolution / Reason |
|----------|-------------|--------|---------------------|
| idempotency | RE-06 | ✅ covered | Reprocessar o mesmo `(tenant_id, provider, external_message_id)` retorna `duplicate: true` sem duplicar oportunidades ou ações (`CT-18`) |
| boundary | CORE-03 | ✅ covered | Quando `exact_quote` é encontrada em `normalized_text`, `char_start` e `char_end` correspondem exatamente aos índices da substring |
| state-transition | CORE-04 | ✅ covered | Atualização de preço posterior marca o `ValueObservation` anterior como `superseded` mantendo-o no histórico (`CT-13`) |
| validation | CRM-01 | ✅ covered | Toda proposta gerada pelo `PilotCRMAdapter` pertence estritamente ao enum `enrichment_action_ck` |

## Prohibitions (must-NOT)

**Coverage:** 3/3 applicable prohibitions resolved · 0 unresolved

| Prohibition (must-NOT statement) | Requirement | Status | Verification / Reason |
|----------------------------------|-------------|--------|------------------------|
| MUST NOT include real-estate-specific fields (`iptu`, `condo_fee`, `bedrooms`, `property_type`) inside `@futuremove/zaptrail-core` | CORE-01 | resolved | verification: test |
| MUST NOT emit `create_deal` as an `enrichment_action` in `PilotCRMAdapter` | CRM-01 | resolved | verification: test |
| MUST NOT auto-execute external outbound WhatsApp actions (`send_whatsapp_followup`) without human approval | CORE-05 | resolved | verification: test |

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                              |
|--------------------|-------|------|--------|------------------------------------|
| Goal Clarity       | 0.95  | 0.75 | ✓      | 20 golden cases explicitly defined |
| Boundary Clarity   | 0.95  | 0.70 | ✓      | Core vs DomainPack vs Adapter      |
| Constraint Clarity | 0.90  | 0.65 | ✓      | <=350 lines, English identifiers   |
| Acceptance Criteria| 0.95  | 0.70 | ✓      | Deterministic Vitest & tsc checks  |
| **Ambiguity**      | 0.08  | ≤0.20| ✓      |                                    |

---

*Phase: 01-core-contracts-real-estate-domain-pack-deterministic-engine*
*Spec created: 2026-10-21*
