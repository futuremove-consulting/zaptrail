# ZapTrail

## What This Is

ZapTrail é um motor de inteligência conversacional, resolução de entidades, decisão operacional e orquestração de oportunidades a partir de conversas de WhatsApp (`@futuremove/zaptrail-core` + pacotes de domínio plugáveis como `@futuremove/zaptrail-domain-real-estate`). Ele transforma conversas coloquiais, fragmentadas e ambíguas em fatos tipados com evidência literal (`exact_quote` + offsets determinísticos), separação epistêmica (`declared`, `inferred`, `validated_human`), oportunidades comerciais sem duplicidade e ações recomendadas auditáveis — operando tanto acoplado ao PilotCRM via `CRMAdapter` quanto como produto SaaS/API/MCP independente.

## Core Value

Transformar qualquer turno de conversa de WhatsApp em registros de negócio auditáveis, idempotentes e vinculados à evidência exata da mensagem — separando com precisão recusa, opt-out, múltiplos imóveis na mesma conversa e demandas condicionadas, sem nunca executar ações externas não autorizadas.

## Business Context

- **Customer**: Imobiliárias, corretores de alto padrão (PilotCRM) e PMEs B2B/B2C que operam vendas complexas via WhatsApp
- **Revenue model**: Módulo nativo de inteligência no PilotCRM (Fase 1-2) evoluindo para API/MCP B2B usage-based + SaaS Cockpit multi-domínio (Fase 3-4)
- **Success metric**: >= 85% de precisão nos 20 casos-ouro imobiliários (`docs/spec.md §21.2`) com ~80% dos turnos resolvidos no Estágio 1 determinístico (custo zero de LLM) e 0 duplicações em reprocessamento
- **Strategy notes**: `docs/spec.md` e `.planning/DECISIONS.md`

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **CORE-01**: Envelope Semântico Universal (`UniversalInterpretationEnvelope`) livre de campos exclusivos de domínio
- [ ] **CORE-02**: Contrato plugável `DomainPack` + portas `CRMAdapter` e `StoragePort`
- [ ] **CORE-03**: Rastreabilidade de evidências (`EvidenceRef`) com cálculo determinístico de `char_start`/`char_end` a partir de `exact_quote`
- [ ] **CORE-04**: Separação epistêmica (`declared`, `inferred`, `validated_external`, `validated_human`, `superseded`, `rejected`) e histórico de evolução de valores sem sobrescrita destrutiva
- [ ] **CORE-05**: Política de confiança (`>=0.85` auto, `0.65-0.84` pending/review, `<0.65` observação) e bloqueio de ações externas irreversíveis
- [ ] **RE-01**: Classificação de papel do interlocutor (`RealEstatePartyRole`: `owner`, `spouse_or_partner`, `family_member`, `broker_or_intermediary`, `unrelated_third_party`, etc.) e extração de terceiro indicado (`refer_third_party`)
- [ ] **RE-02**: Classificação de intenções imobiliárias (`capture_for_sale`, `capture_for_rent`, `capture_for_sale_and_rent`, `not_interested_property`, `do_not_contact`, `ambiguous_or_open`, etc.) considerando contexto da pergunta outbound na `TurnWindow`
- [ ] **RE-03**: Detecção de segundo imóvel na mesma conversa (`CAPTURE_OTHER_PROPERTY`: recusa do imóvel A + oferta do imóvel B criando `PropertyCandidate` distinto)
- [ ] **RE-04**: Detecção de demanda de compra/locação/investimento e vínculo de condição (`sale_before_purchase`, `family_approval`, `exclusivity_constraint`, etc.) entre oportunidades
- [ ] **RE-05**: Normalização determinística de valores monetários coloquiais pt-BR (`1,2 mi`, `850 mil`, `3.5k`, condomínio, IPTU), áreas e tipologia
- [ ] **RE-06**: Idempotência de ingestão por `(tenant_id, provider, external_message_id)` e consolidação de mensagens fragmentadas na `TurnWindow`
- [ ] **CRM-01**: `PilotCRMAdapter` compatível com a constraint `enrichment_action_ck` do PilotCRM (`NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`), eliminando o bug P0 `action_type: "create_deal"`
- [ ] **QA-01**: Suíte automatizada Vitest cobrindo integralmente os 20 Casos-Ouro (`CT-01` a `CT-20` de `docs/spec.md §21.2`)
- [ ] **LLM-01**: Estágio 2 híbrido com Structured Outputs (Zod/JSON Schema) acionado apenas quando o Estágio 1 determinístico retornar ambiguidade, múltiplos imóveis ou contradições
- [ ] **DB-01**: Migrações Supabase PostgreSQL corrigidas (RLS habilitado em todas as tabelas com políticas `tenant_id`/`workspace_id`, `origin_messages`, `evidence_spans`, `extraction_runs`, `review_queue`)
- [ ] **REV-01**: Fila de revisão humana (`review_required`) e API/UI com navegação por contexto ("Mostrar na conversa")
- [ ] **MCP-01**: Servidor MCP e endpoint REST `/v1/ingest/whatsapp` para operação standalone multi-CRM

### Out of Scope

- Negociação autônoma de preço ou fechamento jurídico — alto risco operacional (`docs/spec.md §1.2`)
- Disparo automático de mensagens outbound de WhatsApp sem aprovação humana — proibido no MVP (`docs/spec.md §14.3`)
- Banco de grafos dedicado (Neo4j) ou infraestrutura de microserviços/Kafka/K8s — complexidade desnecessária para o MVP; usar PostgreSQL relacional + JSONB auditável

## Context

- A auditoria técnica do repositório `futuremove-consulting/zaptrail` identificou ausência de `package.json`/`tsconfig.json` na raiz, erro de sintaxe SQL nas migrações (`alter table enable row level security;` sem nome da tabela) e protótipo superficial.
- A auditoria técnica do `futuremove-consulting/pilotcrm` revelou que o motor `canonical-conversation-processor.ts` já resolve ~65% do problema em produção (631 conversas reais), mas possui dívida crítica (`G1`: inserção de `action_type: "create_deal"` violando `enrichment_action_ck`, ausência de separação de 2º imóvel `CAPTURE_OTHER_PROPERTY` e ausência de condição `sale_before_purchase`).
- A arquitetura escolhida é **Package-First ("Spin-Out Ready")**: construir `@futuremove/zaptrail-core` e `@futuremove/zaptrail-domain-real-estate` desacoplados de banco, permitindo uso imediato pelo PilotCRM via `PilotCRMAdapter` e comercialização independente como API/MCP/SaaS.

## Constraints

- **Tech stack**: TypeScript 5+, Node.js 20+, Zod, Vitest, Next.js App Router, Supabase (PostgreSQL + RLS) — alinhado com PilotCRM e Futuremove
- **Code quality**: Limite estrito de 350 linhas por arquivo de produção (`quality/max-lines`), TDD obrigatório (Red-Green-Refactor), identificadores 100% em inglês
- **Architecture**: Zero vazamento de termos imobiliários dentro de `@futuremove/zaptrail-core`; cálculo de offsets `char_start`/`char_end` feito deterministamente em código a partir de `exact_quote`
- **Git / Windows NTFS**: Nunca fazer checkout de caminhos com `:` na árvore git em Windows NTFS

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Arquitetura Package-First (`@futuremove/zaptrail-core` + `@futuremove/zaptrail-domain-real-estate` + `CRMAdapter`) | Permite rodar dentro do PilotCRM hoje e vender como API/MCP/SaaS multi-domínio amanhã com zero reescrita | ✓ Good |
| Pipeline Híbrido 80/20 (Estágio 1 determinístico + Estágio 2 LLM estruturado só para os ~20% ambíguos) | Custo zero e latência <10ms para 80% dos turnos; alta precisão semântica para casos multi-imóvel e condicionais | ✓ Good |
| Offsets de evidência calculados em TypeScript via `exact_quote` | LLMs erram contagem de caracteres; `indexOf(exact_quote)` sobre `normalized_text` garante determinismo | ✓ Good |
| Mapeamento estrito no `PilotCRMAdapter` para `enrichment_action_ck` | Corrige o bug P0 (`G1`) do PilotCRM onde `create_deal` violava a check constraint de `enrichment_proposals` | ✓ Good |

---
*Last updated: 2026-10-21 after initial GSD project & spec.md v1.0.0 bootstrap*
