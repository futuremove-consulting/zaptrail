# ZapTrack — Blueprint Master de UX, Arquitetura de Informação, Jornadas e Fluxos

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Autor:** Manus AI  
**Produto:** organizador e estruturador inteligente de conversas, com agente no WhatsApp e aplicação externa.

> **Decisão central:** o ZapTrack deve apresentar duas interfaces sobre um único núcleo: **WhatsApp é o cockpit de velocidade; a aplicação externa é o centro de comando, profundidade e governança; o núcleo semântico é a única fonte de verdade.**

---

## 1. Veredito executivo

O ZapTrack deve organizar a atividade conversacional da empresa em uma estrutura operacional composta por conversas, pessoas, organizações, relações, eventos, objetos de gestão, estados, evidências, decisões, compromissos, métricas e ações.

O usuário não deve navegar pela ontologia. Deve navegar pela pergunta que precisa responder:

> **O que aconteceu? O que exige minha atenção? O que preciso fazer? Onde está a prova?**

A aplicação externa deve organizar a experiência por **áreas da empresa**, não por agentes. Dentro de cada área, o usuário encontra conversas, objetos, pessoas, arquivos, indicadores, decisões e agentes contextualizados. O agente no WhatsApp é transversal: pode consultar e operar o mesmo núcleo, respeitando identidade, escopo, permissão e confirmação.

A arquitetura recomendada é:

```text
Conversas e fontes
      ↓
Núcleo semântico universal
      ↓
Eventos + entidades + relações + evidências
      ↓
Objetos de gestão + estados + métricas
      ↓
Agora / áreas / análise / controle
      ↕
Agente no WhatsApp
```

O produto deve começar com um núcleo universal, mas liberar profundidade de domínio gradualmente. A universalidade pertence ao modelo; a interface deve permanecer simples.

---

## 2. Modelo mental do usuário

O usuário não pensa em `InteractionEvent`, `ManagementObject`, `RDF`, `embedding` ou `policy gate`. Ele pensa em quatro perguntas:

| Pergunta | Resposta que o ZapTrack deve oferecer |
|---|---|
| O que aconteceu? | Conversas, mensagens, decisões, pedidos, pagamentos, reclamações, entregas e mudanças |
| O que exige atenção? | Pendências, atrasos, riscos, aprovações, compromissos e oportunidades |
| O que posso fazer? | Confirmar, corrigir, atribuir, lembrar, responder, aprovar, concluir ou abrir detalhes |
| Onde está a prova? | Conversa, mensagem, áudio, imagem, documento, link ou sistema de origem |

O produto deve esconder complexidade até que ela seja necessária. A interface apresenta o vocabulário de trabalho; a área de controle apresenta o vocabulário semântico e de governança.

---

## 3. Princípios de experiência

### 3.1 Organizar por área, não por agente

A estrutura principal deve refletir a empresa: Comercial, Atendimento, Financeiro, Operações, Suprimentos, Pessoas, Projetos e Diretoria. Agentes são capacidades e canais, não unidades de navegação.

### 3.2 Atenção antes de cadastro

A página inicial começa com prioridades, prazos, decisões, dependências e riscos. Cadastros e configurações ficam disponíveis, mas não dominam a primeira experiência.

### 3.3 Conversa e objeto são duas vistas do mesmo fato

A conversa é a origem e a evidência. O objeto de gestão é a unidade acompanhável. O usuário pode navegar de uma mensagem para os objetos derivados e de um objeto para a evidência original.

### 3.4 Progressive disclosure

O WhatsApp entrega conclusão, contexto, evidência e próximo passo. A aplicação externa entrega timeline, relações, documentos, revisão em massa, métricas, permissões e auditoria.

### 3.5 Inteligência antecipatória, não intrusiva

O ZapTrack recomenda o próximo passo quando há evidência de relevância, prazo, risco ou dependência. A recomendação precisa ser explicável, descartável e ajustável.

### 3.6 Confiança visível

A IA deve explicar o que entendeu, por que entendeu e o que ainda não sabe. “Proposto”, “confirmado” e “concluído” são estados diferentes.

### 3.7 Ação proporcional ao risco

Consulta, resumo e sugestão podem ser automáticos. Cancelamento, cobrança, pagamento, assinatura, exportação, exclusão e mensagem externa exigem autorização e confirmação proporcional.

### 3.8 Menos telas, mais objetos coerentes

Não criar uma tela para cada intenção. Usar objetos universais tipados, vistas por área, filtros, relações e ações explícitas.

---

## 4. Arquitetura de informação

A navegação principal é:

```text
Agora → Área → Objeto → Evidência → Ação
```

A estrutura global é:

```text
ZapTrack
├── Agora
│   ├── Visão geral
│   ├── Minha agenda
│   ├── Minhas pendências
│   ├── Aguardando terceiros
│   ├── Atenção
│   └── Atividade recente
├── Áreas
│   ├── Comercial
│   ├── Atendimento
│   ├── Financeiro
│   ├── Operações
│   ├── Suprimentos
│   ├── Pessoas
│   ├── Projetos
│   └── Diretoria
├── Conhecimento
│   ├── Conversas
│   ├── Objetos de gestão
│   ├── Pessoas e organizações
│   ├── Arquivos e documentos
│   └── Busca global
├── Análise
│   ├── Indicadores
│   ├── Relatórios
│   ├── Tendências
│   └── Histórico de decisões
├── Controle
│   ├── Revisão da IA
│   ├── Aprovações
│   ├── Automações
│   ├── Fontes e integrações
│   ├── Permissões e privacidade
│   ├── Taxonomia e estados
│   └── Auditoria
└── Assistente
    ├── Chat na aplicação
    ├── Preferências do agente
    └── Abrir no WhatsApp
```

![App map do ZapTrack](https://private-us-east-1.manuscdn.com/sessionFile/6kyDMg1hYN0vL138nYOYJh/sandbox/N2vpFVERbRTOf1WlPifMwc-images_1787770598425_na1fn_L2hvbWUvdWJ1bnR1L3phcHRyYWNrX2FwcF9tYXA.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNmt5RE1nMWhZTjB2TDEzOG5ZT1lKaC9zYW5kYm94L04ydnBGVkVSYlJUT2YxV2xQaWZNd2MtaW1hZ2VzXzE3ODc3NzA1OTg0MjVfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzcGhjSFJ5WVdOclgyRndjRjl0WVhBLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc4OTQzMDQwMH19fV19&Key-Pair-Id=K2QY5QTL8JSY6C&Signature=MEUCIQC6G93MDv37B~EFMVTL6ycRj5NSHwCH-J2kFE02cDqIkQIgVu~c7hcQDi-HkerHsYxGzqz99duz04G8SCvbpsNAnAA_)

### 4.1 Agora

`Agora` é a home operacional. Deve exibir:

```text
Prioridade recomendada
Hoje
Minha fila
Aguardando terceiros
Atenção e riscos
Atividade recente
```

A prioridade recomendada deve conter título, motivo, impacto, party/área, evidência e ação primária. O usuário pode dispensá-la, adiá-la ou pedir mais contexto.

### 4.2 Áreas

Cada área possui a mesma anatomia:

```text
Resumo
├── indicadores essenciais
├── prioridade recomendada
├── atenção da área
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

| Área | Objetos principais | Atenção principal |
|---|---|---|
| Comercial | Leads, oportunidades, propostas, vendas, renovações | Oportunidade sem retorno, proposta vencendo |
| Atendimento | Casos, reclamações, incidentes, feedbacks, SLA | Cliente aguardando, SLA vencido, reclamação crítica |
| Financeiro | Cobranças, faturas, pagamentos, reembolsos, disputas | Vencimento, promessa quebrada, evidência faltante |
| Operações | Pedidos, envios, entregas, tarefas, ocorrências | Atraso, bloqueio, pedido incompleto |
| Suprimentos | Compras, cotações, pedidos de compra, fornecedores | Aprovação pendente, fornecedor atrasado |
| Pessoas | Tarefas, responsabilidades, reuniões, aprovações | Tarefa sem owner, decisão não comunicada |
| Projetos | Projetos, iniciativas, marcos, riscos, decisões | Bloqueio, dependência, desvio de escopo |
| Diretoria | Decisões, riscos, compromissos, indicadores | Risco de alto impacto, decisão vencida |

### 4.3 Conhecimento

A área de conhecimento permite explorar a empresa sem obrigar o usuário a saber em qual área um registro foi criado.

A busca combina filtros estruturados, texto exato, entidades, aliases, busca semântica, relações e evidências. Todo resultado deve indicar se veio de objeto, conversa, documento, pessoa ou correspondência semântica.

### 4.4 Análise

A análise segue:

```text
Indicador → Definição → Período → Escopo → Resultado → Drill-down → Evidência
```

Nenhum número deve aparecer sem definição, fonte, período, timezone e frescor. O LLM interpreta a pergunta e redige; o cálculo é determinístico.

### 4.5 Controle

Controle é o centro de confiança:

| Subárea | Responsabilidade |
|---|---|
| Revisão da IA | Confirmar, corrigir, rejeitar e mesclar interpretações |
| Aprovações | Autorizar ações sensíveis |
| Automações | Configurar regras de baixo risco |
| Fontes | Conectar, limitar, pausar e diagnosticar |
| Permissões | Definir acesso por membro, área, objeto e operação |
| Privacidade | Consentimento, retenção, exportação e exclusão |
| Taxonomia | Rótulos, sinônimos, campos e estados |
| Auditoria | Acesso, inferência, alteração e ação |

---

## 5. App map operacional

### 5.1 Rotas de onboarding

```text
/onboarding/boas-vindas
/onboarding/criar-workspace
/onboarding/configurar-organizacao
/onboarding/conectar-fonte
/onboarding/parear-whatsapp
/onboarding/escolher-areas
/onboarding/configurar-permissoes
/onboarding/primeiro-valor
```

### 5.2 Rotas do app

```text
/app/agora
/app/agora/agenda
/app/agora/pendencias
/app/agora/atencao
/app/areas/:area
/app/areas/:area/resumo
/app/areas/:area/atencao
/app/areas/:area/objetos
/app/areas/:area/conversas
/app/areas/:area/pessoas
/app/areas/:area/documentos
/app/areas/:area/indicadores
/app/conhecimento/conversas
/app/conhecimento/conversas/:id
/app/conhecimento/objetos
/app/conhecimento/objetos/:id
/app/conhecimento/pessoas
/app/conhecimento/pessoas/:id
/app/conhecimento/organizacoes/:id
/app/conhecimento/arquivos
/app/conhecimento/arquivos/:id
/app/conhecimento/busca
/app/analise/indicadores
/app/analise/indicadores/:id
/app/analise/relatorios
/app/analise/tendencias
/app/controle/revisao-da-ia
/app/controle/revisao-da-ia/:id
/app/controle/aprovacoes
/app/controle/automacoes
/app/controle/fontes
/app/controle/permissoes
/app/controle/privacidade
/app/controle/taxonomia
/app/controle/estados
/app/controle/auditoria
/app/assistente/chat
```

### 5.3 Links profundos

```text
/links/evidencia/:token
/links/objeto/:token
/links/aprovacao/:token
/links/pareamento/:token
```

Links profundos abertos a partir do WhatsApp devem respeitar sessão, expiração e permissão. Um link não deve transformar um usuário não autorizado em membro do workspace.

---

## 6. Interfaces

### 6.1 Shell desktop

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

### 6.2 Shell mobile

```text
Cabeçalho: voltar | título | busca/agente
Conteúdo: prioridade → lista → detalhe
Rodapé: Agora | Áreas | Buscar | Agente | Mais
```

Mobile prioriza consulta, atenção, evidência e ação curta. Desktop prioriza revisão em massa, comparação, filtros persistentes, documentos e análise.

### 6.3 Tela universal de objeto

```text
[tipo] [status] [prioridade] [confiança]
título
partes · owner · área · prazo · valor

[ação primária] [mais ações]

Resumo | Evidência | Histórico | Relações | Atividade | Auditoria
```

A aba Evidência é obrigatória quando o objeto foi criado por interpretação. Histórico mostra transições e correções. Relações mostra objetos, parties e dependências.

### 6.4 Tela de conversa

```text
Conversa
├── cabeçalho: fonte · participantes · período · área
├── resumo contextual
├── timeline de mensagens
├── painel “O que o ZapTrack identificou”
├── objetos derivados
├── arquivos e documentos
└── revisão/correção
```

### 6.5 Tela de revisão da IA

```text
fila de sugestões
  → filtro por área/tipo/confiança
  → resumo da interpretação
  → evidência navegável
  → aceitar / corrigir / rejeitar / adiar
  → campos de objeto
  → salvar e avançar
```

### 6.6 Tela de aprovação

```text
ação solicitada
├── quem pediu
├── objeto e parâmetros
├── impacto
├── evidência
├── política aplicada
├── aprovar
├── rejeitar
└── pedir alteração
```

### 6.7 Assistente na aplicação

O chat interno é útil para perguntas abertas, análise contextual e comandos. Deve mostrar a origem da resposta, ferramentas utilizadas em linguagem compreensível e links para objetos/evidências. Não deve expor um trace técnico confuso por padrão.

---

## 7. Agente no WhatsApp

O agente é a interface diária para:

```text
consultar
registrar
revisar
confirmar
corrigir
agir
receber atenção
```

### 7.1 Capacidades do agente

| Intenção | Exemplos |
|---|---|
| Atenção | “O que precisa da minha atenção?” |
| Pendência | “O que vence hoje?” |
| Decisão | “O que ficou decidido na reunião?” |
| Pessoa | “O que está pendente com a Beta?” |
| Conversa | “Quando falamos de preço?” |
| Documento | “Ache o contrato da Alfa.” |
| Métrica | “Quantas propostas foram enviadas este mês?” |
| Registro | “Crie uma tarefa para sexta.” |
| Correção | “Isso não é venda, é oportunidade.” |
| Ação | “Marque como concluída.” |
| Controle | “Pause os alertas até segunda.” |

### 7.2 Comandos previsíveis

```text
AJUDA
VINCULAR <código>
DESVINCULAR
AGORA
MINHAS PENDÊNCIAS
VENCENDO HOJE
OPORTUNIDADES SEM RETORNO
DECISÕES DA SEMANA
RESUMIR <pessoa/empresa/conversa>
CRIAR TAREFA <descrição>
CONCLUIR <id>
PAUSAR ALERTAS
ABRIR NA APLICAÇÃO
```

A linguagem natural é a interface principal; os comandos existem para confirmação, baixa conectividade e previsibilidade.

### 7.3 Formato de resposta

```text
Conclusão
Contexto mínimo
Evidência/frescor
Próximo passo
```

Exemplo:

> Você tem **4 pendências vencendo hoje**. A mais urgente é a proposta da Alfa, prometida em 12/08 e sem confirmação. Quer criar um lembrete ou abrir os detalhes?

---

## 8. Personas e jornadas

### 8.1 Proprietário/sócio

Busca visão de risco e resultado sem navegar em sistemas complexos. Usa o WhatsApp durante o dia e a aplicação para decisões, indicadores e revisão.

### 8.2 Gestor de área

Busca filas, responsáveis, prazos, gargalos e métricas. Usa a aplicação para organizar a equipe e o WhatsApp para consultar e agir rapidamente.

### 8.3 Operador/especialista

Busca contexto e próximo passo. Usa a aplicação para executar o trabalho e o WhatsApp para registrar, confirmar e atualizar.

### 8.4 Administrador

Busca controlar fontes, permissões, retenção, taxonomia e auditoria. Usa principalmente a aplicação.

### 8.5 Analista/consultor

Busca explorar relações, histórico, evidências e indicadores. Usa a aplicação e o agente para perguntas exploratórias.

### 8.6 Jornada transversal

```text
Descobrir
  → conectar fonte
  → parear WhatsApp
  → processar conversas
  → revisar sugestões
  → consultar no agente
  → transformar em objeto
  → agir com segurança
  → receber atenção
  → medir resultado
  → corrigir e melhorar
```

### 8.7 Primeiro valor

O primeiro valor ocorre quando o usuário pergunta “o que precisa da minha atenção?” e recebe uma resposta baseada em dados estruturados, evidência e escopo autorizado.

---

## 9. App flows essenciais

### 9.1 Onboarding

```text
Boas-vindas
  → criar workspace
  → configurar empresa/timezone
  → escolher áreas
  → conectar/importar fonte
  → parear WhatsApp
  → revisar primeiras sugestões
  → consultar Agora/agente
```

Não exigir configuração completa antes do primeiro valor. Mostrar a próxima decisão necessária.

### 9.2 Pareamento

```text
aplicação gera código
  → usuário envia VINCULAR <código>
  → webhook valida telefone/código
  → backend vincula membro/workspace
  → agente confirma escopo
```

Estados: `code_created`, `awaiting_message`, `verified`, `linked`, `expired`, `revoked`.

### 9.3 Ingestão

```text
evento recebido
  → validar origem
  → deduplicar
  → persistir bruto
  → normalizar
  → identificar conversa/party
  → processar mídia
  → interpretar
  → validar schema
  → criar evento/proposta
  → indexar e atualizar Agora
```

Análise pesada deve ser assíncrona. O usuário precisa distinguir processando, processado parcialmente, falha e sem permissão.

### 9.4 Conversa vira objeto

```text
mensagem
  → evidência
  → ato linguístico
  → ação de negócio
  → objeto/estado/tempo/party
  → proposta de objeto
  → confirmação/correção
  → objeto oficial
  → owner/prazo
  → acompanhamento
```

### 9.5 Consulta no WhatsApp

```text
pergunta
  → identidade/workspace
  → classificar consulta
  → resolver escopo
  → consultar objetos estruturados
  → recuperar evidência/contexto
  → responder com frescor
  → refinar/abrir/agir
```

### 9.6 Criação de tarefa

```text
“Crie tarefa para enviar proposta da Alfa até sexta.”
  → resolver Alfa
  → resolver proposta
  → resolver prazo
  → apresentar resumo
  → confirmar
  → criar
  → retornar ID/status
```

### 9.7 Desambiguação

```text
comando ambíguo
  → buscar candidatos
  ├── um → mostrar alvo e executar/confirmar
  ├── vários → perguntar qual
  └── nenhum → informar e sugerir busca
```

### 9.8 Atenção proativa

```text
regra detectada
  → calcular impacto/urgência
  → verificar escopo/silêncio
  → agrupar
  → criar AttentionItem
  → digest/Agora
  → abrir/adiar/delegar/agir
```

### 9.9 Agendamento, cancelamento e reagendamento

```text
solicitação
  → resolver compromisso
  → extrair participantes/local/tempo
  → verificar conflitos
  → proposta
  → confirmação
  → atualizar estado
  → executar integração permitida
```

Reagendamento preserva o intervalo anterior e cria transição. Cancelamento exige alvo explícito, autoridade e confirmação forte.

### 9.10 Comercial

```text
interesse
  → oportunidade candidata
  → qualificação
  → proposta/cotação
  → negociação
  → aprovação/aceite
  → venda/pedido
  → pós-venda/renovação
```

### 9.11 Atendimento

```text
reclamação/pergunta
  → cliente e assunto
  → pedido/serviço relacionado
  → caso/SLA
  → severidade
  → atribuição
  → resposta/resolução
  → feedback
```

### 9.12 Pedido, compras e entrega

```text
pedido mencionado
  → itens/quantidade/valor
  → comprador/vendedor
  → pedido/compra
  → aprovação
  → confirmação
  → envio/entrega
  → atraso/exceção
  → entrega/recusa/devolução
```

### 9.13 Financeiro

```text
cobrança/fatura/pagamento
  → party/documento
  → valor/data/moeda
  → ordem/contrato/fatura
  → promessa/cobrança/pagamento/disputa
  → evidência
  → atenção ou atualização
```

O MVP consulta e registra; não paga, cobra ou concilia automaticamente.

### 9.14 Arquivo/documento

```text
arquivo
  → MIME/checksum/storage
  → OCR/transcrição
  → indexação
  → entidades/eventos
  → vínculo
  → resumo/evidência
  → ação controlada
```

### 9.15 Métrica

```text
pergunta
  → identificar métrica
  → pedir período/escopo
  → aplicar definição/fórmula
  → calcular
  → responder com frescor
  → drill-down
```

### 9.16 Aprovação e ação sensível

```text
comando
  → resolver alvo/parâmetros
  → verificar permissão
  → aplicar política
  → confirmação forte/aprovação
  → executar idempotente
  → registrar resultado
  → atualizar estado/auditoria
```

---

## 10. Estados de interface e domínio

### 10.1 Estados universais de UI

```text
loading
empty
ready
partial
processing
needs_review
ambiguous
no_permission
source_unavailable
success
failed
blocked
archived
```

### 10.2 Estados de objeto

| Objeto | Estados principais |
|---|---|
| Tarefa | Suggested, Open, Assigned, InProgress, Blocked, Completed, Cancelled |
| Compromisso | Proposed, Requested, Confirmed, Rescheduled, Cancelled, Completed, NoShow |
| Oportunidade | New, Qualified, Proposal, Negotiation, Won, Lost, Renewal |
| Pedido | Requested, Approved, Confirmed, Processing, Shipped, Delivered, Returned, Cancelled |
| Contrato | Draft, Proposed, Approved, Signed, Active, Expired, Renewed, Terminated |
| Fatura | Draft, Issued, Sent, Due, Overdue, Paid, Disputed, Cancelled |
| Pagamento | Promised, Initiated, Pending, Completed, Failed, Reversed, Disputed |
| Entrega | Planned, Scheduled, Picked, Shipped, InTransit, Delayed, Delivered, Refused, Returned |
| Caso | Open, Acknowledged, Assigned, InProgress, Resolved, Reopened, Closed |
| Decisão | Proposed, UnderReview, Approved, Rejected, Communicated, Executed, Superseded |

### 10.3 Confiança

A interface não deve exibir apenas uma porcentagem. Deve usar:

```text
Confirmado
Revisar
Interpretação incerta
Há duas possibilidades
Sem fonte suficiente
```

No backend, manter confiança por dimensão: detecção, ação, objeto, actor, party, estado, tempo, valor e evidência.

---

## 11. Componentes de interface

### Estrutura

`AppShell`, `Sidebar`, `MobileNav`, `Topbar`, `Breadcrumbs`, `WorkspaceSwitcher`, `AreaHeader`, `PageHeader`, `ContextPanel`, `CommandPalette`.

### Atenção

`PriorityCard`, `AttentionList`, `SnoozeControl`, `ReasonPopover`, `ImpactBadge`, `DueDateBadge`, `WaitingOnCard`.

### Objetos

`ObjectCard`, `ObjectTable`, `ObjectBoard`, `ObjectCalendar`, `ObjectStatus`, `OwnerAvatar`, `RelationChips`, `ObjectDetail`, `ObjectActions`, `BulkActionBar`.

### Evidência

`EvidenceCard`, `MessageQuote`, `ConversationPreview`, `AudioEvidence`, `DocumentPreview`, `PageSelector`, `OpenSourceButton`, `ConfidenceBadge`, `InterpretationPanel`.

### Revisão

`ReviewQueue`, `ReviewCard`, `AcceptButton`, `RejectButton`, `CorrectTypeSelect`, `EntityResolutionPicker`, `MergeDialog`, `DiffViewer`, `ConfidenceReason`.

### Ação

`ActionButton`, `ConfirmDialog`, `ApprovalCard`, `PolicyNotice`, `RiskNotice`, `ExecutionStatus`, `UndoAction`, `IdempotencyNotice`.

### Análise

`MetricCard`, `MetricDefinition`, `MetricFreshness`, `TimeRangePicker`, `FilterBar`, `DrilldownPanel`, `TrendChart`, `BreakdownTable`, `ExportButton`.

### Conversa

`ChatPanel`, `MessageList`, `MessageComposer`, `SuggestionChips`, `AgentResponse`, `SourceCitation`, `OpenInWhatsAppButton`.

---

## 12. Segurança e governança na experiência

O WhatsApp não deve eliminar governança. O agente carrega identidade, workspace, role, fontes permitidas, objetos permitidos, operações permitidas e estado de consentimento.

A autorização ocorre antes da recuperação e antes da execução. O agente não consulta tabelas diretamente; chama ferramentas de domínio tipadas.

| Ação | Tratamento |
|---|---|
| Resumo/evidência | Automático |
| Sugestão de objeto | Automático, revisão disponível |
| Rascunho | Automático e editável |
| Tarefa interna | Permitida conforme política |
| Delegação | Confirmação inicial |
| Alteração em CRM/ERP | Política + confirmação |
| Mensagem externa | Confirmação forte |
| Exportação | Admin + confirmação |
| Cancelamento/cobrança/pagamento | Bloqueado ou aprovação forte |
| Exclusão | Aplicação + confirmação forte |

A aplicação deve conter trilha de auditoria, consentimento, retenção, exportação, exclusão, revogação de fonte e revisão de acesso.

---

## 13. Priorização MVP/MLP

### MVP

O MVP deve provar:

```text
fonte/conversa
  → evidência
  → evento estruturado
  → objeto de gestão
  → consulta no WhatsApp
  → atenção no Agora
  → revisão na aplicação
  → tarefa/compromisso interno
```

Inclui auth, workspace, membros, pareamento, Conversation, Message, Party, Evidence, InteractionEvent, Task, Commitment, Decision, Request, AttentionItem, agente de consulta, revisão/correção, busca básica, Agora e auditoria mínima.

### MLP

Adiciona Comercial, Atendimento, Financeiro e Operações como views; Opportunity, Complaint, Invoice, Payment, Order, Delivery; arquivos com busca; métricas definidas; aprovações; alertas agrupados; busca híbrida e primeira integração de destino.

### Depois

Integrações CRM/ERP, automações configuráveis, agentes especializados, grafo visual avançado, omnichannel, acesso elegível a fontes adicionais e ações financeiras externas.

### Fora do começo

Não construir leitura indiscriminada de WhatsApp pessoal, acesso geral a grupos existentes, CRM completo, ERP, workflow builder genérico, cobrança automática, pagamento, assinatura de contrato, score comportamental de colaboradores ou dezenas de agentes independentes.

---

## 14. Critérios de aceite de produto

O blueprint deve ser considerado implementável quando:

1. uma mensagem pode ser visualizada com interpretação, evidência, confiança e objeto derivado;
2. o usuário pode consultar o mesmo objeto no WhatsApp e na aplicação;
3. uma correção feita em uma interface aparece na outra;
4. o sistema distingue proposta, compromisso, confirmação e conclusão;
5. datas relativas preservam expressão original, timezone e normalização;
6. ações sensíveis mostram alvo, consequência, política e confirmação;
7. o gestor consegue revisar em massa sem perder evidência individual;
8. métricas mostram fórmula, fonte, período e frescor;
9. identidade e permissão são aplicadas antes da recuperação;
10. toda ação produz resultado e auditoria;
11. falhas de fonte e processamento têm estado visível;
12. o sistema consegue manter `unknown`, `ambiguous` e `not_applicable` sem quebrar o fluxo.

---

## 15. Métricas de UX e produto

| Métrica | O que mede |
|---|---|
| Tempo até primeiro valor | Quão rápido o usuário encontra uma informação real |
| Uso recorrente do agente | Se o WhatsApp virou hábito |
| Taxa de sugestões aceitas | Utilidade da estruturação |
| Taxa de correção | Falhas de semântica e resolução |
| Abertura de evidência | Confiança e verificabilidade |
| Conversas → objetos | Transformação real em gestão |
| Objetos → conclusão | Efetividade operacional |
| Alertas úteis | Antecipação sem ruído |
| Tempo de resposta | Ganho de velocidade |
| Incidentes de autorização | Segurança e governança |

---

## 16. Princípios de implementação para produto e design

A aplicação deve utilizar shell consistente, componentes reutilizáveis, filtros persistentes, estados de carregamento/vazio/erro, acessibilidade, responsividade, foco de teclado e linguagem humana.

A implementação deve começar pelas rotas e pelo shell antes das telas individuais. O componente de detalhe universal e o padrão de evidência devem existir antes de criar módulos de área. A aplicação deve reutilizar tabelas, cards, drawers, dialogs, timelines e filtros; customização só é justificável quando produzir valor claramente superior.

O agente e a aplicação devem chamar as mesmas procedures e comandos de domínio. A lógica de negócio não pode ser reimplementada em prompts separados por canal.

---

## 17. Síntese final

A experiência correta do ZapTrack é uma experiência de **gestão conversacional progressiva**:

```text
A empresa conversa
  → o ZapTrack organiza
  → estrutura o significado
  → mostra o que importa
  → transforma em objeto
  → confirma o que é incerto
  → acompanha o estado
  → antecipa riscos
  → permite agir
  → registra o resultado
```

A aplicação externa não compete com o WhatsApp; ela torna o WhatsApp confiável. O WhatsApp não substitui a aplicação; ele torna o ZapTrack presente no fluxo diário de trabalho.

> **O ZapTrack não deve parecer um ERP reduzido nem um chatbot com dashboard. Deve parecer uma camada operacional que transforma a conversa viva da empresa em uma gestão navegável, verificável e acionável.**

A arquitetura de informação, os app flows e as interfaces devem manter essa promessa em cada decisão: **menos menus, mais contexto; menos cadastro, mais atenção; menos automação cega, mais evidência; menos aplicativos paralelos, mais continuidade entre conversa e gestão.**

---

## Documentos de apoio

- `zaptrack_ux_model.md`
- `zaptrack_information_architecture.md`
- `zaptrack_personas_journeys.md`
- `zaptrack_app_map_interfaces.md`
- `zaptrack_app_flows.md`
- `zaptrack_ux_validation_prioritization.md`
- `zaptrack_ontology_erd.png`
- `zaptrack_app_map.png`
- `ZapTrack_Especificacao_Master_Semantica_Ontologia_Entidades.md`
