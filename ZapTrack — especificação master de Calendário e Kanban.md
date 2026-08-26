# ZapTrack — especificação master de Calendário e Kanban

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Escopo:** visões operacionais de tempo e fluxo sobre o núcleo universal de objetos de gestão.

> **Decisão central:** a timeline mostra o que aconteceu; o calendário mostra quando algo acontece ou vence; o Kanban mostra em que estado está e quem precisa agir; o Agora mostra o que merece atenção primeiro. Todas as vistas usam o mesmo objeto, estado, evidência e permissão.

## 1. Por que essas funções são essenciais

O ZapTrack não deve apenas organizar conversas. Ele precisa transformar a informação estruturada em trabalho executável. Para isso, o usuário precisa de duas leituras complementares:

```text
tempo  → Calendário
fluxo  → Kanban
```

Uma tarefa originada de uma conversa pode aparecer na timeline como compromisso identificado, no calendário como prazo de sexta, no Kanban como item aberto e no Agora como atenção. Nenhuma dessas vistas cria uma cópia.

## 2. Objetos que aparecem no calendário

O calendário contempla qualquer objeto com dimensão temporal:

```text
reunião
ligação
compromisso
tarefa com prazo
follow-up
aprovação
entrega
envio
pedido
pagamento prometido
cobrança
renovação
marco de projeto
SLA
período de contrato
```

A UI diferencia:

```text
acontece em        → starts_at/ends_at/scheduled_at
precisa até        → due_at
previsto para      → expected_at
ocorreu em         → occurred_at/delivered_at
mudou em           → state_changed_at
```

Não representar um prazo como se fosse automaticamente uma reunião ou evento agendado.

## 3. Modos de calendário

| Modo | Pergunta | Conteúdo |
|---|---|---|
| Dia | O que preciso fazer hoje? | Horários, prazos, atrasos, aprovações e ações rápidas |
| Semana | Como organizar minha semana? | Compromissos, carga, conflitos, dependências e prazos |
| Mês | O que está comprometido neste mês? | Marcos, entregas, pagamentos, reuniões e vencimentos |
| Ano | Quais ciclos são importantes? | Projetos, contratos, renovações, metas e marcos estratégicos |

A visão anual deve usar timeline, faixas ou heatmap; uma grade de 365 dias com microtarefas não é útil.

## 4. Camadas e filtros de calendário

```text
Minha agenda
Minha equipe
Projeto
Empresa/pessoa
Área
Todos os itens autorizados
```

Filtros:

```text
período
tipo de objeto
status
owner
empresa/pessoa
projeto
área
fonte
prioridade
atrasado
sem responsável
sem data
aguardando terceiros
```

A URL deve preservar escopo, período, filtros e modo de visualização.

## 5. Antecipação no calendário

O ZapTrack pode detectar conflitos, prazos próximos, dependências quebradas, sobrecarga, entregas sem confirmação e pagamentos vencendo. A recomendação deve ser explicável:

> A entrega do projeto Alfa vence amanhã, mas a aprovação do fornecedor ainda está pendente. Quer abrir a dependência?

A recomendação não altera calendário nem comunica terceiros automaticamente.

## 6. Kanban padrão

O quadro universal deve organizar o fluxo de execução:

```text
Novos / para revisar
→ Abertos
→ Em andamento
→ Aguardando alguém
→ Bloqueados
→ Concluídos
```

Atraso é uma dimensão transversal, não uma coluna obrigatória. Um item pode estar aberto e atrasado, em andamento e atrasado ou aguardando terceiro e atrasado.

## 7. Presets de Kanban

| Preset | Colunas/agrupamento | Uso |
|---|---|---|
| Execução | Novo, aberto, andamento, aguardando, bloqueado, concluído | Trabalho cotidiano |
| Atenção | Normal, próximo do prazo, atrasado, sem retorno, sem responsável, conflito | Exceções |
| Revisão da IA | Nova sugestão, revisar, conflito, confirmada, rejeitada | Qualidade semântica |
| Por responsável | Pessoas/equipes | Delegação e carga |
| Por projeto | Projetos/espaços do cliente | Governança de iniciativas |
| Por empresa/pessoa | Clientes, fornecedores, parceiros ou equipe | Gestão relacional |

Presets são melhores que um construtor genérico no início. A personalização deve vir depois do uso real.

## 8. Adaptação dos estados por domínio

| Domínio | Estados específicos | Fluxo universal |
|---|---|---|
| Tarefa | Open, InProgress, Blocked, Completed | Aberta, andamento, bloqueada, concluída |
| Caso | Open, Assigned, Resolved | Novo, andamento, concluído |
| Oportunidade | New, Proposal, Negotiation, Won, Lost | Novo, andamento, concluído/cancelado |
| Pedido | Requested, Approved, Processing, Shipped, Delivered | Novo, aguardando, andamento, concluído |
| Compra | Requested, Quoted, Approved, Ordered, Received | Novo, aguardando, andamento, concluído |
| Entrega | Planned, InTransit, Delayed, Delivered | Novo, andamento, atrasado, concluído |
| Pagamento | Promised, Pending, Completed, Failed | Aguardando, andamento, concluído, bloqueado |
| Decisão | Proposed, UnderReview, Approved, Executed | Revisar, andamento, concluído |

O status específico permanece no detalhe. O Kanban mostra o estado universal sem apagar o significado do domínio.

## 9. Card do Kanban

```text
[tipo] [prioridade] [atrasado]
Enviar proposta comercial
Alfa Tecnologia · Projeto Implantação Alfa
owner: Ana · vence: sexta
origem: Grupo Implantação Alfa
confiança: confirmada
[evidência] [abrir] [mostrar na conversa]
```

Atraso, bloqueio, ausência de responsável e baixa confiança precisam aparecer por texto e não somente por cor.

## 10. Interações

### Drag-and-drop

Mover um card para outra coluna deve:

```text
validar versão
→ validar permissão
→ validar transição
→ verificar ação implícita
→ pedir confirmação quando necessário
→ salvar estado
→ atualizar demais vistas
→ registrar auditoria
```

### Alteração no calendário

Arrastar um item informa qual campo muda:

```text
reunião → horário
 tarefa → prazo
entrega → previsão
pagamento → vencimento
```

Alteração de recorrência pergunta se afeta esta ocorrência, esta e as próximas ou toda a série.

### Ações em lote

Permitir atribuição, prioridade, adiamento, projeto e revisão quando a operação for homogênea e segura. Não liberar cobrança, pagamento, cancelamento ou mensagens externas em lote no início.

## 11. Navegação com evidência

Todo evento/calendário/card deve oferecer:

```text
abrir objeto
ver evidência
mostrar na conversa
abrir projeto
abrir empresa/pessoa
ver histórico
```

A origem conversacional permanece acessível em todas as vistas.

## 12. Sincronização

```text
alteração no calendário
  → ManagementObject atualizado
  → state_transition/due_date_changed
  → Kanban atualizado
  → timeline atualizada
  → Agora atualizado
  → agente reflete novo estado
```

Se houver atraso de projeção:

> O calendário foi atualizado. A busca e o Kanban serão atualizados em instantes.

Conflitos de edição não devem ser sobrescritos silenciosamente.

## 13. Modelo técnico

### CalendarProjection

```text
workspace_id
object_id
calendar_item_type
starts_at
ends_at
due_at
expected_at
timezone
project_id
party_ids
owner_id
status
attention_state
visibility
projection_version
```

### KanbanProjection

```text
workspace_id
object_id
board_preset
column_key
workflow_state
attention_state
owner_id
project_id
primary_party_id
due_at
priority
position
visibility
projection_version
```

`position` pertence à visão/preset, não ao objeto universal.

## 14. APIs

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
kanban.bulkUpdate
kanban.detectBottlenecks
views.save
views.list
views.delete
```

Cada mutation deve receber workspace, identidade, versão do objeto e idempotency key.

## 15. Roadmap

### MVP

Visão dia/semana, calendário de tarefas e compromissos, Kanban de execução, filtros por projeto/empresa/conversa, atraso, owner, evidência e `Mostrar na conversa`.

### MLP

Visão mês, presets de atenção e revisão, agrupamento por projeto/responsável, drag-and-drop seguro, conflitos, recorrência, views salvas e integração com timeline/agente.

### Posterior

Visão ano estratégica, carga de equipe, dependências avançadas, integrações de calendário externas, automações de baixo risco, métricas de fluxo e personalização de boards.

## 16. Critérios de aceite

1. O mesmo objeto aparece em timeline, calendário, Kanban e Agora.
2. Alterar prazo atualiza todas as vistas.
3. Mover card atualiza estado e histórico.
4. Atraso permanece separado do status.
5. Todo card e evento aponta para evidência e conversa.
6. Filtros por projeto, empresa, pessoa, conversa e área são combináveis.
7. Ações externas passam por política e confirmação.
8. Recorrência permite editar ocorrência ou série.
9. Conflitos não são sobrescritos silenciosamente.
10. Visão anual permanece legível e estratégica.
11. O sistema funciona para usuário solo, equipe e gestor.
12. A aplicação oferece alternativa acessível ao drag-and-drop.

## 17. Veredito

Calendário e Kanban são complementos naturais e indispensáveis da proposta do ZapTrack. A timeline responde **“o que aconteceu?”**; o calendário responde **“quando isso importa?”**; o Kanban responde **“em que estado está e quem precisa agir?”**.

> **O ZapTrack deve transformar conversa em contexto, contexto em objeto, objeto em calendário e fluxo, e fluxo em ação concluída — sem perder a evidência original.**
