# ZapTrack — núcleo universal de dados e pipeline semântico

## 1. Mudança arquitetural

O núcleo não deve mais ser orientado apenas a cinco objetos iniciais. Ele deve possuir uma camada universal de `interaction_events` e uma camada de `management_objects` projetada a partir desses eventos.

Os cinco objetos iniciais continuam sendo o primeiro recorte de experiência, mas deixam de ser o limite do modelo. Solicitação, agendamento, compra, contratação, reclamação, pagamento, entrega, reunião, venda e outras situações passam pelo mesmo pipeline.

```text
mensagem/evento bruto
        ↓
InteractionEvent
        ↓
SemanticAnalysis versionada
        ↓
ManagementObject ou evento apenas informativo
        ↓
StateTransition
        ↓
ActionCommand / métrica / alerta
```

## 2. Tabelas centrais

| Tabela | Papel |
|---|---|
| `parties` | Pessoas, empresas, equipes e entidades externas. |
| `party_roles` | Papel relacional por workspace/conversa. |
| `conversations` | Contexto da interação. |
| `messages` | Evidência bruta e imutável. |
| `attachments` | Mídia, documento, áudio e referência ao storage. |
| `interaction_events` | Fatos semânticos observados na mensagem. |
| `semantic_analyses` | Interpretações versionadas da IA/regras. |
| `entities` | Pessoas, empresas, produtos, datas, valores, pedidos, contratos e outros. |
| `management_objects` | Objetos gerenciais com ciclo de vida. |
| `object_relations` | Relações entre eventos, mensagens, partes e objetos. |
| `state_transitions` | Histórico de mudanças de estado. |
| `action_commands` | Comandos autorizados pelo usuário ou sistema. |
| `action_runs` | Execução, retry, resultado e reversão. |
| `metric_definitions` | Definição, fórmula e fonte de cada métrica. |
| `metric_snapshots` | Resultado calculado por período e escopo. |
| `feedback` | Aceite, edição, rejeição, correção e utilidade. |
| `audit_logs` | Acesso, decisão, mudança, ferramenta e ação. |

## 3. Campos universais de InteractionEvent

```text
id
workspace_id
conversation_id
message_ids
actor_party_id
counterparty_party_ids
relationship_type
speech_act_type
business_action_type
subject_type
subject_id_or_local_ref
state_type
state_confidence
temporal_data
value_data
sentiment_data
feedback_data
risk_data
commitment_data
next_step_data
evidence_refs
uncertainties
confidence
pipeline_version
taxonomy_version
created_at
```

`business_action_type` recebe valores como `schedule`, `reschedule`, `cancel`, `purchase`, `hire`, `approve`, `complain`, `praise`, `rate`, `meet`, `call`, `sell`, `charge`, `pay`, `deliver`, `ship`, `order`, `assign`, `review`, `resolve` e `other`.

`subject_type` recebe valores como `appointment`, `meeting`, `call`, `lead`, `sale`, `quote`, `order`, `purchase`, `contract`, `invoice`, `payment`, `delivery`, `task`, `complaint`, `feedback`, `decision`, `document`, `project` e `other`.

## 4. ManagementObject como projeção

O objeto gerencial compartilha um núcleo comum:

```text
object_id
workspace_id
object_type
subtype
title
status
priority
owner_id
participants
related_parties
related_conversations
source_event_ids
source_message_ids
due_at
value
attributes
confidence
review_state
created_at
updated_at
completed_at
cancelled_at
```

Atributos específicos permanecem em `attributes` com schema próprio. Isso permite que reunião tenha participantes e horário, pagamento tenha valor e vencimento, entrega tenha endereço e rastreio, reclamação tenha categoria e severidade e venda tenha estágio e valor, sem criar um microserviço por assunto.

## 5. Pipeline semântico em duas passagens

### Passagem A — ampla e econômica

Executada para toda mensagem ou janela relevante:

1. detectar idioma, tipo de mensagem, autor e conversa;
2. deduplicar e normalizar timestamp;
3. segmentar mensagem em unidades semânticas;
4. classificar speech acts em multilabel;
5. detectar candidatos a ação de negócio;
6. detectar entidades básicas, datas e valores;
7. estimar confiança e decidir se há necessidade de Passagem B.

### Passagem B — profunda e direcionada

Executada somente quando houver candidato relevante:

1. identificar subject/object;
2. resolver entidades e papéis dos participantes;
3. inferir estado e transição válida;
4. extrair compromisso, prazo, valor e próximo passo;
5. classificar sentimento, feedback e risco como sinais auxiliares;
6. produzir evidência e incertezas;
7. projetar objeto, alerta, métrica ou evento informativo;
8. aplicar policy de revisão e ação.

Esse desenho evita executar o pipeline mais caro para “bom dia” e permite capturar “cancelar reunião amanhã, mas manter a visita” como múltiplos eventos ligados à mesma mensagem.

## 6. Multi-evento e multi-objeto

Uma mensagem pode conter mais de uma ação:

> “Cancele a reunião de amanhã, reagende para sexta e envie a proposta atualizada.”

O sistema deve gerar eventos relacionados:

| Evento | Ação | Objeto | Estado |
|---|---|---|---|
| 1 | Cancel | Reunião | Requested |
| 2 | Reschedule | Reunião | Requested |
| 3 | Send/update | Proposta | Requested |

As três propostas devem manter `parent_event_id`, evidência comum e dependência de execução. Se o usuário confirmar apenas uma, as outras permanecem pendentes ou são descartadas conforme sua resposta.

## 7. Estados e transições

O estado não pode ser inferido isoladamente do verbo. A máquina precisa de contexto:

```text
mentioned → proposed → requested → acknowledged → approved
→ scheduled → confirmed → committed → in_progress → completed
→ cancelled / rejected / failed / disputed / expired
```

Cada tipo de objeto possui transições permitidas. Um pagamento não pode ir de `mentioned` diretamente para `completed` sem evidência adequada; uma reunião não pode virar `confirmed` apenas porque alguém perguntou “pode ser amanhã?”.

## 8. Áreas da empresa como views

A arquitetura pode organizar a aplicação por áreas, sem fragmentar o núcleo:

| Área | Filtros e objetos predominantes |
|---|---|
| Comercial | Leads, propostas, vendas, follow-ups, negociações |
| Atendimento/CS | Solicitações, reclamações, satisfação, resolução |
| Financeiro | Cobranças, pagamentos, faturas, reembolsos |
| Operações | Pedidos, entregas, tarefas, incidentes |
| Pessoas | Reuniões, delegações, aprovações, avaliações |
| Suprimentos | Compras, cotações, fornecedores, recebimentos |
| Marketing | Campanhas, avaliações, convites, opt-outs |
| Diretoria | Decisões, riscos, métricas e compromissos |

`area` é uma classificação derivada de relação, ação e objeto. Não deve criar bancos separados nem agentes independentes.

## 9. Taxonomia versionada e expansão

A taxonomia deve ser um artefato versionado com:

```text
code
label
description
synonyms
negative_examples
related_actions
valid_subject_types
valid_states
required_fields
risk_level
required_confirmation
```

Novas categorias podem começar como `other` com evidência e ser promovidas após frequência, valor e qualidade comprovados. Sinônimos de português brasileiro, abreviações, regionalismos, áudio e code-switching entram como exemplos e aliases, não como lógica espalhada pela aplicação.

## 10. Qualidade por dimensão

O painel interno de avaliação deve separar:

| Dimensão | Pergunta |
|---|---|
| Detecção | A mensagem relevante foi reconhecida? |
| Speech act | O tipo de ato linguístico foi correto? |
| Ação | A ação de negócio foi correta? |
| Objeto | O assunto/objeto foi resolvido? |
| Estado | O estágio foi correto? |
| Participante | Ator, contraparte e owner foram corretos? |
| Tempo/valor | Prazo, quantidade e valor foram corretos? |
| Evidência | A conclusão aponta para a mensagem certa? |
| Ação sugerida | O próximo passo foi seguro e útil? |

Erros que criam cancelamento, cobrança, pagamento, contrato, exclusão, envio ao cliente ou compromisso falso têm severidade alta e thresholds mais conservadores.

## 11. Regra universal

> **O ZapTrack identifica amplamente, estrutura com dimensões estáveis, projeta somente o que merece acompanhamento e age somente com autorização proporcional ao risco.**
