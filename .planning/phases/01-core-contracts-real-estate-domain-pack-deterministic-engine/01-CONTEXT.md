# Phase 1: Core Contracts, Real Estate Domain Pack & Deterministic Engine - Context

**Gathered:** 2026-10-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar a fundação executável do repositório (`package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`), o núcleo semântico universal `@futuremove/zaptrail-core` (`src/packages/core`), o pacote de domínio imobiliário `@futuremove/zaptrail-domain-real-estate` (`src/packages/domain-real-estate`) com o parser determinístico completo de Estágio 1, o adaptador `PilotCRMAdapter` compatível com a constraint `enrichment_action_ck` do PilotCRM, e a suíte automatizada Vitest que valida os 20 Casos-Ouro obrigatórios (`CT-01` a `CT-20` de `docs/spec.md §21.2`).

</domain>

<decisions>
## Implementation Decisions

### Package-First Architecture & Boundary Isolation
- **D-01:** Organizar os módulos do motor em `src/packages/core/` (`@futuremove/zaptrail-core`) e `src/packages/domain-real-estate/` (`@futuremove/zaptrail-domain-real-estate`), mantendo cada arquivo de produção estritamente com `<= 350` linhas (`quality/max-lines`).
- **D-02:** `@futuremove/zaptrail-core` deve ser 100% agnóstico de domínio e de banco de dados: nenhum identificador ou campo exclusivo de imóvel (`iptu`, `condominio`, `quartos`, `matricula`, `real_estate`) pode existir em `src/packages/core/`.
- **D-03:** `@futuremove/zaptrail-core` define as portas plugáveis `DomainPack`, `CRMAdapter` e `StoragePort`, além do `UniversalInterpretationEnvelope` validado via Zod.

### Evidence & Epistemic Rigor
- **D-04:** Toda observação (`IntentObservation`, `FactObservation`, `ValueObservation`, `RelationshipObservation`, `ConditionObservation`), avaliação de oportunidade (`OpportunityAssessment`) e recomendação de ação (`ActionRecommendation`) deve carregar pelo menos um `EvidenceRef` e um `EpistemicStatus` (`declared` | `inferred` | `validated_external` | `validated_human` | `superseded` | `rejected`).
- **D-05:** Os offsets de evidência (`char_start` e `char_end`) devem ser calculados deterministicamente em TypeScript a partir de `exact_quote` sobre `normalized_text` (nunca delegados a contagem livre).
- **D-06:** Atualizações de preço/condição em mensagens posteriores na mesma conversa devem marcar o `ValueObservation` anterior como `superseded` e registrar o novo valor como ativo (`declared`), preservando o histórico completo (`CT-13`).

### Real Estate Domain Rules & Multi-Entity Conversations
- **D-07:** O pacote `@futuremove/zaptrail-domain-real-estate` deve suportar múltiplos imóveis e múltiplas oportunidades na mesma conversa: quando o contato recusa vender/alugar o Imóvel A perguntado mas oferece um Imóvel B (`CAPTURE_OTHER_PROPERTY`, `CT-08`), o motor registra `intent.not_interested_property` no Imóvel A e cria um segundo `RealEstatePropertyCandidate` com oportunidade `real_estate.capture_sale` ou `real_estate.capture_rent`.
- **D-08:** Quando o contato manifesta demanda de compra condicionada à venda do imóvel atual (`CT-10`), o motor deve criar duas oportunidades (`real_estate.capture_sale` e `real_estate.demand_buy`), conectá-las via `ConditionObservation` (`condition_type: 'sale_before_purchase'`) e recomendar a ação `link_conditional_opportunities`.
- **D-09:** O motor deve distinguir estritamente recusa comercial no imóvel (`intent.not_interested_property`), recusa geral (`intent.not_interested_general` / número errado `unrelated_third_party`, `CT-06`) e opt-out explícito (`intent.do_not_contact`, `CT-07`), emitindo `suppress_commercial_followup` e bloqueando qualquer follow-up em caso de opt-out.
- **D-10:** Respostas curtas dependentes de contexto ("Sim", `CT-15`) devem ser interpretadas em função da pergunta outbound anterior na `TurnWindow` (`"Você tem interesse em vender ou alugar seu imóvel?"`), gerando `intent.ambiguous_or_open` e a ação `qualify_property` para esclarecer modalidade e valor.

### PilotCRM Compatibility (`PilotCRMAdapter`)
- **D-11:** O `PilotCRMAdapter` deve traduzir as oportunidades e recomendações do ZapTrail exclusivamente para ações permitidas pela check constraint `enrichment_action_ck` do PilotCRM (`NO_CHANGE`, `CONFIRM`, `UPDATE`, `ADD`, `RELATE`, `CONTRADICT`, `INVALIDATE`, `SUPPRESS`, `DEFER`, `REVIEW`), nunca emitindo `action_type: "create_deal"`.

### the agent's Discretion
- Divisão interna de arquivos dentro de `src/packages/core/` e `src/packages/domain-real-estate/`, desde que respeite o teto de 350 linhas por arquivo e exporte uma API pública limpa em `index.ts`.
- Expressões regulares e heurísticas lexicais em pt-BR para normalização numérica (`1,2 milhão`, `850 mil`, `3.5k`), desde que passem de forma determinística nos 20 Casos-Ouro (`CT-01`..`CT-20`).

</decisions>

<specifics>
## Specific Ideas

- Aproveitar as lições comprovadas do motor `canonical-conversation-processor.ts` do PilotCRM (separação de sufixos, distinção opt-out vs recusa, papéis de terceiros `spouse_or_partner`, `family_member`, `broker_or_intermediary`) combinadas com a taxonomia limpa e os 20 Casos-Ouro de `docs/spec.md`.
- Garantir idempotência determinística por `(tenant_id, provider, external_message_id)` (`CT-18`) e consolidação de mensagens fragmentadas consecutivas na mesma `TurnWindow` (`CT-17`).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Technical Specification & Decisions
- `docs/spec.md` — Especificação Técnica completa do MVP ZapTrail v1.0.0 (objetivos, taxonomia imobiliária, regras epistêmicas, faixas de confiança e os 20 Casos-Ouro `CT-01`..`CT-20`).
- `.planning/PROJECT.md` — Visão do produto, restrições arquiteturais e decisões-chave.
- `.planning/REQUIREMENTS.md` — Lista de requisitos `CORE-01`..`CORE-05`, `RE-01`..`RE-06`, `CRM-01`, `QA-01`.
- `.planning/DECISIONS.md` — ADRs originais do repositório ZapTrail.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/semantic/pipeline.ts` e `src/semantic/extractor.ts`: protótipo inicial de pipeline semântico; não atende à separação de camadas nem aos 20 Casos-Ouro, devendo ser sucedido pelos pacotes `src/packages/core` e `src/packages/domain-real-estate` (mantendo compatibilidade ou re-export se necessário).
- `src/providers/whatsapp.ts` e `src/providers/mock.ts`: contratos legados de MockProvider.

### Established Patterns
- Identificadores 100% em inglês em código, tipos, esquemas Zod e banco de dados.
- Validação em tempo de execução com `zod` e testes unitários/integração com `vitest`.

### Integration Points
- `src/packages/core/index.ts` -> exporta tipos universais, calculador de evidências, avaliador de políticas de confiança e orquestrador de `DomainPack`.
- `src/packages/domain-real-estate/index.ts` -> implementa `DomainPack` imobiliário e `PilotCRMAdapter`.

</code_context>

<deferred>
## Deferred Ideas

- Integração com chamadas reais de LLM (Estágio 2 Structured Outputs) — Fase 2.
- Correção das migrações SQL do Supabase e UI de Review Inbox — Fase 3.
- Servidor MCP e endpoint REST `/api/v1/ingest/whatsapp` — Fase 4.

</deferred>

---

*Phase: 01-core-contracts-real-estate-domain-pack-deterministic-engine*
*Context gathered: 2026-10-21*
