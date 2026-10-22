# Phase 6 Context: PilotCRM 3 Ingest Triggers Integration

## Context & Objectives

- **Phase:** 6
- **Goal:** Conectar os 3 pontos de entrada do PilotCRM (webhook realtime, crons 4x/dia e botão sob demanda) ao endpoint de ingestão do ZapTrail (`POST /api/v1/ingest/whatsapp`).
- **Target Requirements:** `PCRM-03`, `PCRM-04`, `PCRM-05`.
- **Depends on:** Phase 5 (Module Registry, Marketplace Card & Server-Side Encrypted Credentials).

## User Decisions & Architectural Agreements

- **D-6-01 (Shared ZapTrail Client):** Criar `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts` com função central `dispatchTurnToZapTrail`:
  - Obtém credenciais via `getZapTrailCredentials(drizzleSettingsRepo, tenantId)`.
  - Verifica se o módulo está ativo via `isModuleEnabled("zaptrail", tenantId)`.
  - Se inativo ou não configurado: retorno `{ skipped: true, reason: string }` sem erro.
  - Se ativo: formata payload compatível com `IngestWhatsappPayloadSchema`, envia HTTP POST com timeout de 8000ms e headers `Authorization: Bearer <token>` e `x-zaptrail-tenant-id: <tenantId>`.
  - Resiliente: nunca propaga exceções que quebrem os fluxos principais do PilotCRM.
- **D-6-02 (Trigger 1: Webhook Realtime - PCRM-03):**
  - Em `apps/pilotcrm/src/app/api/crm/whatsapp/webhook/route.ts`, após persistir a mensagem bruta (`saveRawWhatsAppMessage`), o hook `after()` do Next.js despacha o turno para o ZapTrail quando o módulo estiver ativo.
  - O webhook responde HTTP 200 imediatamente aos provedores (WABA, OpenWA, Baileys, Uazapi); o processamento no ZapTrail roda em background assíncrono.
- **D-6-03 (Trigger 2: Crons de Sincronização e Análise - PCRM-04):**
  - Em `apps/pilotcrm/src/app/api/cron/whatsapp-sync/route.ts` e `apps/pilotcrm/src/app/api/cron/whatsapp-analysis/route.ts`:
  - As rotas de cron despacham as mensagens/conversas pendentes do tenant para o ZapTrail quando o módulo estiver ativo.
- **D-6-04 (Trigger 3: CTAs sob Demanda no Inbox e Radar - PCRM-05):**
  - No Inbox (`ConversationList.tsx` / `POST /api/crm/whatsapp/sync-conversations`): CTA "Sincronizar Conversas" aciona sincronização e despacho ao ZapTrail.
  - No Radar (`WhatsAppRadarCard.tsx` / `POST /api/crm/whatsapp/analyze-now`): CTA "Analisar agora" dispara análise no ZapTrail e atualiza o estado na UI com feedback visual.
- **D-6-05 (Resiliência & Zero Downtime):**
  - Se o serviço ZapTrail estiver temporariamente indisponível ou retornar 5xx, o PilotCRM continua funcionando normalmente. A mensagem bruta permanece salva no PostgreSQL e o erro é logado sem expor segredos.
- **D-6-06 (Conformidade de Linhas & Governança):**
  - Todos os arquivos criados ou modificados devem ter no máximo 350 linhas (`quality/max-lines`).
  - Zero token em logs. Zero vazamento em `localStorage`.

## Codebase Locations

- PilotCRM Repo: `C:\Users\Gustavo\pilotcrm`
  - Client & Settings: `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts`, `zaptrail-settings.ts`, `zaptrail-settings-repo.ts`
  - Trigger 1 (Webhook): `apps/pilotcrm/src/app/api/crm/whatsapp/webhook/route.ts`
  - Trigger 2 (Crons): `apps/pilotcrm/src/app/api/cron/whatsapp-sync/route.ts`, `whatsapp-analysis/route.ts`
  - Trigger 3 (CTAs & APIs): `apps/pilotcrm/src/app/api/crm/whatsapp/sync-conversations/route.ts`, `analyze-now/route.ts`, `ConversationList.tsx`, `WhatsAppRadarCard.tsx`
- ZapTrail Repo: `c:\Users\Gustavo\Documents\antigravity\dazzling-goodall`
  - Ingest Endpoint: `src/app/api/v1/ingest/whatsapp/route.ts`
  - Ingest Handler: `src/packages/api/ingest-handler.ts`
