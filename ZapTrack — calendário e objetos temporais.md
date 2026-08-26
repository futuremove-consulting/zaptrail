# ZapTrack — calendário e objetos temporais

## 1. Objetivo

O calendário deve transformar o tempo disperso nas conversas em uma agenda operacional única, sem confundir compromisso, prazo, previsão e evento concluído.

## 2. Tipos temporais

| Tipo temporal | Exemplo | Como aparece |
|---|---|---|
| Evento com horário | Reunião amanhã às 10h | Bloco de horário |
| Intervalo | Projeto de 1 a 30/09 | Faixa de período |
| Prazo | Enviar proposta até sexta | Marcador de vencimento |
| Previsão | Entrega prevista para 15/09 | Linha pontilhada/estado previsto |
| Vencimento | Fatura vence dia 10 | Marcador financeiro |
| Recorrência | Reunião toda segunda | Série recorrente |
| Estado ocorrido | Pedido entregue às 16h | Registro na timeline |
| Dependência | Aprovação necessária antes da compra | Indicador de bloqueio |

## 3. Visão dia

A visão dia é executável e deve mostrar:

```text
horários e compromissos
prazos do dia
itens atrasados
aprovações
entregas
pagamentos prometidos
follow-ups
```

Cada item contém título, tipo, horário/prazo, owner, party, projeto, status e ação rápida.

## 4. Visão semana

A semana é a visão padrão para planejamento. Deve mostrar:

```text
compromissos
prazos
carga por dia
conflitos
itens sem data
dependências
atrasos
```

Permitir agrupar por owner, projeto, empresa/pessoa, área ou tipo. A recomendação de planejamento deve ser opcional e explicável.

## 5. Visão mês

A visão mensal deve focar compromissos, vencimentos, marcos e concentração de carga. Não exibir cada microtarefa como uma etiqueta ilegível. Tarefas podem ser agregadas:

```text
12 itens neste dia
3 atrasados
2 marcos
1 pagamento
```

Clicar abre a lista daquele dia.

## 6. Visão ano

A visão anual não deve ser uma grade de 365 dias. Usar timeline, faixas ou heatmap para:

```text
projetos
renovações
contratos
metas
campanhas
eventos recorrentes
marcos estratégicos
```

A visão anual ajuda o proprietário/gestor a ver ciclos e concentração de compromissos.

## 7. Escopos e camadas

```text
Minha agenda
Minha equipe
Projeto
Empresa/pessoa
Área
Todos os itens autorizados
```

Cada camada pode ser ligada/desligada. O usuário deve saber quando está vendo sua agenda, a equipe ou a empresa inteira.

## 8. Filtros

```text
data/período
objeto
status
owner
empresa/pessoa
projeto
área
fonte
prioridade
atraso
sem responsável
sem data
aguardando terceiros
```

Filtros devem preservar a URL e funcionar junto com a timeline e o Kanban.

## 9. Ações no calendário

```text
abrir objeto
abrir conversa
mostrar na conversa
alterar prazo
agendar
reagendar
atribuir
concluir
adiar
criar dependência
abrir projeto
```

Arrastar e soltar pode alterar data apenas em objetos de baixo risco e deve produzir confirmação visual. Reagendamento de compromisso externo exige política e confirmação.

## 10. Conflitos e antecipação

O sistema deve detectar:

```text
dois compromissos no mesmo horário
prazo antes da dependência
owner com excesso de itens
entrega sem confirmação
pagamento prometido após vencimento
reunião sem participantes
projeto com marco sem tarefas
```

O alerta deve conter motivo e evidência:

> A entrega do projeto Alfa vence amanhã, mas a aprovação do fornecedor ainda está pendente.

## 11. Conversa → calendário

Quando uma conversa gerar prazo ou compromisso:

```text
mensagem
  → timestamp explícito/inferido
  → objeto temporal
  → confirmação se ambíguo
  → calendário
  → reminder/atenção
```

Manter a expressão original (“até sexta”) e sua normalização (“2026-08-28 17:00”, se aplicável).

## 12. Calendário → conversa

Todo evento ou prazo deve oferecer:

```text
ver evidência
mostrar na conversa
ver objeto
ver projeto
ver empresa/pessoa
```

A agenda nunca deve perder o vínculo com a origem conversacional.

## 13. Recorrência

Suportar recorrência para reuniões, pagamentos, tarefas e serviços, mas distinguir:

```text
recorrência declarada
recorrência inferida
instância ocorrida
instância cancelada
```

A edição deve perguntar se afeta esta ocorrência ou a série inteira.

## 14. Fuso horário e precisão

Cada data deve possuir timezone e precisão. Mostrar:

```text
27/08 às 10h · confirmado
até sexta · dia confirmado, hora não informada
amanhã · relativo ao momento da mensagem
data aproximada · inferida
```

## 15. Performance

Usar carregamento por janela temporal, paginação, cache por escopo e projeções de leitura. A visão ano deve carregar marcos agregados; abrir detalhes sob demanda.
