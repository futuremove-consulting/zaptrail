# Phase 7 Context: Outbound Webhook & AI Suggestions Loop

## Context & Objectives

- **Phase:** 7
- **Goal:** Implementar o loop de retorno onde o ZapTrail despacha webhooks para o PilotCRM persistir sugestões de negócio (`ai_suggestions`) com conformidade estrita à constraint `enrichment_action_ck`, alimentando o Radar de Oportunidades para aprovação do corretor.
- **Target Requirements:** `PCRM-06`, `PCRM-07`.
- **Depends on:** Phase 6 (PilotCRM 3 Ingest Triggers Integration).

## User Decisions & Architectural Agreements

- **D-7-01 (Canonical Naming: ai_suggestions):**
  - A entidade de sugestões da inteligência artificial passa a ser canonicamente chamada de **`ai_suggestions`** (substituindo o termo ambíguo `enrichment_proposals`).
  - No banco de dados do PilotCRM, mantém-se a compatibilidade com a tabela física existente `enrichment_proposals` exportando o alias TypeScript `export const ai_suggestions = enrichment_proposals`.
  - Na API do PilotCRM, o endpoint receptor canônico será `/api/crm/whatsapp/ai-suggestions/ingest` (mantendo alias para `/proposals/ingest`).
  - Na interface (Radar de Oportunidades), cada card exibe os **"Insights da Conversa"** (valor, bairro, intenção, evidência textual) com a ação **"Aprovar Oportunidade"** que converte a sugestão em um Deal oficial no Kanban.
- **D-7-02 (Outbound Webhook Dispatcher no ZapTrail):**
  - No ZapTrail (`src/packages/api/outbound-dispatcher.ts` e `ingest-handler.ts`):
  - Ao processar uma conversa e gerar um envelope com oportunidades/ações válidas, o ZapTrail aciona o `PilotCRMAdapter` para formatar o lote de `ai_suggestions`.
  - Se um `callback_url` for fornecido no payload de ingestão (ou configurado por tenant), dispara requisição HTTP POST para o PilotCRM com timeout de 8000ms e headers `Authorization: Bearer <token>` e `x-zaptrail-tenant-id: <tenantId>`.
- **D-7-03 (Receptor Resiliente e Idempotente no PilotCRM):**
  - No PilotCRM (`/api/crm/whatsapp/ai-suggestions/ingest` e `apps/pilotcrm/src/lib/whatsapp/ai-suggestions-service.ts`):
  - Recebe o lote de sugestões, valida o payload com Zod (`AiSuggestionsIngestPayloadSchema`).
  - Grava cada sugestão com chave de idempotência (`idempotency_key`), evitando duplicar cards no Radar caso o webhook seja reenviado.
  - Garante conformidade estrita com a constraint PostgreSQL `enrichment_action_ck` (`action_type IN ('NO_CHANGE','CONFIRM','UPDATE','ADD','RELATE','CONTRADICT','INVALIDATE','SUPPRESS','DEFER','REVIEW','create_deal','CREATE_DEAL')`).
- **D-7-04 (Conexão Automática do Callback na Ingestão):**
  - Em `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts`, ao despachar o turno do WhatsApp para o ZapTrail, inclui automaticamente o `callback_url` apontando para o endpoint do PilotCRM, permitindo fechamento do ciclo sem configuração manual de URLs reversas.
- **D-7-05 (Conformidade de Linhas e Qualidade):**
  - Todos os arquivos criados ou modificados devem ter no máximo 350 linhas (`quality/max-lines`).
  - Zero log de tokens em texto claro e zero chamadas a `localStorage`.

## Codebase Locations

- ZapTrail Repo: `c:\Users\Gustavo\Documents\antigravity\dazzling-goodall`
  - Adapter: `src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts`
  - Outbound Dispatcher: `src/packages/api/outbound-dispatcher.ts`
  - Ingest Pipeline: `src/packages/api/ingest-handler.ts`
  - Tests: `tests/api/outbound-dispatcher.test.ts`
- PilotCRM Repo: `C:\Users\Gustavo\pilotcrm`
  - Schema: `apps/pilotcrm/src/db/schema/conversationEngine.ts` (alias `ai_suggestions`)
  - Ingest Service: `apps/pilotcrm/src/lib/whatsapp/ai-suggestions-service.ts`
  - Ingest Route: `apps/pilotcrm/src/app/api/crm/whatsapp/ai-suggestions/ingest/route.ts`
  - Client Callback: `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts`
  - Radar UI: `apps/pilotcrm/src/app/crm/components/WhatsAppRadarCard.tsx`
  - Tests: `apps/pilotcrm/src/lib/whatsapp/__tests__/ai-suggestions-ingest.test.ts`
