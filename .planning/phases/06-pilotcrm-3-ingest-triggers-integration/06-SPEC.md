# Phase 6 SPEC: PilotCRM 3 Ingest Triggers Integration

## Requirements Covered
- **PCRM-03**: Webhook realtime do PilotCRM (`/api/crm/whatsapp/webhook`) encaminha turnos de mensagens assincronamente via `after()` para `POST /api/v1/ingest/whatsapp` quando o módulo ZapTrail estiver ativo.
- **PCRM-04**: Crons de sincronização do PilotCRM (`/api/cron/whatsapp-sync` e `whatsapp-analysis`) enviam filas de mensagens pendentes para processamento no ZapTrail.
- **PCRM-05**: CTAs sob demanda no Inbox ("Sincronizar Conversas") e no Radar ("Analisar agora") disparam requisições ao ZapTrail e refletem o status na interface.

## Must-Haves
1. `ZapTrailClient` (`apps/pilotcrm/src/lib/integrations/zaptrail-client.ts`) implementa despacho de mensagens para a API do ZapTrail com autenticação Bearer, header de tenant, timeout de 8s e tratamento completo de erros.
2. Webhook realtime (`/api/crm/whatsapp/webhook`) dispara o despacho para o ZapTrail dentro de `after()` quando o módulo estiver ativo, preservando latência de resposta HTTP para o webhook.
3. Crons `/api/cron/whatsapp-sync` e `/api/cron/whatsapp-analysis` incluem chamadas ao ZapTrail para mensagens pendentes quando o módulo estiver ativo.
4. Rota `/api/crm/whatsapp/analyze-now` e CTA do Radar disparam análise no ZapTrail e retornam feedback visual para a UI.
5. Todos os arquivos criados ou modificados respeitam estritamente o limite de 350 linhas (`quality/max-lines`).
6. Zero log de tokens em texto claro e zero chamadas a `localStorage`.

## Edge Coverage
- **Módulo desativado**: Todas as 3 rotas/gatilhos executam com sucesso sem disparar nenhuma requisição externa ao ZapTrail.
- **Módulo ativado mas sem credenciais**: Pula silenciosamente o despacho com warning nos logs sem derrubar o webhook ou crons.
- **ZapTrail offline / HTTP 500 / timeout**: O webhook e os crons completam seu ciclo sem quebrar; erros são capturados e logados estruturadamente.
- **Mensagem duplicada**: O ZapTrail lida com idempotência via `(tenant_id, provider, external_message_id)` e retorna status 200 `duplicate: true`, que o PilotCRM consome normalmente.

## Prohibitions (must-NOT)
- Não bloquear a resposta síncrona do webhook de WhatsApp (deve rodar obrigatoriamente dentro de `after()`).
- Não expor o token decifrado em logs, payloads de resposta ou client-side.
- Não ultrapassar 350 linhas em nenhum arquivo de produção.
- Não quebrar o funcionamento nativo do PilotCRM caso o ZapTrail falhe.
