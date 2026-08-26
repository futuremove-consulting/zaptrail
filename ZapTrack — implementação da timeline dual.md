# ZapTrack — implementação da timeline dual

## 1. Fonte de verdade

A conversa original, o evento semântico, o objeto e a evidência são entidades distintas, conectadas por IDs. A timeline é uma projeção de leitura.

```text
Message           = conteúdo e timestamp da fonte
InteractionEvent  = interpretação de algo que aconteceu
Evidence          = vínculo auditável com uma fonte
ManagementObject  = unidade operacional acompanhável
TimelineItem      = projeção de leitura
```

## 2. Tabelas

```sql
create table conversation_timeline_items (
  id uuid primary key,
  workspace_id uuid not null,
  conversation_id uuid not null,
  item_type text not null,
  source_message_ids uuid[] not null default '{}',
  source_event_ids uuid[] not null default '{}',
  object_id uuid,
  occurred_at timestamptz,
  message_sent_at timestamptz,
  created_at timestamptz not null default now(),
  state_changed_at timestamptz,
  due_at timestamptz,
  label text not null,
  summary text,
  status text,
  confidence numeric,
  evidence_count integer not null default 0,
  sort_key timestamptz not null,
  visibility text not null,
  metadata jsonb not null default '{}'
);

create index timeline_conversation_sort
  on conversation_timeline_items(workspace_id, conversation_id, sort_key desc);

create index timeline_conversation_type
  on conversation_timeline_items(workspace_id, conversation_id, item_type, sort_key desc);

create index timeline_object
  on conversation_timeline_items(workspace_id, object_id);
```

A projeção pode ser materializada ou calculada sob demanda para conversas pequenas. Para conversas grandes, materializar e atualizar por eventos.

## 3. API de timeline

```text
conversation.timeline
conversation.messages
conversation.timeline_item
conversation.timeline_filters
conversation.search
conversation.show_in_conversation
conversation.context
conversation.saved_view.create
conversation.saved_view.list
conversation.saved_view.delete
```

### Query

```json
{
  "conversation_id": "conv_1",
  "view": "structured",
  "from": "2026-08-01T00:00:00-03:00",
  "to": "2026-08-31T23:59:59-03:00",
  "time_axis": "occurred_at",
  "item_types": ["decision", "commitment", "management_object"],
  "intent_types": ["request", "approval"],
  "action_types": ["deliver", "approve"],
  "object_types": ["task", "delivery"],
  "party_ids": ["party_1"],
  "project_ids": ["project_1"],
  "statuses": ["open", "delayed"],
  "keyword": "entrega",
  "include_context": true,
  "cursor": null,
  "limit": 50
}
```

### show_in_conversation

```json
{
  "timeline_item_id": "item_1",
  "conversation_id": "conv_1",
  "primary_message_id": "msg_183",
  "message_ids": ["msg_182", "msg_183", "msg_184"],
  "context_before": 2,
  "context_after": 2,
  "highlight_selector": {
    "message_id": "msg_183",
    "span_start": 0,
    "span_end": 42
  }
}
```

## 4. Eventos de atualização

```text
message.received
message.edited
message.deleted
semantic_analysis.completed
interaction_event.created
interaction_event.updated
object.created
object.status_changed
evidence.linked
evidence.removed
context_link.updated
feedback.recorded
```

Cada atualização deve invalidar ou recalcular somente as projeções afetadas. Não reprocessar a conversa inteira por uma pequena correção, salvo quando a mudança alterar contexto amplo.

## 5. Componentes

```text
ConversationWorkspace
ConversationHeader
ConversationTabs
ConversationOriginalView
StructuredTimelineView
TimelineToolbar
TimelineFilters
TimelineSearch
TimelineGroup
TimelineItem
TimelineItemIcon
TimelineTimestamp
EvidenceMarker
EvidenceDrawer
ContextChips
ObjectInlineCard
ShowInConversationButton
SynchronizedScroll
SavedViewMenu
LoadingTimeline
PartialTimelineNotice
```

## 6. Estados do componente

```text
idle
loading
partial
ready
filtered
empty
no_evidence
no_permission
source_unavailable
processing
error
```

### Partial

Mostrar:

> A timeline está parcialmente processada. 12 mensagens ainda estão sendo analisadas.

### Empty

Diferenciar:

```text
nenhuma mensagem na conversa
nenhum item corresponde ao filtro
nenhum evento estruturado ainda
nenhuma evidência disponível
```

## 7. Sincronização de rolagem

No desktop, a sincronização deve ser baseada em IDs e timestamps, não somente em posição percentual do scroll. Um item estruturado pode representar várias mensagens; neste caso, a mensagem principal é a âncora e o restante é contexto.

```text
timeline_item_id
  → primary_message_id
  → source_message_ids
  → highlight
  → viewport target
```

Se a mensagem não estiver carregada, buscar a janela temporal correspondente e então posicionar.

## 8. Interação “mostrar na conversa”

### Do item para a fonte

```text
clicar Mostrar na conversa
  → recuperar evidência autorizada
  → carregar janela de mensagens
  → alternar para Conversa ou modo Ambas
  → posicionar na mensagem principal
  → destacar trecho
  → mostrar contexto
  → permitir voltar à timeline filtrada
```

### Da mensagem para o objeto

```text
clicar marcador semântico
  → abrir resumo do evento/objeto
  → mostrar estado/confiança
  → abrir detalhe
  → permitir ação ou correção
```

## 9. Busca e filtros no backend

Todos os filtros devem ser aplicados ao conjunto autorizado. O pipeline recomendado é:

```text
workspace + ACL
  → conversation_id
  → time range
  → item type/status
  → entity/context filters
  → keyword/full-text
  → semantic retrieval
  → pagination
```

## 10. Dados de timestamp

O frontend deve receber cada timestamp com tipo, timezone e qualidade:

```json
{
  "value": "2026-08-27T10:00:00-03:00",
  "kind": "due_at",
  "timezone": "America/Sao_Paulo",
  "precision": "day",
  "source": "explicit",
  "confidence": 0.98
}
```

Isso permite escrever “até sexta”, “27/08 às 10h” ou “data aproximada” sem perder a representação original.

## 11. Desempenho

- virtualizar a lista de mensagens e itens;
- paginar por cursor;
- carregar contexto sob demanda;
- separar conteúdo bruto de derivados;
- não calcular semântica durante a renderização;
- usar cache por query e versão da projeção;
- invalidar cache após eventos relevantes;
- limitar resposta do agente a resumos e links quando a lista for grande.

## 12. Observabilidade

Registrar:

```text
conversation_id
timeline_query_id
filters
time_axis
result_count
latency
projection_version
source_ids
permission_scope
show_in_conversation_success
```

Medir especialmente se o usuário encontra o trecho correto ao clicar em `Mostrar na conversa`.
