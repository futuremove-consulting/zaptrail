# ZapTrack — modelo da timeline dual de conversa e grupo

## 1. Decisão de produto

A tela de uma conversa ou grupo deve possuir duas leituras sincronizadas:

```text
Conversa original
  = sequência humana, literal e cronológica das mensagens

Timeline estruturada
  = sequência semântica dos acontecimentos, intenções, ações, decisões,
    objetos, arquivos, estados e evidências
```

A interface deve permitir alternar entre as duas vistas e, quando possível, visualizar ambas em paralelo. As duas vistas apontam para os mesmos `message_id`, `event_id`, `object_id` e `evidence_id`.

## 2. Por que isso é central

A conversa original preserva contexto, tom, nuances e prova. A timeline estruturada reduz o ruído e torna encontráveis os fatos gerenciais. Uma vista sem a outra seria insuficiente:

- somente conversa: o usuário precisa reler tudo;
- somente timeline: o usuário pode perder contexto e desconfiar da interpretação;
- vistas sincronizadas: o usuário entende, verifica e age.

## 3. Estrutura da tela

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Grupo/Conversa · participantes · empresa · projeto · fonte            │
├───────────────────────────────────────────────────────────────────────┤
│ Busca nesta conversa                    [Conversa] [Timeline] [Ambas] │
├───────────────────────────────────────────────────────────────────────┤
│ Filtros: período · tipo · ação · objeto · arquivo · pessoa · projeto  │
├───────────────────────────────┬───────────────────────────────────────┤
│ Conversa original              │ Timeline estruturada                 │
│                               │                                       │
│ 09:42 Ana: ...                │ 09:42 Solicitação de compra           │
│ 09:45 João: ...               │      evidência: mensagens 183–185     │
│ 09:47 arquivo.pdf              │ 09:47 Arquivo recebido                 │
│                               │ 09:50 Decisão proposta                 │
│                               │      [mostrar na conversa]             │
└───────────────────────────────┴───────────────────────────────────────┘
```

No mobile, usar alternância entre abas `Conversa` e `Timeline`, com uma ação persistente `Mostrar na conversa`. No desktop, oferecer modo dividido redimensionável.

## 4. Tipos de itens da timeline estruturada

A timeline deve combinar itens de natureza diferente, sempre diferenciados visualmente e por texto:

| Tipo | Exemplo | Fonte |
|---|---|---|
| Mensagem relevante | “Vamos enviar sexta” | Message |
| Intenção | Solicitação de cotação | InteractionEvent |
| Ação de negócio | Agendar, comprar, cobrar, entregar | InteractionEvent |
| Decisão | Proposta aprovada/rejeitada | Decision/Event |
| Compromisso | “Eu envio até sexta” | Commitment |
| Objeto criado | Tarefa, pedido, oportunidade | ManagementObject |
| Mudança de estado | Pedido confirmado → enviado | StateTransition |
| Arquivo | Proposta.pdf, comprovante.jpg | Attachment/Document |
| Pessoa/empresa | Alfa resolvida como organização | EntityResolution |
| Relação | Grupo associado ao projeto Alfa | ContextLink |
| Atenção | Entrega em risco | AttentionItem |
| Ação do usuário | Objeto corrigido/confirmado | AuditLog/Feedback |

## 5. Tempo e timestamps

Uma timeline confiável precisa distinguir vários tempos:

```text
message_sent_at       = quando a mensagem foi enviada
message_received_at   = quando o ZapTrack a recebeu
occurred_at           = quando o evento descrito aconteceu
created_at            = quando o objeto foi criado
state_changed_at      = quando o estado mudou
due_at                = prazo/vencimento
processed_at          = quando a IA processou
```

A ordenação principal deve usar `occurred_at` quando a confiança e a precisão forem suficientes; caso contrário, usar `message_sent_at` e mostrar a distinção.

### Exemplo

```text
26/08 09:42  mensagem enviada
26/08 09:42  “Vou entregar amanhã”
27/08 00:00  compromisso vence/inicia janela
27/08 18:00  atenção: sem evidência de entrega
28/08 10:12  usuário registra entrega
```

A interface deve exibir timezone do workspace e sinalizar datas inferidas ou aproximadas:

```text
27/08 10h · horário confirmado
amanhã · horário aproximado
até sexta · prazo interpretado
sem data · tempo não informado
```

## 6. Cabeçalho e contexto

```text
[1:1 ou Grupo] Nome da conversa
Fonte · última atividade · status de processamento

Participantes: Ana · Alfa Tecnologia · Equipe Operações
Empresas: Alfa Tecnologia
Projetos: Implantação Alfa · Renovação 2026
Áreas: Operações · Comercial
Objetos abertos: 4
```

Os chips de empresa, projeto, área e objeto são navegáveis e abrem a respectiva lente sem perder a posição da timeline.

## 7. Filtros obrigatórios

### Filtros semânticos

```text
intenções/atos
├── pergunta
├── solicitação
├── informação
├── proposta
├── compromisso
├── aprovação
├── cancelamento
├── reagendamento
├── reclamação
├── elogio
└── decisão

ações
├── agendar
├── comprar
├── vender
├── contratar
├── cobrar
├── pagar
├── enviar
├── entregar
├── revisar
├── aprovar
└── concluir

objetos
├── tarefa
├── compromisso
├── reunião/ligação
├── oportunidade
├── pedido
├── compra
├── contrato
├── fatura
├── pagamento
├── entrega
├── caso/reclamação
├── decisão
└── risco

arquivos
├── documento
├── proposta
├── contrato
├── fatura
├── comprovante
├── imagem
├── áudio
└── link
```

### Filtros contextuais

```text
data/período
palavra-chave
pessoa
empresa/organização
projeto
área
responsável
status
prioridade
fonte/canal
tipo de conversa: 1:1 ou grupo
mensagens com evidência
mensagens sem classificação
confiança
```

Os filtros devem ser combináveis. Exemplo:

```text
projeto = Implantação Alfa
+ tipo = grupo
+ ação = entregar
+ status = atrasado
+ período = agosto
```

## 8. Busca dentro da conversa

A busca deve aceitar palavra, frase e pergunta:

```text
“preço”
“quando combinamos a entrega?”
“tudo sobre aprovação”
“arquivos enviados em agosto”
“decisões ainda não executadas”
```

Resultados devem ser agrupados:

```text
Mensagens: 12
Intenções: 3
Objetos: 2
Decisões: 1
Arquivos: 4
```

A busca por palavra-chave deve encontrar a mensagem literal. A busca semântica deve encontrar significado relacionado, mas informar essa diferença.

## 9. Alternância entre vistas

### Modo Conversa

Mostra a ordem original, mensagens, reações, respostas, arquivos e participantes. Mensagens relevantes recebem marcadores discretos:

```text
[decisão]
[compromisso]
[pedido]
[arquivo]
[atenção]
```

### Modo Timeline

Mostra apenas eventos e objetos relevantes, agrupados por data e tipo, com o mínimo de texto necessário e link para evidência.

### Modo Ambas

No desktop, mantém a conversa à esquerda e timeline à direita. O scroll pode ser sincronizado pelo timestamp; ao clicar em um item, o outro painel focaliza a origem.

## 10. Função “mostrar na conversa”

### Origem: timeline → conversa

Ao clicar em `Mostrar na conversa`:

1. identificar uma ou várias mensagens de evidência;
2. abrir o modo Conversa ou o painel dividido;
3. rolar até a primeira mensagem de origem;
4. destacar o trecho por alguns segundos sem movimento excessivo;
5. mostrar mensagens de contexto antes/depois;
6. oferecer `voltar para timeline`;
7. preservar filtros e posição anterior.

### Origem: objeto → conversa

Se o objeto foi derivado de várias mensagens, mostrar:

```text
Este objeto foi criado a partir de 3 evidências
[Mensagem principal]
[Ver outras 2]
```

O destaque deve indicar se a mensagem é evidência direta, contexto ou confirmação posterior.

### Origem: conversa → timeline

Ao clicar no marcador de uma mensagem, abrir o painel do evento/objeto correspondente:

```text
Mensagem
  → evento identificado
  → objeto relacionado
  → estado
  → responsável/prazo
  → ações
```

## 11. Agrupamento inteligente

Agrupar itens quando isso reduz ruído, mas permitir expandir:

```text
26/08 · 09:42–10:05 · Solicitação e aprovação de compra
  5 mensagens · 1 arquivo · 1 decisão
  [expandir]
```

O agrupamento deve usar thread, proximidade temporal, assunto, participantes e relação com objeto. Não unir mensagens apenas porque ocorreram próximas.

## 12. Diferenciar fato, proposta e interpretação

Cada item deve mostrar seu nível:

| Nível | Apresentação |
|---|---|
| Mensagem literal | “Ana escreveu…” |
| Evento observado | “Arquivo recebido” |
| Interpretação | “Parece uma solicitação de compra” |
| Objeto sugerido | “Sugestão de tarefa” |
| Objeto confirmado | “Tarefa criada” |
| Ação executada | “Lembrete criado” |

A timeline não deve transformar inferências em fatos sem sinalização.

## 13. Contexto por grupos

O grupo pode ter projeto padrão, mas a timeline deve aceitar múltiplos contextos:

```text
Filtro de projeto: Todos
├── Implantação Alfa · 24 eventos
├── Renovação Alfa · 8 eventos
└── Sem projeto · 13 eventos
```

Mensagens fora do assunto podem aparecer em `Sem projeto` ou receber associação específica.

## 14. Filtros salvos e views

O usuário deve poder salvar views:

```text
“Entregas atrasadas do projeto Alfa”
“Decisões da diretoria deste mês”
“Mensagens 1:1 com clientes sem retorno”
“Arquivos e comprovantes da Beta”
```

Views salvas devem guardar filtros, ordenação, agrupamento e escopo, nunca copiar dados.

## 15. Estados de interface

```text
processando mensagens
timeline parcial
sem eventos estruturados
sem evidência suficiente
filtro sem resultado
permissão limitada
fonte indisponível
mensagens fora do período de retenção
objeto arquivado
```

Quando a timeline estiver incompleta, informar o motivo. Nunca apresentar ausência de evento como prova de que nada aconteceu.

## 16. Implementação

### Modelo de leitura

Criar uma projeção `conversation_timeline_items`:

```text
id
workspace_id
conversation_id
item_type
source_message_ids
source_event_ids
object_id
party_ids
project_ids
area_ids
occurred_at
message_sent_at
created_at
due_at
label
summary
status
confidence
evidence_count
sort_key
visibility
```

A projeção é atualizada por eventos e pode ser recalculada. Mensagem, evento e objeto continuam sendo as fontes de verdade.

### APIs

```text
conversation.timeline
conversation.messages
conversation.search
conversation.timelineFilters
conversation.timelineItem
conversation.showInConversation
conversation.context
conversation.savedViews
```

`showInConversation` deve retornar `conversation_id`, `message_ids`, `primary_message_id`, `context_window_before`, `context_window_after` e `highlight_selector`.

### Componentes

```text
ConversationHeader
ConversationTabs
ConversationTimeline
StructuredTimeline
TimelineItem
TimelineGroup
TimelineFilters
TimelineSearch
EvidenceMarker
ShowInConversationButton
SynchronizedScroll
ContextChips
SavedViewMenu
```

## 17. Critérios de aceite

1. O usuário alterna entre conversa original e timeline sem perder posição.
2. Um objeto mostra a mensagem/trecho que o originou.
3. `Mostrar na conversa` leva ao ponto correto e destaca a evidência.
4. A timeline diferencia timestamp de mensagem, ocorrência, criação e prazo.
5. Filtros combinados retornam somente itens autorizados.
6. Palavra-chave busca literal; pergunta busca semântica e explica o resultado.
7. Um grupo pode conter mais de um projeto sem reclassificação destrutiva.
8. Mensagens sem classificação continuam visíveis.
9. Objetos de múltiplas mensagens exibem todas as evidências.
10. Correção no timeline atualiza conversa, objeto, projeto e empresa.
11. Timeline parcial comunica processamento incompleto.
12. A experiência é útil para 1:1, grupo, autônomo e equipe.
