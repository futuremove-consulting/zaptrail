# ZapTrack — plano de sprints, marcos e execução com Opencode

## 1. Formato recomendado

Usar **12 sprints de uma semana**, com possibilidade de agrupar em seis ciclos de duas semanas. Para um desenvolvedor solo usando Opencode, uma semana é curta o suficiente para manter foco e longa o suficiente para entregar uma fatia verificável.

Cada sprint precisa terminar com:

```text
código executável
migração aplicada se houver banco
testes passando
verificação no browser
registro de decisões
risco atualizado
incremento demonstrável
```

Não considerar uma sprint concluída porque o código “parece pronto”. O resultado deve ser observável em uma jornada real ou em teste automatizado.

## 2. Marcos

| Marco | Sprints | Resultado |
|---|---:|---|
| M0 — Fundação | 0–1 | Projeto sobe, autenticação e workspace funcionam |
| M1 — Produto navegável | 2 | Shell e onboarding inicial funcionam |
| M2 — Fonte conectada | 3–4 | WhatsApp conectado e webhook validado |
| M3 — Dados utilizáveis | 5–6 | Mensagens persistem e conversa 1:1/grupo pode ser selecionada |
| M4 — Primeiro valor | 7–9 | Objetos e timeline estruturada com evidência funcionam |
| M5 — Publicável | 10–12 | Segurança, QA, beta e publicação concluídos |

## 3. Sprint 0 — alinhamento, ferramentas e execução

### Objetivo

Eliminar incerteza antes de escrever produto.

### Features

```text
F00.1 repositório e scaffold
F00.2 ambientes
F00.3 contratos de decisão
F00.4 critérios de aceite
```

### Tasks

1. Criar repositório, branches e arquivo de instruções para Opencode.
2. Inicializar aplicação, rodar `dev`, `check`, `test` e `build`.
3. Criar `.env.example`, README e matriz de ambientes.
4. Registrar stack escolhida e itens fora do MVP.
5. Criar quadro de backlog com IDs E/F/H/T.
6. Criar fixtures sintéticas para conversa direta e grupo.
7. Configurar formatação, typecheck, testes e CI.
8. Fazer primeiro commit executável.

### Saída

Aplicação vazia publicada em ambiente de desenvolvimento e documentação inicial.

### Gate

Não avançar se o projeto não sobe em uma máquina limpa ou se Opencode não consegue encontrar as instruções do projeto.

## 4. Sprint 1 — autenticação e workspace

### Objetivo

Criar identidade, sessão e isolamento de dados.

### Features

```text
F01.1 autenticação
F01.2 workspace
F01.3 membership/ACL mínima
F01.4 estado de onboarding
```

### Tasks

1. Integrar OAuth do scaffold.
2. Criar tela de login, logout e estados de sessão.
3. Criar tabelas workspace/membership.
4. Criar workspace inicial para novo usuário.
5. Criar procedures protegidas.
6. Aplicar workspace scope em toda query.
7. Criar testes de sessão e isolamento.
8. Criar página autenticada mínima.

### Saída

Usuário entra, vê seu workspace e não acessa dados de outro workspace.

### Gate

Teste automatizado de isolamento passa e sessão persiste após refresh.

## 5. Sprint 2 — shell e onboarding visual

### Objetivo

Criar a aplicação navegável e o caminho guiado pelo primeiro valor.

### Features

```text
F02.1 DashboardLayout/shell
F02.2 design system mínimo
F02.3 stepper de onboarding
F02.4 estados loading/empty/error
```

### Tasks

1. Implementar sidebar e layout responsivo.
2. Criar rotas Agora, Conversas, Configurações e Ajuda.
3. Criar componentes de status, progresso, card, filtro e erro.
4. Criar stepper `Conectar → Preparar → Escolher → Organizar → Ver timeline`.
5. Criar CTA principal e fallback de encaminhamento/importação.
6. Persistir a etapa de onboarding.
7. Verificar mobile, teclado e estados vazios.
8. Fazer teste de browser do caminho sem integração real.

### Saída

O usuário entende o fluxo antes de o WhatsApp estar conectado.

### Gate

O fluxo visual não possui dead-end, spinner indefinido ou tela sem próximo passo.

## 6. Sprint 3 — configuração WhatsApp e mocks

### Objetivo

Construir a integração atrás de contratos testáveis antes de depender da Meta.

### Features

```text
F03.1 configuração da fonte
F03.2 conexão simulada
F03.3 SourceConnection
F03.4 status e erros
```

### Tasks

1. Criar tabelas `source_connections`, `connection_events` e credenciais protegidas.
2. Definir interface `WhatsAppProvider`.
3. Implementar provider mock para desenvolvimento.
4. Implementar callback fake para testes.
5. Criar estados pending/connected/failed/revoked.
6. Criar tela de escopo e consentimento.
7. Criar contrato de payloads sanitizados.
8. Testar conexão sem chamadas externas.

### Saída

A aplicação demonstra conexão completa usando provider mock.

### Gate

O restante do produto não depende diretamente do SDK/API da Meta; depende do contrato interno.

## 7. Sprint 4 — conexão real e webhook

### Objetivo

Conectar o WhatsApp Business de forma oficial e receber eventos.

### Features

```text
F03.2 Embedded Signup real
F03.3 validação server-side
F03.4 webhook
F03.5 health/status
```

### Tasks

1. Configurar app, URLs e permissões da Meta nos ambientes.
2. Implementar botão e launch do Embedded Signup.
3. Tratar retorno, cancelamento e erro.
4. Trocar código/validar ativos server-side.
5. Registrar WABA/phone number IDs e status.
6. Implementar verificação e assinatura de webhook.
7. Persistir payload bruto sanitizado.
8. Responder rapidamente e enfileirar processamento.
9. Criar health check e tela de status.
10. Validar com uma conta de desenvolvimento autorizada.

### Saída

Fonte real conectada, webhook confirmado e eventos recebidos.

### Gate externo

A integração pode depender de configuração, aprovação e elegibilidade na Meta. Se o gate externo atrasar, continuar com mock e fallback de importação, sem parar o restante do MVP.

## 8. Sprint 5 — ingestão e sincronização

### Objetivo

Transformar eventos da fonte em mensagens e conversas canônicas.

### Features

```text
F04.1 raw model
F04.2 idempotência
F04.3 normalização
F04.4 SyncJob
F04.5 attachments metadata
```

### Tasks

1. Criar tabelas conversations, participants, messages, attachments e inbound_events.
2. Implementar normalização de conversa direta e grupo.
3. Persistir timestamps UTC e timestamp original.
4. Implementar dedupe por source event/message ID.
5. Implementar paginação/cursor do sync.
6. Criar SyncJob com progresso, retry e erro.
7. Criar armazenamento de metadados de arquivos.
8. Criar fixture com duplicatas, replies, áudio e arquivo.
9. Testar reprocessamento sem duplicação.
10. Criar status de sincronização na UI.

### Saída

Mensagens e conversas persistidas de maneira idempotente e observável.

### Gate

Repetir webhook e sync não gera duplicatas.

## 9. Sprint 6 — picker de conversas 1:1 e grupos

### Objetivo

Permitir que o usuário escolha a conversa que será organizada.

### Features

```text
F07.1 lista de conversas
F07.2 abas 1:1/grupos
F07.3 busca/filtros
F07.4 contexto sugerido
F07.5 seleção/confirmacao
```

### Tasks

1. Criar query paginada `conversation.list`.
2. Criar abas `Conversas 1:1` e `Grupos`.
3. Criar cards com participantes, última atividade e fonte.
4. Implementar busca por nome/pessoa/empresa/projeto.
5. Criar filtros recentes, com arquivos e com pendências.
6. Criar seleção e resumo de escopo.
7. Criar sugestões de empresa/projeto sem bloquear.
8. Persistir ConversationSelection.
9. Criar empty/error/partial states.
10. Testar seleção direta e grupo.

### Saída

Usuário escolhe uma conversa real autorizada e confirma período/escopo.

### Gate

É impossível retornar conversa de outro workspace ou selecionar item fora do escopo.

## 10. Sprint 7 — pipeline semântico mínimo

### Objetivo

Extrair significado suficiente para uma primeira timeline útil.

### Features

```text
F05.1 jobs semânticos
F05.2 structured extraction
F05.3 entities/mentions
F05.4 intents/actions/events
F05.6 evidence/confidence
F05.7 time expressions
```

### Tasks

1. Criar ProcessingRun e etapas do pipeline.
2. Criar prompt/schema de saída JSON estrita.
3. Implementar chunking por janela contextual, não por mensagem isolada.
4. Extrair participantes, entidades, menções e aliases.
5. Extrair atos: pedido, pergunta, decisão, aprovação, compromisso, reclamação e elogio.
6. Extrair ações e datas relativas.
7. Persistir evidências por message ID e trecho.
8. Validar JSON com Zod.
9. Criar quality gate para baixa confiança.
10. Criar reprocessamento seletivo.

### Saída

Uma conversa gera eventos semânticos validados, com evidência e confiança.

### Gate

Nenhum resultado inválido ou sem evidência entra na camada de objetos.

## 11. Sprint 8 — objetos de gestão

### Objetivo

Transformar eventos em unidades operacionais sem criar um módulo por intenção.

### Features

```text
F06.1 ManagementObject
F06.2 tarefa/compromisso
F06.3 decisão
F06.4 arquivo
F06.5 atenção
```

### Tasks

1. Criar management_objects e state_transitions.
2. Criar tipos task, commitment, decision, file e attention.
3. Mapear owner, due_at, status, priority e project opcional.
4. Criar regras de criação por tipo de evento.
5. Diferenciar proposta, confirmação e execução.
6. Criar detalhe lateral com histórico.
7. Criar confirmar/corrigir/ignorar.
8. Criar associação com conversa, pessoa e empresa.
9. Criar regras de atraso e sem responsável.
10. Testar múltiplos objetos na mesma janela.

### Saída

Eventos viram objetos de gestão rastreáveis e editáveis.

### Gate

O objeto mostra origem, contexto, confiança e estado; decisão não é confundida com tarefa concluída.

## 12. Sprint 9 — timeline dual e Mostrar na conversa

### Objetivo

Entregar o primeiro valor visual do ZapTrack.

### Features

```text
F08.1 conversa original
F08.2 timeline estruturada
F08.3 modo Ambas
F08.4 filtros básicos
F08.5 Mostrar na conversa
F08.6 preview
F08.7 estados parciais
```

### Tasks

1. Criar projeção `conversation_timeline_items`.
2. Criar conversa original cronológica.
3. Criar timeline com eventos, objetos, arquivos e evidência.
4. Criar tabs Conversa/Timeline/Ambas.
5. Criar filtros por tipo, status, período e palavra-chave.
6. Criar `show_in_conversation` por IDs.
7. Carregar contexto antes/depois e destacar trecho.
8. Criar preview com contagens e incerteza explícita.
9. Criar empty/partial/no evidence/error states.
10. Criar teste de browser do primeiro valor.

### Saída

Usuário alterna entre conversa e timeline e verifica a origem de um item.

### Gate

O evento de ativação passa com fixture 1:1 e grupo.

## 13. Sprint 10 — fallback, segurança e confiabilidade

### Objetivo

Evitar que o MVP dependa de um único caminho ou falhe de maneira opaca.

### Features

```text
F09.1 encaminhamento
F09.2 importação
F10.1 segredos
F10.2 auditoria
F10.3 retries/dead letters
F10.4 observabilidade
F10.5 ciclo de dados
```

### Tasks

1. Implementar source de conteúdo encaminhado.
2. Implementar upload/parser do formato suportado.
3. Revisar segredo server-side e logs.
4. Criar ACL por workspace/fonte/conversa.
5. Criar audit events para confirmação/correção.
6. Criar retries por categoria de erro.
7. Criar dead-letter lógico e reprocessamento.
8. Criar correlation ID de webhook a timeline.
9. Criar revogação da fonte.
10. Criar smoke test de falha de IA/storage/fonte.

### Saída

O produto tem fallback e é investigável quando algo falha.

### Gate

Não há vazamento entre workspaces, segredo exposto ou job sem estado.

## 14. Sprint 11 — QA, beta e hardening

### Objetivo

Validar o produto em staging com usuários reais autorizados.

### Features

```text
F11.1 fixtures
F11.2 integration tests
F11.3 E2E
F11.4 security/performance
F11.5 beta
```

### Tasks

1. Criar fixtures 1:1, grupo, duplicata, ambiguidade, arquivo e datas.
2. Rodar unit, integration, contract e browser tests.
3. Testar paginação de conversa longa.
4. Testar processamento parcial e retomada.
5. Testar permissão, upload e tokens.
6. Testar webhook timeout e retry.
7. Testar `Mostrar na conversa` com múltiplas evidências.
8. Conduzir beta com 3–10 usuários.
9. Medir funil de ativação.
10. Corrigir os três maiores pontos de abandono.

### Saída

Release candidate validado por fluxo e observabilidade.

### Gate

Usuários conseguem ativar sem treinamento síncrono obrigatório.

## 15. Sprint 12 — publicação do MVP

### Objetivo

Publicar o MVP com rollback e operação mínima.

### Tasks

1. Configurar variáveis e segredos de produção.
2. Configurar domínio/TLS e callbacks finais.
3. Aplicar migrações com plano de rollback.
4. Publicar release candidate.
5. Executar smoke test de login, conexão, seleção, processamento e timeline.
6. Verificar webhooks em produção.
7. Ativar monitoramento de erros e eventos.
8. Publicar documentação de onboarding.
9. Criar changelog e known issues.
10. Liberar gradualmente para primeiros usuários.
11. Monitorar ativação, falhas e custo de IA.
12. Ter procedimento de rollback documentado.

### Saída

MVP publicado e utilizável por usuários convidados.

### Gate final

O MVP cumpre integralmente a Definition of Done do documento de escopo.

## 16. Caminho crítico

```text
setup
  → auth/workspace
  → conexão real
  → webhook/ingestão
  → sync
  → picker
  → semântica
  → objetos
  → timeline
  → Mostrar na conversa
  → QA
  → publicação
```

As tarefas de shell, componentes e testes podem ocorrer em paralelo ao caminho crítico. A aprovação/configuração externa da Meta é um risco independente; por isso, o provider mock e o fallback de importação devem estar prontos antes do Sprint 4.

## 17. Ritmo de execução com Opencode

Para cada story, usar o ciclo:

```text
1. fornecer contexto e ID da história;
2. pedir inspeção do repositório antes de alterar;
3. pedir plano curto e arquivos afetados;
4. implementar a menor fatia vertical;
5. rodar check/test/build;
6. revisar diff e estados de UI;
7. corrigir falhas;
8. registrar decisão e aceite;
9. criar commit pequeno;
10. só então iniciar a próxima história.
```

Nunca pedir ao Opencode “construa o ZapTrack inteiro”. Dividir por story com contrato, arquivos esperados, critérios de aceite e testes.

## 18. Template de prompt para Opencode

```text
Contexto: ZapTrack, MVP de conversas em objetos de gestão.
Épico: E__.
Feature: F__.
História: [texto].
Objetivo desta tarefa: [uma frase].
Arquivos permitidos/prováveis: [lista].
Dependências: [lista].
Critérios de aceite: [lista].
Não fazer: [escopo fora].

Antes de editar:
1. inspecione os arquivos relevantes;
2. descreva o plano em até 8 passos;
3. indique riscos e decisões.

Depois de editar:
1. rode typecheck, testes e build;
2. mostre arquivos alterados;
3. relacione cada critério de aceite ao resultado;
4. informe pendências sem escondê-las.
```

## 19. Checkpoint por sprint

Ao final de cada sprint, registrar:

```text
entregue
não entregue
risco novo
decisão tomada
métrica observada
bugs conhecidos
próxima prioridade
```

Se uma sprint atrasar, reduzir escopo horizontal, não empilhar dívida invisível. O caminho crítico do primeiro valor tem prioridade sobre calendário, Kanban, agente autônomo, grafo visual e integrações secundárias.
