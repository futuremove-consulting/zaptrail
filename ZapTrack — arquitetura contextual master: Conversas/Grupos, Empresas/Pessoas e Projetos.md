# ZapTrack — arquitetura contextual master: Conversas/Grupos, Empresas/Pessoas e Projetos

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Escopo:** decisão de navegação, modelo contextual, jornadas, indexação, busca, interfaces e plano de construção.

> **Veredito:** sim, faz muito sentido e é uma decisão inteligente. Para o usuário real do WhatsApp, a atividade nasce em uma conversa 1:1 ou em um grupo, envolve uma pessoa ou empresa e normalmente pertence a um projeto, cliente, demanda ou objetivo. O ZapTrack deve refletir essa realidade.

---

## 1. Decisão revisada

A arquitetura do ZapTrack deve possuir quatro lentes principais:

```text
Agora              = o que exige atenção
Conversas & Grupos = onde aconteceu
Empresas & Pessoas = com quem aconteceu
Projetos           = para qual objetivo aconteceu
```

As áreas da empresa continuam importantes, mas funcionam como uma quinta lente de organização:

```text
Áreas              = em qual função da empresa se encaixa
```

A navegação primária recomendada passa a ser:

```text
Agora
Conversas & Grupos
Empresas & Pessoas
Projetos
Áreas
Análises
Controle
```

O agente no WhatsApp permanece como botão/canal transversal. Ele não deve ser o eixo de organização do aplicativo, porque o usuário pensa em cliente, projeto, grupo, pendência e decisão — não em qual agente especializado deve abrir.

---

## 2. Por que essa arquitetura é inteligente

Ela representa o modo como profissionais liberais, autônomos, donos e gestores de pequenas empresas realmente trabalham:

- **a atividade acontece em conversas**;
- **as conversas envolvem pessoas e organizações**;
- **o trabalho é agrupado por cliente, projeto, demanda ou iniciativa**;
- **as ações e pendências precisam de responsável, prazo e estado**;
- **o gestor quer enxergar o que exige atenção sem ler tudo**.

A arquitetura também reduz a carga de memória do usuário. Ele não precisa lembrar se algo foi classificado como Comercial, Atendimento ou Operações. Pode começar pelo grupo, pela empresa, pelo projeto ou pela pendência e chegar ao mesmo objeto e à mesma evidência.

A decisão não significa criar quatro bases de dados. Significa criar **quatro vistas sobre uma mesma rede de entidades, eventos, objetos e relações**.

---

## 3. Modelo mental final

| Pergunta do usuário | Lente do produto |
|---|---|
| O que precisa de atenção? | Agora |
| Onde isso foi conversado? | Conversas & Grupos |
| Com quem foi tratado? | Empresas & Pessoas |
| A qual objetivo pertence? | Projetos |
| Em qual função da empresa se encaixa? | Áreas |
| Qual foi a evidência? | Mensagem, arquivo, áudio ou documento |
| O que precisa ser feito? | Objeto de gestão e ação |

O usuário pode entrar por qualquer lente. A aplicação deve preservar o caminho e oferecer navegação lateral entre elas:

```text
Grupo Implantação Alfa
  → Empresa Alfa
  → Projeto Implantação Alfa
  → Entrega atrasada
  → Mensagem de origem
  → Tarefa para responsável
```

---

## 4. Conversas & Grupos como área primária

### 4.1 Decisão de interface

`Conversas & Grupos` deve ser uma área de primeira classe, não ficar escondida em “Conhecimento”. Dentro dela, usar abas e filtros:

```text
Conversas & Grupos
├── Todas
├── 1:1
├── Grupos
├── Não organizadas
├── Com atenção
├── Com objetos
├── Recentes
└── Fontes
```

Não é necessário criar dois menus independentes. Uma área única com a distinção clara entre `1:1` e `Grupos` é mais simples e mantém a regra do WhatsApp: toda conversa é direta ou coletiva, com possíveis threads e importações.

### 4.2 Item da lista

Cada conversa deve mostrar:

```text
tipo: 1:1 ou grupo
nome/título
participantes principais
empresa/pessoa relacionada
projeto relacionado
último assunto relevante
pendências abertas
decisões recentes
última atividade
status de processamento
```

### 4.3 Página de conversa/grupo

```text
Cabeçalho
├── tipo e fonte
├── título/nome
├── participantes
├── empresas/pessoas relacionadas
├── projetos relacionados
└── organizar / silenciar / exportar conforme permissão

Resumo
├── assunto atual
├── decisões
├── compromissos
├── pendências
├── riscos
└── última mudança

Timeline
├── mensagens
├── respostas/citações
├── mídias
├── evidências
└── objetos derivados

Contexto
├── empresas/pessoas
├── projetos
├── áreas
└── documentos
```

O resumo não substitui a timeline. A timeline não deve obrigar o usuário a ler toda a conversa para encontrar o que precisa ser feito.

### 4.4 Grupos que mudam de assunto

Um grupo pode tratar de mais de um projeto e ter assuntos paralelos. O ZapTrack deve suportar associação por:

| Escopo | Exemplo |
|---|---|
| Grupo inteiro | Grupo “Implantação Alfa” associado ao projeto Alfa |
| Período | Mensagens de agosto associadas ao projeto Alfa |
| Thread/assunto | Apenas a thread “instalação” |
| Mensagem | Uma mensagem específica associada ao projeto Beta |
| Exceção | Mensagem explicitamente fora do projeto |

A associação de um grupo inteiro deve ser o contexto padrão, não uma regra absoluta. O sistema precisa impedir que todo assunto futuro seja forçado para o mesmo projeto.

---

## 5. Empresas & Pessoas como área primária

### 5.1 Decisão de domínio

A interface pode usar “Empresas & Pessoas”, mas o domínio deve usar `Party` e `PartyRole`.

```text
Party
├── Person
├── Organization
├── Team
└── SystemAgent
```

Papéis são contextuais:

```text
Customer
Supplier
Partner
Employee
Prospect
Provider
Consultant
Representative
```

A mesma pessoa pode ser cliente em uma relação, representante de fornecedor em outra e colaborador em um workspace diferente.

### 5.2 Página de empresa

```text
Empresa
├── resumo
├── papéis e relação com o workspace
├── pessoas associadas
├── conversas 1:1
├── grupos
├── projetos
├── oportunidades/vendas
├── pedidos/compras
├── contratos
├── cobranças/pagamentos
├── entregas/ocorrências
├── decisões/compromissos
├── arquivos
├── timeline
└── indicadores
```

### 5.3 Página de pessoa

```text
Pessoa
├── perfil e identificadores
├── papéis por contexto
├── empresas associadas
├── conversas 1:1
├── grupos
├── projetos
├── tarefas/compromissos
├── decisões/aprovações
├── documentos
└── timeline
```

A página deve ser uma visão de relação e atividade, não apenas um cadastro de contato.

---

## 6. Projetos como área primária

### 6.1 Projeto formal e espaço do cliente

Para uma empresa estruturada, projeto pode ser implantação, obra, campanha, iniciativa, produto ou contrato. Para um autônomo, pode ser simplesmente o espaço de trabalho de um cliente.

Tipos:

```text
formal_project
client_workspace
recurring_service
internal_initiative
event
one_off_request
```

O conceito de **Espaço do cliente** evita obrigar um profissional liberal a adotar a linguagem pesada de gestão de projetos.

### 6.2 Página de projeto

```text
Projeto
├── objetivo, status e owner
├── resumo executivo
├── conversas 1:1
├── grupos
├── empresas e pessoas
├── tarefas e compromissos
├── decisões e riscos
├── pedidos/entregas
├── contratos/pagamentos
├── arquivos/documentos
├── marcos e cronograma
├── timeline
└── indicadores
```

O projeto precisa responder:

```text
o que está acontecendo?
quem está envolvido?
o que foi decidido?
o que está pendente?
o que está atrasado?
qual é o próximo marco?
qual conversa prova isso?
```

---

## 7. Modelo contextual sem duplicação

A regra principal é:

> **Uma mensagem pertence a uma conversa; pode relacionar-se a várias parties, projetos, áreas e objetos; nenhuma dessas relações cria uma cópia da mensagem.**

```text
Message M
  ├── belongs_to → Conversation C
  ├── authored_by → Party P1
  ├── mentions/relates_to → Party P2 / Organization O
  ├── contextualized_by → Project J
  ├── classified_in → Area A
  ├── generates → InteractionEvent E
  └── supports → Evidence V

InteractionEvent E
  ├── proposes/updates → ManagementObject O
  └── relates_to → Project J / Party P / Conversation C
```

A mesma entidade pode ser acessada por:

```text
Agora
Conversas & Grupos
Empresas & Pessoas
Projetos
Áreas
Busca global
```

O ID é o mesmo, o estado é o mesmo, a evidência é a mesma e a permissão é a mesma.

---

## 8. Modelo de dados recomendado

### Tabelas principais

```text
workspaces
organizations
org_units
teams
parties
party_identifiers
party_roles
party_relationships
connectors
source_accounts
conversations
conversation_participants
messages
message_relations
attachments
projects
context_links
interaction_events
semantic_analyses
evidence
management_objects
object_relations
state_transitions
action_commands
action_runs
metric_definitions
attention_items
access_grants
audit_logs
```

### ContextLink

A relação contextual deve ser uma entidade própria:

```text
context_links
├── id
├── workspace_id
├── source_type
├── source_id
├── context_type
├── context_id
├── relation_type
├── relation_status
├── confidence
├── source_event_id
├── valid_from
├── valid_to
└── created_by
```

Exemplos:

```text
conversation.related_to_organization
conversation.contextualized_by_project
message.mentions_party
message.contextualized_by_project
object.about_party
object.part_of_project
object.occurs_in_conversation
```

### Relação explícita versus inferida

```text
explicit
suggested
accepted
rejected
overridden
```

O usuário deve poder aceitar, rejeitar ou corrigir associações. Uma rejeição explícita deve impedir a re-sugestão silenciosa sem nova evidência.

---

## 9. Indexação e busca

### 9.1 Documento indexável

Cada mensagem, conversa, party, projeto, objeto, arquivo e evento pode gerar um documento de busca lógico:

```json
{
  "resource_id": "msg_123",
  "resource_type": "message",
  "workspace_id": "ws_1",
  "conversation_ids": ["conv_1"],
  "conversation_types": ["group"],
  "party_ids": ["party_alfa", "party_ana"],
  "organization_ids": ["org_alfa"],
  "project_ids": ["project_implantacao"],
  "area_ids": ["operations"],
  "object_ids": ["delivery_1"],
  "event_types": ["delivery_commitment"],
  "action_types": ["deliver", "confirm"],
  "status_terms": ["pending"],
  "text": "texto autorizado e normalizado",
  "time_start": "2026-08-26T00:00:00Z",
  "time_end": "2026-08-26T23:59:59Z",
  "confidence": 0.91,
  "visibility": "team_operations",
  "freshness_at": "2026-08-26T18:04:00Z"
}
```

### 9.2 Ordem da busca

```text
1. autenticar
2. identificar workspace
3. aplicar permissão
4. interpretar pergunta/filtros
5. resolver party/projeto/grupo
6. consultar objetos estruturados
7. consultar full-text
8. usar busca vetorial quando necessário
9. reordenar por relevância/contexto/recência/confiança
10. recuperar evidência autorizada
11. mostrar motivo da correspondência
```

Não buscar tudo e filtrar depois. O controle de acesso deve ocorrer antes da recuperação.

### 9.3 Exemplos

| Pergunta | Interpretação |
|---|---|
| “Grupos do projeto Alfa com pendências” | `conversation_type=group`, `project=Alfa`, `object_status=open` |
| “Tudo que ficou pendente com a Beta” | party/org Beta + objetos abertos + período implícito |
| “Quando combinamos a entrega?” | delivery + temporal evidence + conversation search |
| “Quem está esperando resposta?” | waiting state + absence of response + party |
| “O que atrasou no projeto?” | project + delayed/blocked events + timeline |
| “Quais pagamentos vencem sexta?” | payment/invoice + due date + project/party scope |

A interface deve mostrar a interpretação antes de executar uma pergunta ambígua:

> Entendi: **grupos**, do projeto **Implantação Alfa**, com objetos **pendentes**. Aplicar?

---

## 10. Resolução de entidades

### Sinais

```text
identificador exato
telefone/e-mail verificado
número de pedido/contrato
alias confirmado
participantes da conversa
relação histórica
nome normalizado
unidade/site
janela temporal
similaridade semântica
título do grupo
```

O título do grupo é um sinal útil, mas não é prova suficiente de identidade ou projeto.

### Resultado

```json
{
  "mention": "Alfa",
  "candidates": [
    {
      "id": "org_alfa",
      "name": "Alfa Tecnologia Ltda.",
      "score": 0.94,
      "reasons": ["nome exato", "participante", "relação ativa"]
    }
  ],
  "decision": "resolved",
  "requires_confirmation": false
}
```

Se houver colisão, pedir desambiguação. Merge e unmerge devem ser auditáveis.

---

## 11. Jornadas recomendadas

### 11.1 Profissional liberal/autônomo

```text
abrir Agora
  → ver compromissos e pendências
  → abrir Conversas & Grupos
  → selecionar cliente/projeto
  → revisar mensagens e arquivos
  → confirmar objeto
  → trabalhar pelo WhatsApp
  → receber resumo no fim do dia
```

O produto deve oferecer poucos conceitos iniciais: `Agora`, `Conversas & Grupos`, `Empresas & Pessoas`, `Projetos`, `Arquivos` e `Configurações`. Áreas podem aparecer conforme o volume cresce.

### 11.2 Dono/gestor de PME

```text
abrir Agora
  → identificar risco/atraso
  → filtrar por área ou projeto
  → abrir empresa/fornecedor/cliente
  → ver grupos e pendências
  → delegar tarefa
  → acompanhar estado
  → consultar resultado no WhatsApp
```

### 11.3 Conversa → projeto

```text
grupo recorrente
  → detectar empresa/assunto
  → sugerir projeto ou espaço do cliente
  → usuário aceitar/editar
  → indexar mensagens futuras
  → separar exceções por thread/período
```

### 11.4 Projeto → conversa

```text
projeto
  → abrir conversas e grupos relacionados
  → filtrar por empresa/pessoa
  → filtrar por assunto/objeto
  → abrir evidência
  → criar ação
```

---

## 12. Fluxo de implementação

### Fase 1 — fundação

Construir autenticação, workspace, parties, conversas, grupos, participantes, projetos e `context_links`. Criar navegação, listas e páginas de detalhe com associações manuais.

### Fase 2 — contexto navegável

Implementar timeline de conversa, perfil de empresa/pessoa, página de projeto, breadcrumbs, filtros e links entre lentes.

### Fase 3 — indexação

Adicionar full-text, aliases, índices por workspace/conversa/party/projeto, projeções de contexto e busca global.

### Fase 4 — estruturação semântica

Adicionar extração de entidades, ações, eventos, objetos e projetos candidatos. Criar fila de revisão e evidência.

### Fase 5 — agente

Adicionar consultas no WhatsApp:

```text
“Quais grupos do projeto Alfa têm pendências?”
“Tudo que está pendente com a Beta.”
“O que foi decidido no projeto?”
“Crie uma tarefa para a Ana.”
```

### Fase 6 — antecipação

Adicionar atenção por conversa, empresa e projeto; resumos, atrasos, promessas, ausência de retorno e conflitos.

---

## 13. API/procedures mínimas

```text
context.conversations.list
context.conversations.get
context.conversations.relatedProjects
context.parties.list
context.parties.get
context.parties.relatedConversations
context.parties.relatedProjects
context.projects.list
context.projects.get
context.projects.relatedConversations
context.projects.relatedParties
context.links.suggest
context.links.accept
context.links.reject
context.search
context.timeline
context.attention.byContext
```

Esses procedimentos devem devolver dados já filtrados por workspace e permissão. O agente deve chamá-los por ferramentas tipadas, nunca acessar banco diretamente.

---

## 14. Regras críticas

1. Grupo é uma especialização de conversa.
2. Conversa 1:1 e grupo devem ser distinguíveis na navegação.
3. Uma conversa pode relacionar-se a várias empresas, pessoas e projetos.
4. Um projeto pode conter várias conversas, grupos, empresas e pessoas.
5. Uma mensagem pode estar associada a vários contextos, mas possui uma única origem.
6. O título do grupo não determina sozinho o projeto.
7. Uma pessoa pode ter papéis diferentes por contexto.
8. Toda relação inferida possui confiança e evidência.
9. Toda relação rejeitada pode impedir re-inferência automática.
10. Toda vista deve respeitar permissão e retenção.
11. O usuário deve conseguir corrigir contexto sem apagar a origem.
12. A busca estruturada deve preceder a busca semântica.
13. Um novo projeto sugerido não é projeto confirmado.
14. Mensagem futura não deve herdar contexto de grupo sem considerar assunto e período.
15. O estado exibido é único em todas as lentes.

---

## 15. MVP/MLP

### MVP

```text
Auth/workspace
Conversas & Grupos
Empresas & Pessoas
Projetos simples/Espaço do cliente
Timeline e evidência
Context links manuais
Busca estruturada
Agora
Agente de consulta
Tarefa/compromisso/decisão
```

### MLP

```text
sugestões automáticas de empresa/projeto
busca híbrida
revisão da IA
arquivos e transcrição
atenção por contexto
métricas básicas
áreas Comercial/Financeiro/Operações/Atendimento
aprovações de baixo risco
```

### Posterior

```text
integrações CRM/ERP
automação avançada
agentes especializados
grafo visual avançado
omnichannel
ações financeiras externas
```

---

## 16. Veredito final

A observação do usuário deve alterar a arquitetura anterior: `Conversas & Grupos` não deve ficar escondido dentro de “Conhecimento”. `Empresas & Pessoas` e `Projetos` também devem aparecer como eixos primários.

A versão mais inteligente e eficaz da arquitetura é:

> **Agora para atenção; Conversas & Grupos para origem; Empresas & Pessoas para relacionamento; Projetos para finalidade; Áreas para função; Análises para desempenho; Controle para confiança.**

A construção deve começar por relações explícitas e interfaces simples, evoluir para indexação e resolução semântica, e só depois automatizar associações e ações. O produto ganha profundidade sem precisar criar cópias de dados, módulos isolados ou um agente diferente para cada área.

O melhor ZapTrack é aquele em que o usuário pode perguntar, pela aplicação ou pelo WhatsApp:

> **“O que aconteceu com este cliente, em quais conversas, dentro de qual projeto, o que está pendente, quem precisa agir e qual mensagem prova isso?”**

E obter uma resposta única, contextual, navegável e auditável.
