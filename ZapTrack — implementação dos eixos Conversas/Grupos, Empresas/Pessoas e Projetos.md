# ZapTrack — implementação dos eixos Conversas/Grupos, Empresas/Pessoas e Projetos

## 1. Princípio de implementação

Construir uma única plataforma com três lentes de contexto e uma lente de atenção:

```text
Agora              → o que exige atenção
Conversas & Grupos → onde aconteceu
Empresas & Pessoas → com quem aconteceu
Projetos           → para qual objetivo aconteceu
```

As lentes usam os mesmos registros. A aplicação não deve duplicar mensagens, objetos ou arquivos.

## 2. Stack opinativa

Para um produto independente:

| Camada | Decisão |
|---|---|
| Frontend | Next.js, React, TypeScript |
| UI | Tailwind + shadcn/ui |
| API | Route Handlers/Server Actions + Zod ou tRPC |
| Banco | Supabase Postgres |
| Busca textual | Postgres Full-Text Search |
| Busca semântica | pgvector |
| Jobs | Inngest ou worker gerenciado equivalente |
| Storage | Supabase Storage |
| IA | gateway agnóstico + saída estruturada por schema |
| Canal | WhatsApp Business Platform oficial e importação controlada |
| Observabilidade | logs estruturados, Sentry, métricas de jobs |

Para piloto nativo no ambiente Manus, usar React/Vite, Express, tRPC, Drizzle/TiDB, storage e LLM integrados; não misturar os dois modelos no mesmo projeto.

## 3. Schema mínimo

```sql
create table conversations (
  id uuid primary key,
  workspace_id uuid not null,
  source_account_id uuid not null,
  external_id text not null,
  conversation_type text not null check (conversation_type in ('direct_1_to_1','group','channel','thread','imported_archive')),
  title text,
  normalized_title text,
  started_at timestamptz,
  last_message_at timestamptz,
  processing_status text not null,
  privacy_scope text not null,
  created_at timestamptz not null default now(),
  unique (source_account_id, external_id)
);

create table conversation_participants (
  id uuid primary key,
  workspace_id uuid not null,
  conversation_id uuid not null references conversations(id),
  party_id uuid not null,
  participant_role text,
  joined_at timestamptz,
  left_at timestamptz,
  confidence numeric,
  unique (conversation_id, party_id, joined_at)
);

create table parties (
  id uuid primary key,
  workspace_id uuid not null,
  party_type text not null check (party_type in ('person','organization','team','system_agent','unknown')),
  display_name text not null,
  normalized_name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key,
  workspace_id uuid not null,
  name text not null,
  project_type text not null,
  status text not null,
  owner_party_id uuid references parties(id),
  goal text,
  start_at timestamptz,
  end_at timestamptz,
  privacy_scope text not null,
  created_at timestamptz not null default now()
);

create table context_links (
  id uuid primary key,
  workspace_id uuid not null,
  source_type text not null,
  source_id uuid not null,
  context_type text not null,
  context_id uuid not null,
  relation_type text not null,
  confidence numeric,
  relation_status text not null check (relation_status in ('explicit','suggested','accepted','rejected','overridden')),
  source_event_id uuid,
  valid_from timestamptz,
  valid_to timestamptz,
  created_by uuid,
  created_at timestamptz not null default now()
);

create unique index context_links_unique
  on context_links(workspace_id, source_type, source_id, context_type, context_id, relation_type);
```

As tabelas de mensagens, eventos, objetos, evidências, arquivos e auditoria são as já definidas na ontologia master.

## 4. Eventos de contexto

```text
conversation.created
conversation.renamed
conversation.participant_added
conversation.participant_removed
message.received
message.mentioned_party
message.context_candidate_created
context_link.suggested
context_link.accepted
context_link.rejected
project.created
project.context_updated
party.resolved
party.merge_requested
object.related_to_project
object.related_to_party
```

Os eventos alimentam projeções e índices. Todos devem carregar `workspace_id`, `correlation_id`, `source_id`, `occurred_at` e `idempotency_key`.

## 5. Projeções de contexto

### ConversationContextView

```text
conversation_id
conversation_type
title
participant_count
primary_parties
organizations
projects
areas
active_objects
open_attention
latest_relevant_event
last_message_at
```

### PartyContextView

```text
party_id
display_name
party_type
roles
organizations
conversations
groups
projects
open_objects
attention_items
last_activity_at
```

### ProjectContextView

```text
project_id
name
status
owner
parties
organizations
conversations
groups
objects
files
decisions
risks
attention_items
metrics
last_activity_at
```

As views podem ser materializadas para listas rápidas e recalculadas por eventos. O detalhe sempre consulta a fonte de verdade.

## 6. API de contexto

```text
GET  /api/context/conversations
GET  /api/context/conversations/:id
GET  /api/context/parties
GET  /api/context/parties/:id
GET  /api/context/projects
GET  /api/context/projects/:id
GET  /api/context/search
POST /api/context/links/suggest
POST /api/context/links/accept
POST /api/context/links/reject
POST /api/context/projects
PATCH /api/context/projects/:id
```

Se usar tRPC, os equivalentes devem ser procedimentos tipados:

```text
context.conversations.list
context.conversations.get
context.parties.list
context.parties.get
context.projects.list
context.projects.get
context.search
context.links.suggest
context.links.accept
context.links.reject
context.projects.create
context.projects.update
```

## 7. Contrato de filtros

```json
{
  "workspace_id": "ws_1",
  "conversation_type": ["group"],
  "conversation_ids": [],
  "party_ids": ["party_alfa"],
  "organization_ids": ["org_alfa"],
  "project_ids": ["project_implantacao"],
  "area_ids": ["operations"],
  "object_types": ["delivery", "task"],
  "statuses": ["pending", "delayed"],
  "owner_ids": [],
  "from": "2026-08-01T00:00:00-03:00",
  "to": "2026-08-31T23:59:59-03:00",
  "query": "entrega atrasada",
  "include_evidence": true,
  "sort": "relevance"
}
```

A aplicação deve manter filtros na URL para permitir compartilhamento seguro, voltar/avançar e deep links.

## 8. Busca híbrida

```text
1. Validar sessão, workspace e permissões.
2. Interpretar filtros explícitos.
3. Resolver parties, projetos, grupos e aliases.
4. Consultar objetos estruturados e context links.
5. Aplicar full-text.
6. Aplicar vetores para perguntas abertas.
7. Reordenar por relevância, contexto, recência, prioridade e confiança.
8. Recuperar evidências autorizadas.
9. Retornar agrupamento por lente e motivo da correspondência.
```

### Exemplo de resposta da API

```json
{
  "query": "grupos do projeto Alfa com pendências",
  "resolved_context": {
    "projects": [{"id": "project_alfa", "name": "Implantação Alfa"}],
    "conversation_type": "group"
  },
  "groups": [
    {
      "conversation_id": "conv_1",
      "title": "Implantação Alfa",
      "matched_by": ["project_link", "object_status"],
      "open_objects": 3,
      "evidence_count": 7
    }
  ],
  "freshness_at": "2026-08-26T18:04:00Z"
}
```

## 9.1 Filtros versus busca livre

A interface deve aceitar tanto filtros como pergunta natural, mas mostrar a interpretação:

> Entendi: **grupos**, do projeto **Implantação Alfa**, com objetos **pendentes**. Aplicar?

Isso evita que uma pergunta ambígua produza uma lista errada.

## 10. Resolução de entidades

A resolução deve gerar candidatos e razões:

```text
menção “Alfa”
  → Alfa Tecnologia: telefone do grupo, alias confirmado, relação ativa
  → Alfa Engenharia: nome semelhante, sem participação no grupo
  → decisão: Alfa Tecnologia
```

Quando houver empate, perguntar. Quando o usuário corrigir, guardar alias, exclusão ou relação contextual.

## 11. Criação e associação de projeto

O usuário pode:

```text
Criar projeto
  → nome
  → objetivo opcional
  → owner
  → empresa/pessoas
  → associar conversa/grupo
  → definir prazo opcional
```

O sistema pode sugerir:

> Encontrei 18 mensagens, 2 arquivos e 4 pendências recorrentes com a Alfa. Quer criar um **Espaço do cliente Alfa** ou associar ao projeto existente?

Nunca criar projeto formal automaticamente sem confirmação. Pode criar um candidato interno, mas a interface deve distingui-lo de um projeto confirmado.

## 12. Associação de grupo a projeto

Suportar quatro níveis:

| Nível | Exemplo |
|---|---|
| Conversa inteira | Grupo Implantação Alfa pertence ao projeto Alfa |
| Intervalo | Mensagens do grupo entre 1/8 e 30/9 |
| Thread/assunto | Apenas thread “instalação” |
| Mensagem | Uma mensagem específica fora do assunto principal |

A prioridade é: associação explícita da mensagem > thread > intervalo > conversa inteira > inferência por título.

## 13. Como construir em etapas

### Sprint 1 — estrutura e navegação

Criar workspace, parties, conversations, participants, projects e context_links. Implementar rotas, sidebar e listas com dados manuais/seed controlado.

### Sprint 2 — timeline e detalhe

Implementar detalhe de conversa/grupo, detalhe de pessoa/empresa, detalhe de projeto, timeline, objetos relacionados e breadcrumbs.

### Sprint 3 — indexação

Adicionar full-text, aliases, índices por workspace, projeto, party e conversa. Criar projeções de contexto.

### Sprint 4 — semântica assistida

Adicionar extração de parties, projetos, ações e objetos. Criar sugestões de relação e fila de revisão.

### Sprint 5 — agente e busca natural

Adicionar consultas do agente como “grupos do projeto X com pendências” e confirmação de associação.

### Sprint 6 — antecipação e métricas

Adicionar atenção por projeto/empresa/grupo, resumos, atrasos, pendências e métricas básicas.

## 14. Testes essenciais

- uma mensagem aparece na conversa, empresa e projeto sem duplicação;
- um grupo pode ter vários projetos por período;
- um grupo 1:1 não é confundido com um grupo de mesmo nome;
- empresa homônima gera desambiguação;
- party pode ser cliente e fornecedor em contextos diferentes;
- usuário sem acesso não vê conversa, mensagem, arquivo ou objeto relacionado;
- filtro por projeto retorna objetos e mensagens autorizados;
- busca natural mostra como interpretou a pergunta;
- correção de relação atualiza todas as vistas;
- remoção de vínculo não é desfeita silenciosamente pela IA;
- mensagem nova de grupo muda o contexto somente se houver evidência suficiente;
- projeto arquivado continua pesquisável conforme retenção;
- falha de indexação aparece como estado parcial, não como ausência silenciosa.

## 15. Critério de simplicidade

O usuário deve conseguir operar com quatro ações principais:

```text
abrir contexto
buscar
associar
agir
```

A maior parte da complexidade deve ficar no backend, nas relações e nas sugestões. A interface deve mostrar o contexto já resolvido e pedir confirmação somente quando a ambiguidade ou o risco justificarem.
