# ZapTrack — taxonomia, ontologia e vocabulário controlado v1

## 1. Convenções e distinções

### Taxonomia

A taxonomia organiza conceitos em hierarquias e famílias. Ela responde “que tipo de coisa é esta?”. Exemplos: `Ação de negócio > Financeiro > Pagamento` e `Objeto de gestão > Transação > Pedido`.

### Ontologia

A ontologia define as classes, propriedades, relações, restrições, estados e regras que explicam como os conceitos se conectam. Ela responde “o que existe, como se relaciona e o que pode ser inferido?”.

### Vocabulário controlado

O vocabulário liga códigos canônicos a rótulos em português brasileiro, sinônimos, abreviações, exemplos positivos, exemplos negativos, notas de uso e traduções. Ele responde “como as pessoas chamam isso?”.

### Schema físico

O schema físico representa esses conceitos em Postgres, JSON/TypeScript, índices, eventos e APIs. Ele não deve ser confundido com a ontologia.

## 2. Namespace e identificação

Usar um namespace lógico próprio, por exemplo `https://zaptrack.app/ontology/`, com códigos estáveis:

```text
zt:Agent
zt:Person
zt:Organization
zt:PartyRole
zt:Conversation
zt:Message
zt:InteractionEvent
zt:BusinessAction
zt:ManagementObject
zt:Evidence
zt:Commitment
zt:StateTransition
zt:ActionCommand
```

No banco, usar UUID/ULID interno e guardar `canonical_type`, `external_id`, `source_system` e `same_as` quando houver mapeamento para sistemas externos. Não usar o texto da mensagem como identificador.

## 3. Camada superior

A camada superior deve ser pequena e estável:

| Classe | Definição | Exemplos |
|---|---|---|
| `Thing` | Qualquer recurso identificável | Pessoa, pedido, mensagem, local |
| `Agent` | Algo capaz de agir ou ser responsável | Pessoa, organização, sistema, agente IA |
| `Person` | Agente humano | Cliente, colaborador, sócio |
| `Organization` | Agente organizacional | Empresa, fornecedor, parceiro, equipe |
| `Place` | Local físico/virtual | Loja, endereço, sala, chamada online |
| `TimeEntity` | Instante, intervalo, prazo ou recorrência | Amanhã, reunião, vencimento |
| `InformationObject` | Conteúdo informacional | Mensagem, áudio, imagem, documento, link |
| `Activity` | Algo que ocorre, pode ocorrer ou é executado | Reunião, análise, envio, pagamento |
| `Event` | Ocorrência observada ou afirmada | Mensagem recebida, entrega realizada |
| `State` | Condição de um recurso em determinado momento | Aprovado, pago, cancelado |
| `Value` | Quantidade, valor, medida ou código | R$ 500, 3 itens, prioridade alta |
| `Evidence` | Recurso que sustenta uma afirmação | Trecho, arquivo, comprovante |
| `Policy` | Regra de acesso, risco, retenção ou ação | Exigir aprovação para pagamento |
| `Metric` | Medição definida sobre objetos/eventos | Tempo de resposta, volume de vendas |

## 4. Núcleo da ontologia ZapTrack

| Classe | Subclasses principais | Papel |
|---|---|---|
| `Workspace` | Organização, unidade, projeto | Limite de dados, autoridade e configuração |
| `Party` | Person, Organization, Team, SystemAgent | Participante identificável |
| `PartyRole` | Customer, Employee, Partner, Supplier, Prospect | Papel contextual da Party |
| `Conversation` | DirectConversation, GroupConversation, Thread | Contexto de interação |
| `Message` | TextMessage, AudioMessage, ImageMessage, DocumentMessage, LinkMessage | Evidência comunicacional |
| `InteractionEvent` | Observation, Request, Proposal, Confirmation, Commitment, Feedback | Significado observável na conversa |
| `BusinessAction` | Schedule, Buy, Sell, Pay, Deliver, Approve, Complain | Ação de negócio representada |
| `BusinessObject` | Product, Service, Order, Contract, Invoice, Payment | Coisa sobre a qual o negócio opera |
| `ManagementObject` | Task, Appointment, Opportunity, Complaint, Decision, Risk | Unidade que pode ser acompanhada |
| `Commitment` | Promise, Deadline, Obligation, SLA | Compromisso de agente/parte |
| `Decision` | Proposal, Approval, Rejection, PolicyDecision | Decisão proposta/aprovada |
| `Feedback` | Complaint, Praise, Review, Rating, Suggestion | Retorno e avaliação |
| `Document` | Quote, Proposal, Contract, Invoice, Receipt | Artefato documental |
| `ActionCommand` | Create, Update, Assign, Complete, Send, Export | Intenção autorizada de modificar/agir |
| `MetricDefinition` | Volume, Rate, Duration, Amount, Quality | Definição formal de indicador |

## 5. Taxonomia de atos linguísticos

```text
zt:SpeechAct
├── zt:Ask
│   ├── zt:Question
│   ├── zt:Request
│   ├── zt:Inquiry
│   └── zt:Clarification
├── zt:Inform
│   ├── zt:Notify
│   ├── zt:Update
│   ├── zt:Report
│   └── zt:Share
├── zt:Propose
│   ├── zt:Offer
│   ├── zt:Quote
│   ├── zt:Invite
│   └── zt:Counterproposal
├── zt:Commit
│   ├── zt:Promise
│   ├── zt:Guarantee
│   ├── zt:Reservation
│   └── zt:DeadlineCommitment
├── zt:Decide
│   ├── zt:Approve
│   ├── zt:Authorize
│   ├── zt:Accept
│   ├── zt:Reject
│   └── zt:CancelDecision
├── zt:Coordinate
│   ├── zt:Schedule
│   ├── zt:Reschedule
│   ├── zt:Delegate
│   ├── zt:Assign
│   └── zt:Escalate
├── zt:Evaluate
│   ├── zt:Complain
│   ├── zt:Praise
│   ├── zt:Review
│   ├── zt:Rate
│   └── zt:Recommend
└── zt:Negotiate
    ├── zt:NegotiatePrice
    ├── zt:NegotiateTerm
    ├── zt:RequestDiscount
    └── zt:Condition
```

O ato linguístico não afirma por si só que a ação de negócio ocorreu. Ele representa a função comunicacional do trecho.

## 6. Taxonomia de ações de negócio

```text
zt:BusinessAction
├── zt:CustomerServiceAction
│   ├── zt:RequestSupport
│   ├── zt:AnswerQuestion
│   ├── zt:OpenCase
│   ├── zt:ResolveCase
│   └── zt:EscalateCase
├── zt:CalendarAction
│   ├── zt:Schedule
│   ├── zt:ConfirmAppointment
│   ├── zt:Reschedule
│   ├── zt:CancelAppointment
│   ├── zt:Attend
│   ├── zt:Meet
│   ├── zt:Call
│   └── zt:Visit
├── zt:CommercialAction
│   ├── zt:Prospect
│   ├── zt:Qualify
│   ├── zt:Quote
│   ├── zt:SendProposal
│   ├── zt:Negotiate
│   ├── zt:ApproveSale
│   ├── zt:Sell
│   ├── zt:Renew
│   └── zt:Recover
├── zt:ProcurementAction
│   ├── zt:RequestQuotation
│   ├── zt:ApprovePurchase
│   ├── zt:Buy
│   ├── zt:Order
│   ├── zt:HireSupplier
│   ├── zt:ReceivePurchase
│   └── zt:ReturnPurchase
├── zt:ContractAction
│   ├── zt:DraftContract
│   ├── zt:ApproveContract
│   ├── zt:SignContract
│   ├── zt:ActivateContract
│   ├── zt:RenewContract
│   ├── zt:AmendContract
│   └── zt:TerminateContract
├── zt:FinanceAction
│   ├── zt:IssueInvoice
│   ├── zt:Charge
│   ├── zt:PromisePayment
│   ├── zt:Pay
│   ├── zt:ReceivePayment
│   ├── zt:Refund
│   ├── zt:DisputeCharge
│   └── zt:Reconcile
├── zt:FulfillmentAction
│   ├── zt:CreateOrder
│   ├── zt:ChangeOrder
│   ├── zt:Pick
│   ├── zt:Pack
│   ├── zt:Ship
│   ├── zt:Deliver
│   ├── zt:DelayDelivery
│   └── zt:ReturnDelivery
├── zt:WorkAction
│   ├── zt:CreateTask
│   ├── zt:AssignTask
│   ├── zt:StartTask
│   ├── zt:BlockTask
│   ├── zt:ReviewWork
│   ├── zt:CompleteTask
│   └── zt:DelegateWork
├── zt:PeopleAction
│   ├── zt:Onboard
│   ├── zt:Allocate
│   ├── zt:ApproveLeave
│   ├── zt:EvaluatePerformance
│   └── zt:ResolveConflict
├── zt:FeedbackAction
│   ├── zt:Complain
│   ├── zt:Praise
│   ├── zt:Review
│   ├── zt:Rate
│   └── zt:Recommend
└── zt:KnowledgeAction
    ├── zt:Summarize
    ├── zt:Explain
    ├── zt:Decide
    ├── zt:Document
    └── zt:Search
```

## 7. Taxonomia de objetos

```text
zt:ManagementObject
├── zt:Request
├── zt:Task
├── zt:Commitment
├── zt:Appointment
│   ├── zt:Meeting
│   ├── zt:Call
│   ├── zt:Visit
│   └── zt:Reservation
├── zt:CommercialObject
│   ├── zt:Lead
│   ├── zt:Opportunity
│   ├── zt:Quote
│   ├── zt:Proposal
│   └── zt:Sale
├── zt:ProcurementObject
│   ├── zt:PurchaseRequest
│   ├── zt:PurchaseOrder
│   ├── zt:Order
│   └── zt:Return
├── zt:ContractualObject
│   ├── zt:Contract
│   ├── zt:ServiceAgreement
│   └── zt:SLA
├── zt:FinancialObject
│   ├── zt:Invoice
│   ├── zt:Charge
│   ├── zt:Payment
│   ├── zt:Refund
│   └── zt:Dispute
├── zt:FulfillmentObject
│   ├── zt:Shipment
│   ├── zt:Delivery
│   ├── zt:Pickup
│   └── zt:Tracking
├── zt:ServiceObject
│   ├── zt:Case
│   ├── zt:Complaint
│   ├── zt:Incident
│   └── zt:Feedback
├── zt:DecisionObject
│   ├── zt:Decision
│   ├── zt:Approval
│   └── zt:Risk
└── zt:WorkObject
    ├── zt:Project
    ├── zt:Initiative
    ├── zt:Milestone
    └── zt:Issue
```

Documento, áudio, imagem e link não são objetos de gestão por padrão. São `InformationObject`/`Evidence` e podem estar vinculados a qualquer objeto.

## 8. Vocabulário controlado

Cada conceito deve possuir:

```json
{
  "code": "business_action.reschedule",
  "preferred_label": "Reagendamento",
  "language": "pt-BR",
  "alternate_labels": ["remarcar", "mudar horário", "passar para outro dia"],
  "definition": "Alteração de data ou horário de um compromisso existente.",
  "broader": "business_action.calendar",
  "related": ["business_action.cancel", "object.appointment"],
  "valid_subject_types": ["appointment", "meeting", "call", "visit"],
  "valid_states": ["proposed", "requested", "confirmed", "completed", "cancelled"],
  "required_fields": ["subject", "new_time"],
  "negative_examples": ["Podemos reagendar?"],
  "positive_examples": ["Reagendado para sexta às 10h."],
  "risk_level": "medium",
  "required_confirmation": "policy_dependent",
  "taxonomy_version": "1.0.0"
}
```

A mesma palavra pode ter conceitos diferentes. “Cobrar” pode significar `charge` financeiro, `follow_up` operacional ou `escalate` relacional; o contexto decide.

## 9. Regras de composição

O ZapTrack deve compor a interpretação nesta ordem:

```text
speech_act
  + business_action
  + subject_type
  + state
  + relationship
  + temporal/value data
  + evidence
  = InteractionEvent
```

Depois:

```text
InteractionEvent
  + relevance rule
  + lifecycle schema
  = ManagementObject proposal
```

E somente depois:

```text
ManagementObject
  + permission
  + risk policy
  + confirmation
  = ActionCommand
```

## 10. Regras ontológicas mínimas

1. Todo `Message` pertence a uma `Conversation` e tem uma origem/canal.
2. Todo `InteractionEvent` tem uma ou mais evidências.
3. Todo `InteractionEvent` tem pelo menos um `actor` ou marca `actor_unknown`.
4. Todo `BusinessAction` possui um sujeito/objeto quando a classe exigir.
5. Todo `ManagementObject` pertence a um `Workspace`.
6. Todo objeto com ciclo de vida possui estado atual e histórico de transições.
7. Todo compromisso possui quem assumiu, o quê, quando e evidência ou indicação de baixa certeza.
8. Toda ação executada possui comando, executor, política e resultado.
9. Toda métrica possui definição, fonte, período, timezone e versão.
10. Toda inferência de IA possui modelo, prompt/taxonomia, confiança e proveniência.
11. Um evento proposto não pode ser tratado como evento confirmado sem evidência adicional.
12. Um arquivo não vira pagamento, contrato, venda ou entrega sem extração e confirmação suficiente.
13. Pessoas e organizações podem ter múltiplos papéis conforme workspace e relação.
14. O sistema deve preservar `unknown`, `other`, `ambiguous` e `not_applicable`.
15. A ontologia nunca deve apagar a mensagem original ou substituir a interpretação anterior.

## 11. Regras de inferência segura

| Regra | Inferência permitida | Condição |
|---|---|---|
| R1 | Pedido de compra → possível PurchaseRequest | Speech act request + objeto identificável |
| R2 | “Aprovado” → Approval | Deve resolver objeto e ator com autoridade |
| R3 | “Pago” → Payment completed | Exige evidência ou origem transacional confiável |
| R4 | “Vou pagar sexta” → Commitment | Não equivale a pagamento realizado |
| R5 | “Reunião confirmada” → Appointment confirmed | Data, participantes ou objeto resolvidos |
| R6 | “Cliente reclamou” → Complaint | Evidência textual/áudio e relação cliente |
| R7 | “Entrega atrasada” → Delivery risk/exception | Objeto de entrega e referência temporal |
| R8 | “Podemos cancelar?” → Cancel request/proposal | Não cancelar automaticamente |
| R9 | Documento com palavra contrato → Document candidate | Não é contrato válido sem tipo/estado/evidência |
| R10 | “Parece interessado” → Opportunity signal | Nunca criar Sale automaticamente |

## 12. Perfis de domínio

Domínios não devem criar ontologias isoladas. Devem especializar o núcleo:

| Perfil | Especializações |
|---|---|
| Comercial | Lead, Opportunity, Quote, Proposal, Sale, Renewal |
| Atendimento | Case, Complaint, SLA, Resolution, Satisfaction |
| Financeiro | Invoice, Charge, Payment, Refund, Reconciliation |
| Operações | Order, Delivery, Shipment, Task, Incident |
| Suprimentos | Supplier, PurchaseRequest, PurchaseOrder, Receipt |
| Pessoas | Employee, Role, Assignment, Meeting, Approval |
| Projetos | Project, Initiative, Milestone, Issue, Decision |
| Marketing | Campaign, Audience, Invitation, Review, OptOut |
| Diretoria | Risk, Decision, KPI, Commitment, Initiative |

Cada perfil adiciona rótulos, campos, estados e regras; não duplica `Conversation`, `Party`, `Evidence`, `InteractionEvent`, `ManagementObject` ou `ActionCommand`.
