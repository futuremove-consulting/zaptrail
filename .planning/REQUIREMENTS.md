# Requirements: ZapTrail

**Defined:** 2026-10-21
**Core Value:** Transformar qualquer turno de conversa de WhatsApp em registros de negócio auditáveis, idempotentes e vinculados à evidência exata da mensagem — separando com precisão recusa, opt-out, múltiplos imóveis na mesma conversa e demandas condicionadas, sem nunca executar ações externas não autorizadas.

## v1.1 Requirements

Requirements for Milestone v1.1.0: PilotCRM Native Integration & Marketplace.

### Marketplace & Modules (PilotCRM)

- [x] **PCRM-01**: PilotCRM registra o módulo ZapTrail em `MODULE_REGISTRY` (`apps/pilotcrm/src/lib/module-flags/types.ts`) com flags de ativação por tenant.
- [x] **PCRM-02**: PilotCRM renderiza card do ZapTrail na página de módulos (`/crm/settings/modules`), permitindo configurar URL do ZapTrail, API Key/Token e status de ativação.

### Trigger Integration (PilotCRM -> ZapTrail)

- [ ] **PCRM-03**: Webhook realtime do PilotCRM (`/api/crm/whatsapp/webhook`) encaminha turnos de mensagens assincronamente via `after()` para `POST /api/v1/ingest/whatsapp` quando o módulo ZapTrail estiver ativo.
- [ ] **PCRM-04**: Crons de sincronização do PilotCRM (`/api/cron/whatsapp-sync` e `whatsapp-analysis`) enviam filas de mensagens pendentes para processamento no ZapTrail.
- [ ] **PCRM-05**: CTAs sob demanda no Inbox ("Sincronizar Conversas") e no Radar ("Analisar agora") disparam requisições ao ZapTrail e refletem o status na interface.

### Proposal Sync & Outbound Callback (ZapTrail -> PilotCRM)

- [ ] **PCRM-06**: ZapTrail envia webhook outbound após processamento para o PilotCRM com propostas comerciais formatadas via `PilotCRMAdapter`.
- [ ] **PCRM-07**: PilotCRM recebe propostas via endpoint `/api/crm/whatsapp/proposals/ingest` e persiste em `enrichment_proposals` estritamente compatível com a constraint `enrichment_action_ck`.

### E2E Live Integration & Quality

- [ ] **PCRM-08**: Suíte de testes E2E simulando os 3 gatilhos, deduplicação de webhooks, geração de propostas e aprovação para criação de Deal no PilotCRM.

## Future Requirements (v1.2+)

### Multi-Domain Expansion

- **DOM-01**: Segundo `DomainPack` completo e plugável (ex.: Saúde/Clínicas ou Consultoria B2B).
- **DOM-02**: Roteamento dinâmico de domínio por metadados de tenant na ingestão.

### Assisted Actions

- **AGT-01**: Disparo assistido de mensagens outbound aprovadas na fila de revisão com 1 clique via WhatsApp Cloud API.
- **AGT-02**: Templates dinâmicos de follow-up aprovados por corretor.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Negociação autônoma de preço ou fechamento jurídico | Alto risco operacional e ético (`docs/spec.md §1.2`) |
| Disparo automático de WhatsApp sem aprovação humana | Proibido expressamente pela política de segurança (`docs/spec.md §14.3`) |
| Substituição do banco de dados relacional por grafo (Neo4j) | Complexidade desnecessária; PostgreSQL com JSONB e RLS supre todas as necessidades |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PCRM-01 | Phase 5 | Satisfied |
| PCRM-02 | Phase 5 | Satisfied |
| PCRM-03 | Phase 6 | Pending |
| PCRM-04 | Phase 6 | Pending |
| PCRM-05 | Phase 6 | Pending |
| PCRM-06 | Phase 7 | Pending |
| PCRM-07 | Phase 7 | Pending |
| PCRM-08 | Phase 8 | Pending |

**Coverage:**
- v1.1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-21*
*Last updated: 2026-10-21 after Milestone v1.1.0 definition*
