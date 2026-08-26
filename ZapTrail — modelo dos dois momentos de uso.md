# ZapTrail — modelo dos dois momentos de uso

## Tese

O ZapTrail não deve ser pensado como “um aplicativo com um bot no WhatsApp” nem como “um bot que também possui dashboard”. Ele é um mesmo sistema de gestão conversacional com duas superfícies complementares, desenhadas para contextos diferentes.

> **Na rua, o WhatsApp é o cockpit de baixa fricção. Em casa ou no escritório, a aplicação é o centro de comando visual.**

## Momento 1 — rua, deslocamento e baixa atenção

O usuário está no telefone, provavelmente em movimento, entre reuniões, atendimentos ou tarefas. Ele não quer abrir outra aplicação, localizar uma tela, aplicar filtros complexos ou ler um painel. Ele quer perguntar, recuperar contexto, registrar algo, confirmar uma pendência ou receber uma resposta curta.

### Ações prioritárias

```text
consultar contexto
perguntar sobre pessoa/empresa/projeto
perguntar o que está pendente
perguntar decisões recentes
registrar uma nota ou compromisso
confirmar/adiar/rejeitar sugestão
pedir resumo curto
abrir link profundo para a aplicação
```

### Interface principal

Conversa 1:1 com o agente no WhatsApp.

### Forma de resposta

```text
resposta curta
fonte/evidência resumida
status de confiança quando relevante
uma ou duas ações sugeridas
link para aprofundar na aplicação
```

## Momento 2 — casa, escritório e atenção concentrada

O usuário tem uma tela maior, mais tempo e necessidade de compreender relações, revisar hipóteses e operar objetos. Ele quer explorar conversas e grupos, empresas/pessoas, projetos, timeline, calendário, Kanban, arquivos, filtros, relatórios e configurações.

### Ações prioritárias

```text
explorar a timeline
alternar conversa original/estruturada
revisar e corrigir inferências
filtrar por pessoa, empresa, projeto, período e status
organizar tarefas e decisões
usar calendário e Kanban
auditar evidências
configurar conexões, permissões e regras
```

### Interface principal

Aplicação web responsiva, otimizada para notebook e também utilizável no celular.

## Regra de divisão

| Necessidade | WhatsApp/agente | Aplicação |
|---|---:|---:|
| Pergunta rápida | Principal | Secundária |
| Recuperar contexto antes de conversa | Principal | Secundária |
| Registrar compromisso | Principal | Principal |
| Ver conversa original | Link/recorte | Principal |
| Timeline completa | Resumo/link | Principal |
| Revisar IA | Limitado | Principal |
| Filtros avançados | Não recomendado | Principal |
| Calendário | Resposta/link | Principal |
| Kanban | Resposta/link | Principal |
| Configuração | Não | Principal |
| Auditoria e permissões | Não | Principal |

## Princípio de handoff

O usuário nunca deve ser obrigado a mudar de superfície para concluir uma tarefa simples. Também não se deve tentar comprimir uma tarefa complexa em mensagens de WhatsApp.

```text
WhatsApp resolve rapidamente.
Aplicação permite compreender e operar profundamente.
```

Quando o usuário pergunta algo no WhatsApp, o agente pode responder e oferecer:

```text
[Abrir conversa]
[Abrir timeline]
[Ver pendências]
[Ver projeto]
[Revisar evidências]
```

Esses links devem abrir a aplicação na entidade correta, com filtros e contexto preservados.

## Implicação para o MVP

O MVP deve comprovar primeiro dois caminhos:

```text
Caminho A — mobile/contexto rápido
usuário conversa com agente → pergunta → recebe resposta baseada em objetos/evidências

Caminho B — tela concentrada
usuário abre aplicação → seleciona conversa 1:1/grupo → organiza → vê timeline → mostra na conversa
```

Se o MVP não puder responder ao caminho A por limitações do provider, o fallback deve ser representar o agente dentro da aplicação e deixar o adapter de WhatsApp pronto, sem fingir que o canal está operacional.

## Decisão de frontend

A aplicação externa deve ser **web responsiva mobile-first**, acessível por link, porque ela é o centro de exploração e administração. O agente é uma interface conversacional separada e o WhatsApp é o canal de baixa fricção.

O frontend nativo Expo/React Native continua sendo uma evolução possível se houver demanda comprovada por notificações, offline, deep links nativos ou distribuição em lojas. Não é necessário transformar o MVP em um app nativo para cumprir o princípio mobile-first.

## Frase estratégica

> **ZapTrail acompanha você no WhatsApp quando você precisa de uma resposta e organiza tudo em uma aplicação quando precisa administrar o trabalho.**
