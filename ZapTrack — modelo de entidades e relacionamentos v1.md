# ZapTrack — modelo de entidades e relacionamentos v1

## 1. Decisão de modelagem

O ZapTrack deve usar um **modelo híbrido**:

- **relacional** para identidade, tenancy, permissões, objetos, estados, ações, métricas e consultas operacionais;
- **JSONB/schema** para atributos específicos de cada tipo de objeto e evolução controlada;
- **índices textuais e vetoriais** para busca semântica;
- **grafo lógico de relações** sobre tabelas relacionais;
- **exportação JSON-LD/RDF** somente quando houver necessidade de interoperabilidade.

Não usar um banco de grafos separado no MVP. O grafo conceitual pode ser representado por IDs e tabelas de relações no Postgres. Se a exploração de relações crescer e houver evidência de que SQL/CTEs não são suficientes, a projeção para um grafo dedicado poderá ser considerada.

## 2. Camadas do modelo

| Camada | Entidades |
|---|---|
| Contexto | Workspace, Organization, OrgUnit, Site, Project |
| Identidade | Party, Person, Organization, SystemAgent, PartyIdentifier |
| Papel e relação | PartyRole, PartyRelationship, Membership, Authority |
| Fonte e canal | Connector, SourceAccount, Channel, ImportBatch |
| Conversa | Conversation, ConversationParticipant, Message, MessageRelation |
| Mídia e conteúdo | Attachment, Transcript, Document, Link, ContentAnnotation |
| Semântica | ConceptScheme, Concept, InteractionEvent, SemanticAnalysis, Evidence |
| Tempo e espaço | TimeExpression, TemporalInterval, Place |
| Gestão | ManagementObject, ObjectRelation, State, StateTransition, Commitment |
| Domínios | Appointment, Sale, Opportunity, Order, Contract, Invoice, Payment, Delivery, Case, Feedback, Decision, Risk, Task |
| Ação | ActionCommand, ActionApproval, ActionRun, ActionResult |
| Inteligência | MetricDefinition, MetricObservation, AttentionItem, Forecast |
| Governança | Consent, AccessGrant, Policy, RetentionRule, AuditLog |

## 3. Entidades de contexto

### Workspace

Representa o espaço de dados, identidade, regras e autoridade de um cliente do ZapTrack. Todos os dados operacionais devem ser vinculados a `workspace_id`, exceto conceitos globais da taxonomia.

Campos mínimos:

```text
workspace_id
name
legal_organization_id
timezone
default_language
plan
status
created_at
```

### Organization, OrgUnit e Site

`Organization` representa empresas, fornecedores, parceiros, clientes corporativos e a empresa proprietária do workspace. `OrgUnit` representa áreas, filiais ou equipes. `Site` representa loja, escritório, obra, endereço de entrega ou local operacional.

Uma organização pode conter unidades; unidades podem conter equipes; organizações e unidades podem operar em sites. Esses relacionamentos devem ser temporais quando a estrutura mudar.

### Project e Initiative

Projeto/iniciativa é um contexto de trabalho que agrupa decisões, tarefas, reuniões, documentos, riscos e entregas. Não deve ser criado para toda conversa; aparece quando houver objetivo, escopo ou acompanhamento.

## 4. Identidade e partes

### Party

`Party` é a superentidade de qualquer participante potencial:

```text
Party
├── Person
├── Organization
├── Team
├── SystemAgent
└── UnknownParty
```

Não modelar “cliente”, “colaborador” ou “fornecedor” como subtipos exclusivos de pessoa. Esses são papéis relacionais e podem variar por workspace, organização e período.

### PartyIdentifier

Guarda identificadores de origem com escopo e verificação:

```text
identifier_id
party_id
kind                 // phone, email, external_id, document, handle
normalized_value
value_hash
source_system
source_account_id
is_verified
valid_from
valid_to
```

O valor bruto sensível deve ser protegido. O ZapTrack deve evitar usar o telefone como chave de negócio universal; o identificador vincula uma possível identidade, que precisa de resolução e autorização.

### PartyRole e PartyRelationship

`PartyRole` é a atribuição de um papel a uma Party em contexto:

```text
party_role_id
party_id
workspace_id
organization_id
role_concept_id       // customer, employee, supplier, partner, prospect
source_conversation_id
valid_from
valid_to
confidence
status
```

`PartyRelationship` representa a relação entre duas parties:

```text
relationship_id
workspace_id
subject_party_id
relationship_concept_id   // buys_from, supplies, employs, partners_with
object_party_id
context_object_id
source_event_id
valid_from
valid_to
confidence
status
```

O relacionamento pode ser inferido de conversas, importado de um sistema ou confirmado por um usuário. A origem e a confiança são obrigatórias.

### Membership e Authority

`Membership` liga pessoa a organização/unidade/equipe com papel, período e status. `Authority` registra o que uma party está autorizada a aprovar, acessar, delegar ou executar em determinado workspace.

Isso é fundamental para distinguir:

- “Gus aprovou” de “Gus sugeriu”;
- “o cliente aceitou” de “o colaborador informou que o cliente talvez aceite”;
- “fornecedor confirmou entrega” de “a equipe espera que o fornecedor entregue”.

## 5. Fontes, conectores e canais

### Connector e SourceAccount

`Connector` representa a integração técnica; `SourceAccount` representa uma conta/número/caixa concreta daquela integração.

```text
Connector 1 ─── N SourceAccount
SourceAccount 1 ─── N Conversation
SourceAccount 1 ─── N Message
```

Campos importantes:

```text
connector_id
workspace_id
provider
kind
status
consent_state
scope
last_sync_at
cursor
error_state
```

### ImportBatch

Toda importação de arquivo ou histórico deve gerar um lote com origem, período, formato, usuário que iniciou, checksum, estado e resultado. Isso permite explicar de onde vieram mensagens e evitar duplicidade.

## 6. Conversas e mensagens

### Conversation

Representa um contexto comunicacional:

```text
conversation_id
workspace_id
source_account_id
conversation_type       // direct, group, channel, thread, imported
external_id
subject
started_at
ended_at
language
visibility
retention_policy_id
```

### ConversationParticipant

É uma relação contextual, não apenas uma lista de parties:

```text
conversation_participant_id
conversation_id
party_id
external_participant_id
role                    // sender, recipient, admin, observer, agent
joined_at
left_at
visibility_scope
```

Uma party pode participar de várias conversas e uma conversa pode ter várias parties. O papel pode mudar por mensagem, período ou contexto.

### Message

Mensagem é evidência bruta e imutável:

```text
message_id
conversation_id
source_account_id
external_id
sender_party_id
sent_at
received_at
message_type            // text, audio, image, document, link, location, reaction
body_text
quoted_message_id
reply_to_message_id
raw_payload_ref
language
checksum
visibility
```

Não substituir `body_text` pela interpretação. A mensagem original continua preservada conforme a política de retenção.

### MessageRelation

Representa resposta, citação, encaminhamento, reação, menção, thread, referência e edição/remoção quando a fonte fornecer tais eventos.

## 7. Conteúdo, mídia e evidência

### Attachment, Transcript e Document

`Attachment` aponta para arquivo armazenado, com MIME, tamanho, checksum, origem, retenção e status de processamento. `Transcript` e `OCRResult` são derivados versionados. `Document` é uma interpretação documental ou tipo de artefato, como proposta, contrato, fatura ou comprovante.

A relação correta é:

```text
Message ──has_attachment──> Attachment
Attachment ──has_derivative──> Transcript/OCR
Message/Attachment ──supports──> Evidence
Evidence ──supports──> InteractionEvent/ManagementObject
```

Um documento não é automaticamente um contrato, fatura ou comprovante. O tipo e o estado precisam de evidência suficiente.

### Evidence

`Evidence` é a ponte entre interpretação e origem:

```text
evidence_id
workspace_id
target_resource_id
selector_type             // quote, text_span, timestamp, page, file_region
selector_data
quoted_text
source_message_id
source_attachment_id
created_by_type            // human, model, rule, integration
created_by_id
created_at
confidence
```

Para áudio, `selector_data` pode conter início/fim em segundos. Para PDF, página e bounding box. Para texto, quote e offsets. A evidência deve ser navegável na aplicação.

## 8. Tempo e local

### TimeExpression

Não guardar apenas uma data calculada. Guardar expressão original, valor normalizado, precisão e timezone:

```text
time_expression_id
raw_expression             // “amanhã de manhã”
normalized_start
normalized_end
due_at
precision                  // exact, day, week, approximate, relative
timezone
recurrence_rule
source_message_id
confidence
```

### TemporalInterval

Eventos e objetos temporais podem possuir instante, intervalo, prazo, duração e recorrência. Reagendamento cria transição e preserva a ocorrência anterior; não sobrescreve silenciosamente o histórico.

### Place

Local físico, endereço, site, sala, loja ou localização virtual. Deve ser ligado à origem e à confiança quando inferido de texto.

## 9. Camada semântica

### ConceptScheme e Concept

`ConceptScheme` é uma taxonomia/versionamento. `Concept` representa uma ação, estado, objeto, papel, relação, área ou conceito de domínio.

Campos de `Concept`:

```text
concept_id
scheme_id
code
preferred_label
alternate_labels
language
definition
broader_concept_id
narrower_concept_ids
related_concept_ids
positive_examples
negative_examples
valid_subject_types
valid_states
risk_level
version
status
```

### InteractionEvent

Evento semântico imutável, derivado de uma ou mais mensagens, integração ou ação de sistema:

```text
event_id
workspace_id
conversation_id
source_message_ids
actor_party_id
counterparty_party_ids
relationship_concept_id
speech_act_concept_id
business_action_concept_id
subject_object_id
state_concept_id
temporal_expression_id
place_id
value_data
commitment_data
feedback_data
risk_data
next_step_data
confidence
analysis_id
created_at
```

### SemanticAnalysis

Registra a versão de uma interpretação:

```text
analysis_id
input_resource_ids
model_provider
model_name
model_version
prompt_version
taxonomy_version
schema_version
output_json
confidence
latency_ms
cost_estimate
created_at
```

Não substituir análise anterior. Uma correção humana gera uma nova análise/annotation e uma transição de confiança.

## 10. Gestão e ciclo de vida

### ManagementObject

É a unidade acompanhável. Possui núcleo comum e especialização por tipo:

```text
object_id
workspace_id
object_type_concept_id
subtype_concept_id
title
status_concept_id
priority
owner_party_id
responsible_unit_id
related_party_ids
related_conversation_ids
related_event_ids
related_project_id
start_at
end_at
due_at
value_data
attributes_json
confidence
review_state
created_by
created_at
updated_at
```

Especializações recomendadas:

| Subtipo | Atributos específicos |
|---|---|
| `Task` | dependências, checklist, executor, resultado |
| `Appointment` | participantes, organizer, local, duração, recorrência |
| `Opportunity` | etapa, valor estimado, probabilidade, origem |
| `Quote/Proposal` | itens, preço, validade, aprovação |
| `Order/Purchase` | comprador, vendedor, itens, quantidade, entrega |
| `Contract` | partes, vigência, renovação, obrigações |
| `Invoice/Charge` | valor, vencimento, status, referência |
| `Payment` | valor, data, método, comprovante, conciliação |
| `Delivery/Shipment` | origem, destino, carrier, tracking, eventos |
| `Case/Complaint` | categoria, severidade, SLA, resolução |
| `Feedback/Review` | tipo, nota, comentário, resposta |
| `Decision/Approval` | proposta, decisor, autoridade, resultado |
| `Risk/Issue` | probabilidade, impacto, mitigação |
| `Project/Initiative` | escopo, marcos, orçamento, resultado |

### ObjectRelation

Liga objetos sem criar colunas infinitas:

```text
object_relation_id
workspace_id
source_object_id
relation_concept_id       // derives_from, blocks, depends_on, part_of, supersedes
 target_object_id
source_event_id
confidence
valid_from
valid_to
```

Exemplos: pedido `part_of` oportunidade; entrega `fulfills` pedido; pagamento `settles` fatura; tarefa `derived_from` decisão; reclamação `about` pedido; reunião `reviews` proposta.

### Commitment

Pode ser uma subclasse de `ManagementObject` ou uma projeção com tabela própria quando exigir consultas rápidas:

```text
commitment_id
promisor_party_id
promisee_party_id
subject_object_id
promised_action_concept_id
promised_result
promised_time_expression_id
status
source_event_id
breach_event_id
```

Não confundir promessa com execução. O sistema deve representar compromisso quebrado quando o prazo passa sem evidência de cumprimento.

### State e StateTransition

`StateTransition` é imutável e registra:

```text
transition_id
object_id
from_state
 to_state
trigger_event_id
actor_party_id
command_id
reason
confidence
occurred_at
```

O estado atual é uma projeção. O histórico é a fonte para auditoria e métricas de tempo.

## 11. Relações de domínio

### Calendário

```text
Appointment ──has_participant──> Party
Appointment ──organized_by──> Party
Appointment ──has_time──> TemporalInterval
Appointment ──has_location──> Place
Appointment ──about──> BusinessObject/Project
Appointment ──supersedes──> Appointment anterior
```

### Comercial

```text
Party ──has_role──> Prospect/Customer
Opportunity ──for──> Party/Organization
Quote ──supports──> Opportunity
Quote ──offers──> Product/Service
Sale ──converts──> Opportunity
Order ──accepted_offer──> Quote/Offer
```

### Compras e fornecedores

```text
Party/Organization ──supplier_of──> Organization
PurchaseRequest ──requests──> Product/Service
PurchaseOrder ──fulfills──> PurchaseRequest
PurchaseOrder ──placed_with──> Supplier
Receipt ──receives──> PurchaseOrder
```

### Financeiro

```text
Invoice ──billed_to──> Party
Invoice ──for──> Order/Contract
Payment ──settles──> Invoice
Charge ──requested_from──> Party
Refund ──reverses──> Payment/Charge
Dispute ──contests──> Invoice/Payment/Order
```

### Fulfillment

```text
Shipment ──fulfills──> Order
Delivery ──delivers──> Order/LineItem
Delivery ──from──> Place
Delivery ──to──> Place
Delivery ──handled_by──> Party/Organization
Delivery ──has_tracking──> TrackingEvent
```

### Atendimento e feedback

```text
Case/Complaint ──raised_by──> Party
Case/Complaint ──about──> Order/Product/Service/Delivery
Case ──assigned_to──> Party/Team
Feedback ──about──> Product/Service/Interaction/Organization
Feedback ──provided_by──> Party
Feedback ──results_in──> Task/Decision/Improvement
```

### Organização e trabalho

```text
Task ──assigned_to──> Party/Team
Task ──derived_from──> InteractionEvent/Decision/Complaint
Task ──depends_on──> Task
Decision ──proposed_by──> Party
Decision ──approved_by──> Party
Decision ──applies_to──> Project/Policy/BusinessObject
Risk ──mitigated_by──> Task/Decision
```

## 12. Ação, autorização e resultado

### ActionCommand

Um comando pode ser originado pelo agente, aplicação, integração ou automação:

```text
command_id
workspace_id
requested_by_party_id
channel
intent
target_object_ids
parameters_json
risk_level
policy_decision
confirmation_state
idempotency_key
created_at
expires_at
```

### ActionApproval, ActionRun e ActionResult

Uma ação sensível pode exigir uma aprovação separada. A execução registra executor, ferramenta, tentativas, efeitos e resultado.

```text
ActionCommand 1 ─── N ActionApproval
ActionCommand 1 ─── N ActionRun
ActionRun 1 ─── 1 ActionResult
ActionRun ───produces──> InteractionEvent/StateTransition
```

## 13. Métricas e atenção

### MetricDefinition

```text
metric_id
workspace_id
code
name
definition
formula
source_object_types
source_event_types
filters
timezone
unit
version
owner
```

### MetricObservation

Resultado calculado com período, escopo, frescor e evidência. Não permitir que o LLM invente a fórmula.

### AttentionItem

Uma projeção de “o que precisa de atenção” que pode derivar de atraso, risco, baixa confiança, mudança importante, promessa próxima, reclamação crítica, pagamento vencido ou decisão pendente.

## 14. Governança

### Consent e AccessGrant

`Consent` registra finalidade, fonte, escopo, sujeito, data e revogação. `AccessGrant` liga member/role a recursos e operações.

### Policy e RetentionRule

`Policy` controla risco, confirmação, autonomia, fonte permitida, área, objeto e ação. `RetentionRule` define retenção para mensagens, anexos, transcrições, análises, objetos e logs.

### AuditLog

Registra leitura, criação, alteração, inferência, acesso, exportação, aprovação, bloqueio e ação externa.

## 15. Cardinalidades principais

| Relação | Cardinalidade |
|---|---|
| Workspace → Members | 1:N |
| Workspace → Parties | 1:N |
| Workspace → Connectors | 1:N |
| Connector → SourceAccounts | 1:N |
| SourceAccount → Conversations | 1:N |
| Conversation → Messages | 1:N |
| Conversation ↔ Parties | N:N via ConversationParticipant |
| Message → Attachments | 1:N |
| Message → InteractionEvents | 1:N |
| InteractionEvent → Evidence | 1:N |
| InteractionEvent → ManagementObjects | 0:N |
| ManagementObject → StateTransitions | 1:N |
| ManagementObject ↔ ManagementObjects | N:N via ObjectRelation |
| ManagementObject → ActionCommands | 0:N |
| MetricDefinition → Observations | 1:N |
| Member/Role → AccessGrants | 1:N |
| Any governed resource → AuditLogs | 1:N |

## 16. Invariantes críticos

1. Todo registro operacional possui `workspace_id`.
2. Toda mensagem possui origem, conversa, autor ou `unknown_party` e timestamp ou precisão temporal explícita.
3. Toda inferência possui evidência, versão e confiança.
4. Todo objeto possui tipo, estado, histórico e origem.
5. Toda transição de estado deve ser válida para o tipo de objeto.
6. Toda ação possui comando, ator, permissão, política e resultado.
7. Nenhum pagamento, aprovação, cancelamento, contrato, venda ou entrega concluída deve ser inferido apenas por uma palavra isolada.
8. Todo identificador externo é escopado por connector/source account.
9. Toda relação inferida possui validade, confiança e origem.
10. `unknown`, `ambiguous`, `not_applicable` e `other` são valores aceitos.
11. Dados brutos, interpretações e projeções não devem ser sobrescritos destrutivamente.
12. Um objeto pode ter várias evidências e uma evidência pode sustentar vários objetos.
13. A aplicação pode exibir views por área, mas não deve duplicar entidades por departamento.
14. Um membro pode operar por WhatsApp ou aplicação, mas a autorização é a mesma.
15. O banco relacional é a fonte operacional; o grafo semântico é uma projeção explicável.

## 17. Decisão de implementação

Começar com tabelas fortes para Workspace, Member, Party, PartyRole, Connector, Conversation, Message, Attachment, InteractionEvent, Evidence, ManagementObject, StateTransition, ActionCommand, ActionRun, MetricDefinition e AuditLog.

Usar `attributes_json` para especializações e adicionar tabelas especializadas somente quando houver uma necessidade real de constraint, consulta, integração, relatório ou permissão. Começar com views e schemas por tipo. Não criar 30 agentes ou 30 módulos isolados.

A ontologia universal deve existir desde o primeiro contrato; a exposição de funcionalidades e o grau de automação devem evoluir por evidência.
