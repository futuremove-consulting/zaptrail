# Phase 2: Hybrid Stage 2 Structured LLM Fallback & Outbound Context - Research

**Researched:** 2026-10-21  
**Domain:** Structured LLM Outputs (Zod / JSON Schema), Hallucination Guardrails, Exact Quote Verification & Outbound Context Seeding  
**Confidence:** HIGH  

## Executive Summary

Na Fase 1, entregamos o motor determinístico (Estágio 1) que resolve com latência zero e custo computacional ínfimo os fluxos frequentes e diretos (CT-01 a CT-20). Contudo, em conversas reais de WhatsApp, aproximadamente 15% a 25% dos turnos apresentam construções ambíguas, gírias regionais complexas, negações indiretas ("não é que eu não queira vender..."), condicionantes familiares intrincadas ou mensagens com referências contextuais elípticas.

A Fase 2 implementa a arquitetura **Híbrida de 2 Estágios**:
1. **Estágio 1 (Determinístico / Regras / Regex)**: Executa primeiro. Se atingir confiança alta (`>= 0.85`) e intenção inequívoca (ex.: opt-out direto `do_not_contact`, aceitação unívoca `capture_for_sale` com preço claro), finaliza imediatamente sem invocar LLM (`llm_invoked: false`, custo zero, latência < 5ms).
2. **Estágio 2 (Structured LLM Fallback via Zod JSON Schema)**: É acionado apenas quando o Estágio 1 assinala ambiguidade (`intent.ambiguous_or_open`), papel desconhecido (`role: unknown`), contradição de valores ou complexidade multi-entidade.
3. **Guarda Anti-Alucinação (`Exact Quote Validator`)**: Todo dado extraído pelo LLM (papel, intenção, valor, condição) DEVE ser acompanhado de sua `exact_quote`. O validador determinístico do `@futuremove/zaptrail-core` verifica se a string existe verbatim na mensagem do usuário. Se o modelo inventar uma citação ausente do texto original, o dado é rejeitado ou rebaixado para `EpistemicStatus: 'inferred'` com `review_required: true` (`T-02-01`).
4. **Coalescência de Turnos e Injeção de Campanhas Outbound (`ING-01`)**: Turnos rápidos consecutivos do WhatsApp (ex.: 3 mensagens em menos de 120s) são agrupados antes da extração, e o contexto de campanhas outbound (`seeded_property_candidates`) é vinculado ao `TurnWindow`, permitindo que respostas curtas ("Sim, pode anunciar", "esse mesmo") herdem os dados do imóvel da abordagem ativa.

---

## Architectural Responsibility Map

| Capability | Primary Layer | Secondary Layer | Rationale |
|---|---|---|---|
| `LLMProvider` interface & `validateLlmQuotes` | `@futuremove/zaptrail-core` (`src/packages/core/`) | — | O core define o contrato de LLM e o validador de exatidão de citações de forma 100% agnóstica de domínio. |
| Hybrid Routing Engine (`HybridInterpretationEngine`) | `@futuremove/zaptrail-core` (`src/packages/core/`) | `DomainPack` | Gerencia o circuito de fallback: Estágio 1 → Checagem de Confiança → Estágio 2 → Mesclagem → Gating. |
| Real Estate LLM Schema & pt-BR System Prompts | `@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate/llm/`) | `@futuremove/zaptrail-core` | Define a taxonomia imobiliária em Zod para Structured Outputs e prompts orientados a diálogos brasileiros. |
| Mock LLM Provider & SDK Adapters | `@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate/llm/`) | Provedor externo | Permite testes 100% determinísticos em CI/CD sem requisições externas e desacopla o provedor (Gemini / OpenAI / Anthropic). |
| TurnWindow Coalescer & Outbound Seed Binder | `@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate/`) | `@futuremove/zaptrail-core` | Agrupa mensagens fragmentadas do mesmo contato e vincula imóveis pré-cadastrados da campanha de captação ativa. |

---

## Technical Standards & Patterns

### 1. Zero Hallucination via Exact Quote Verification (`LLM-02`)
Os LLMs tendem a parafrasear ou inventar trechos quando instados a justificar suas conclusões. Para eliminar alucinações:
- O schema JSON exige o campo `exact_quote` para cada entidade.
- O `@futuremove/zaptrail-core` executa busca de substring determinística via `normalizeMessageText(exact_quote)` contra `normalizeMessageText(user_message)`.
- Se a citação não existir na mensagem original:
  - Não são atribuídos offsets arbitrários (`char_start`/`char_end` só são gerados para substrings comprovadas).
  - A evidência é marcada como `hallucination_detected: true`.
  - A confiança é forçada para `< 0.65` e adiciona-se um `ReviewItem` mandatório.

### 2. Structured Outputs com Zod
Utilizamos Zod para tipar o payload de retorno do LLM. O schema do domínio imobiliário extrai:
- `detected_role`: papel do contato com citação literal.
- `intents`: array de intenções detectadas com score e citação.
- `property_candidates`: imóveis citados (preço, aluguel, condomínio, endereço mencionado, se é o imóvel alvo ou um 2º imóvel).
- `demand_profile`: intenção de compra ou locação com orçamento e prazos.
- `conditions`: condicionantes expressas (ex.: inventário, venda prévia, aprovação de cônjuge).

### 3. TurnWindow Coalescer & Outbound Seeding (`ING-01`)
Em abordagens de prospecção fria ou campanhas ativas, a mensagem inicial do corretor informa:
> *"Olá Roberto, sou da imobiliária XYZ. Temos clientes interessados em apartamentos no Edifício Mirage, você tem interesse em vender o seu?"*

O proprietário responde em mensagens picadas:
> [14:02:01] *"Boa tarde"*  
> [14:02:15] *"Até penso em vender sim"*  
> [14:02:30] *"Mas só por 1.5M"*  

O **Coalescer** agrupa as 3 mensagens em uma única `TurnWindow`, preservando os IDs individuais, e injeta o `SeededPropertyCandidate` (Edifício Mirage) no contexto. Assim, o motor infere que o valor de `1.5M` aplica-se ao imóvel da abordagem inicial com alta confiança.

---

## Validation Architecture

### Framework
- **Test Runner:** Vitest `^2.1.0`
- **Comando Rápido:** `npx.cmd vitest run`
- **Comando Completo:** `npx.cmd vitest run && npx.cmd tsc --noEmit`
- **Critério de Aceite:** 100% dos testes aprovados, 0 erros no typechecker, todos os arquivos com `<= 350` linhas.

### Matriz de Testes da Fase 2

| Req ID | Comportamento | Tipo | Comando Automatizado | Arquivo de Teste |
|---|---|---|---|---|
| `LLM-01` | Estágio 1 resolve turnos claros sem invocar LLM (`llm_invoked: false`); Estágio 2 acionado em turnos ambíguos | Unit / Integration | `npx.cmd vitest run tests/core/hybrid-engine.test.ts` | `tests/core/hybrid-engine.test.ts` |
| `LLM-02` | Validação estrita de `exact_quote`, detecção e rebaixamento de alucinações para `review_required=true` | Unit | `npx.cmd vitest run tests/core/quote-validator.test.ts` | `tests/core/quote-validator.test.ts` |
| `ING-01` | Coalescência de mensagens rápidas do mesmo contato e injeção de `seeded_property_candidates` de campanha | Unit / Integration | `npx.cmd vitest run tests/domain-real-estate/coalescer-seeding.test.ts` | `tests/domain-real-estate/coalescer-seeding.test.ts` |
| `LLM-01, LLM-02` | Extração estruturada do domínio imobiliário via `RealEstateLLM` com mock e mesclagem no envelope | Integration | `npx.cmd vitest run tests/domain-real-estate/real-estate-llm.test.ts` | `tests/domain-real-estate/real-estate-llm.test.ts` |
