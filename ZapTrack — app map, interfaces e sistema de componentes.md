# ZapTrack — app map, interfaces e sistema de componentes

## 1. Visão do produto

O ZapTrack é composto por duas superfícies:

```text
Aplicação externa
├── Centro de comando e profundidade
├── Revisão da IA
├── Gestão por áreas
├── Pessoas, conversas, objetos e arquivos
├── Indicadores e relatórios
└── Controle, permissões e integrações

Agente no WhatsApp
├── Consulta
├── Registro
├── Confirmação
├── Correção
├── Atenção proativa
└── Comandos de baixo risco
```

As duas superfícies chamam o mesmo núcleo de domínio e exibem o mesmo estado.

## 2. App map completo

```text
/
├── onboarding
│   ├── boas-vindas
│   ├── criar-workspace
│   ├── configurar-organizacao
│   ├── conectar-fonte
│   ├── parear-whatsapp
│   ├── escolher-areas
│   ├── configurar-permissoes
│   └── primeiro-valor
│
├── app
│   ├── agora
│   │   ├── visao-geral
│   │   ├── minha-agenda
│   │   ├── minhas-pendencias
│   │   ├── aguardando-terceiros
│   │   ├── atencao
│   │   └── atividade-recente
│   │
│   ├── areas
│   │   ├── comercial
│   │   │   ├── resumo
│   │   │   ├── atencao
│   │   │   ├── oportunidades
│   │   │   ├── propostas
│   │   │   ├── vendas
│   │   │   ├── follow-ups
│   │   │   ├── conversas
│   │   │   ├── pessoas-e-organizacoes
│   │   │   ├── documentos
│   │   │   └── indicadores
│   │   ├── atendimento
│   │   │   ├── resumo
│   │   │   ├── fila
│   │   │   ├── casos
│   │   │   ├── reclamacoes
│   │   │   ├── incidentes
│   │   │   ├── feedbacks
│   │   │   ├── conversas
│   │   │   └── indicadores
│   │   ├── financeiro
│   │   │   ├── resumo
│   │   │   ├── contas-a-receber
│   │   │   ├── cobrancas
│   │   │   ├── pagamentos
│   │   │   ├── reembolsos
│   │   │   ├── disputas
│   │   │   ├── compromissos
│   │   │   ├── documentos
│   │   │   └── indicadores
│   │   ├── operacoes
│   │   │   ├── resumo
│   │   │   ├── pedidos
│   │   │   ├── envios
│   │   │   ├── entregas
│   │   │   ├── ocorrencias
│   │   │   ├── tarefas
│   │   │   ├── conversas
│   │   │   └── indicadores
│   │   ├── suprimentos
│   │   │   ├── resumo
│   │   │   ├── solicitacoes-de-compra
│   │   │   ├── cotacoes
│   │   │   ├── pedidos-de-compra
│   │   │   ├── fornecedores
│   │   │   ├── recebimentos
│   │   │   └── indicadores
│   │   ├── pessoas
│   │   │   ├── resumo
│   │   │   ├── tarefas
│   │   │   ├── responsabilidades
│   │   │   ├── reunioes
│   │   │   ├── aprovacoes
│   │   │   ├── feedbacks
│   │   │   └── indicadores
│   │   ├── projetos
│   │   │   ├── resumo
│   │   │   ├── projetos
│   │   │   ├── iniciativas
│   │   │   ├── marcos
│   │   │   ├── tarefas
│   │   │   ├── riscos
│   │   │   ├── decisoes
│   │   │   └── indicadores
│   │   └── diretoria
│   │       ├── resumo
│   │       ├── decisoes
│   │       ├── riscos
│   │       ├── compromissos
│   │       ├── iniciativas
│   │       ├── indicadores
│   │       └── relatorios
│   │
│   ├── conhecimento
│   │   ├── conversas
│   │   ├── conversas/:id
│   │   ├── objetos
│   │   ├── objetos/:id
│   │   ├── pessoas
│   │   ├── pessoas/:id
│   │   ├── organizacoes
│   │   ├── organizacoes/:id
│   │   ├── arquivos
│   │   ├── arquivos/:id
│   │   └── busca
│   │
│   ├── analise
│   │   ├── indicadores
│   │   ├── indicadores/:id
│   │   ├── relatorios
│   │   ├── relatorios/:id
│   │   ├── tendencias
│   │   ├── historico-de-decisoes
│   │   └── exportacoes
│   │
│   ├── controle
│   │   ├── revisao-da-ia
│   │   ├── revisao-da-ia/:id
│   │   ├── aprovacoes
│   │   ├── automacoes
│   │   ├── automacoes/:id
│   │   ├── fontes
│   │   ├── fontes/:id
│   │   ├── permissoes
│   │   ├── privacidade
│   │   ├── taxonomia
│   │   ├── estados
│   │   └── auditoria
│   │
│   ├── assistente
│   │   ├── chat
│   │   ├── historico
│   │   ├── preferencias
│   │   └── whatsapp
│   │
│   └── conta
│       ├── perfil
│       ├── notificacoes
│       ├── preferencias
│       ├── seguranca
│       └── sair
│
└── links
    ├── evidencia/:token
    ├── objeto/:token
    ├── aprovacao/:token
    └── pareamento/:token
```

## 3. Shell da aplicação

### Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo | workspace | busca global | agente | alertas | perfil  │
├──────────────┬───────────────────────────────────────────────┤
│ Sidebar      │ Breadcrumbs                                  │
│ Agora        │ Título + ações                                │
│ Áreas        │ Conteúdo principal                            │
│ Conhecimento │ Painel contextual / relações / evidência      │
│ Análise      │                                               │
│ Controle     │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### Mobile

```text
Cabeçalho: voltar | título | busca/agente
Conteúdo: prioridade → lista → detalhe em drawer/tela
Rodapé: Agora | Áreas | Buscar | Agente | Mais
```

A aplicação deve usar sidebar persistente no desktop e navegação inferior contextual no mobile. A superfície mobile não deve tentar reproduzir todas as tabelas e gráficos do desktop.

## 4. Inventário de interfaces

### Interfaces transversais

| Interface | Função |
|---|---|
| Agora | Mostrar prioridade, agenda, pendências, atenção e atividade |
| Busca global | Recuperar conversa, objeto, pessoa, arquivo, evento ou métrica |
| Detalhe universal | Apresentar resumo, campos, evidências, relações, histórico e ações |
| Timeline | Mostrar eventos e transições em ordem temporal |
| Revisão da IA | Confirmar, corrigir, rejeitar e mesclar sugestões |
| Centro de aprovação | Autorizar ações sensíveis |
| Assistente | Conversar com o agente dentro da aplicação |
| Biblioteca | Navegar arquivos, documentos, transcrições e derivados |
| Indicadores | Consultar métricas com definição e drill-down |
| Auditoria | Rastrear acesso, inferência, alteração e ação |

### Interfaces por área

Cada área deve reutilizar o mesmo shell e componentes; apenas muda o recorte dos objetos, indicadores e atenção.

| Área | Entrada | Objetos principais | Ação primária |
|---|---|---|---|
| Comercial | Oportunidades e atenção | Lead, Opportunity, Proposal, Sale | Criar follow-up |
| Atendimento | Fila e SLA | Case, Complaint, Incident, Feedback | Atribuir/responder |
| Financeiro | Vencimentos e compromissos | Invoice, Charge, Payment, Refund | Revisar cobrança/pagamento |
| Operações | Pedidos e exceções | Order, Delivery, Shipment, Task | Atualizar operação |
| Suprimentos | Aprovações e fornecedores | PurchaseRequest, Quote, PurchaseOrder | Aprovar/solicitar cotação |
| Pessoas | Responsabilidades e reuniões | Task, Meeting, Assignment, Feedback | Delegar/acompanh ar |
| Projetos | Marcos e riscos | Project, Initiative, Milestone, Issue | Resolver bloqueio |
| Diretoria | Atenção executiva | Decision, Risk, Commitment, KPI | Decidir/priorizar |

## 5. Detalhamento da página Agora

```text
Agora
├── Saudação + data + workspace
├── Prioridade recomendada
│   ├── título
│   ├── motivo
│   ├── impacto
│   ├── evidência
│   └── ação primária
├── Hoje
│   ├── agenda
│   ├── vencimentos
│   ├── aprovações
│   └── entregas
├── Minha fila
│   ├── pendências
│   ├── decisões
│   └── revisões da IA
├── Aguardando terceiros
│   ├── clientes
│   ├── fornecedores
│   ├── parceiros
│   └── equipe
└── Mudanças recentes
    ├── novos objetos
    ├── estados alterados
    └── alertas
```

## 6. Detalhamento da tela de objeto

```text
Objeto de gestão
├── breadcrumb
├── tipo + status + prioridade + confiança
├── título
├── parties relacionadas
├── owner + área + projeto
├── prazo/tempo/valor
├── ação primária
├── menu de ações
├── Resumo
├── Evidência
│   ├── mensagem/trecho
│   ├── arquivo/áudio/documento
│   └── abrir conversa
├── Histórico
│   ├── transições
│   ├── correções
│   └── versões
├── Relações
│   ├── objetos relacionados
│   ├── pessoas/organizações
│   └── dependências
├── Atividade
│   ├── comentários internos
│   ├── comandos
│   └── notificações
└── Auditoria
```

## 7. Componentes reutilizáveis

### Componentes de estrutura

`AppShell`, `Sidebar`, `MobileNav`, `Topbar`, `Breadcrumbs`, `WorkspaceSwitcher`, `AreaHeader`, `PageHeader`, `ContextPanel`, `CommandPalette`.

### Componentes de atenção

`PriorityCard`, `AttentionList`, `AttentionItem`, `SnoozeControl`, `ReasonPopover`, `ImpactBadge`, `DueDateBadge`, `WaitingOnCard`.

### Componentes de objetos

`ObjectCard`, `ObjectTable`, `ObjectBoard`, `ObjectCalendar`, `ObjectStatus`, `ObjectTypeBadge`, `OwnerAvatar`, `RelationChips`, `ObjectDetail`, `ObjectActions`, `BulkActionBar`.

### Componentes de evidência

`EvidenceCard`, `MessageQuote`, `ConversationPreview`, `AudioEvidence`, `DocumentPreview`, `PageSelector`, `OpenSourceButton`, `ConfidenceBadge`, `InterpretationPanel`.

### Componentes de revisão

`ReviewQueue`, `ReviewCard`, `AcceptButton`, `RejectButton`, `CorrectTypeSelect`, `EntityResolutionPicker`, `MergeDialog`, `DiffViewer`, `ConfidenceReason`.

### Componentes de ação

`ActionButton`, `ConfirmDialog`, `ApprovalCard`, `PolicyNotice`, `RiskNotice`, `ExecutionStatus`, `UndoAction`, `IdempotencyNotice`.

### Componentes de análise

`MetricCard`, `MetricDefinition`, `MetricFreshness`, `TimeRangePicker`, `FilterBar`, `DrilldownPanel`, `TrendChart`, `BreakdownTable`, `ExportButton`.

### Componentes de conversa

`ChatPanel`, `MessageList`, `MessageComposer`, `SuggestionChips`, `AgentResponse`, `ToolTraceSummary`, `SourceCitation`, `OpenInWhatsAppButton`.

## 8. Padrão de cartão de atenção

```text
[ícone] [tipo] [prioridade]
Título do item
Por que importa: explicação curta
Contexto: party · área · prazo
Origem: conversa/arquivo/sistema
[Ver evidência] [Ação primária] [Adiar]
```

## 9. Padrão de lista universal

Filtros persistentes no topo:

```text
área · tipo · status · owner · party · prazo · prioridade · confiança · fonte
```

Cada linha apresenta tipo, título, party principal, owner, estado, prazo, confiança e ação mais provável. Não mostrar todos os atributos simultaneamente.

## 10. Padrão de confiança

Usar linguagem humana:

| Estado | UI |
|---|---|
| Alta | “Confirmado” ou sem alerta visual excessivo |
| Média | “Revisar” com razão curta |
| Baixa | “Interpretação incerta” com ação de correção |
| Conflito | “Há duas possibilidades” com desambiguação |
| Sem evidência | “Sem fonte suficiente” |

Não usar porcentagem como única explicação. A porcentagem pode existir no detalhe avançado.

## 11. Padrão de aplicação das áreas

Cada área deve possuir:

```text
Resumo
├── indicadores essenciais
├── prioridade recomendada
├── fila de atenção
└── mudanças recentes

Trabalho
├── objetos da área
├── conversas relevantes
├── pessoas/organizações
└── documentos

Análise
├── métricas
├── tendências
└── relatórios
```

## 12. Aplicação versus WhatsApp

| Situação | WhatsApp | Aplicação |
|---|---|---|
| Pergunta rápida | Principal | Também disponível |
| Criar lembrete | Principal | Também disponível |
| Confirmar sugestão | Principal | Também disponível |
| Corrigir muitos objetos | Não ideal | Principal |
| Explorar relações | Resumo/link | Principal |
| Ler documento extenso | Resumo/link | Principal |
| Ver dashboard | Pergunta/resumo | Principal |
| Aprovar ação sensível | Forte confirmação ou link | Principal |
| Configurar permissões | Não | Principal |
| Rever histórico da IA | Resumo | Principal |

## 13. Modo assistido e modo exploratório

O usuário deve alternar entre:

- **Modo assistido:** o ZapTrack recomenda prioridade e próximo passo.
- **Modo exploratório:** o usuário busca, filtra e investiga livremente.

O modo assistido nunca deve ocultar o modo exploratório. A recomendação deve ser descartável, explicável e ajustável.

## 14. App map do agente no WhatsApp

```text
Número do Agente ZapTrack
├── VINCULAR
├── DESVINCULAR
├── AJUDA
├── AGORA
│   ├── O que precisa de atenção?
│   ├── O que vence hoje?
│   └── O que está atrasado?
├── CONSULTAR
│   ├── pessoas/organizações
│   ├── conversas
│   ├── objetos
│   ├── arquivos
│   └── indicadores
├── REGISTRAR
│   ├── tarefa
│   ├── compromisso
│   ├── decisão
│   ├── reunião
│   └── observação
├── REVISAR
│   ├── confirmar
│   ├── corrigir
│   ├── rejeitar
│   └── desambiguar
├── AGIR
│   ├── concluir
│   ├── atribuir
│   ├── lembrar
│   ├── pausar alertas
│   └── abrir aplicação
└── CONTROLE
    ├── fontes
    ├── permissões
    ├── privacidade
    └── status do sistema
```

O agente não precisa expor um menu literal; essa é a arquitetura de capacidade. A conversa continua natural, mas os comandos críticos precisam ser previsíveis.
