# ZapTrack — implementação técnica de calendário e Kanban

## 1. Princípio

Calendário e Kanban são projeções de leitura sobre `ManagementObject`. Não criar uma entidade paralela de “card” ou “evento de agenda” sem vínculo com o objeto.

```text
Message / InteractionEvent / ManagementObject
  → Timeline
  → CalendarProjection
  → KanbanProjection
  → Agora
```

## 2. Campos temporais

```text
starts_at
ends_at
scheduled_at
due_at
expected_at
committed_at
delivered_at
state_changed_at
timezone
precision
source
confidence
```

## 3. Campos de fluxo

```text
workflow_state
workflow_stage
attention_state
owner_id
team_id
priority
blocked_reason
waiting_on_party_id
review_state
```

Separar `workflow_state` de `attention_state`. Assim, um item pode estar `in_progress` e `overdue` ao mesmo tempo.

## 4. Projeção de calendário

```text
calendar_items
├── workspace_id
├── object_id
├── calendar_item_type
├── starts_at
├── ends_at
├── due_at
├── expected_at
├── timezone
├── display_label
├── project_id
├── party_ids
├── owner_id
├── status
├── attention_state
├── visibility
└── projection_version
```

A projeção deve ser recalculável a partir do objeto. Usar cache por período e escopo.

## 5. Projeção de Kanban

```text
kanban_cards
├── workspace_id
├── object_id
├── board_preset
├── column_key
├── workflow_state
├── attention_state
├── owner_id
├── project_id
├── primary_party_id
├── due_at
├── priority
├── position
├── visibility
└── projection_version
```

`position` deve ser específica da visão/preset, não uma propriedade universal do objeto.

## 6. Rotas

```text
/app/agora/calendario
/app/agora/kanban
/app/areas/:area/calendario
/app/areas/:area/kanban
/app/projetos/:id/calendario
/app/projetos/:id/kanban
/app/empresas/:id/calendario
/app/empresas/:id/kanban
/app/conversas/:id/timeline
```

No mobile, calendário e Kanban podem aparecer dentro de `Agora`, `Projetos` e `Áreas`, com navegação por abas.

## 7. APIs/procedures

```text
calendar.list
calendar.get
calendar.updateTemporalField
calendar.detectConflicts
calendar.createRecurringSeries
calendar.updateRecurringScope
kanban.list
kanban.getPresets
kanban.moveCard
kanban.updateGroupBy
kanban.updateColumn
kanban.bulkUpdate
kanban.detectBottlenecks
views.save
views.list
views.delete
```

Toda mutation deve aceitar `workspace_id`, identidade, versão do objeto e `idempotency_key`.

## 8. Contrato de calendário

```json
{
  "view": "week",
  "scope": {
    "workspace_id": "ws_1",
    "project_ids": ["project_alfa"],
    "owner_ids": [],
    "area_ids": ["operations"]
  },
  "time_axis": "due_at",
  "from": "2026-08-24T00:00:00-03:00",
  "to": "2026-08-30T23:59:59-03:00",
  "include_overdue": true,
  "include_context": true
}
```

## 9.1 Contrato de Kanban

```json
{
  "preset": "execution",
  "group_by": "status",
  "scope": {
    "workspace_id": "ws_1",
    "project_ids": ["project_alfa"]
  },
  "filters": {
    "object_types": ["task", "delivery"],
    "attention_states": ["overdue", "blocked"]
  },
  "sort": "priority_due_date"
}
```

## 10. Presets implementáveis

```text
execution
attention
review
by_owner
by_project
by_party
```

Os presets devem possuir configuração declarativa:

```json
{
  "key": "attention",
  "columns": [
    {"key": "normal", "label": "Normal"},
    {"key": "due_soon", "label": "Próximo do prazo"},
    {"key": "overdue", "label": "Atrasado"},
    {"key": "waiting", "label": "Sem retorno"},
    {"key": "unassigned", "label": "Sem responsável"},
    {"key": "conflict", "label": "Conflito"}
  ],
  "source": "attention_state"
}
```

## 11. Eventos de atualização

```text
object.created
object.updated
object.status_changed
object.owner_changed
object.due_date_changed
object.attention_changed
object.project_changed
object.party_changed
calendar_item.created
calendar_item.updated
kanban_card.moved
kanban_view.saved
```

As projeções devem reagir a eventos. Atualizações externas precisam ser idempotentes.

## 12. Drag-and-drop seguro

### Kanban

```text
drag start
  → carregar versão do objeto
  → validar permissão
  → validar transição
  → verificar ação implícita
  → confirmar se risco médio/alto
  → aplicar mutation
  → atualizar card otimista
  → atualizar calendário/timeline/Agora
```

### Calendário

```text
drop event
  → identificar campo temporal
  → verificar conflito
  → confirmar se externo/sensível
  → aplicar mutation
  → registrar histórico
```

## 13. Conflitos

O backend deve rejeitar ou sinalizar:

```text
versão obsoleta
transição inválida
permissão insuficiente
objeto arquivado
prazo incompatível
série recorrente ambígua
ação externa implícita
```

A UI deve oferecer atualizar, revisar e tentar novamente, sem sobrescrever silenciosamente.

## 14. Métricas

```text
calendar_view_opened
calendar_item_opened
calendar_filter_applied
calendar_reschedule_started
calendar_reschedule_completed
kanban_view_opened
kanban_preset_changed
kanban_card_opened
kanban_card_moved
kanban_bulk_action_started
kanban_bulk_action_completed
bottleneck_opened
show_in_conversation_from_calendar
show_in_conversation_from_kanban
```

Medir se calendário e Kanban levam a ações concluídas, não apenas visualizações.

## 15. Roadmap

### Sprint 1

Lista de objetos com prazo, visão dia/semana e Kanban de execução para tarefas e compromissos.

### Sprint 2

Filtros por projeto, empresa/pessoa, responsável e conversa/grupo; calendário mês; estados de atraso e espera.

### Sprint 3

Timeline integrada, `Mostrar na conversa`, drag-and-drop seguro, histórico e conflitos.

### Sprint 4

Visão ano por marcos, presets de atenção/revisão, recorrência, carga por owner e alertas antecipatórios.

### Sprint 5

Ações controladas, integrações de agenda e destinos externos, métricas e views salvas.

## 16. Critérios de aceite

1. O mesmo objeto aparece em timeline, calendário, Kanban e Agora.
2. Alterar prazo atualiza todas as vistas.
3. Mover card atualiza estado e histórico.
4. Atraso é uma dimensão separada de status.
5. Ações sensíveis passam por confirmação/policy gate.
6. Filtros por projeto, empresa, pessoa e conversa funcionam combinados.
7. Toda vista oferece evidência e `Mostrar na conversa`.
8. Recorrência permite editar ocorrência ou série.
9. Conflitos não são sobrescritos silenciosamente.
10. A visão anual permanece legível.
