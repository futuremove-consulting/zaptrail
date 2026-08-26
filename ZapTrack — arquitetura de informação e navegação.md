# ZapTrack — arquitetura de informação e navegação

## 1. Princípio de navegação

A aplicação externa deve organizar a complexidade por **contexto de negócio**, não por tecnologia, modelo de IA ou agente. O usuário navega por:

```text
Agora → Área → Objeto → Evidência → Ação
```

A navegação começa pelo que exige atenção, permite entrar numa área de trabalho, abrir um objeto gerencial, verificar a evidência na conversa e executar uma ação controlada.

## 2. Estrutura global

```text
ZapTrack
├── Agora
│   ├── Visão geral
│   ├── Minha agenda
│   ├── Minhas pendências
│   ├── Atenção da empresa
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
│   └── Configurações
└── Agente
    ├── Conversar na aplicação
    ├── Preferências do agente
    └── Abrir no WhatsApp
```

## 3. Navegação primária recomendada

| Item | Propósito | Pergunta respondida |
|---|---|---|
| Agora | Prioridade e ação imediata | “O que precisa da minha atenção?” |
| Áreas | Contexto organizacional | “Em que parte da empresa isso acontece?” |
| Conhecimento | Exploração e recuperação | “Onde está a informação?” |
| Análise | Padrões e desempenho | “O que está acontecendo ao longo do tempo?” |
| Controle | Confiança e administração | “Quem pode ver, alterar ou automatizar?” |
| Agente | Atalho conversacional | “Posso perguntar ou comandar isso?” |

`Agente` pode ficar como botão persistente no cabeçalho e como item de navegação, mas não deve substituir a estrutura do produto.

## 4. Agora

`Agora` é a página inicial após login. Ela não deve ser um dashboard genérico cheio de gráficos. Deve ser uma central operacional com quatro blocos:

```text
Agora
├── Prioridade recomendada
├── Pendências minhas
├── Aguardando terceiros
└── Mudanças e riscos recentes
```

### Blocos principais

| Bloco | Conteúdo |
|---|---|
| Prioridade recomendada | O item de maior impacto/urgência com motivo e evidência |
| Hoje | Agenda, prazos, pagamentos, entregas e aprovações do dia |
| Minha fila | Tarefas, decisões e revisões atribuídas ao usuário |
| Aguardando | Retornos de clientes, fornecedores, colaboradores e parceiros |
| Atenção | Atrasos, reclamações, baixa confiança, conflitos e exceções |
| Recente | Objetos criados, estados alterados e novas mensagens relevantes |

A recomendação deve ser explicável e desconsiderável. O usuário deve conseguir ver “por que isto está no topo”.

## 5. Áreas da empresa

As áreas são **views contextuais** sobre o mesmo núcleo, não bancos ou módulos semânticos independentes.

Cada área usa uma estrutura comum:

```text
Área
├── Resumo
├── Atenção
├── Objetos
├── Conversas
├── Pessoas e organizações
├── Arquivos e documentos
├── Indicadores
└── Configuração da área
```

### Comercial

Objetos: leads, oportunidades, propostas, cotações, vendas, renovações e follow-ups. Atenções: oportunidade sem retorno, proposta vencendo, decisão pendente e compromisso comercial atrasado.

### Atendimento

Objetos: casos, solicitações, reclamações, incidentes, resoluções, SLA e feedback. Atenções: reclamação crítica, cliente aguardando, caso reaberto e prazo de resposta vencido.

### Financeiro

Objetos: cobranças, faturas, pagamentos, reembolsos, disputas e compromissos financeiros. Atenções: vencimentos, promessas de pagamento, divergências e evidência faltante.

### Operações

Objetos: pedidos, entregas, envios, tarefas, ocorrências e exceções. Atenções: atraso, bloqueio, pedido incompleto, entrega sem confirmação e dependência vencida.

### Suprimentos

Objetos: solicitações de compra, cotações, pedidos de compra, fornecedores, recebimentos e devoluções. Atenções: aprovação pendente, fornecedor atrasado e compra sem cotação.

### Pessoas

Objetos: responsabilidades, reuniões, tarefas, aprovações, alocações e feedbacks internos. Atenções: tarefa sem owner, decisão não comunicada, conflito e dependência de equipe.

### Projetos

Objetos: projetos, iniciativas, marcos, tarefas, riscos, decisões e documentos. Atenções: bloqueios, marcos próximos, mudança de escopo e decisões aguardando aprovação.

### Diretoria

Objetos: decisões, compromissos, riscos, indicadores e iniciativas. Atenções: riscos de alto impacto, decisões vencidas, compromissos estratégicos e desvios.

## 6. Conhecimento

### Conversas

A área de conversas deve permitir:

- lista por fonte, canal, período, participante, área e relevância;
- timeline de mensagens;
- participantes e papéis;
- objetos derivados;
- evidências e arquivos;
- resumo contextual;
- busca dentro da conversa;
- revisão/correção de interpretações.

A conversa não deve ser apenas uma caixa de entrada. Deve mostrar o que o ZapTrack entendeu e permitir voltar à fonte.

### Objetos de gestão

A visão universal deve oferecer filtros por:

```text
tipo
status
área
owner
party/organização
período
prioridade
confiança
fonte
projeto
relação
```

O usuário deve poder trocar entre lista, quadro, agenda, timeline e grafo leve de relações, sem duplicar dados.

### Pessoas e organizações

A página de uma pessoa/organização deve reunir:

```text
perfil
papéis e relações
conversas
objetos relacionados
decisões e compromissos
pedidos/vendas/compras
financeiro
arquivos
histórico
```

O conteúdo exibido depende das permissões e do papel do usuário.

### Arquivos e documentos

A biblioteca deve permitir busca por nome, conteúdo, conversa, tipo, pessoa, organização, área, data, status e evidência. O preview precisa mostrar documento, extrações e objetos vinculados.

### Busca global

A busca deve combinar:

1. filtros estruturados;
2. texto exato e full-text;
3. entidades e aliases;
4. busca semântica;
5. relações;
6. evidência.

A interface deve indicar por que um resultado apareceu: “encontrado no objeto”, “encontrado na conversa” ou “encontrado por significado semelhante”.

## 7. Análise

A análise não deve começar por gráficos. Deve começar por perguntas e definições:

```text
Indicador → Definição → Período → Escopo → Resultado → Drill-down → Evidência
```

O usuário pode perguntar ao agente e abrir a definição na aplicação. Cada número deve mostrar fórmula, fonte, frescor e objetos incluídos.

## 8. Controle

`Controle` é a área que impede que a automação se torne uma caixa-preta:

| Subárea | Função |
|---|---|
| Revisão da IA | Confirmar, corrigir, rejeitar e mesclar interpretações |
| Aprovações | Autorizar ações sensíveis e alterações externas |
| Automações | Criar regras de baixo risco e agendas |
| Fontes | Conectar, limitar, pausar e diagnosticar fontes |
| Permissões | Gerenciar acesso por workspace, área, objeto e operação |
| Privacidade | Consentimento, retenção, exportação e exclusão |
| Configurações | Taxonomia, campos, estados, notificações e preferências |

## 9. Navegação contextual do objeto

Todo objeto deve ter o mesmo cabeçalho contextual:

```text
[tipo] [status] [prioridade]
título
partes · owner · área · prazo

[ação primária] [mais ações]

Resumo | Evidência | Histórico | Relações | Atividade | Auditoria
```

A aba `Evidência` é obrigatória para interpretações de IA. `Histórico` mostra transições. `Relações` mostra outros objetos e parties. `Auditoria` depende da permissão.

## 10. Padrão de breadcrumbs

Usar breadcrumbs para preservar contexto:

```text
Comercial / Oportunidades / Alfa / Revisão de proposta
Financeiro / Pagamentos / Beta / Promessa de pagamento
Atendimento / Casos / Cliente X / Reclamação sobre entrega
```

## 11. Mobile e responsividade

O app externo deve ser mobile-first para consulta e ação rápida, mas desktop-first para revisão em massa, análise, configuração, leitura de documentos longos e gestão de permissões.

No mobile, priorizar Agora, busca, objeto, evidência, confirmação e agenda. No desktop, habilitar painéis laterais, comparação, tabelas, filtros persistentes e múltiplas relações.

## 12. Princípios de nomenclatura

| Evitar | Preferir |
|---|---|
| Intentos | O que foi identificado / ação |
| Entidades | Pessoas e organizações |
| Ontologia | Modelo semântico, em áreas avançadas |
| RAG | Busca contextual |
| Workflow | Fluxo ou automação |
| Agent orchestration | Coordenação do agente |
| Human-in-the-loop | Revisão/confirmar |
| Object proposal | Sugestão de objeto |
| Confidence score | Confiança da interpretação |

## 13. Navegação por permissão

O menu deve esconder áreas não habilitadas, mas nunca esconder um objeto ao qual o usuário tem acesso apenas porque veio de outra área. O controle real ocorre no backend e no nível da entidade, relação, evidência e ação.

## 14. Regra de consistência

Se o usuário cria uma tarefa no WhatsApp, ela aparece imediatamente em `Agora`, na área contextual, na pessoa/organização relacionada, na conversa de origem e na busca global. Se alguém altera o status na aplicação, o agente deve responder com o mesmo estado na próxima consulta.
