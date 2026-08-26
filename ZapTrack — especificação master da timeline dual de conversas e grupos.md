# ZapTrack — especificação master da timeline dual de conversas e grupos

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Escopo:** visualização cronológica original e estruturada de conversas 1:1 e grupos.

> **Decisão central:** uma conversa deve possuir duas leituras sincronizadas: a conversa original, preservada como fonte humana e cronológica, e a timeline estruturada, organizada semanticamente em intenções, ações, decisões, objetos, arquivos, estados e evidências.

## 1. A função e o diferencial

A timeline é uma das funções centrais do ZapTrack porque transforma uma conversa longa em uma visão operacional sem apagar o contexto. Ela permite responder rapidamente:

```text
O que foi dito?
O que aconteceu?
O que foi decidido?
O que alguém solicitou?
Qual ação ficou combinada?
Qual objeto foi criado?
Qual arquivo sustenta isso?
O que está pendente ou atrasado?
```

A conversa original preserva o que as pessoas efetivamente escreveram, enviaram ou falaram. A timeline estruturada organiza o significado operacional. Uma vista complementa a outra.

## 2. Modos de visualização

### Conversa original

Exibe mensagens, respostas, citações, reações, mídias, arquivos e participantes na ordem da fonte.

### Timeline estruturada

Exibe eventos e objetos relevantes em ordem cronológica, agrupados por data, assunto ou tipo, sem exigir a leitura de todas as mensagens.

### Ambas

No desktop, mostra conversa e timeline em painéis sincronizados. No mobile, oferece abas `Conversa` e `Timeline`, com `Mostrar na conversa` sempre acessível.

## 3. Layout recomendado

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Grupo/Conversa · fonte · participantes · empresa · projeto              │
├────────────────────────────────────────────────────────────────────────┤
│ Buscar nesta conversa              [Conversa] [Timeline] [Ambas]        │
├────────────────────────────────────────────────────────────────────────┤
│ Período | Tipo | Intenção | Ação | Objeto | Arquivo | Pessoa | Projeto  │
├───────────────────────────────┬────────────────────────────────────────┤
│ Conversa original              │ Timeline estruturada                  │
│ 09:42 Ana: ...                │ 09:42 Solicitação de compra            │
│ 09:45 João: ...               │      evidência: mensagens 183–185      │
│ 09:47 proposta.pdf             │ 09:47 Arquivo recebido                  │
│                               │ 09:50 Decisão proposta                  │
│                               │      [mostrar na conversa]              │
└───────────────────────────────┴────────────────────────────────────────┘
```

## 4. Itens estruturados

| Item | O que representa |
|---|---|
| Mensagem relevante | Trecho que sustenta uma conclusão ou ação |
| Intenção/ato | Pergunta, solicitação, proposta, compromisso, aprovação ou reclamação |
| Ação | Agendar, cancelar, comprar, contratar, vender, cobrar, pagar, enviar, entregar ou concluir |
| Decisão | Escolha aprovada, rejeitada, comunicada ou executada |
| Objeto | Tarefa, compromisso, pedido, oportunidade, contrato, pagamento, entrega, caso ou risco |
| Arquivo | Documento, proposta, contrato, comprovante, áudio, imagem ou link |
| Estado | Aberto, em andamento, bloqueado, atrasado, concluído, cancelado ou aguardando |
| Relação | Associação com pessoa, empresa, projeto, área ou objeto |
| Atenção | Mudança, risco, atraso, ausência de retorno ou prazo próximo |

## 5. Timestamps

Não confundir os tempos. Cada item pode conter:

```text
message_sent_at
message_received_at
event_occurred_at
object_created_at
state_changed_at
due_at
processed_at
```

A ordenação principal usa `event_occurred_at` quando o evento está explicitamente indicado e possui confiança suficiente. Caso contrário, usa o timestamp da mensagem e sinaliza que o evento foi inferido.

A UI deve mostrar precisão e origem:

```text
27/08 10h · horário confirmado
até sexta · prazo interpretado
amanhã · prazo aproximado
sem data · não informado
```

## 6. Filtros

### Semânticos

```text
intenções/atos: pergunta, solicitação, proposta, compromisso, aprovação,
cancelamento, reagendamento, reclamação, elogio, feedback, decisão

ações: agendar, cancelar, reagendar, comprar, contratar, aprovar, vender,
cobrar, pagar, entregar, enviar, receber, revisar, atribuir, concluir

objetos: tarefa, compromisso, reunião, ligação, oportunidade, pedido, compra,
contrato, fatura, pagamento, entrega, caso, reclamação, decisão, risco

arquivos: documento, proposta, contrato, fatura, comprovante, imagem, áudio, link
```

### Contextuais

```text
data/período
palavra-chave
pessoa
empresa/organização
papel: cliente, fornecedor, parceiro, colaborador
projeto/espaço do cliente
área
responsável
status
prioridade
fonte/canal
tipo de conversa: 1:1 ou grupo
confiança
evidência disponível
```

Filtros devem ser combináveis e visíveis como chips. A timeline deve indicar quantos itens foram encontrados e quantas mensagens de contexto foram ocultadas.

## 7. Busca

A busca dentro da conversa suporta:

```text
palavra literal: “preço”
frase: “aprovação da compra”
pergunta: “quando combinamos a entrega?”
consulta estruturada: “decisões sem execução”
```

A resposta deve explicar se o resultado veio de termo exato, filtro estruturado ou significado semelhante. O usuário pode salvar a busca como view, por exemplo:

```text
Entregas atrasadas do projeto Alfa
Decisões sem execução
Arquivos de contrato da Beta
Mensagens 1:1 com clientes sem retorno
```

## 8. Agrupamento

Permitir agrupar por dia, semana, assunto, intenção, ação, objeto, projeto, empresa, pessoa, estado ou arquivo. O agrupamento é uma camada de leitura e não altera a cronologia real.

Exemplo:

```text
26/08 · 09:42–10:05 · Solicitação e aprovação de compra
  5 mensagens · 1 arquivo · 1 decisão
  [expandir]
```

Mensagens sociais e sem significado gerencial continuam disponíveis na conversa original e podem ficar em contexto secundário na timeline.

## 9. Mostrar na conversa

Essa ação deve existir em qualquer item estruturado, objeto ou evidência.

### Timeline → conversa

```text
clicar Mostrar na conversa
  → localizar evidência direta
  → abrir modo Conversa ou Ambas
  → carregar janela de contexto
  → rolar até a mensagem principal
  → destacar o trecho
  → permitir voltar à timeline filtrada
```

O destaque deve incluir mensagens anteriores e posteriores suficientes para compreensão. O usuário não deve ser levado apenas a uma mensagem isolada quando o significado depender de uma troca.

### Objeto → conversa

Se o objeto veio de várias mensagens, exibir a principal e indicar:

> Este objeto foi criado a partir de 3 evidências. Ver mensagem principal ou todas as evidências.

### Conversa → objeto

Marcadores semânticos nas mensagens permitem abrir o evento, o objeto, o status, o responsável, o prazo e as ações disponíveis.

## 10. Navegação contextual

O cabeçalho deve mostrar:

```text
tipo: 1:1 ou grupo
nome/título
fonte e status de processamento
participantes
empresa/pessoa relacionada
projetos relacionados
objetos abertos
```

Chips de empresa, projeto, área e objeto são navegáveis. Ao sair para outra lente, preservar a origem e permitir voltar.

## 11. Grupos e múltiplos projetos

Um grupo pode ter projeto padrão, mas também assuntos paralelos. A timeline deve suportar:

```text
Projeto: Todos
├── Implantação Alfa · 24 eventos
├── Renovação Alfa · 8 eventos
└── Sem projeto · 13 eventos
```

Associações podem ser por conversa inteira, período, thread, assunto, mensagem ou exceção. Uma mensagem explicitamente fora do projeto não deve ser reclassificada automaticamente.

## 12. Fato versus interpretação

| Nível | Forma de apresentação |
|---|---|
| Literal | “Ana escreveu…” |
| Observado | “Arquivo recebido” |
| Interpretado | “Parece uma solicitação de compra” |
| Sugerido | “Sugestão de tarefa” |
| Confirmado | “Tarefa criada” |
| Executado | “Lembrete criado” |

A timeline deve deixar claro quando está mostrando uma inferência da IA.

## 13. Modelo de dados

A timeline é uma projeção:

```text
Message
InteractionEvent
Evidence
ManagementObject
StateTransition
  ↓
ConversationTimelineItem
```

Campos mínimos:

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
occurred_at
message_sent_at
created_at
state_changed_at
due_at
label
summary
status
confidence
evidence_count
sort_key
visibility
metadata
```

A projeção é atualizada por eventos, mas as mensagens, eventos, objetos e evidências continuam sendo a fonte de verdade.

## 14. APIs

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

`conversation.show_in_conversation` deve retornar `conversation_id`, `primary_message_id`, `message_ids`, janela de contexto e seletor de destaque.

## 15. Implementação incremental

### MVP

Implementar Conversa original, Timeline estruturada básica, timestamps de mensagem/evento, filtros por período/tipo/palavra-chave, marcadores de objeto, evidência e `Mostrar na conversa`.

### MLP

Adicionar filtros por pessoa, empresa, projeto, intenção, ação, arquivo e estado; agrupamento; modo Ambas; busca híbrida; views salvas; timeline parcial e revisão da IA.

### Posterior

Adicionar agrupamento avançado por assunto, janelas temporais semânticas, múltiplos projetos por thread, métricas temporais e sincronização com fontes externas adicionais.

## 16. Critérios de aceite

1. O usuário alterna entre conversa e timeline sem perder posição ou filtros.
2. Todo objeto mostra sua evidência e possui `Mostrar na conversa`.
3. A função leva à mensagem correta e destaca o trecho relevante.
4. Itens com múltiplas mensagens mostram evidência principal e complementares.
5. A timeline diferencia tempos de mensagem, evento, criação, estado e prazo.
6. Filtros combinados retornam somente itens autorizados.
7. Mensagens sem classificação continuam visíveis na conversa original.
8. A busca literal não é confundida com a busca semântica.
9. Grupos podem conter vários projetos sem duplicação.
10. Correções atualizam a timeline, o objeto, o projeto e a empresa.
11. Timeline parcial informa processamento incompleto.
12. O sistema nunca apresenta ausência de evento como prova de que nada aconteceu.

## 17. Veredito

Essa função é **inteligente, eficaz e estratégica**. Ela materializa a proposta do ZapTrack melhor do que um simples dashboard ou uma lista de tarefas. A conversa continua sendo a fonte humana; a timeline passa a ser a fonte operacional de leitura; e o vínculo entre ambas produz confiança.

> **O ZapTrack deve permitir ler a conversa como ela aconteceu e, com um único movimento, enxergar tudo o que ela gerou em gestão — depois voltar à mensagem original para conferir, compreender e agir.**

## Documento visual

![Fluxo da timeline dual](https://private-us-east-1.manuscdn.com/sessionFile/6kyDMg1hYN0vL138nYOYJh/sandbox/YCQoeX7IzkuI8KSCkrquSn-images_1787771639616_na1fn_L2hvbWUvdWJ1bnR1L3phcHRyYWNrX2NvbnZlcnNhdGlvbl90aW1lbGluZV9mbG93.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNmt5RE1nMWhZTjB2TDEzOG5ZT1lKaC9zYW5kYm94L1lDUW9lWDdJemt1SThLU0NrcnF1U24taW1hZ2VzXzE3ODc3NzE2Mzk2MTZfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzcGhjSFJ5WVdOclgyTnZiblpsY25OaGRHbHZibDkwYVcxbGJHbHVaVjltYkc5My5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3ODk0MzA0MDB9fX1dfQ__&Key-Pair-Id=K2QY5QTL8JSY6C&Signature=MEQCIEpBPRc99zLEl03sJd2lyyC3JAxmAPT0S6w75EPA0IfmAiAMBgvXVTcDfXNxq2Vcgoc6L~nxacXOkTex2p9QiL30dQ__)
