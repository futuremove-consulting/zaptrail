# ZapTrack — interações, sincronização e ações seguras

## 1. Regra de consistência

Calendário, Kanban, timeline, conversa, empresa/pessoa e projeto são vistas do mesmo `ManagementObject`.

```text
alterar no calendário
  → atualizar objeto
  → registrar transição
  → atualizar Kanban
  → atualizar timeline
  → atualizar Agora
  → refletir no agente
```

O mesmo vale para alteração feita no Kanban, timeline ou WhatsApp.

## 2. Navegação entre vistas

No cabeçalho de cada contexto, oferecer:

```text
[Timeline] [Lista] [Calendário] [Kanban]
```

O contexto e os filtros devem ser preservados na troca:

```text
Projeto: Alfa
Empresa: Alfa Tecnologia
Período: este mês
Status: aberto
```

Se uma vista não suportar algum filtro, explicar o que foi mantido ou convertido.

## 3. Ações de baixo risco

Podem ser feitas com uma confirmação visual simples:

```text
abrir objeto
ver evidência
mostrar na conversa
alterar prioridade
atribuir tarefa interna
marcar como em andamento
marcar como concluído
adiar lembrete
silenciar atenção
```

## 4. Ações de médio risco

Exigem confirmação curta:

```text
alterar owner
alterar prazo
mover pedido de estado
reagendar compromisso interno
criar compromisso
criar aprovação
```

Exemplo:

> Alterar a tarefa “Enviar proposta” para Ana e prazo para sexta às 17h?

## 5. Ações de alto risco

Exigem confirmação forte, aprovação ou abertura na aplicação:

```text
cancelar compromisso externo
cancelar pedido
enviar mensagem a cliente
cobrar
registrar pagamento
alterar contrato
exportar dados
excluir objeto/fonte
```

O Kanban não deve permitir que um simples arrastar execute ação externa sem passar pelo policy gate.

## 6. Drag-and-drop no Kanban

### Mover entre colunas

```text
arrastar card
  → validar permissão
  → validar transição
  → identificar ação implícita
  → pedir confirmação se necessário
  → salvar estado
  → registrar auditoria
```

### Conflito

Se o card foi alterado por outra pessoa enquanto era arrastado:

> Este item foi atualizado por João. Ver a versão atual antes de mover?

Não sobrescrever silenciosamente.

## 7. Arrastar no calendário

Mover um evento pode alterar `starts_at`/`ends_at`; mover um prazo altera `due_at`. O sistema deve indicar qual campo será alterado.

```text
Reunião → alterar horário
Tarefa → alterar prazo
Entrega → alterar previsão
Pagamento → alterar vencimento somente com permissão
```

A alteração de uma série recorrente deve perguntar:

```text
Somente esta ocorrência
Esta e as próximas
Toda a série
```

## 8. Filtros persistentes

Filtros devem ficar na URL e em views salvas:

```text
/project/alfa/kanban?group_by=owner&status=open&overdue=true
```

A URL não deve carregar conteúdo secreto para usuários sem permissão. O backend valida o escopo.

## 9. Presets

Oferecer presets para reduzir decisões:

```text
Minha semana
Atenção da equipe
Aguardando terceiros
Atrasados
Por projeto
Por cliente
Revisão da IA
```

O usuário pode personalizar depois.

## 10. Sincronização eventual

Quando uma atualização ainda estiver sendo processada:

```text
salvando...
atualizando outras vistas...
concluído
```

Se o índice estiver atrasado:

> O Kanban foi atualizado. A busca e o calendário serão atualizados em instantes.

Não esconder eventual consistency.

## 11. Relação com a timeline

Cada card/evento possui:

```text
Ver timeline
Ver evidência
Mostrar na conversa
```

Na timeline, cada item possui:

```text
Abrir no calendário
Abrir no Kanban
Abrir objeto
```

A troca preserva `object_id`, `conversation_id`, `message_id` e filtros compatíveis.

## 12. Relação com o agente

Perguntas:

```text
“Quais tarefas minhas vencem esta semana?”
“Mostre o Kanban do projeto Alfa.”
“O que está bloqueado?”
“Quem está sobrecarregado?”
“Coloque a entrega da Alfa para sexta.”
```

O agente deve responder com resumo e link para a vista. Para alterações, apresentar alvo, campos e confirmação.

## 13. Antecipação

O ZapTrack pode recomendar uma organização de vista:

> Você tem 12 itens aguardando terceiros e 4 atrasados. Quer abrir a fila de atenção?

Ou:

> Seu calendário tem três prazos sem responsável. Quer ver somente esses itens?

Recomendações não devem alterar o board ou calendário sem ação do usuário.

## 14. Histórico

Toda alteração deve registrar:

```text
quem alterou
quando
antes/depois
origem: aplicação, agente ou integração
motivo/confirmacao
correlation_id
```

O detalhe do objeto exibe o histórico de estados e prazos.

## 15. Ações em lote

Permitir lote quando:

```text
itens são do mesmo workspace
usuário possui permissão
operação é homogênea
operação é reversível ou auditável
não há efeitos externos escondidos
```

Exemplos: atribuir, alterar prioridade, mover para revisão, adiar e associar projeto. Bloquear lote para cobrança, pagamento, cancelamento e mensagens externas no início.

## 16. Offline e conexão instável

No mobile, permitir rascunho local de alteração de baixo risco. Sincronizar quando voltar a conexão e mostrar conflito se a versão mudou. Não confirmar operação externa offline.

## 17. Acessibilidade

Todo drag-and-drop deve possuir alternativa por menu:

```text
Mover para...
Alterar estado...
Atribuir a...
Alterar prazo...
```

Cores de atraso, bloqueio e prioridade devem ter texto e ícones equivalentes.

## 18. Critérios de aceite

1. Alterar um objeto em uma vista atualiza as outras.
2. O sistema não confunde atraso com coluna de status.
3. Ações externas exigem política e confirmação.
4. Filtros e escopo são preservados na navegação.
5. Conflitos de edição não são sobrescritos silenciosamente.
6. Todo card e evento mantém vínculo com evidência e conversa.
7. Presets ajudam o usuário sem impedir personalização.
8. O Kanban e o calendário funcionam para solo, equipe e projeto.
