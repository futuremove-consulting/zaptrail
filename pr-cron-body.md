## Problema

O motor canonico de conversas (#272, mergeado) trouxe a rota consumidora
`apps/pilotcrm/src/app/api/cron/whatsapp-engine/route.ts`, que le
`conversation_engine_queue` com claim/lease via `processConversationQueue`.

A rota **nao estava registrada em `vercel.json`**. Sem registro, a Vercel nunca a
invoca, entao:

- os jobs enfileirados pelo webhook ficam em `pending` para sempre;
- a fila do motor nunca e consumida;
- sinais/fatos/timeline nao sao gerados;
- o piloto business + personal nao passa da ingestao raw.

## Correcao

- `vercel.json`: adiciona o cron `/api/cron/whatsapp-engine` com schedule de 1 minuto.
- JSON validado via `JSON.parse`.

## Por que 1 minuto

O `whatsapp-sync` ja roda a cada minuto; a latencia alvo do piloto e < 30s
inbound -> ouro e < 60s mensagem -> sinal. Mesma cadencia evita a fila crescer
entre ciclos.

## Escopo

Um unico arquivo, 4 linhas. Nao altera codigo de aplicacao, schema ou gateway.
