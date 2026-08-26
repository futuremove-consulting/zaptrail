# ZapTrack — indexação, estruturação, busca e resolução de entidades

## 1. Objetivo

O ZapTrack deve permitir que o usuário encontre uma informação começando por qualquer lente:

```text
conversa/grupo
empresa/pessoa
projeto
área
objeto de gestão
mensagem/arquivo
```

A busca deve convergir para a mesma fonte de verdade. Não criar uma base paralela para cada menu.

## 2. Pipeline de ingestão e indexação

```text
Webhook/importação/upload
  → validação de origem
  → idempotência
  → persistência bruta
  → normalização
  → resolução de fonte/conversa
  → resolução de party
  → transcrição/OCR
  → segmentação
  → extração semântica
  → criação de eventos
  → criação/atualização de objetos
  → criação de relações
  → documento de busca
  → projeções de contexto
  → notificações/atenção
```

Cada etapa é idempotente e possui status próprio. O webhook não deve executar análise pesada dentro da requisição.

## 3. Documentos de busca

Cada recurso indexável produz um documento lógico:

```json
{
  "resource_id": "msg_123",
  "resource_type": "message",
  "workspace_id": "ws_1",
  "source_account_ids": ["src_1"],
  "conversation_ids": ["conv_1"],
  "conversation_types": ["group"],
  "party_ids": ["party_alfa", "party_ana"],
  "organization_ids": ["org_alfa"],
  "project_ids": ["proj_implantacao"],
  "area_ids": ["operations"],
  "object_ids": ["obj_delivery_1"],
  "event_types": ["delivery.commitment"],
  "action_types": ["deliver", "confirm"],
  "status_terms": ["pending"],
  "text": "texto normalizado e autorizado",
  "text_tokens": ["entrega", "sexta", "alfa"],
  "time_start": "2026-08-26T00:00:00Z",
  "time_end": "2026-08-26T23:59:59Z",
  "value_amount": 1500,
  "value_currency": "BRL",
  "confidence": 0.91,
  "review_state": "accepted",
  "visibility": "team_operations",
  "embedding": "vector",
  "freshness_at": "2026-08-26T18:04:00Z"
}
```

## 4. Estratégia de busca

A busca deve ocorrer nesta ordem:

1. autenticar e validar workspace;
2. aplicar visibilidade e permissões;
3. interpretar intenção e filtros;
4. resolver entidades e contexto;
5. executar consulta estruturada;
6. executar full-text quando necessário;
7. executar busca vetorial para perguntas abertas;
8. combinar e reordenar resultados;
9. recuperar evidências;
10. exibir explicação de correspondência.

Não recuperar tudo e filtrar depois. Permissão é condição da consulta.

## 5. Busca estruturada

Perguntas comuns devem virar filtros determinísticos:

| Pergunta | Filtros |
|---|---|
| “Pendências da Alfa” | party/org = Alfa; object status != completed |
| “Grupos do projeto X” | conversation_type = group; project_id = X |
| “Pagamentos vencidos” | object_type = payment/invoice; due_at < now; status = overdue |
| “O que está atrasado?” | state = delayed/overdue/blocked; order by impact |
| “Decisões da reunião” | event/speech act = decision; conversation relation = meeting |
| “Conversas sem retorno” | conversation/message/object with waiting state and no response interval |
| “Tudo da Beta esta semana” | party/org = Beta; temporal interval current week |

## 6. Busca semântica

Usar vetores para perguntas como:

```text
“onde combinamos de trocar o fornecedor?”
“qual era o problema de acesso do cliente?”
“o que ficou pendente depois da reunião?”
“me mostre as conversas sobre atraso de entrega”
```

O resultado deve vir acompanhado de `match_reason`, por exemplo:

```text
Objeto correspondente por filtro
Mensagem correspondente por termo exato
Trecho semelhante por significado
Relação encontrada no projeto
```

A busca semântica nunca deve ignorar escopo, permissão, fonte ou estado de revisão.

## 7. Reranking

A ordenação pode combinar:

```text
relevance
+ exact_match
+ entity_match
+ context_match
+ recency
+ object_priority
+ confidence
+ evidence_quality
+ user_scope
```

Em resultados sensíveis, confiança e qualidade da evidência devem pesar mais que similaridade textual.

## 8. Resolução de entidades

### 8.1 Entidades-alvo

- pessoa;
- empresa/organização;
- equipe/unidade;
- conversa/grupo;
- projeto;
- produto/serviço;
- pedido/contrato/fatura;
- local;
- documento.

### 8.2 Sinais de resolução

| Sinal | Peso conceitual |
|---|---|
| Identificador exato | Muito alto |
| Telefone/e-mail verificado | Muito alto |
| Número de pedido/contrato | Muito alto |
| Alias confirmado pelo usuário | Alto |
| Participante da conversa | Alto |
| Relação histórica no workspace | Médio/alto |
| Nome normalizado | Médio |
| Organização/unidade/local | Médio |
| Janela temporal | Médio |
| Similaridade semântica | Médio |
| Título da conversa/grupo | Baixo/médio |
| Palavra isolada | Baixo |

### 8.3 Resultado da resolução

A resolução deve retornar:

```json
{
  "mention": "Alfa",
  "candidates": [
    {
      "party_id": "org_alfa",
      "display_name": "Alfa Tecnologia Ltda.",
      "score": 0.94,
      "reasons": ["nome exato", "participante do grupo", "relação ativa"]
    }
  ],
  "decision": "resolved",
  "requires_confirmation": false
}
```

Se houver colisão:

```json
{
  "decision": "ambiguous",
  "requires_confirmation": true,
  "question": "Você se refere à Alfa Tecnologia ou à Alfa Engenharia?"
}
```

Não fundir entidades apenas por nome. Merge e unmerge devem ser auditáveis.

## 9. Resolução de projetos

Projetos podem ser explicitamente criados ou inferidos como candidatos.

### Sinais de vínculo

```text
nome do projeto na mensagem
nome do grupo
parties recorrentes
mesmo cliente/fornecedor
documentos e arquivos
objetos relacionados
período
local
owner
```

O vínculo de um grupo a um projeto pode ser:

```text
explicit
suggested
default_context
time_bounded
message_specific
overridden
excluded
```

Um grupo pode ter um projeto padrão e exceções por mensagem/thread. Uma mesma conversa pode atravessar vários projetos ao longo do tempo.

## 10. Resolução de empresas e pessoas

### Empresa

A interface mostra “Empresa”, mas o domínio diferencia:

```text
legal_organization
commercial_name
business_unit
supplier
customer
partner
service_provider
```

### Pessoa

Uma pessoa pode ter múltiplos papéis:

```text
customer_contact
supplier_contact
employee
manager
partner_representative
prospect
external_consultant
```

O papel é contextual, temporal e relacionado ao workspace.

## 11. Resolução de conversas e grupos

Uma conversa pode ser localizada por:

```text
external_id
source_account
conversation_type
phone/participant
normalized title
participant set
last activity
```

O título de grupo não é uma identidade confiável por si só. Renomeações devem gerar histórico. Participantes entram e saem; a composição da conversa é temporal.

## 12. Estruturação por mensagem

Cada mensagem pode gerar zero, um ou vários segmentos semânticos:

```json
{
  "message_id": "msg_1",
  "segments": [
    {
      "text_span": "aprova a compra",
      "speech_act": "request",
      "business_action": "approve_purchase",
      "subject_ref": "purchase_request_1"
    },
    {
      "text_span": "e marca a reunião para sexta",
      "speech_act": "request",
      "business_action": "schedule",
      "subject_ref": "appointment_candidate_1"
    }
  ]
}
```

Uma mensagem não precisa virar um único intent. A unidade de análise pode ser o segmento, e a unidade de correlação continua sendo a mensagem/conversa.

## 13. Estruturação por janela conversacional

Alguns significados só aparecem em uma janela:

```text
mensagem atual
+ mensagens anteriores relevantes
+ participantes
+ objetos abertos
+ projetos ativos
+ eventos temporais
```

A janela deve ser limitada por relevância, tempo e thread; não mandar toda a conversa ao modelo. Resumos de contexto devem ser derivados, versionados e vinculados às mensagens de origem.

## 14. Projeções para navegação

Criar projeções recalculáveis:

```text
conversation_context_view
├── conversation_id
├── main_parties
├── organizations
├── projects
├── areas
├── active_objects
├── open_attention
└── latest_relevant_event

party_context_view
├── party_id
├── roles
├── organizations
├── conversations
├── projects
├── objects
└── open_items

project_context_view
├── project_id
├── parties
├── conversations
├── groups
├── objects
├── files
├── decisions
├── risks
└── metrics
```

## 15. Atualização e consistência

Quando uma relação ou estado muda, publicar evento:

```text
context_link.created
context_link.updated
context_link.removed
entity.resolved
entity.merge_requested
project.context_changed
object.status_changed
```

As projeções e índices são atualizados de forma assíncrona, com eventual consistency explícita na interface. A tela pode mostrar “atualizando contexto” quando necessário.

## 16. Implementação incremental

### Etapa 1

Implementar filtros por workspace, conversa, grupo, pessoa, organização e projeto com relações explícitas criadas manualmente.

### Etapa 2

Adicionar extração automática de parties, projetos, ações e objetos com revisão.

### Etapa 3

Adicionar busca híbrida, aliases, entity linking, timeline e views por contexto.

### Etapa 4

Adicionar sugestões de associação, agrupamento por assunto, vínculos temporais e atenção antecipada.

### Etapa 5

Adicionar busca conversacional, navegação relacional e exportação semântica.

## 17. Critérios de qualidade

A indexação é boa quando:

- o usuário encontra o mesmo objeto por conversa, empresa, pessoa ou projeto;
- o resultado mostra a evidência correta;
- a busca não revela dados fora da permissão;
- grupos com assuntos diferentes não misturam contexto silenciosamente;
- relações ambíguas pedem confirmação;
- renomeações e mudanças preservam histórico;
- filtros estruturados respondem sem depender do LLM;
- perguntas abertas recuperam contexto relevante;
- cada associação pode ser corrigida e explicada;
- a latência percebida permanece aceitável.
