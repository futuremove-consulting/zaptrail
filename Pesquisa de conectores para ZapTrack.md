# Pesquisa de conectores para ZapTrack

## UAZAPI — achados iniciais

Fonte: https://docs.uazapi.com/ e https://uazapi.dev/ (acesso em 26/08/2026).

A documentação pública apresenta a UAZAPI/uazapiGO V2 como uma API para WhatsApp com documentação OpenAPI e dezenas de grupos de endpoints. A página lista instâncias, webhooks/SSE, envio e recebimento de mensagens, busca de chats, contatos, grupos/comunidades, CRM e integração com Chatwoot.

O endpoint de criação de instância documentado é `POST https://free.uazapi.com/instance/create`. A instância é criada desconectada, recebe um token único e apresenta estados `disconnected`, `connecting`, `connected` e `hibernated`. A documentação exige um admin token para criação e recomenda guardar o token da instância para chamadas subsequentes.

Implicações para o ZapTrack:

1. O conector precisa modelar instância, token server-side, status, reconexão e hibernação.
2. Webhooks/SSE devem ser encapsulados em um adapter próprio; a aplicação não pode depender dos nomes internos da UAZAPI.
3. A presença de endpoints de chats, contatos e grupos é promissora para o MVP, mas não prova por si só que todo histórico de grupos esteja disponível ou que o uso seja adequado para produção; isso deve ser validado com teste autorizado.
4. O subdomínio `free.uazapi.com` sugere uma porta de entrada sem custo, mas não foi tratado como garantia de gratuidade, SLA ou estabilidade comercial.
5. O token de administrador é uma dependência de provisionamento que não deve chegar ao frontend nem ser compartilhada com o usuário final.

## Decisão provisória

UAZAPI pode servir como provider inicial para prototipagem, desde que haja provider adapter, mock, idempotência, fallback e plano de substituição. Não deve ser a fonte de verdade nem o modelo de domínio do ZapTrack.

## Evolution API — achados iniciais

Fonte: https://github.com/evolution-foundation/evolution-api (acesso em 26/08/2026).

O repositório oficial descreve a Evolution API como uma API open source de integração com WhatsApp. O material público indica suporte a uma camada baseada em WhatsApp Web e também à WhatsApp Cloud API, além de integrações com Chatwoot, Dify, n8n, OpenAI, Typebot e outros componentes. O repositório apresenta histórico ativo de desenvolvimento, documentação, Docker e preocupação explícita com segurança e deduplicação.

Implicações:

1. Pode ser uma alternativa mais flexível que um provedor fechado se o desenvolvedor aceitar hospedar e operar a infraestrutura.
2. Open source não significa custo operacional zero: sessão, servidor, domínio, HTTPS, atualizações e observabilidade continuam sendo responsabilidade do produto.
3. A mesma API pode oferecer mais de um backend de WhatsApp; o ZapTrack deve esconder essa diferença atrás do adapter.
4. O caminho open source aumenta controle, mas também aumenta risco de manutenção e de mudanças no comportamento de uma automação baseada em WhatsApp Web.

## WAHA — achados iniciais

Fonte: https://waha.devlike.pro/docs/how-to/events/ (acesso em 26/08/2026).

A documentação oficial apresenta webhooks e WebSockets para eventos da API, webhooks por sessão ou globais, retry configurável, headers customizados e autenticação HMAC. O catálogo de eventos inclui `message`, `message.any`, `message.ack`, `message.edited`, `message.revoked`, mudanças em grupos, contatos/presença e estado de sessão. A página também referencia engines e uma versão gratuita/comunitária, mas mostra suporte comunitário de US$ 5/mês; isso não deve ser interpretado como custo total zero.

Implicações:

1. WAHA possui um contrato de eventos adequado à ingestão orientada a webhooks.
2. HMAC, retry e eventos de grupo são úteis para o MVP, mas precisam ser validados com payloads reais e idempotência própria.
3. A solução é orientada a execução própria/self-hosted, portanto exige um processo persistente e pode sair do custo zero quando colocada em produção.
4. É uma alternativa forte para protótipo técnico controlado, mas não elimina os riscos de bloqueio, estabilidade e conformidade de automações que não sejam a plataforma oficial.
5. Para manter simplicidade, não usar WebSocket no MVP; receber eventos por webhook e consultar status sob demanda.

## WPPConnect — achados iniciais

Fonte: https://wppconnect.io/docs/projects/wppserver/introduction/ (acesso em 26/08/2026).

O WPPConnect Server é apresentado como API REST pronta para uso, baseada em Node.js, com múltiplas sessões, recebimento de mensagens, lista de contatos, abertura/fechamento de sessão, criação de grupos e webhook. A documentação também referencia Swagger, Postman e licença Apache 2.0.

Implicações:

1. É uma opção tecnicamente simples para quem aceita operar uma API própria.
2. Possui os recursos mínimos de sessões, mensagens, contatos, grupos e webhook exigidos pelo protótipo.
3. Exige execução persistente e não é custo zero em produção se houver servidor, domínio, monitoramento e manutenção.
4. Como as opções baseadas em WhatsApp Web, deve ser tratada como adapter experimental, com risco operacional e de conformidade maior do que a plataforma oficial.

## Supabase Free — achados iniciais

Fonte: https://supabase.com/pricing (acesso em 26/08/2026).

A página oficial mostra plano Free de US$ 0/mês com limite de dois projetos ativos, 500 MB de banco, 1 GB de file storage, 5 GB de egress, 5 GB de cached egress, 50.000 MAUs, 500.000 invocações de Edge Functions, API requests ilimitadas e Realtime com limites próprios. Projetos gratuitos podem ser pausados após uma semana de inatividade.

Implicações:

1. Supabase é adequado para começar sem custo de infraestrutura em um piloto pequeno.
2. Mensagens e arquivos de WhatsApp podem consumir rapidamente banco, storage e egress; attachments devem ser opcionais e controlados.
3. O MVP deve operar com uma conta/projeto principal e dados sintéticos de teste para preservar o segundo projeto como staging ou contingência.
4. “Custo zero” é uma fase de validação, não uma promessa de custo zero em escala; LLM, provedor WhatsApp, domínio, execução persistente e volume de mídia podem gerar custos.
5. Deve existir retenção limitada, processamento incremental e limites de tamanho para evitar que o Free seja esgotado.

## UAZAPI — preço público observado

Fonte: https://uazapi.dev/ (acesso em 26/08/2026).

A página pública apresenta um plano limitado de até 2 dispositivos por R$ 38/mês, equivalente a R$ 19 por dispositivo, e planos de servidor Lite/Pro de R$ 138/mês e R$ 195/mês. A página lista gerenciamento de grupos, webhook e envio ilimitado dentro dos planos apresentados. O teste/documentação exige login e aceite dos termos e política de privacidade.

Conclusão de custo: UAZAPI não deve ser tratada como custo zero recorrente. Pode haver endpoint/free trial/documentação para experimentação, mas a página comercial observada apresenta planos pagos. Para custo zero real, o MVP deve começar com mock/local fixture; para testar WhatsApp real, deve-se aceitar custo de provedor ou usar uma alternativa self-hosted em infraestrutura gratuita/temporária, sem prometer estabilidade.
