# Phase 7 SPEC: Outbound Webhook & AI Suggestions Loop

## Requirements Covered
- **PCRM-06**: ZapTrail envia webhook outbound após processamento para o PilotCRM com propostas comerciais formatadas via `PilotCRMAdapter` como `ai_suggestions`.
- **PCRM-07**: PilotCRM recebe sugestões via endpoint `/api/crm/whatsapp/ai-suggestions/ingest` e persiste em `enrichment_proposals` (alias `ai_suggestions`) estritamente compatível com a constraint `enrichment_action_ck`.

## Must-Haves
1. ZapTrail possui módulo `outbound-dispatcher.ts` que formata envelopes via `PilotCRMAdapter` e despacha para `callbackUrl` via HTTP POST com timeout de 8s e autenticação Bearer.
2. Ingest handler do ZapTrail (`ingest-handler.ts`) aceita `callback_url` e `callback_token` no payload e aciona o dispatcher após processar o turno (quando não for duplicata).
3. PilotCRM implementa serviço `ai-suggestions-service.ts` e rota `POST /api/crm/whatsapp/ai-suggestions/ingest` validando autenticação, formato Zod e persistindo em `enrichment_proposals`.
4. Todas as sugestões gravadas atendem estritamente à constraint `enrichment_action_ck`.
5. A gravação é idempotente por `(tenant_id, conversation_id, idempotency_key)`, garantindo que retentativas de webhook não criem duplicatas no banco de dados.
6. A rota legada `/api/crm/whatsapp/proposals/ingest` delega para o novo serviço de sugestões garantindo retrocompatibilidade total.
7. Todos os arquivos criados ou modificados respeitam <= 350 linhas de código (`quality/max-lines`).
8. Zero credenciais em texto claro em logs.

## Edge Coverage
- **Ausência de `callback_url`**: ZapTrail processa a mensagem normalmente e retorna o envelope no response HTTP, ignorando o despacho outbound silenciosamente.
- **Envelope sem oportunidades ou ações**: ZapTrail não envia webhook vazio se nada foi detectado.
- **PilotCRM offline / 5xx no callback**: ZapTrail captura o erro, registra log estruturado e não quebra a resposta principal da API.
- **Webhook duplicado recebido no PilotCRM**: O PilotCRM detecta a chave de idempotência e retorna HTTP 200 `{ duplicate: true }` sem duplicar linhas.

## Prohibitions (must-NOT)
- Não permitir que falha no webhook outbound faça a requisição de ingestão do ZapTrail falhar (deve ser não-bloqueante / resiliente).
- Não violar a constraint `enrichment_action_ck` em nenhuma circunstância.
- Não expor tokens de autenticação em texto claro em logs.
- Não exceder 350 linhas em nenhum arquivo de produção.
