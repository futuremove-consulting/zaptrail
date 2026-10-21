# Requirements: ZapTrail

**Defined:** 2026-10-21
**Core Value:** Transformar qualquer turno de conversa de WhatsApp em registros de negócio auditáveis, idempotentes e vinculados à evidência exata da mensagem — separando com precisão recusa, opt-out, múltiplos imóveis na mesma conversa e demandas condicionadas, sem nunca executar ações externas não autorizadas.

## v1 Requirements

Requirements for initial release (`spec.md v1.0.0`). Each maps to roadmap phases.

### Universal Semantic Core (`@futuremove/zaptrail-core`)

- [x] **CORE-01**: Sistema fornece `UniversalInterpretationEnvelope` (Zod + TypeScript) contendo `participants`, `intents`, `facts`, `values`, `relationships`, `conditions`, `opportunities`, `actions`, `evidence_refs` e `review_items` sem nenhum atributo exclusivo de imóvel.
- [x] **CORE-02**: Sistema define as interfaces plugáveis `DomainPack<TDomainEntities>`, `CRMAdapter` e `StoragePort` permitindo trocar o domínio (ex.: `real_estate`) ou o CRM alvo (ex.: `PilotCRMAdapter`) sem alterar o core.
- [x] **CORE-03**: Sistema constrói `EvidenceRef` obrigatório para toda observação/decisão, calculando `char_start` e `char_end` deterministicamente em TypeScript a partir de `exact_quote` sobre `normalized_text`.
- [x] **CORE-04**: Sistema aplica separação epistêmica (`declared`, `inferred`, `validated_external`, `validated_human`, `superseded`, `rejected`) e preserva evolução histórica de valores (ex.: atualização de preço marca o valor anterior como `superseded` sem apagá-lo).
- [x] **CORE-05**: Sistema aplica faixas de confiança (`>= 0.85` auto-update seguro, `0.65–0.84` `pending_confirmation` + `ReviewItem`, `< 0.65` observação/hipótese sem sobrescrita) e bloqueia execução autônoma de ações externas (`send_whatsapp_followup`).

### Real Estate Domain Pack & Deterministic Engine (`@futuremove/zaptrail-domain-real-estate`)

- [x] **RE-01**: Motor identifica o papel do contato em relação ao imóvel (`owner`, `co_owner`, `spouse_or_partner`, `family_member`, `friend_or_acquaintance`, `representative_or_advisor`, `broker_or_intermediary`, `tenant_or_occupant`, `unrelated_third_party`, `unknown`) e extrai contato de terceiro indicado (`refer_third_party` -> `real_estate.owner_discovery` + `request_owner_contact`).
- [x] **RE-02**: Motor classifica intenções comerciais (`capture_for_sale`, `capture_for_rent`, `capture_for_sale_and_rent`, `not_interested_property`, `not_interested_general`, `do_not_contact`, `future_interest`, `conditional_interest`, `ambiguous_or_open`, `noise_or_ack`) interpretando respostas curtas ("Sim", "Depende") em função da pergunta outbound da `TurnWindow`.
- [x] **RE-03**: Motor detecta oferta de segundo imóvel na mesma conversa (`CAPTURE_OTHER_PROPERTY`: recusa do imóvel perguntado + oferta de outro imóvel), criando um segundo `RealEstatePropertyCandidate` independente e oportunidade `real_estate.capture_sale` / `real_estate.capture_rent`.
- [x] **RE-04**: Motor detecta demandas (`buy_demand`, `rent_demand`, `investment_demand`) e condicionantes (`sale_before_purchase`, `family_approval`, `exclusivity_constraint`, `broker_commission_condition`, `tenant_vacating`, `date_or_timeframe`), vinculando oportunidades dependentes via `link_conditional_opportunities`.
- [x] **RE-05**: Motor extrai e normaliza valores monetários coloquiais em pt-BR (`1,2 milhão`, `850 mil`, `3.5k`, condomínio, IPTU), áreas (`m²`), quartos/vagas e anexos de mídia (`MediaUnderstandingResult` vinculado ao `PropertyCandidate`).
- [x] **RE-06**: Motor garante idempotência por `(tenant_id, provider, external_message_id)` e consolida mensagens fragmentadas consecutivas na mesma `TurnWindow` sem duplicar oportunidades ou ações.

### CRM Compatibility & Golden Verification

- [x] **CRM-01**: `PilotCRMAdapter` traduz decisões do ZapTrail para propostas compatíveis com a constraint `enrichment_action_ck` do PilotCRM (`NO_CHANGE|CONFIRM|UPDATE|ADD|RELATE|CONTRADICT|INVALIDATE|SUPPRESS|DEFER|REVIEW`), corrigindo o erro P0 `action_type: "create_deal"`.
- [x] **QA-01**: Suíte de testes automatizados Vitest valida 100% dos 20 Casos-Ouro obrigatórios (`CT-01` a `CT-20` de `docs/spec.md §21.2`) mais verificação arquitetural de zero vazamento de termos imobiliários em `@futuremove/zaptrail-core`.

### Hybrid LLM Stage 2 & Context Seeding

- [x] **LLM-01**: Orquestrador aciona o Estágio 2 (LLM Structured Outputs via Zod JSON Schema) somente quando o Estágio 1 determinístico sinalizar ambiguidade (`unknown` / `ambiguous_or_open`), múltiplos imóveis complexos ou contradição semântica.
- [x] **LLM-02**: Resposta do LLM retorna `exact_quote` literal validada contra a mensagem original; citações alucinadas que não existem no texto original são rejeitadas ou rebaixadas para `review_required=true`.
- [x] **ING-01**: Debouncer/Coalescer de `TurnWindow` agrupa mensagens rápidas do mesmo remetente e injeta `seeded_property_candidates` vindos de campanhas outbound de captação.

### Persistence, Security & Human Review Inbox

- [ ] **DB-01**: Migrações SQL Supabase corrigem o bug `alter table <name> enable row level security;`, criando `origin_messages`, `evidence_spans`, `extraction_runs`, `management_objects` e `review_queue` com RLS estrito por `workspace_id`/`tenant_id`.
- [ ] **REV-01**: API e interface de Revisão Humana (`review_queue` + Timeline Dual) permitem aprovar, editar ou rejeitar extrações com `review_required=true` e navegar direto para a evidência ("Mostrar na conversa").

### Standalone Spin-Out Surface (API & MCP)

- [ ] **API-01**: Endpoint `/api/v1/ingest/whatsapp` processa webhooks/turnos de forma idempotente retornando `UniversalInterpretationEnvelope` auditável.
- [ ] **MCP-01**: Servidor MCP expõe tools `analyze_conversation`, `get_entity_memory` e `resolve_review_item` para consumo por agentes externos e CRMs terceiros.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Multi-Domain Expansion & Active Agents

- **DOM-01**: Segundo `DomainPack` completo em produção (ex.: Clínicas/Saúde ou Consultoria B2B).
- **AGT-01**: Disparo assistido de follow-ups outbound no WhatsApp após aprovação humana com um clique.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Negociação autônoma de preço | Proibido por `docs/spec.md §1.2` — risco comercial e jurídico |
| Disparo outbound automático sem aprovação | Proibido por `docs/spec.md §14.3` — exige governança e consentimento |
| Neo4j / Kafka / Kubernetes | Proibido por `.planning/DECISIONS.md` — manter arquitetura enxuta em Postgres/Supabase |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CORE-01 | Phase 1 | Complete |
| CORE-02 | Phase 1 | Complete |
| CORE-03 | Phase 1 | Complete |
| CORE-04 | Phase 1 | Complete |
| CORE-05 | Phase 1 | Complete |
| RE-01 | Phase 1 | Complete |
| RE-02 | Phase 1 | Complete |
| RE-03 | Phase 1 | Complete |
| RE-04 | Phase 1 | Complete |
| RE-05 | Phase 1 | Complete |
| RE-06 | Phase 1 | Complete |
| CRM-01 | Phase 1 | Complete |
| QA-01 | Phase 1 | Complete |
| LLM-01 | Phase 2 | Complete |
| LLM-02 | Phase 2 | Complete |
| ING-01 | Phase 2 | Complete |
| DB-01 | Phase 3 | Pending |
| REV-01 | Phase 3 | Pending |
| API-01 | Phase 4 | Pending |
| MCP-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-21*
*Last updated: 2026-10-21 after initial definition*
