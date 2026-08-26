# ZapTrack — papel do calendário e do Kanban

## 1. Decisão central

O calendário e o Kanban devem ser **vistas de trabalho sobre o mesmo objeto**, não módulos separados nem cadastros duplicados.

```text
Timeline de conversa = o que aconteceu
Calendário           = quando acontece ou vence
Kanban               = em que estado está e quem precisa agir
Agora                = o que merece atenção primeiro
```

A mesma tarefa, compromisso, entrega, reunião, cobrança, aprovação ou decisão pode aparecer nas quatro vistas, com o mesmo `object_id`, status, owner, prazo e evidência.

## 2. Calendário: o que deve aparecer

Não limitar o calendário a reuniões. Ele deve mostrar qualquer objeto com dimensão temporal relevante:

```text
reunião
ligação
compromisso
prazo de tarefa
entrega
envio
vencimento
pagamento prometido
cobrança
aprovação
marco de projeto
SLA
follow-up
renovação
período de contrato
```

Cada item precisa declarar a natureza do tempo:

```text
starts_at/ends_at       = acontece em um intervalo
scheduled_at            = foi agendado
due_at                  = precisa estar concluído até uma data
expected_at             = previsão
delivered_at             = ocorreu efetivamente
state_changed_at         = mudou de estado
```

Não representar `due_at` como se fosse automaticamente um evento de agenda. Na UI, usar tipos visuais diferentes para “acontece em” e “vence em”.

## 3. Modos temporais

| Modo | Pergunta | Conteúdo |
|---|---|---|
| Dia | “O que preciso fazer hoje?” | Agenda executável, horários, atrasos e ações rápidas |
| Semana | “Como organizar minha semana?” | Compromissos, prazos, carga, conflitos e dependências |
| Mês | “O que está comprometido neste mês?” | Marcos, entregas, pagamentos, reuniões e vencimentos |
| Ano | “Quais são os ciclos e marcos importantes?” | Renovação, contratos, metas, projetos e recorrências; não cada tarefa |

A visualização anual deve ser uma faixa/heatmap de marcos e períodos, não uma grade com milhares de microtarefas.

## 4. Camadas do calendário

```text
Minha agenda
Minha equipe
Projeto
Empresa/pessoa
Área
Todos os compromissos autorizados
```

O usuário pode ligar/desligar camadas. A aplicação deve manter o escopo explícito para evitar mistura de agenda pessoal, equipe e empresa.

## 5. Calendário como instrumento de antecipação

O ZapTrack deve identificar:

```text
conflitos de horário
prazos próximos
itens sem responsável
itens sem data
atrasos
sequências impossíveis
dependências vencidas
promessas sem confirmação
```

O sistema pode recomendar:

> A entrega do projeto Alfa vence amanhã, mas a aprovação do fornecedor ainda está pendente. Quer criar uma atenção ou abrir a dependência?

Não reagendar ou comunicar terceiros automaticamente sem autorização.

## 6. Kanban: o que deve aparecer

O Kanban deve organizar objetos que possuem fluxo de trabalho:

```text
tarefas
solicitações
casos
reclamações
oportunidades
pedidos
compras
entregas
aprovações
projetos
```

Reuniões, arquivos e mensagens não precisam virar cards por padrão, mas podem aparecer como evidência ou gerar um card quando houver ação acompanhável.

## 7. Estados universais de Kanban

O quadro padrão do ZapTrack deve ser baseado no fluxo de execução:

```text
Novos / para revisar
→ Abertos
→ Em andamento
→ Aguardando alguém
→ Bloqueados
→ Concluídos
```

`Atrasados` não deve ser uma coluna exclusiva, porque atraso é uma dimensão temporal que pode atravessar Aberto, Em andamento e Aguardando. Usar badge, filtro e faixa de atenção.

`Cancelados` e `Arquivados` ficam fora do fluxo principal, mas continuam pesquisáveis.

## 8. Agrupamentos de Kanban

O usuário deve trocar o agrupamento do mesmo conjunto de objetos:

```text
por status
por responsável
por projeto
por empresa/pessoa
por área
por tipo de objeto
por prioridade
por prazo
por dependência
por origem: conversa/grupo
por confiança/revisão
```

### Agrupamentos inteligentes recomendados

#### Fila de execução

Colunas por status: aberto, em andamento, aguardando, bloqueado, concluído.

#### Fila de atenção

Colunas por saúde: normal, próximo do prazo, atrasado, sem retorno, sem responsável, conflito.

#### Gestão por pessoa

Colunas por owner, com sinalização de sobrecarga, atrasos e itens bloqueados.

#### Gestão por projeto

Colunas por projeto ou espaço do cliente, para comparar execução e riscos.

#### Revisão da IA

Colunas por confiança: nova sugestão, revisar, conflito, confirmada, rejeitada.

O sistema deve oferecer presets; o usuário não precisa construir um board genérico do zero.

## 9. Calendário e Kanban não substituem a conversa

Cada card e evento deve oferecer:

```text
abrir objeto
ver evidência
mostrar na conversa
abrir projeto
abrir empresa/pessoa
ver histórico
alterar status
atribuir
alterar prazo
```

A origem conversacional permanece acessível em todos os modos.

## 10. Regras para múltiplas datas

Um objeto pode ter várias datas. Exemplo de entrega:

```text
solicitada_at = 20/08
prometida_at = 27/08
due_at = 27/08
shipped_at = 26/08
delivered_at = 28/08
```

O calendário deve escolher uma data primária conforme o modo e permitir expandir as demais. Não substituir a data prometida pela data efetiva; ambas são importantes para gestão.

## 11. Visão “Agora” integrada

O calendário e o Kanban devem alimentar a página Agora:

```text
Hoje
├── 3 compromissos
├── 5 prazos
├── 2 atrasos
├── 1 aprovação
└── 4 itens aguardando terceiros
```

Clicar em cada bloco abre o calendário ou o Kanban com filtros já aplicados.

## 12. Regra de simplicidade

O ZapTrack deve entregar três presets visíveis:

```text
Calendário
Kanban
Timeline
```

As configurações avançadas ficam em `Personalizar visão`. O usuário não deve escolher entre dezenas de tipos de board antes de ver valor.
