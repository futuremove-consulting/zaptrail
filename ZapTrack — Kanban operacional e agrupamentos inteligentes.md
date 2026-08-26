# ZapTrack — Kanban operacional e agrupamentos inteligentes

## 1. Objetivo

O Kanban deve responder:

```text
O que está por fazer?
O que está em andamento?
O que aguarda alguém?
O que está bloqueado?
O que está atrasado?
O que foi concluído?
```

Ele é uma visão de fluxo de trabalho, não uma segunda fonte de verdade.

## 2. Preset padrão

```text
Novos / para revisar
→ Abertos
→ Em andamento
→ Aguardando alguém
→ Bloqueados
→ Concluídos
```

`Atrasado` aparece como selo e filtro transversal. Não deve ser uma coluna exclusiva porque uma tarefa pode estar atrasada e ainda aberta, em andamento ou aguardando terceiro.

## 3. Presets de quadro

### Fila de execução

Colunas por estado operacional:

```text
Novos → Abertos → Em andamento → Aguardando → Bloqueados → Concluídos
```

### Fila de atenção

Colunas por condição:

```text
Normal → Próximo do prazo → Atrasado → Sem retorno → Sem responsável → Conflito
```

### Revisão da IA

Colunas por maturidade da interpretação:

```text
Nova sugestão → Revisar → Conflito → Confirmada → Rejeitada
```

### Por responsável

Cada coluna representa uma pessoa/equipe. O cabeçalho mostra quantidade aberta, vencida e bloqueada.

### Por projeto

Cada coluna representa um projeto ou espaço do cliente. O cabeçalho mostra itens abertos, risco e próximo marco.

### Por empresa/pessoa

Cada coluna representa um cliente, fornecedor, parceiro ou equipe. Útil para acompanhamento relacional, mas não deve ser o quadro padrão.

## 4. Adaptação por tipo de objeto

Cada objeto possui estados específicos, mas mapeia para estados universais:

| Domínio | Estados específicos | Mapeamento universal |
|---|---|---|
| Tarefa | Open, InProgress, Blocked, Completed | Aberta, andamento, bloqueada, concluída |
| Caso | Open, Assigned, InProgress, Resolved | Novo, andamento, concluído |
| Oportunidade | New, Qualified, Proposal, Negotiation, Won, Lost | Novo, andamento, concluído/cancelado |
| Pedido | Requested, Approved, Processing, Shipped, Delivered | Novo, aguardando, andamento, concluído |
| Compra | Requested, Quoted, Approved, Ordered, Received | Novo, aguardando, andamento, concluído |
| Entrega | Planned, Scheduled, InTransit, Delayed, Delivered | Novo, andamento, atrasado, concluído |
| Pagamento | Promised, Pending, Completed, Failed | Aguardando, andamento, concluído, bloqueado |
| Decisão | Proposed, UnderReview, Approved, Executed | Revisar, andamento, concluído |

O usuário pode ver o estado específico no card e o estado universal na coluna. Não converter silenciosamente “perdida” em “concluída”; preservar o domínio.

## 5. Card de Kanban

```text
┌──────────────────────────────────────────────────┐
│ [tipo] [prioridade] [atrasado]                   │
│ Enviar proposta comercial                        │
│ Alfa Tecnologia · Implantação Alfa               │
│ owner: Ana · vence: sexta                        │
│ origem: Grupo Implantação Alfa                   │
│ confiança: confirmada                            │
│ [evidência] [abrir] [mostrar na conversa]        │
└──────────────────────────────────────────────────┘
```

Mostrar no máximo os atributos que orientam a ação. Informações detalhadas ficam no drawer/detalhe.

## 6. Interações

### Abrir

Clicar no card abre detalhe lateral preservando o board.

### Arrastar

Arrastar pode mudar estado somente quando:

```text
há permissão
estado é compatível
não há ação externa implícita
não há aprovação necessária
```

Ao arrastar um pedido para `Concluído`, o sistema deve confirmar se concluir significa apenas registrar conclusão interna ou executar uma ação externa.

### Alterar owner

Arrastar para coluna de pessoa pode delegar. Exigir confirmação na primeira utilização e registrar auditoria.

### Alterar prazo

Arrastar no modo calendário pode alterar `due_at`. Não alterar `starts_at`, envio, entrega ou compromisso externo sem confirmação.

### Ação em lote

Permitir somente operações reversíveis e homogêneas:

```text
atribuir
alterar prioridade
alterar projeto
adiar
marcar revisão
silenciar atenção
```

## 7. Filtros do board

```text
projeto
empresa/pessoa
conversa/grupo
área
tipo de objeto
owner
status
prioridade
prazo
atraso
confiança
fonte
```

O board deve preservar filtros na URL e oferecer `salvar visão`.

## 8. Limites inteligentes

Mostrar alerta quando:

```text
uma coluna ultrapassar volume configurável
uma pessoa acumular muitos itens
há muitos cards sem prazo
há muitos itens aguardando terceiros
há dependências bloqueando o fluxo
```

Não impor WIP rígido no início. Recomendar limites com base no uso e permitir configuração posterior.

## 9. Atenção e exceções

Badges transversais:

```text
vence hoje
atrasado
sem responsável
sem evidência
sem retorno
bloqueado
conflito
revisão necessária
```

O filtro `Atrasado` deve considerar prazo e timezone. `Sem retorno` deve apresentar intervalo de silêncio e base de comparação.

## 10. Integração com timeline e conversa

Cada card deve permitir:

```text
ver evidência
mostrar na conversa
abrir timeline da conversa
abrir empresa/pessoa
abrir projeto
ver histórico de estados
```

Quando o usuário confirmar ou corrigir um objeto na timeline, o card é atualizado. Quando o usuário mover o card, o histórico da conversa não muda; apenas o estado operacional do objeto.

## 11. Integração com calendário

O mesmo objeto com `due_at`, `starts_at` ou `ends_at` aparece no calendário. Alterar data no calendário atualiza o card e vice-versa.

```text
Kanban: Enviar proposta · Aberta · vence sexta
Calendário: marcador em sexta
Timeline: compromisso identificado em 26/08
Conversa: mensagem de origem destacada
```

## 12. Kanban por projeto

No projeto, o preset recomendado é:

```text
Backlog/revisar
A fazer
Em andamento
Aguardando
Bloqueado
Concluído
```

O resumo do projeto mostra quantidade por coluna, atraso, risco, próximo marco e itens sem owner.

## 13. Kanban por relacionamento

Na página de empresa/pessoa, o preset recomendado é:

```text
A fazer com esta parte
Aguardando resposta
Comprometido
Em negociação
Resolvido
```

Não misturar automaticamente tarefas internas com estados do cliente. A coluna deve declarar se representa estado operacional ou estágio relacional.

## 14. Kanban por revisão semântica

A fila de IA deve permitir revisar:

```text
mensagem → evento → objeto → party → projeto → estado → prazo
```

Cada correção atualiza o objeto e registra a versão anterior. A coluna `Confirmada` significa revisão humana ou regra suficientemente confiável; não significa execução concluída.

## 15. Mobile

No mobile, não renderizar um board horizontal enorme. Usar:

```text
seletor de coluna
lista de cards da coluna
swipe ou mover por menu
```

A ação primária deve ser abrir, ver evidência, alterar estado ou delegar. O desktop oferece drag-and-drop e comparação entre colunas.

## 16. Estados do board

```text
loading
ready
empty_board
no_results
filtered
partial
permission_limited
stale_projection
action_pending
saving
success
error
```

`stale_projection` deve informar que o board pode estar alguns segundos atrás da fonte operacional e oferecer atualizar.

## 17. Critérios de eficácia

O Kanban é útil quando o usuário consegue:

```text
ver o fluxo real
identificar atraso
entender owner e projeto
abrir evidência
mover/alterar com segurança
voltar à conversa
```

Ele falha quando vira uma parede de cards sem prioridade, contexto, prazo ou origem.
