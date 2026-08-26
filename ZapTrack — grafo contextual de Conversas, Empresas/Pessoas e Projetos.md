# ZapTrack — grafo contextual de Conversas, Empresas/Pessoas e Projetos

## 1. Decisão de produto

A observação do usuário é correta: para quem trabalha pelo WhatsApp, a conversa 1:1 ou o grupo é o lugar onde o trabalho nasce. A aplicação deve, portanto, oferecer **Conversas & Grupos** como eixo primário, ao lado de **Empresas & Pessoas** e **Projetos**.

Esses três eixos não competem entre si:

```text
Conversas & Grupos = onde aconteceu
Empresas & Pessoas = com quem aconteceu
Projetos = para qual objetivo aconteceu
Áreas = em qual função da empresa se encaixa
Agora = o que exige atenção
```

A mesma mensagem pode aparecer nas quatro lentes sem ser duplicada.

## 2. O grafo mínimo

```text
Workspace
  ├── Party: pessoa/empresa/equipe
  ├── Conversation: 1:1/grupo/thread/importada
  ├── Project: projeto/iniciativa
  ├── ManagementObject: tarefa/pedido/decisão/etc.
  └── AreaContext: comercial/financeiro/operações/etc.

Message
  ├── belongs_to → Conversation
  ├── authored_by → Party
  ├── mentions/relates_to → Party
  ├── contextualized_by → Project
  ├── classified_in → AreaContext
  ├── generates → InteractionEvent
  └── supports → Evidence

InteractionEvent
  ├── involves → Party
  ├── about → BusinessObject
  ├── occurs_in → Conversation
  ├── contextualized_by → Project
  ├── proposes/updates → ManagementObject
  └── supported_by → Evidence
```

## 3. Entidades de primeiro nível

### Conversation

`Conversation` é o contexto de comunicação e deve possuir uma classificação de interface:

```text
conversation_type
├── direct_1_to_1
├── group
├── channel
├── thread
└── imported_archive
```

Campos mínimos:

```text
conversation_id
workspace_id
source_account_id
external_id
conversation_type
title
normalized_title
participant_count
started_at
last_message_at
processing_status
privacy_scope
project_count
party_count
attention_count
object_count
```

Para grupos, guardar título histórico e atual, administradores quando disponível, participantes por período e indicador de que a relação foi inferida ou explicitamente fornecida.

### Party

`Party` representa uma pessoa, empresa, equipe ou agente de sistema. “Cliente”, “fornecedor”, “parceiro”, “colaborador” e “prospect” são papéis e relações, não identidades mutuamente exclusivas.

### Project

`Project` é um contexto de finalidade. Pode ser um projeto formal, cliente/projeto de serviço, obra, evento, implantação, iniciativa interna ou demanda contínua.

Campos mínimos:

```text
project_id
workspace_id
name
project_type
status
owner_party_id
sponsor_party_id
start_at
end_at
goal
description
area_context
privacy_scope
```

### ContextLink

`ContextLink` é a relação explícita que conecta qualquer recurso ao eixo de contexto sem copiar o recurso:

```text
context_link_id
workspace_id
source_type
source_id
context_type
context_id
relation_type
role
confidence
source_event_id
created_by_type
valid_from
valid_to
```

Exemplos de `relation_type`:

```text
message.belongs_to_conversation
message.mentions_party
conversation.involves_party
conversation.related_to_organization
conversation.contextualized_by_project
object.about_party
object.part_of_project
object.owned_by_party
object.occurs_in_conversation
document.supports_object
```

## 4. Regra de não duplicação

A mensagem tem uma única identidade, uma fonte e uma conversa de origem. A interface cria índices e relações; não cria cópias.

```text
Message M
  belongs_to Conversation C
  mentions Party P
  contextualized_by Project J
  generates Event E
  supports Object O
```

Ao abrir M a partir de C, P ou J, o usuário chega ao mesmo `message_id` e ao mesmo estado de evidência.

## 5. Contexto explícito versus inferido

Toda relação deve possuir origem e confiança:

| Tipo | Exemplo | Tratamento |
|---|---|---|
| Explícito | Usuário associa grupo ao projeto “Implantação Alfa” | Relação confirmada |
| Fonte | Integração informa que conversa pertence ao cliente | Relação importada |
| Inferido | “projeto da Alfa” aparece no título e nas mensagens | Relação sugerida |
| Ambíguo | Duas empresas possíveis para “Beta” | Pedir desambiguação |
| Negado | Usuário remove associação | Bloquear re-inferência silenciosa |

Uma associação manual negativa deve ser preservada como feedback para evitar que o sistema volte a sugerir a mesma relação sem nova evidência.

## 6. Conversas & Grupos como área de produto

```text
Conversas & Grupos
├── Todas
├── 1:1
├── Grupos
├── Não organizadas
├── Com atenção
├── Com objetos
├── Recentes
├── Minhas conversas
└── Fontes
```

Cada linha mostra:

```text
ícone 1:1/grupo · título/nome
participantes principais
empresa/pessoa relacionada
projeto relacionado
último evento relevante
pendências/objetos
última atividade
```

Filtros:

```text
tipo  · fonte · participante · empresa · projeto · área · período
atenção · objetos · status de processamento · privacidade
```

## 7. Página de conversa/grupo

```text
Cabeçalho
├── tipo: 1:1 ou grupo
├── título e fonte
├── participantes
├── empresa/pessoas relacionadas
├── projetos relacionados
└── ações: organizar, silenciar, exportar conforme permissão

Resumo
├── assunto atual
├── o que mudou
├── decisões
├── compromissos
├── pendências
└── alertas

Timeline
├── mensagens
├── mídias
├── marcações de eventos
└── objetos derivados

Contexto
├── empresas/pessoas
├── projetos
├── áreas
└── documentos
```

O resumo nunca substitui a timeline; a timeline nunca deve exigir que o usuário leia tudo para encontrar as ações.

## 8. Empresas & Pessoas como área de produto

```text
Empresas & Pessoas
├── Todas
├── Pessoas
├── Empresas
├── Clientes
├── Fornecedores
├── Parceiros
├── Colaboradores
├── Prospects
├── Sem relação definida
└── Com atenção
```

A classificação por cliente/fornecedor/parceiro/colaborador é uma visão de `PartyRole` e pode ter mais de um papel em contextos diferentes.

### Página de empresa

```text
Empresa
├── resumo
├── papéis e relação com o workspace
├── pessoas associadas
├── conversas 1:1
├── grupos
├── projetos
├── oportunidades/pedidos/contratos
├── cobranças/pagamentos
├── entregas e ocorrências
├── documentos
├── decisões e compromissos
├── timeline
└── indicadores
```

### Página de pessoa

```text
Pessoa
├── perfil e identificadores
├── papéis por contexto
├── empresa(s) associada(s)
├── conversas 1:1
├── grupos
├── projetos
├── tarefas e compromissos
├── decisões e aprovações
├── documentos
└── timeline
```

## 9. Projetos como área de produto

```text
Projetos
├── Todos
├── Meus projetos
├── Ativos
├── Em risco
├── Sem prazo
├── Arquivados
└── Modelos
```

### Página de projeto

```text
Projeto
├── objetivo, status e owner
├── resumo executivo
├── conversas 1:1
├── grupos
├── empresas e pessoas
├── tarefas e compromissos
├── decisões e riscos
├── documentos e arquivos
├── marcos e cronograma
├── indicadores
├── timeline
└── configurações de associação
```

A associação de um grupo inteiro a um projeto é conveniente, mas não deve forçar que toda mensagem futura do grupo pertença ao projeto se a conversa mudar de assunto. O sistema deve suportar:

- associação padrão do grupo ao projeto;
- associação por intervalo de tempo;
- associação por mensagem/thread;
- exceção explícita;
- múltiplos projetos com confiança e prioridade.

## 10. Projetos contínuos

Profissionais liberais e autônomos muitas vezes não têm projetos formais, mas têm clientes recorrentes e demandas contínuas. Criar dois tipos:

```text
ProjectType
├── formal_project
├── client_workspace
├── recurring_service
├── internal_initiative
├── event
└── one_off_request
```

`client_workspace` funciona como um contêiner operacional do cliente sem obrigar o usuário a criar um projeto tradicional. A interface pode chamá-lo de “Espaço do cliente”.

## 11. Organização por lentes

O mesmo objeto pode aparecer em:

```text
Agora
Conversas & Grupos
Empresa/Pessoa
Projeto
Área
Busca global
```

A aplicação deve informar o caminho atual:

```text
Projetos / Implantação Alfa / Conversas / Grupo Alfa + Equipe
```

E permitir mudar de lente sem voltar ao início:

```text
ver empresa → ver projeto → abrir conversa → abrir objeto → ver evidência
```

## 12. Exemplos de uso

### Profissional liberal

Um advogado conversa em 1:1 com cliente, troca mensagens com correspondente em um grupo e mantém um “Espaço do cliente” para o caso. O ZapTrack liga mensagens, compromissos, documentos e tarefas ao cliente e ao caso, sem exigir CRM.

### Prestador de serviço

Uma arquiteta conversa com cliente, fornecedor e equipe em grupos diferentes sobre uma obra. O projeto reúne todas as conversas relevantes, mas cada participante mantém seu papel. O sistema mostra aprovação, compra, entrega, alteração de escopo e tarefas.

### Dono/gestor de PME

O gestor administra clientes, fornecedores e equipe. Pode abrir uma empresa e ver todos os grupos e conversas relacionados; abrir um projeto e ver a equipe, documentos e prazos; ou perguntar no WhatsApp quais projetos possuem entregas atrasadas.

## 13. Queries que a arquitetura deve suportar

```text
“Mostre os grupos do projeto Alfa com pendências.”
“Quais clientes estão aguardando resposta?”
“Tudo que ficou pendente com a Beta esta semana.”
“Em quais conversas o fornecedor Delta confirmou entrega?”
“Quais projetos têm pagamentos prometidos para sexta?”
“Abra o grupo da obra e mostre as decisões.”
“Liste as conversas 1:1 com clientes sem retorno.”
```

Cada pergunta deve ser traduzida em filtros e relações estruturadas antes de usar busca semântica.

## 14. Como construir

### Banco relacional

Começar com:

```text
workspaces
parties
party_roles
party_relationships
conversations
conversation_participants
messages
projects
context_links
interaction_events
management_objects
object_relations
evidence
```

Índices principais:

```text
(workspace_id, conversation_type, last_message_at)
(workspace_id, party_id, valid_to)
(workspace_id, project_id, relation_type)
(workspace_id, source_type, source_id, context_type, context_id)
(workspace_id, object_type, status, due_at)
```

### Projeções

Criar views/materialized views para:

```text
conversation_summary
party_activity_summary
project_activity_summary
attention_by_context
object_search_document
```

Não duplicar mensagem ou objeto. Projeções podem ser recalculadas.

### Indexação

Cada recurso indexável deve produzir um documento de busca com:

```json
{
  "resource_id": "msg_123",
  "resource_type": "message",
  "workspace_id": "ws_1",
  "conversation_ids": ["conv_1"],
  "party_ids": ["party_alfa"],
  "project_ids": ["proj_implantacao"],
  "area_ids": ["operations"],
  "text": "...",
  "structured_terms": ["delivery", "commitment"],
  "status_terms": ["pending"],
  "time_start": "2026-08-26T00:00:00Z",
  "time_end": "2026-08-26T23:59:59Z",
  "confidence": 0.91,
  "embedding": "...",
  "permissions": ["member_1", "team_operations"]
}
```

### Busca

A busca deve ser híbrida:

```text
filtros estruturados
+ full-text
+ entidades/aliases
+ relações/contexto
+ busca vetorial
+ reranking por relevância e confiança
```

A ordem recomendada é filtrar por workspace/permissão, resolver contexto, executar busca estruturada, recuperar evidência semântica e ordenar resultados.

## 15. Regras para grupos

1. Grupo é uma Conversation especializada, não uma entidade concorrente.
2. Título do grupo não é necessariamente nome de projeto ou empresa.
3. Participantes mudam; registrar validade temporal.
4. Assunto de grupo pode mudar; suportar threads, segmentos e projetos por período.
5. Uma mensagem em grupo pode envolver apenas alguns participantes.
6. O usuário deve poder marcar “fora de contexto” para uma mensagem.
7. Grupo importado/sincronizado só pode ser indexado dentro do escopo autorizado.
8. Não prometer acesso a grupos que a fonte oficial não disponibiliza.

## 16. Critério final

A arquitetura é eficaz quando o usuário pode começar por qualquer uma das perguntas:

```text
Onde isso aconteceu?       → Conversas & Grupos
Com quem aconteceu?        → Empresas & Pessoas
Para quê aconteceu?        → Projetos
O que está acontecendo?    → Agora
Em qual área?              → Áreas
Qual é a prova?            → Evidência
```

E chegar ao mesmo evento, objeto e mensagem, sem duplicação, sem perda de contexto e sem depender de memorizar a estrutura interna do sistema.
