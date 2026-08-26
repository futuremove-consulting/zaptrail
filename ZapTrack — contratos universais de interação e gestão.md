# ZapTrack — contratos universais de interação e gestão

## 1. Princípio de modelagem

O ZapTrack deve separar quatro coisas que frequentemente são misturadas:

| Elemento | O que é | Persistência |
|---|---|---|
| `InteractionEvent` | Fato observável na conversa ou no sistema | Imutável |
| `SemanticAnalysis` | Interpretação do fato | Versionada |
| `ManagementObject` | Projeção gerencial acompanhável | Mutável com histórico |
| `ActionCommand` | Intenção autorizada de alterar algo ou comunicar | Auditável/idempotente |

Uma mensagem pode gerar vários eventos semânticos. Um evento pode gerar nenhum, um ou vários objetos. Um objeto pode receber várias ações ao longo do ciclo de vida.

## 2. InteractionEvent universal

```json
{
  "event_id": "evt_01",
  "event_type": "interaction.observed",
  "schema_version": 1,
  "workspace_id": "ws_01",
  "source": {
    "channel": "whatsapp",
    "connector_id": "con_01",
    "conversation_id": "conv_01",
    "message_ids": ["msg_01"],
    "captured_at": "2026-08-26T18:00:00Z"
  },
  "actor": {
    "party_id": "party_01",
    "role": "customer",
    "confidence": 0.98
  },
  "counterparties": [
    {
      "party_id": "party_02",
      "role": "company",
      "confidence": 0.99
    }
  ],
  "relationship": "commercial",
  "speech_act": {
    "type": "request",
    "confidence": 0.93
  },
  "business_action": {
    "type": "schedule",
    "confidence": 0.91
  },
  "subject": {
    "type": "meeting",
    "external_id": null,
    "attributes": {
      "topic": "revisão de proposta"
    }
  },
  "state": {
    "value": "proposed",
    "confidence": 0.88
  },
  "temporal": {
    "start_at": null,
    "end_at": null,
    "due_at": "2026-08-27T10:00:00-03:00",
    "timezone": "America/Sao_Paulo",
    "recurrence": null,
    "confidence": 0.84
  },
  "value": {
    "amount": null,
    "currency": null,
    "quantity": null,
    "unit": null
  },
  "feedback": null,
  "commitment": null,
  "risk": null,
  "next_step": {
    "type": "confirm_details",
    "suggested_owner_id": "party_02",
    "confidence": 0.72
  },
  "evidence": [
    {
      "message_id": "msg_01",
      "quote": "Podemos marcar para amanhã às 10h?",
      "span": [0, 38]
    }
  ],
  "uncertainties": ["appointment_not_confirmed"],
  "confidence": 0.88,
  "model_version": "semantic-pipeline-1",
  "taxonomy_version": "taxonomy-1",
  "created_at": "2026-08-26T18:01:00Z"
}
```

## 3. Speech act, ação e estado

O contrato usa três eixos distintos:

- `speech_act`: o que a mensagem faz na linguagem, como perguntar, solicitar, informar, oferecer, aprovar, recusar, elogiar ou reclamar.
- `business_action`: o que está acontecendo no negócio, como agendar, cancelar, pagar, vender, entregar, contratar ou reunir.
- `state`: o estágio, como mencionado, proposto, solicitado, confirmado, executado, cancelado, falho ou contestado.

Essa separação evita falsos positivos. “Podemos reagendar?” é `speech_act=request`, `business_action=reschedule`, `state=proposed`; não é um reagendamento confirmado.

## 4. Taxonomia inicial versionada

A taxonomia deve ser multidimensional e extensível:

```text
speech_act
  request, question, inform, notify, offer, propose, confirm,
  approve, reject, deny, promise, complain, praise, rate,
  negotiate, escalate, delegate, remind, clarify

business_action
  schedule, reschedule, cancel, attend, call, meet, visit,
  quote, propose, sell, buy, order, hire, contract, renew,
  bill, charge, pay, receive, refund, deliver, ship, return,
  assign, execute, block, resolve, review, decide, document

relationship
  customer, prospect, collaborator, manager, partner,
  supplier, provider, community, internal, unknown

state
  mentioned, proposed, requested, acknowledged, approved,
  scheduled, confirmed, committed, in_progress, completed,
  cancelled, rejected, failed, disputed, expired, unknown
```

O campo `unknown/other` é obrigatório. Quando uma categoria não existe ou a confiança for baixa, o sistema deve preservar a evidência e permitir revisão, em vez de forçar uma classe incorreta.

## 5. ManagementObject universal

```json
{
  "object_id": "obj_01",
  "workspace_id": "ws_01",
  "object_type": "appointment",
  "subtype": "meeting",
  "title": "Revisão de proposta com Alfa",
  "status": "proposed",
  "priority": "medium",
  "owner_id": "party_02",
  "participants": ["party_01", "party_02"],
  "related_company_id": "company_01",
  "related_conversation_ids": ["conv_01"],
  "source_event_ids": ["evt_01"],
  "due_at": "2026-08-27T10:00:00-03:00",
  "value": null,
  "attributes": {
    "topic": "revisão de proposta"
  },
  "confidence": 0.88,
  "lifecycle": {
    "created_at": "2026-08-26T18:01:00Z",
    "updated_at": "2026-08-26T18:01:00Z",
    "completed_at": null,
    "cancelled_at": null
  },
  "review": {
    "state": "needs_confirmation",
    "reviewed_by": null,
    "reviewed_at": null
  },
  "taxonomy_version": "taxonomy-1",
  "pipeline_version": "semantic-pipeline-1"
}
```

O objeto possui um núcleo comum para filtros, feed, busca e ações. `attributes` guarda campos específicos validados pelo schema do subtipo. Essa escolha permite cobrir pedido, contrato, reunião, pagamento e reclamação sem criar uma aplicação diferente para cada caso.

## 6. Eventos de domínio

```text
interaction.observed
interaction.structured
entity.resolved
object.proposed
object.accepted
object.rejected
object.updated
object.assigned
object.scheduled
object.completed
object.cancelled
action.requested
action.approved
action.executed
action.failed
feedback.recorded
source.sync_started
source.sync_completed
source.sync_failed
```

Todos os eventos possuem `event_id`, `event_type`, `schema_version`, `workspace_id`, `occurred_at`, `actor`, `correlation_id`, `idempotency_key`, `source_refs` e `payload` validado.

## 7. Vocabulário de exemplos

| Conversa | Speech act | Business action | Objeto | Estado inicial |
|---|---|---|---|---|
| “Pode enviar a proposta?” | Request | Send/propose | Cotação/proposta | Requested |
| “A proposta foi aprovada” | Inform/confirm | Approve | Proposta | Approved |
| “Vamos marcar uma reunião?” | Request | Schedule | Reunião | Proposed |
| “Reunião confirmada terça às 10h” | Confirm | Meet | Reunião | Confirmed |
| “Preciso cancelar” | Request | Cancel | Objeto contextual | Requested |
| “Compra aprovada, pode emitir” | Approve | Buy/order | Pedido/compra | Approved |
| “Contratamos o serviço” | Confirm | Contract/hire | Contrato | Completed/active |
| “Vou pagar sexta” | Promise | Pay | Pagamento | Committed |
| “Pagamento recebido” | Inform | Receive | Pagamento | Completed |
| “Entrega atrasou” | Report/complain | Deliver | Entrega | Failed/at_risk |
| “O cliente reclamou do prazo” | Complain | Support/resolve | Reclamação | Open |
| “A equipe aprovou o projeto” | Approve | Decide | Decisão/projeto | Approved |
| “Fornecedor enviou a nota” | Inform | Bill/send | Documento/fatura | Received |

## 8. Regras contra explosão de categorias

Não criar uma tabela, tela ou agente novo para cada verbo. Criar novas categorias somente quando houver uma diferença real de ciclo de vida, permissão, métrica ou ação.

Por exemplo, reunião, ligação e visita podem compartilhar o objeto `appointment` com subtipos. Compra, pedido e contratação podem compartilhar um fluxo transacional, com atributos específicos. Reclamação, elogio e avaliação podem compartilhar `feedback`, mudando tipo, severidade e ação recomendada.

A universalidade deve ser obtida por **composição**, não por uma lista plana de milhares de intents.

## 9. Regra de qualidade

O sistema deve medir cobertura e precisão por dimensão. Um modelo pode reconhecer corretamente que existe uma solicitação, mas errar o objeto, o estado ou o prazo. A avaliação deve separar esses erros e tratar como críticos aqueles que criam compromisso, cobrança, pagamento, cancelamento ou comunicação externa incorreta.
