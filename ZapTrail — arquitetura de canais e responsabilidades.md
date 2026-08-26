# ZapTrail — arquitetura de canais e responsabilidades

## 1. Decisão

O ZapTrail terá duas superfícies de acesso, mas apenas uma fonte de verdade:

```text
WhatsApp do usuário
  ↔ Agente ZapTrail
        ↘ respostas, consultas e comandos rápidos

Aplicação web responsiva
  ↔ exploração, revisão, operação, configuração e auditoria

Ambos
  → API de domínio
  → Supabase
  → objetos, evidências, timeline, calendário e Kanban
```

O WhatsApp não é uma versão reduzida do dashboard. A aplicação não é um “chat com mais telas”. Cada superfície deve fazer o que seu contexto favorece.

## 2. Momento móvel — agente no WhatsApp

### Intenção

Resolver necessidades de baixa atenção e alta urgência sem exigir que o usuário saia do WhatsApp.

### Comandos prioritários

```text
O que ficou pendente com a Maria?
Quais decisões tomamos no projeto X?
Qual foi o último contato com a Empresa Y?
Tenho alguma cobrança atrasada?
O que preciso fazer hoje?
Mostre os compromissos desta semana.
Registre que vou ligar para João amanhã.
Confirme essa tarefa.
Adie para sexta.
Abra a timeline do projeto X.
```

### Resposta ideal

```text
resumo curto
contexto e período
estado/urgência
uma ou duas evidências
botões/comandos de próximo passo
link profundo para a aplicação quando necessário
```

O agente deve responder com base em objetos e evidências estruturados; não deve devolver apenas um resumo livre das mensagens.

## 3. Momento concentrado — aplicação web

A aplicação é o centro de comando do ZapTrail para notebook, desktop e celular. Sua prioridade é compreensão, exploração e operação.

### Áreas

```text
Agora
Conversas
Grupos
Empresas/Pessoas
Projetos
Timeline
Calendário
Kanban
Arquivos
Busca
Configurações
```

A aplicação permite revisar hipóteses, alternar conversa/timeline, filtrar, confirmar/corrigir objetos, visualizar calendário e Kanban, gerir conexões e auditar evidências.

## 4. Identidade e conexões

Há uma distinção importante entre a conta do usuário, a fonte WhatsApp que será indexada e o número do agente:

| Elemento | Papel |
|---|---|
| `UserAccount` | Identidade do usuário no ZapTrail |
| `SourceConnection` | Número/conta WhatsApp do usuário ou empresa que será lido/indexado |
| `AgentConnection` | Número do ZapTrail com quem o usuário conversa |
| `Workspace` | Escopo de dados, relações, projetos e permissões |

Para consultar conversas e grupos do próprio WhatsApp, é provável que o MVP precise de uma `SourceConnection` vinculada por QR/sessão. Para conversar com o agente sem abrir a aplicação, é recomendável um número separado de `AgentConnection`.

Não presumir que o mesmo número possa ser simultaneamente a fonte de leitura e o canal confortável de conversa com o agente. Validar esse comportamento no spike do provider.

## 5. Fluxo de autenticação cruzada

```text
usuário cria conta no ZapTrail
  → informa/verifica telefone
  → conecta SourceConnection por QR/provider
  → ZapTrail associa número ao UserAccount
  → usuário envia “oi” ao AgentConnection
  → agente reconhece telefone verificado
  → agente responde com workspace/contexto permitido
```

A associação por número não deve ser considerada suficiente sozinha quando houver risco de compartilhamento. Usar verificação adicional no onboarding e permitir revogação.

## 6. Responsabilidades por superfície

| Capacidade | Agente WhatsApp | Aplicação web |
|---|---:|---:|
| Pergunta rápida | Principal | Sim |
| Última atividade | Principal | Sim |
| Pendências e atenção | Principal | Principal |
| Registrar objeto simples | Principal, com confirmação | Principal |
| Revisar evidência | Resumo/link | Principal |
| Escolher fonte/conversa | Limitado | Principal |
| Timeline completa | Link/resumo | Principal |
| Filtros avançados | Não | Principal |
| Calendário | Consulta/resumo | Principal |
| Kanban | Consulta/mudança simples | Principal |
| Configuração | Não | Principal |
| Permissões | Não | Principal |
| Auditoria | Não | Principal |
| Ação irreversível | Nunca implícita | Confirmação explícita |

## 7. Fonte única de verdade

O agente não deve criar sua própria memória paralela. Toda consulta e ação passa por:

```text
identidade → autorização → recuperação → evidência → resposta/ação
```

Se o agente criar um compromisso, a aplicação deve mostrá-lo imediatamente. Se o usuário corrigir um objeto na aplicação, o agente deve usar a versão atualizada na próxima pergunta.

## 8. Arquitetura técnica simplificada

```text
WhatsApp Source Provider
  → source webhook
  → raw ingestion
  → semantic pipeline
  → knowledge/objects

WhatsApp Agent Provider
  → agent webhook
  → identify user
  → intent/router
  → read tools or confirmed action tools
  → answer/send

Web app
  → Supabase Auth
  → domain API/Edge Functions
  → same queries and mutations

Supabase
  ├── Postgres
  ├── Storage
  ├── Edge Functions
  └── Realtime optional
```

O agente e a aplicação compartilham schemas, queries, policies e ferramentas. Não duplicar regra de negócio no prompt ou no frontend.

## 9. Progressão de autonomia

| Nível | Comportamento | MVP |
|---|---|---:|
| L0 | Responder com informação estruturada | Sim |
| L1 | Criar proposta de objeto para confirmação | Sim |
| L2 | Alterar objeto interno após confirmação | Sim, limitado |
| L3 | Executar ação externa reversível | Não |
| L4 | Executar ação externa irreversível/financeira | Não |

A ação do agente deve ser tipada, autorizada, idempotente e auditável. Nunca enviar mensagem externa, cancelar, pagar, contratar ou aprovar sem confirmação explícita e regra de permissão.

## 10. Estratégia de custo

### Protótipo zero

```text
web app responsiva
MockProvider
agente simulado dentro da aplicação
fixtures sintéticas
Supabase Free
```

### Primeiro teste de canal

```text
AgentConnection com um número controlado
SourceConnection opcional do usuário
UAZAPI ou provider equivalente
uma conversa/grupo selecionado
processamento sob demanda
```

### Produção futura

Separar fontes, número de agente, quotas, rate limits, observabilidade, custo por instância e política de retenção.

## 11. Decisão de frontend

A aplicação externa deve ser **web responsiva mobile-first**, com excelente uso em notebook. O usuário não precisa instalar um segundo aplicativo para o momento concentrado. Expo/React Native continua sendo uma opção de evolução, mas não é obrigatório para cumprir a visão do produto quando o principal acesso móvel ocorre dentro do próprio WhatsApp.

## 12. Regra de produto

> **O WhatsApp resolve; a aplicação explica, organiza e governa.**

Essa divisão é o centro da experiência do ZapTrail.
