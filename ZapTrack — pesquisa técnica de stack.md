# ZapTrack — pesquisa técnica de stack

## Supabase

Fonte: https://supabase.com/

A página oficial apresenta Supabase como uma plataforma que combina Postgres, autenticação, Row Level Security, Edge Functions, Storage, Realtime, APIs e vetores/embeddings. O produto é adequado ao princípio de reduzir componentes, pois permite manter dados relacionais, autorização, arquivos, sincronização e busca vetorial em uma base integrada. A recomendação de usar pgvector no próprio Postgres para a primeira versão é consistente com a preferência por menos serviços e menor operação.

## Inngest

Fonte: https://www.inngest.com/docs/learn/inngest-functions

A documentação oficial descreve funções TypeScript disparadas por eventos, cron ou webhooks, com jobs em background, retries, checkpoints, controle de concorrência e observabilidade. Isso é adequado para ingestão, processamento assíncrono de IA, transcrição/OCR, resumos, notificações e digests sem construir uma fila/workflow engine própria.

## Implicação arquitetural

A combinação Postgres + Auth + Storage + pgvector com um orquestrador gerenciado de jobs atende ao princípio “less custom, more building blocks”. O ZapTrack deve manter no próprio código somente a semântica de negócio, a proveniência das análises, o modelo de objetos, as políticas de confiança e o desenho do próximo passo.

## Meta WhatsApp Business Platform — Webhooks

Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview

A documentação oficial, atualizada em 26 de junho de 2026, informa que webhooks enviam payloads JSON para um servidor designado e cobrem mensagens recebidas, status de mensagens enviadas, eventos de chamadas e alterações de conta/capacidade. A documentação exige permissões específicas, assinatura de campos e endpoint próprio para produção. Ela também informa que payloads podem chegar a 3 MB, que falhas de entrega geram retries por até 7 dias e que esses retries podem causar notificações duplicadas.

Implicação: o conector do ZapTrack deve responder rapidamente, persistir o payload, deduplicar por identificador externo/idempotency key e processar de forma assíncrona. Não deve executar análise pesada dentro do request do webhook.

## Meta WhatsApp Business Messaging Policy

Fonte: https://whatsappbusiness.com/policy/

A política oficial informa que a empresa é responsável por obter avisos, permissões e consentimentos necessários para coletar, usar e compartilhar conteúdo e informações das pessoas, manter política de privacidade publicada e cumprir a legislação aplicável. Também exige respeitar pedidos de bloqueio, interrupção ou opt-out e deixa a empresa responsável pelo método de opt-in.

Implicação: o produto deve ter escopo de captura claro, consentimento e políticas documentadas, suporte a opt-out quando houver mensagens proativas e limites fortes para agentes e automações. A expressão “sem risco de banimento” não é aceitável como claim comercial.

## Atualização da decisão de stack

O conector oficial via webhook é tecnicamente adequado para o caminho comercial, mas requer deduplicação, retries, idempotência, permissões e processamento assíncrono. Um importador controlado continua útil para validar o núcleo sem depender de toda a homologação do canal.
