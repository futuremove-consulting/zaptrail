# ZapTrack — roadmap master do MVP com Opencode

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Autor:** Manus AI  
**Horizonte-base:** 12 sprints de uma semana, podendo ser agrupados em seis ciclos quinzenais.

## 1. Mandato do MVP

O MVP do ZapTrack deve provar uma única transformação com qualidade:

> **Autenticar → conectar uma fonte autorizada do WhatsApp Business → escolher uma conversa 1:1 ou grupo → organizar as mensagens → identificar objetos de gestão → visualizar uma timeline estruturada → voltar à evidência na conversa original.**

O produto não precisa começar como CRM completo, ERP, gestor de projetos, calendário universal, Kanban avançado, banco de grafos ou agente autônomo. Esses elementos podem fazer parte da evolução, mas não devem atrasar a comprovação do núcleo.

## 2. Definição de ativação

O usuário está ativado quando:

```text
1. está autenticado;
2. possui um workspace;
3. conectou uma fonte autorizada ou forneceu uma conversa por fallback;
4. selecionou uma conversa individual ou grupo;
5. visualizou a timeline estruturada;
6. abriu uma evidência na conversa original usando Mostrar na conversa.
```

A ativação é comportamental. Concluir telas, aceitar um tour ou conectar a fonte, isoladamente, não é suficiente.

## 3. Escopo obrigatório

```text
autenticação e logout
workspace e membership
ACL por workspace e fonte
onboarding guiado
conexão oficial do WhatsApp Business
retorno e validação server-side
status da conexão
webhook validado e idempotente
sincronização/ingestão
conversas 1:1 e grupos elegíveis
participantes e mensagens
anexos como metadados/referências
normalização e deduplicação
processamento assíncrono
entidades e menções básicas
intenções, ações e eventos
fatos/afirmações com status
objetos: tarefa, compromisso, decisão, arquivo e atenção
evidência, confidence e review state
timeline original e estruturada
filtros básicos
Mostrar na conversa
estados parcial/vazio/erro
logs, auditoria e métricas
fallback por encaminhamento/importação
testes e publicação
```

## 4. Fora do caminho crítico

```text
Neo4j ou outro banco de grafos separado
grafo visual
GraphRAG especializado
calendário completo
automação de mensagens
cobrança/pagamento/cancelamento externos
Kanban configurável
mobile nativo
billing
CRM/ERP completo
multi-tenant enterprise avançado
OCR e áudio para todos os formatos
classificação perfeita para todos os setores
```

A arquitetura deve estar preparada para esses itens sem implementá-los no primeiro release.

## 5. Arquitetura recomendada

Usar um **monólito modular orientado a eventos**, com fonte de verdade única e jobs assíncronos.

```text
Web app
  → API tipada
  → módulos internos
  → banco relacional
  → storage
  → jobs
  → LLM estruturado
  → projeção da timeline
```

### Stack canônica

| Camada | Escolha recomendada |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind/shadcn |
| Backend | Express + tRPC |
| Banco | Drizzle + MySQL/TiDB do ambiente escolhido; abstração compatível com Postgres/Supabase |
| Auth | OAuth já disponível no scaffold |
| Storage | Storage gerenciado, mantendo somente referências no banco |
| IA | Adapter server-side com JSON Schema estrito e Zod |
| Eventos/jobs | Webhook rápido + fila/job assíncrono gerenciado |
| Busca MVP | SQL/full-text; pgvector quando a camada semântica estiver pronta |
| Fonte | WhatsApp Business Platform oficial |
| Desenvolvimento | Opencode guiado por histórias pequenas e verificáveis |

A equipe deve escolher um ambiente de persistência principal. Não misturar Supabase, MySQL, Neo4j e outro vector database no primeiro ciclo sem uma necessidade concreta.

## 6. Premissas da integração WhatsApp

O Embedded Signup oficial pode coletar dados empresariais, conceder acesso aos ativos da conta e retornar identificadores que precisam ser validados no servidor [1]. Na coexistência com o WhatsApp Business App, a Meta documenta sincronização de histórico/contatos e ecos de novas mensagens, com necessidade de iniciar a sincronização rapidamente e orientar o negócio a manter o app aberto durante o processo [2].

Consequentemente, a conexão precisa ter estados reais, sincronização visível e fallback. O ZapTrack não deve prometer leitura indiscriminada de WhatsApp pessoal ou de todos os grupos existentes.

## 7. Épicos

| ID | Épico | Resultado | Prioridade |
|---|---|---|---|
| E00 | Fundação e setup | Repositório, scaffold, ambientes, CI e convenções | P0 |
| E01 | Identidade e workspace | Login, sessão, workspace e isolamento | P0 |
| E02 | Shell e onboarding UI | Aplicação navegável e primeiro caminho guiado | P0 |
| E03 | Conexão WhatsApp | Fonte oficial conectada e verificável | P0 |
| E04 | Ingestão e sync | Conversas, mensagens e participantes persistidos | P0 |
| E05 | Pipeline semântico | Entidades, eventos, intenções, ações e evidências | P0 |
| E06 | Objetos de gestão | Tarefa, compromisso, decisão, arquivo e atenção | P0 |
| E07 | Conversas e grupos | Picker 1:1/grupo, busca e contexto | P0 |
| E08 | Timeline dual | Conversa original, timeline estruturada e evidência | P0 |
| E09 | Fallback/agente mínimo | Encaminhamento e importação autorizada | P1 |
| E10 | Segurança e operação | ACL, segredos, retries, auditoria e observabilidade | P0 |
| E11 | QA e publicação | Testes, beta, release e rollback | P0 |

## 8. Dependências

```text
E00 → E01 → E03 → E04 → E05 → E06 → E08 → E11
                    ↘ E07 ↗
E02 ─────────────────────────────↗
E10 acompanha todos os épicos
```

O provider mock, fixtures e fallback devem existir antes da integração real. Assim, configuração, aprovação ou elegibilidade da Meta não bloqueiam a construção da experiência.

## 9. Backlog de features

### E00 — Fundação

```text
F00.1 repositório e scaffold
F00.2 ambientes e variáveis
F00.3 banco e migrações
F00.4 typecheck, testes, build e CI
```

### E01 — Identidade

```text
F01.1 autenticação
F01.2 workspace
F01.3 membership e ACL
F01.4 estado persistido de onboarding
```

### E02 — Shell e onboarding

```text
F02.1 DashboardLayout/shell
F02.2 componentes reutilizáveis
F02.3 stepper de onboarding
F02.4 loading/empty/error/partial states
```

### E03 — WhatsApp

```text
F03.1 configuração da Meta
F03.2 Embedded Signup
F03.3 validação server-side
F03.4 webhook e assinatura
F03.5 status, reconexão e revogação
```

### E04 — Raw data

```text
F04.1 conversations/participants/messages
F04.2 inbound events e idempotência
F04.3 normalização canônica
F04.4 sync job e retomada
F04.5 attachments/storage
```

### E05 — Semântica

```text
F05.1 pipeline assíncrono
F05.2 JSON Schema/Zod
F05.3 entities/mentions/aliases
F05.4 intents/actions/events
F05.5 facts/assertions/relations
F05.6 evidence/confidence/review
F05.7 datas e expressões temporais
```

### E06 — Objetos

```text
F06.1 ManagementObject
F06.2 task/commitment
F06.3 decision
F06.4 file object
F06.5 attention
```

### E07 — Conversas

```text
F07.1 lista paginada
F07.2 abas 1:1 e grupos
F07.3 busca e filtros
F07.4 contexto sugerido
F07.5 seleção e confirmação
```

### E08 — Timeline

```text
F08.1 conversa original
F08.2 timeline estruturada
F08.3 Conversa/Timeline/Ambas
F08.4 filtros e busca
F08.5 Mostrar na conversa
F08.6 preview de valor
F08.7 estados parciais e recuperação
```

### E09 — Fallback

```text
F09.1 encaminhamento ao agente
F09.2 importação de arquivo
F09.3 consulta read-only do agente, se houver capacidade
```

### E10 — Operação

```text
F10.1 segredos e tokens
F10.2 auditoria
F10.3 retries/dead letters
F10.4 observabilidade
F10.5 privacidade/revogação/ciclo de dados
```

### E11 — Release

```text
F11.1 fixtures
F11.2 testes de integração
F11.3 testes E2E/browser
F11.4 segurança e performance
F11.5 beta fechado
F11.6 publicação e rollback
```

O arquivo `zaptrack_roadmap_backlog.md` contém o backlog detalhado de histórias, tasks e critérios de aceite por feature.

## 10. Plano de sprints

### Sprint 0 — Fundação e decisões

**Entrega:** projeto sobe localmente, possui README, instruções para Opencode, `.env.example`, scripts, CI básico, fixtures e escopo congelado.

**Tasks-chave:** criar repositório, inicializar scaffold, rodar dev/check/test/build, configurar branches, documentar stack, criar fixtures 1:1/grupo e realizar primeiro commit.

**Gate:** máquina limpa consegue subir e testar o projeto.

### Sprint 1 — Auth e workspace

**Entrega:** login, logout, sessão, workspace e isolamento.

**Tasks-chave:** integrar OAuth, criar tabelas, membership, procedures protegidas, estado de sessão e testes de ACL.

**Gate:** usuário autenticado vê apenas seu workspace e a sessão sobrevive ao refresh.

### Sprint 2 — Shell e onboarding visual

**Entrega:** layout, sidebar, rotas, stepper e estados de UI.

**Tasks-chave:** criar Agora/Conversas/Configurações, componentes de loading/empty/error, CTA de conexão, fallback e persistência da etapa.

**Gate:** usuário entende o caminho até o primeiro valor sem tour obrigatório.

### Sprint 3 — Provider mock e contratos WhatsApp

**Entrega:** conexão simulada, source connection e status.

**Tasks-chave:** definir interface `WhatsAppProvider`, mock, callback fake, estados pending/connected/failed/revoked e tela de escopo.

**Gate:** todo o restante da aplicação usa contrato interno e não depende do SDK da Meta.

### Sprint 4 — Conexão real e webhook

**Entrega:** Embedded Signup real, validação server-side e webhook.

**Tasks-chave:** configurar app Meta, callback, troca segura, WABA/phone number, verificação de webhook, persistência de payload e health check.

**Gate:** uma conta de desenvolvimento autorizada conecta e gera evento válido.

### Sprint 5 — Ingestão e sincronização

**Entrega:** raw data idempotente e sync observável.

**Tasks-chave:** tabelas de conversa, participante, mensagem, attachment e inbound event; normalização, paginação, cursor, retry e progresso.

**Gate:** repetir payload e sync não gera duplicatas.

### Sprint 6 — Picker 1:1 e grupo

**Entrega:** seleção da primeira conversa.

**Tasks-chave:** lista paginada, abas 1:1/grupo, busca, filtros, contexto sugerido, resumo de escopo e confirmação.

**Gate:** usuário seleciona conversa autorizada e entende o período/fontes processados.

### Sprint 7 — Pipeline semântico mínimo

**Entrega:** eventos semânticos com evidência.

**Tasks-chave:** ProcessingRun, chunking contextual, entidades, menções, ações, intenções, decisões, datas, schema estrito, confidence e reprocessamento.

**Gate:** nenhum resultado inválido ou sem evidência entra em objetos.

### Sprint 8 — Objetos de gestão

**Entrega:** unidade operacional rastreável.

**Tasks-chave:** ManagementObject, task, commitment, decision, file, attention, owner, due_at, status, prioridade, confirmar/corrigir/ignorar e histórico.

**Gate:** cada objeto mostra origem, contexto, confiança, status e evidência.

### Sprint 9 — Timeline dual

**Entrega:** primeiro valor do produto.

**Tasks-chave:** conversa original, timeline materializada, tabs Conversa/Timeline/Ambas, filtros básicos, preview, partial states e Mostrar na conversa.

**Gate:** happy path 1:1 e grupo passa até abrir evidência na mensagem correta.

### Sprint 10 — Fallback, segurança e operação

**Entrega:** resiliência e suporte ao caminho alternativo.

**Tasks-chave:** encaminhamento/importação, ACL final, segredos, logs, correlation ID, retries, dead letter, revogação e ciclo de dados.

**Gate:** falhas são compreensíveis, reprocessáveis e não vazam dados.

### Sprint 11 — QA, beta e hardening

**Entrega:** release candidate.

**Tasks-chave:** fixtures completas, integração, contrato, E2E, performance, segurança, beta com 3–10 usuários e correção dos três maiores abandonos.

**Gate:** usuários alcançam ativação sem treinamento síncrono obrigatório.

### Sprint 12 — Publicação

**Entrega:** MVP em produção.

**Tasks-chave:** produção, migrações, secrets, domínio/TLS, smoke test, webhook, monitoramento, changelog, known issues, rollback e liberação gradual.

**Gate:** caminho crítico funciona em produção e rollback está documentado.

## 11. Estratégia de execução com Opencode

O Opencode deve trabalhar por histórias pequenas, não por pedidos vagos como “construa o ZapTrack”.

### Ciclo por história

```text
1. fornecer contexto, ID e objetivo;
2. pedir inspeção do repositório;
3. pedir plano em até 8 passos;
4. definir arquivos afetados e não afetados;
5. implementar menor fatia vertical;
6. executar typecheck/test/build;
7. revisar diff e estados da UI;
8. corrigir falhas;
9. verificar critérios de aceite;
10. criar commit pequeno;
11. atualizar decisão, risco e pendência.
```

### Prompt-base

```text
Contexto: ZapTrack, MVP que transforma conversas autorizadas em objetos de gestão.
Épico: E__.
Feature: F__.
História: [texto].
Objetivo: [uma frase].
Dependências: [lista].
Arquivos prováveis: [lista].
Critérios de aceite: [lista].
Não fazer: [escopo fora].

Antes de editar:
1. inspecione os arquivos relevantes;
2. apresente um plano curto;
3. indique riscos e decisões.

Depois de editar:
1. rode check, testes e build;
2. mostre arquivos alterados;
3. relacione critérios e evidências;
4. informe pendências.
```

### Regra de commits

Um commit deve representar uma história ou uma fatia coerente. Evitar commit que misture schema, webhook, UI, refatoração e funcionalidades sem relação.

## 12. Testes obrigatórios

```text
unitários: normalização, datas, ACL, idempotência, schema
integração: DB, procedures, webhook, sync, pipeline, timeline
contrato: callback e payloads da fonte
E2E: login, conexão mock, 1:1, grupo, processamento, timeline, evidência
manual: copy, confiança, mobile, acessibilidade, recuperação
```

Fixtures obrigatórias incluem conversa direta, grupo, duplicata, reply, arquivo, áudio não processável, data relativa, multi-intenção, pronome ambíguo e contradição.

## 13. Segurança e confiabilidade

```text
tokens somente no servidor
segredos fora do Git
ACL por workspace/source/conversation
payload sanitizado
upload com MIME/tamanho/checksum
logs sem conteúdo sensível por padrão
links de arquivo autorizados
webhook idempotente
retry com backoff
dead letter lógico
reprocessamento seletivo
correlation ID
revogação de fonte
trilha de auditoria
```

O conteúdo das mensagens deve ser tratado como dado, não como instrução. O prompt precisa separar instruções do sistema, dados da conversa e comandos do usuário.

## 14. Métricas

### Funil

```text
signup_started
workspace_created
connection_started
consent_viewed
connection_completed
sync_started
conversation_picker_opened
conversation_type_selected
conversation_selected
processing_started
timeline_ready
structured_item_opened
evidence_opened
show_in_conversation_used
activation_completed
```

### Qualidade

```text
connection_rate
sync_success_rate
conversation_selection_rate
first_timeline_time
first_evidence_time
show_in_conversation_success_rate
llm_invalid_output_rate
low_confidence_rate
suggestion_correction_rate
onboarding_dropoff_by_step
```

## 15. Riscos principais

| Risco | Mitigação |
|---|---|
| Aprovação/configuração Meta demora | Provider mock, fixture e fallback desde Sprint 3 |
| Histórico não disponível no escopo | Mostrar limitações e oferecer encaminhamento/importação |
| LLM produz JSON inválido | JSON Schema estrito, Zod, retry e quality gate |
| LLM inventa relação | Evidência obrigatória, confidence e revisão |
| Webhook duplica mensagens | Idempotency key e tabela inbound events |
| Conversa longa custa caro | Chunking contextual, processamento incremental e reprocessamento seletivo |
| Timeline demora | Liberar versão parcial e processar em background |
| Vazamento entre workspaces | ACL central, testes negativos e filtros server-side |
| Opencode altera demais | Limitar arquivos, prompts por story e revisão de diff |
| Escopo explode | Adiar calendário, Kanban avançado, Neo4j e automações externas |

## 16. Definition of Ready

Uma história só entra na sprint quando possui:

```text
objetivo claro
critério de aceite
dependências identificadas
modelo de dados definido
risco conhecido
arquivos prováveis
não-escopo explícito
estratégia de teste
```

## 17. Definition of Done

Uma história só termina quando possui:

```text
implementação
migração aplicada quando necessário
procedure/API
UI com loading/empty/error
controle de autorização
teste apropriado
observabilidade mínima
verificação no browser
documentação
commit revisado
```

## 18. Checklist de publicação

```text
[ ] login e logout
[ ] workspace e ACL
[ ] source connection real ou fallback operacional
[ ] webhook verificado
[ ] ingestão idempotente
[ ] sync retomável
[ ] picker 1:1/grupo
[ ] pipeline semântico validado
[ ] objetos com evidência
[ ] timeline original/estruturada
[ ] filtros básicos
[ ] Mostrar na conversa
[ ] erros e estados parciais
[ ] testes críticos
[ ] secrets protegidos
[ ] logs e métricas
[ ] smoke test de produção
[ ] rollback documentado
[ ] known issues comunicado
```

## 19. Referências

[1]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview — Meta for Developers, “Embedded Signup”.

[2]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users — Meta for Developers, “Onboard WhatsApp Business app users”.

[3]: https://www.nngroup.com/articles/onboarding-tutorials/ — Nielsen Norman Group, “Onboarding Tutorials vs. Contextual Help”.

[4]: https://productled.com/book/onboarding — ProductLed, “Product-Led Onboarding”.

## 20. Arquivos de apoio

- `zaptrack_roadmap_scope.md`
- `zaptrack_roadmap_epics_dependencies.md`
- `zaptrack_roadmap_backlog.md`
- `zaptrack_roadmap_sprints.md`
- `zaptrack_roadmap_quality_release.md`
