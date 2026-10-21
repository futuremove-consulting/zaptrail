# ZapTrail

## What This Is

ZapTrail é um motor de inteligência conversacional, resolução de entidades, decisão operacional e orquestração de oportunidades a partir de conversas de WhatsApp (`@futuremove/zaptrail-core` + pacotes de domínio plugáveis como `@futuremove/zaptrail-domain-real-estate`). Ele transforma conversas coloquiais, fragmentadas e ambíguas em fatos tipados com evidência literal (`exact_quote` + offsets determinísticos), separação epistêmica (`declared`, `inferred`, `validated_human`), oportunidades comerciais sem duplicidade e ações recomendadas auditáveis — operando tanto acoplado ao PilotCRM via `PilotCRMAdapter` quanto como produto SaaS/API/MCP independente (`@futuremove/zaptrail-mcp`).

## Core Value

Transformar qualquer turno de conversa de WhatsApp em registros de negócio auditáveis, idempotentes e vinculados à evidência exata da mensagem — separando com precisão recusa, opt-out, múltiplos imóveis na mesma conversa e demandas condicionadas, sem nunca executar ações externas não autorizadas.

## Business Context

- **Customer**: Imobiliárias, corretores de alto padrão (PilotCRM) e PMEs B2B/B2C que operam vendas complexas via WhatsApp
- **Revenue model**: Módulo nativo de inteligência no PilotCRM (Fase 1-2) e API/MCP B2B usage-based + SaaS Cockpit multi-domínio (Fase 3-4)
- **Success metric**: 100% de aprovação nos 20 Casos-Ouro imobiliários (`docs/spec.md §21.2`), latência <10ms no Estágio 1 determinístico para turnos inequívocos, zero chamadas desnecessárias de LLM, e 0 duplicações em reprocessamento
- **Strategy notes**: `docs/spec.md`, `.planning/DECISIONS.md` e `.planning/milestones/v1.0.0-MILESTONE-AUDIT.md`

## Requirements

### Validated

- ✓ **CORE-01**: Envelope Semântico Universal (`UniversalInterpretationEnvelope`) livre de campos exclusivos de domínio — v1.0.0
- ✓ **CORE-02**: Contrato plugável `DomainPack` + portas `CRMAdapter` e `StoragePort` — v1.0.0
- ✓ **CORE-03**: Rastreabilidade de evidências (`EvidenceRef`) com cálculo determinístico de `char_start`/`char_end` a partir de `exact_quote` — v1.0.0
- ✓ **CORE-04**: Separação epistêmica (`declared`, `inferred`, `validated_external`, `validated_human`, `superseded`, `rejected`) e histórico de evolução de valores sem sobrescrita destrutiva — v1.0.0
- ✓ **CORE-05**: Política de confiança (`>=0.85` auto, `0.65-0.84` pending/review, `<0.65` observação) e bloqueio de ações externas irreversíveis — v1.0.0
- ✓ **RE-01**: Classificação de papel do interlocutor (`RealEstatePartyRole`) e extração de terceiro indicado (`refer_third_party`) — v1.0.0
- ✓ **RE-02**: Classificação de intenções imobiliárias (`capture_for_sale`, `capture_for_rent`, `do_not_contact`, `ambiguous_or_open`, etc.) considerando pergunta outbound da `TurnWindow` — v1.0.0
- ✓ **RE-03**: Detecção de segundo imóvel na mesma conversa (`CAPTURE_OTHER_PROPERTY`: recusa do imóvel A + oferta do imóvel B criando `PropertyCandidate` distinto) — v1.0.0
- ✓ **RE-04**: Detecção de demanda de compra/locação e vínculo de condicionantes (`sale_before_purchase`, `family_approval`) entre oportunidades — v1.0.0
- ✓ **RE-05**: Normalização determinística de valores monetários coloquiais pt-BR (`1,2 mi`, `850 mil`, `3.5k`, condomínio, IPTU), áreas e tipologia — v1.0.0
- ✓ **RE-06**: Idempotência de ingestão por `(tenant_id, provider, external_message_id)` e consolidação de mensagens fragmentadas na `TurnWindow` — v1.0.0
- ✓ **CRM-01**: `PilotCRMAdapter` compatível com a constraint `enrichment_action_ck` do PilotCRM (`NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`), eliminando o bug P0 `action_type: "create_deal"` — v1.0.0
- ✓ **QA-01**: Suíte automatizada Vitest cobrindo integralmente os 20 Casos-Ouro (`CT-01` a `CT-20`) e fronteira arquitetural core/mcp sem termos de domínio — v1.0.0
- ✓ **LLM-01**: Estágio 2 híbrido com Structured Outputs (Zod/JSON Schema) acionado apenas quando o Estágio 1 determinístico retornar ambiguidade — v1.0.0
- ✓ **LLM-02**: Validação estrita de `exact_quote` contra alucinações e rebaixamento com abertura de `ReviewItem` — v1.0.0
- ✓ **ING-01**: Coalescência de turnos com debounce e injeção de candidatos de campanhas outbound — v1.0.0
- ✓ **DB-01**: Migrações Supabase PostgreSQL corrigidas (001-004 com RLS explícito ativado), `SupabaseStoragePort` com isolamento multi-tenant — v1.0.0
- ✓ **REV-01**: Fila de revisão humana (`ReviewInboxService`) e Timeline Dual com destaque exato ("Mostrar na conversa") — v1.0.0
- ✓ **API-01**: Rota REST `/api/v1/ingest/whatsapp` com deduplicação de webhooks e suporte a cabeçalhos de autenticação/tenant — v1.0.0
- ✓ **MCP-01**: Servidor MCP (`@futuremove/zaptrail-mcp`) com stdio runner e ferramentas `analyze_conversation`, `get_entity_memory`, `resolve_review_item` — v1.0.0

### Active (Próximo Milestone: v1.1.0)

- [ ] **DOM-01**: Segundo `DomainPack` completo e plugável (ex.: Saúde/Clínicas ou Consultoria B2B)
- [ ] **AGT-01**: Disparo assistido de mensagens outbound aprovadas na fila de revisão com 1 clique via WhatsApp Cloud API
- [ ] **ADM-01**: Dashboard administrativo avançado para gestão multi-tenant de regras e auditoria analítica

### Out of Scope

- Negociação autônoma de preço ou fechamento jurídico — alto risco operacional (`docs/spec.md §1.2`)
- Disparo automático de mensagens outbound de WhatsApp sem aprovação humana — proibido (`docs/spec.md §14.3`)
- Banco de grafos dedicado (Neo4j) ou infraestrutura de microserviços/Kafka/K8s — complexidade desnecessária; PostgreSQL relacional + JSONB auditável supre com folga

## Context

- **Milestone v1.0.0 Shipped**: Entregue com 9 planos, 18 tasks, 90 arquivos criados/modificados e 214 testes automatizados em 14 suítes Vitest.
- **Tech Stack consolidada**: TypeScript 5.8, Node.js 20+, Vitest 2.1, Zod 3.24, Next.js 14 App Router, Supabase (PostgreSQL 15 + RLS).
- **Arquitetura comprovada**: Package-First com desacoplamento modular estrito:
  - `@futuremove/zaptrail-core`: 100% agnóstico de domínio e banco
  - `@futuremove/zaptrail-domain-real-estate`: motor determinístico pt-BR + adaptador PilotCRM
  - `@futuremove/zaptrail-mcp`: servidor MCP JSON-RPC 2.0 stdio
  - `src/app/api/`: rotas Next.js App Router para ingestão e objetos de gestão
- **Qualidade**: 100% dos arquivos de produção com `<= 346` linhas (respeitando o teto de 350 linhas do `quality/max-lines`).

## Constraints

- **Tech stack**: TypeScript 5+, Node.js 20+, Zod, Vitest, Next.js App Router, Supabase (PostgreSQL + RLS)
- **Code quality**: Limite estrito de 350 linhas por arquivo de produção (`quality/max-lines`), TDD obrigatório, identificadores 100% em inglês
- **Architecture**: Zero vazamento de termos imobiliários dentro de `@futuremove/zaptrail-core` e `@futuremove/zaptrail-mcp`; cálculo de offsets `char_start`/`char_end` determinístico a partir de `exact_quote`
- **Git / Windows NTFS**: Nunca fazer checkout de caminhos com `:` na árvore git em Windows NTFS

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Arquitetura Package-First (`@futuremove/zaptrail-core` + `@futuremove/zaptrail-domain-real-estate` + `PilotCRMAdapter`) | Permite rodar dentro do PilotCRM hoje e como API/MCP standalone amanhã com zero reescrita | ✓ Good |
| Pipeline Híbrido 80/20 (Estágio 1 determinístico + Estágio 2 LLM estruturado) | Custo zero e latência <10ms para turnos claros; precisão semântica para casos multi-imóvel e condicionais | ✓ Good |
| Offsets de evidência calculados em TypeScript via `exact_quote` | LLMs erram contagem de caracteres; `indexOf(exact_quote)` sobre `normalized_text` garante determinismo | ✓ Good |
| Mapeamento estrito no `PilotCRMAdapter` para `enrichment_action_ck` | Corrige o bug P0 do PilotCRM onde `create_deal` violava a check constraint de `enrichment_proposals` | ✓ Good |
| Correção estrutural de RLS nas migrações SQL 001-004 | Garante isolamento multi-tenant real e audit trail imutável no Supabase | ✓ Good |
| Protocolo MCP via stdio e JSON-RPC 2.0 | Integração direta com IDEs e agentes de IA modernos sem infraestrutura extra de rede | ✓ Good |

---
*Last updated: 2026-10-21 after v1.0.0 milestone*
