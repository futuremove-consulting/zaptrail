# ZapTrail — recalibração de mobile, web, onboarding e MVP

## 1. Decisão de superfície

O MVP não precisa começar com um aplicativo nativo instalado. O requisito essencial é que o uso móvel de baixa atenção aconteça no WhatsApp, por meio do agente. A aplicação externa pode ser uma web app responsiva, acessível por link no notebook ou celular.

```text
Mobile em movimento = WhatsApp + agente
Casa/escritório = web app responsiva
App nativo = evolução condicionada a demanda comprovada
```

Isso reduz custo, fricção de instalação, complexidade de distribuição e duplicação de frontend. A aplicação web continua mobile-first no design, mas não precisa competir com o WhatsApp como canal de mobilidade.

## 2. Frontend recomendado

Para este novo modelo, a decisão muda em relação à recomendação anterior de Expo como frontend primário:

> **Escolher Next.js/React como aplicação externa principal, responsiva e mobile-first; manter a experiência móvel imediata no WhatsApp.**

Expo/React Native deixa de ser obrigatório e passa a ser uma opção futura, caso o produto comprove necessidade de notificações nativas, offline, captura avançada, distribuição em lojas ou uso recorrente fora do WhatsApp.

A justificativa é pragmática: o centro de comando precisa funcionar muito bem em notebook e celular; o canal móvel principal já é o WhatsApp; o MVP ganha velocidade com uma única web app responsiva e um único backend.

## 3. MVP reformulado

### Obrigatório

```text
conta e autenticação
workspace
configuração do AgentConnection
conexão ou cadastro da SourceConnection
lista de conversas 1:1 e grupos
seleção de uma conversa
organização sob demanda
pipeline semântico mínimo
objetos de gestão com evidência
timeline original/estruturada
Mostrar na conversa
agente WhatsApp com perguntas read-only
links profundos para a aplicação
```

### Importante, mas depois do primeiro caminho

```text
confirmação de objetos pelo agente
calendário
Kanban
projetos e empresas como filtros e contexto
arquivos indexados
resumos recorrentes
```

### Fora do MVP inicial

```text
app nativo de loja
offline completo
agente autônomo de escrita externa
múltiplos workspaces complexos
GraphRAG sofisticado
Neo4j
automação de campanhas
pagamentos/contratos/ações irreversíveis
```

## 4. Onboarding coerente com os dois momentos

```text
1. criar conta no ZapTrail
2. entender a promessa: “organize uma conversa em minutos”
3. configurar/confirmar o número do agente
4. conectar ou cadastrar a fonte WhatsApp
5. explicar exatamente o que será processado
6. selecionar uma conversa 1:1 ou grupo
7. escolher período/limite
8. organizar sob demanda
9. revisar preview
10. abrir timeline
11. clicar Mostrar na conversa
12. enviar primeira pergunta ao agente
```

A conexão pode exigir dois números/conexões: uma fonte para indexação e um número do agente para perguntas. O produto deve dizer isso claramente quando necessário e validar se o provider escolhido suporta a topologia desejada.

## 5. Home da aplicação

A home não deve ser um dashboard genérico. Deve ser o ponto de continuidade entre WhatsApp e aplicação:

```text
Olá, Gus

[Continuar de onde parei]
[Conversas recentes]
[Objetos que exigem atenção]
[Projetos ativos]
[Abrir agente no WhatsApp]
```

Se o usuário chegou por deep link, a aplicação abre diretamente no contexto solicitado.

## 6. Navegação web

```text
Agora
Conversas
Grupos
Empresas/Pessoas
Projetos
Timeline
Calendário
Kanban
Busca
Configurações
```

Em desktop, usar sidebar e painel de detalhe. Em celular, usar tabs inferiores para `Agora`, `Conversas`, `Projetos` e `Mais`, com busca global sempre acessível. A aplicação não deve tentar reproduzir a navegação do WhatsApp.

## 7. Arquitetura técnica revisada

```text
Next.js/React responsivo
  → Supabase Auth
  → Supabase Postgres/Storage
  → Supabase Edge Functions
  → Provider WhatsApp Adapter
  → Agent Router
  → Semantic Pipeline
  → Timeline/Object Projections
```

O número do agente pode receber mensagens via UAZAPI. A fonte de conversas pode ser o mesmo provider ou uma conexão separada, desde que a sessão, escopo e consentimento sejam explicitamente modelados.

## 8. Caminho de ativação

O evento de ativação deve ser:

```text
usuário autenticado
+ uma fonte conectada ou fixture autorizada
+ uma conversa selecionada
+ timeline estruturada pronta
+ evidência aberta na conversa original
+ primeira pergunta bem-sucedida ao agente
```

Não considerar “criou conta” ou “conectou WhatsApp” como ativação. O valor só foi demonstrado quando a conversa virou estrutura utilizável.

## 9. Métricas por momento

| Momento | Métrica principal |
|---|---|
| Rua/WhatsApp | pergunta respondida com evidência |
| Casa/escritório | timeline aberta e filtrada |
| Continuidade | deep link aberto no contexto correto |
| Confiança | evidência visualizada |
| Operação | objeto confirmado ou corrigido |
| Retenção | retorno ao agente ou à aplicação em 7 dias |

## 10. Regra de simplicidade

Não construir duas experiências completas. Construir um núcleo e especializar:

```text
WhatsApp = entrada de baixa fricção
Web = exploração e controle
Backend = verdade, semântica e autorização
```

O agente não deve ganhar um dashboard escondido em mensagens; a web não deve ganhar um chat obrigatório para cada tarefa.

## 11. Resultado estratégico

O ZapTrail deixa de ser “um app mobile com integração WhatsApp” e passa a ser:

> **Um sistema de gestão conversacional que acompanha o profissional no WhatsApp e organiza o trabalho em uma aplicação quando ele precisa enxergar o todo.**
