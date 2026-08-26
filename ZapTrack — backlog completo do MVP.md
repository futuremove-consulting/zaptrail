# ZapTrack — backlog completo do MVP

**Objetivo do release:** autenticar, conectar uma fonte oficial do WhatsApp Business, selecionar uma conversa 1:1 ou grupo, organizar uma primeira conversa e visualizar uma timeline estruturada de objetos de gestão com evidência.

## Convenções

- **Épico:** capacidade de produto ou plataforma.
- **Feature:** resultado funcional dentro do épico.
- **História:** comportamento observável para o usuário ou sistema.
- **Task:** unidade técnica executável pelo Opencode.
- **P0:** caminho crítico do MVP.
- **P1:** necessário para qualidade de beta, mas pode entrar após o primeiro happy path.
- **P2:** pós-MVP.

Toda história deve cumprir a Definition of Done: código, teste apropriado, estados loading/empty/error, autorização, observabilidade, documentação e verificação no browser.

---

# E00 — Fundação e setup

## F00.1 — Criar repositório e scaffold

**História:** Como equipe, quero um projeto executável com convenções estáveis para iniciar o desenvolvimento sem dívida estrutural.

**Tasks:**

1. Criar repositório Git e branches `main`, `develop` e feature branches.
2. Inicializar o scaffold web com React, TypeScript, Vite, Tailwind, Express, tRPC, Drizzle e Vitest.
3. Configurar scripts `dev`, `build`, `start`, `check`, `format`, `test` e migração.
4. Criar `README.md`, `AGENTS.md`/instruções para Opencode e `.env.example` sem segredos.
5. Executar o projeto em desenvolvimento e confirmar a rota inicial.

**Aceite:** projeto sobe localmente, build passa, testes passam e um novo desenvolvedor consegue seguir o README.

## F00.2 — Configurar ambientes

**História:** Como desenvolvedor, quero ambientes separados para desenvolvimento, staging e produção.

**Tasks:**

1. Definir variáveis de ambiente por ambiente.
2. Validar configuração no startup sem vazar valores sensíveis.
3. Criar seed seguro para dados de demonstração não reais.
4. Documentar URLs, callbacks e webhooks por ambiente.
5. Definir configuração de timezone e locale `pt-BR`.

**Aceite:** aplicação falha de forma explicável quando uma variável obrigatória está ausente e nenhum segredo aparece em logs ou frontend.

## F00.3 — Criar banco e migrações

**História:** Como produto, quero uma persistência versionada para dados brutos, semânticos e operacionais.

**Tasks:**

1. Criar schema inicial de usuários, workspace e membership.
2. Criar migrações versionadas e estratégia de rollback.
3. Criar helpers de banco por módulo.
4. Criar índices de `workspace_id`, timestamps e chaves externas.
5. Definir convenção de IDs, timestamps UTC e soft delete quando necessário.

**Aceite:** migração limpa cria o banco; segunda execução é segura; schema TypeScript e banco permanecem sincronizados.

## F00.4 — Qualidade contínua

**História:** Como equipe, quero detectar regressões antes de publicar.

**Tasks:**

1. Configurar TypeScript strict e Prettier.
2. Criar testes unitários iniciais e comando único de verificação.
3. Criar pipeline de check, test e build no push/PR.
4. Configurar relatório de falhas com contexto suficiente.
5. Documentar padrão de commits e tamanho de módulos.

**Aceite:** PR que falha em typecheck, teste ou build não é considerado pronto.

---

# E01 — Identidade, workspace e autorização

## F01.1 — Autenticação

**História:** Como usuário, quero entrar e sair do ZapTrack de forma segura.

**Tasks:**

1. Integrar o fluxo de OAuth já disponível no scaffold.
2. Implementar `auth.me` e logout.
3. Proteger rotas e procedures privadas.
4. Criar tela de login, loading e erro.
5. Testar sessão expirada e logout.

**Aceite:** usuário não autenticado não acessa dados privados; logout invalida a sessão; estado de autenticação é consistente no refresh.

## F01.2 — Criar workspace

**História:** Como usuário autenticado, quero iniciar um workspace pessoal ou empresarial.

**Tasks:**

1. Criar tabela `workspaces`.
2. Criar membership do usuário proprietário.
3. Exibir nome e tipo do workspace no primeiro acesso.
4. Persistir estado de onboarding por workspace.
5. Criar `workspace.getCurrent` e `workspace.update`.

**Aceite:** todo dado do MVP pertence a um workspace e o usuário vê somente workspaces autorizados.

## F01.3 — Papéis e permissões mínimas

**História:** Como proprietário, quero que dados e conexões tenham escopo controlado.

**Tasks:**

1. Definir papéis `owner`, `admin` e `member` ou equivalente mínimo.
2. Criar função central de autorização por workspace e fonte.
3. Aplicar ACL a queries, mutations, arquivos e conversas.
4. Criar testes de isolamento entre workspaces.
5. Exibir estado de acesso insuficiente sem revelar dados.

**Aceite:** tentativa de acessar ID de outro workspace retorna `FORBIDDEN` ou resposta equivalente sem vazamento.

## F01.4 — Estado de onboarding

**História:** Como usuário, quero retornar ao ponto em que parei.

**Tasks:**

1. Criar `OnboardingSession`.
2. Persistir etapa, caminho escolhido, fonte, conversa selecionada e processing run.
3. Criar procedure de retomada.
4. Implementar abandono e retomada sem duplicar jobs.
5. Registrar eventos de funil.

**Aceite:** fechar o navegador e retornar preserva progresso e não cria uma segunda conexão ou processamento duplicado.

---

# E02 — Shell, design system e onboarding UI

## F02.1 — Shell autenticado

**História:** Como usuário, quero uma aplicação navegável com orientação clara.

**Tasks:**

1. Implementar layout autenticado com sidebar e conteúdo principal.
2. Criar rotas para Agora, Conversas, Timeline, Configurações e Ajuda.
3. Criar breadcrumbs e botão de retorno em páginas profundas.
4. Adicionar responsividade desktop/mobile.
5. Definir tokens visuais, tipografia, espaçamento e estados semânticos.

**Aceite:** nenhuma tela interna termina em dead-end; navegação funciona com teclado e viewport mobile.

## F02.2 — Componentes reutilizáveis

**História:** Como equipe, quero construir telas com blocos consistentes.

**Tasks:**

1. Criar `StatusBadge`, `EmptyState`, `ErrorState`, `ProgressStepper`, `EntityChip` e `EvidenceLink`.
2. Criar `ConversationCard`, `ObjectCard`, `TimelineItem` e `FilterBar`.
3. Criar skeletons de lista e detalhe.
4. Padronizar toasts, dialogs e confirmação.
5. Testar componentes críticos visualmente.

**Aceite:** loading, empty e error têm representação consistente e não dependem de texto improvisado em cada tela.

## F02.3 — Onboarding guiado por tarefa

**História:** Como novo usuário, quero saber o que fazer sem assistir a um tour.

**Tasks:**

1. Criar stepper `Conectar → Preparar → Escolher conversa → Organizar → Ver timeline`.
2. Implementar CTA principal e fallbacks visíveis.
3. Adicionar ajuda contextual de escopo e permissões.
4. Persistir etapa atual.
5. Evitar tour obrigatório de funcionalidades.

**Aceite:** usuário entende o próximo passo e consegue alcançar a primeira timeline sem conhecer a ontologia interna.

## F02.4 — Estados de primeiro acesso

**História:** Como usuário, quero compreender o que ocorre enquanto o sistema trabalha.

**Tasks:**

1. Criar estados de conexão, sincronização, processamento e timeline.
2. Mostrar progresso real e última atualização.
3. Diferenciar parcial, vazio, erro e sem permissão.
4. Criar ações de retry e continuar depois.
5. Instrumentar abandono por tela.

**Aceite:** nenhum spinner indefinido ou tela em branco no caminho crítico.

---

# E03 — Conexão oficial do WhatsApp Business

## F03.1 — Preparar configuração da Meta

**História:** Como operador do produto, quero que a integração possa ser configurada por ambiente.

**Tasks:**

1. Criar/validar app e configurações da Meta para desenvolvimento, staging e produção.
2. Configurar Embedded Signup e callback.
3. Registrar URLs válidas e permissões necessárias.
4. Documentar WABA, número, webhook e credenciais sem armazenar segredo no Git.
5. Criar checklist de aprovação e dependências externas.

**Aceite:** documentação permite repetir a configuração em ambiente limpo sem improviso.

## F03.2 — Lançar Embedded Signup

**História:** Como usuário empresarial, quero conectar meu WhatsApp Business por um fluxo oficial.

**Tasks:**

1. Criar botão `Conectar WhatsApp Business`.
2. Abrir Embedded Signup com configuração correta.
3. Tratar retorno, cancelamento e erro.
4. Exibir explicação de escopo antes da autorização.
5. Não marcar a fonte como conectada antes da confirmação do servidor.

**Aceite:** usuário consegue iniciar e concluir/cancelar o fluxo, e o produto comunica claramente o que será acessado.

## F03.3 — Validar conexão server-side

**História:** Como sistema, quero validar e registrar a conexão sem expor tokens.

**Tasks:**

1. Receber o código/retorno no backend.
2. Trocar o código por credencial apropriada no servidor.
3. Registrar WABA, phone number ID, display name e metadados mínimos.
4. Criptografar ou proteger segredos conforme o ambiente.
5. Persistir status `pending`, `connected`, `failed`, `revoked`.

**Aceite:** nenhum token aparece em response ao browser, logs ou banco sem proteção; conexão só é `connected` após validação.

## F03.4 — Assinar webhooks

**História:** Como sistema, quero receber mudanças da fonte.

**Tasks:**

1. Implementar verificação do endpoint.
2. Registrar/subscrever tópicos necessários.
3. Validar assinatura/autenticidade do payload.
4. Mapear eventos para handlers internos.
5. Criar teste de contrato com payloads sanitizados.

**Aceite:** payload inválido é rejeitado; payload válido é aceito rapidamente e processado de forma assíncrona.

## F03.5 — Status da fonte

**História:** Como usuário, quero saber se a conexão está pronta, sincronizando ou com problema.

**Tasks:**

1. Criar tela de conexão com conta mascarada.
2. Exibir escopo e última sincronização.
3. Exibir ações de reconectar, verificar e desconectar.
4. Criar health check da fonte.
5. Registrar alterações de status em auditoria.

**Aceite:** usuário nunca precisa adivinhar se a integração está ativa.

---

# E04 — Ingestão, sincronização e dados brutos

## F04.1 — Modelo raw de conversas

**História:** Como sistema, quero preservar a fonte original sem alterar mensagens.

**Tasks:**

1. Criar `conversations` com tipo `direct` ou `group`.
2. Criar `conversation_participants`.
3. Criar `messages` com IDs externos, sender, timestamps, texto e payload sanitizado.
4. Criar `attachments` com metadados e referência de storage.
5. Criar índices por workspace, source, conversation e timestamp.

**Aceite:** conteúdo bruto é imutável ou versionado; mensagens mantêm ordenação e ID externo.

## F04.2 — Webhook idempotente

**História:** Como sistema, quero processar o mesmo evento sem duplicar dados.

**Tasks:**

1. Criar tabela de `inbound_events`.
2. Gerar chave idempotente por fonte/evento.
3. Persistir payload antes de processar.
4. Responder ao webhook sem aguardar IA.
5. Criar retry e dead-letter lógico.

**Aceite:** reenviar o mesmo payload não cria mensagens, conversas ou attachments duplicados.

## F04.3 — Normalizar mensagens

**História:** Como pipeline, quero uma representação canônica independente da fonte.

**Tasks:**

1. Mapear texto, mídia, documento, áudio, reação e resposta.
2. Normalizar timezone para UTC e preservar timestamp original.
3. Normalizar telefone e identificadores quando permitido.
4. Preservar payload de origem para auditoria técnica.
5. Criar testes para payloads diretos e de grupo.

**Aceite:** todos os tipos aceitos têm representação canônica e mensagens inválidas são marcadas sem derrubar o lote.

## F04.4 — Sync de contatos e histórico

**História:** Como usuário, quero ver conversas disponíveis após conectar.

**Tasks:**

1. Criar `SyncJob` com etapa, contagem, cursor e erro.
2. Solicitar/receber contatos e histórico no escopo disponível.
3. Processar paginação e retomada.
4. Atualizar progresso por etapa.
5. Informar o usuário sobre necessidade de manter o app aberto quando aplicável.

**Aceite:** sync pode ser retomado, mostra status e não bloqueia o servidor durante chamadas longas.

## F04.5 — Conversas 1:1 e grupos

**História:** Como usuário, quero distinguir e selecionar conversas individuais ou grupos.

**Tasks:**

1. Persistir `conversation_type`.
2. Calcular nome, avatar/identificador e participantes.
3. Detectar atualização de nome/participantes em grupo.
4. Criar queries separadas por tipo.
5. Testar conversa direta e grupo com múltiplos participantes.

**Aceite:** picker diferencia claramente `Conversas 1:1` e `Grupos`.

## F04.6 — Anexos e arquivos

**História:** Como usuário, quero que arquivos permaneçam ligados à mensagem e à timeline.

**Tasks:**

1. Armazenar bytes em storage gerenciado, não em coluna do banco.
2. Persistir filename, MIME, tamanho, checksum e source reference.
3. Criar pipeline opcional de processamento.
4. Marcar arquivo `received`, `processing`, `processed`, `failed`.
5. Impedir acesso a arquivo sem ACL.

**Aceite:** arquivo pode ser localizado a partir da mensagem e possui estado compreensível.

---

# E05 — Pipeline semântico

## F05.1 — Orquestrar processamento assíncrono

**História:** Como sistema, quero processar mensagens sem bloquear ingestão ou UI.

**Tasks:**

1. Criar jobs `normalize`, `extract`, `resolve`, `materialize`.
2. Criar chave de deduplicação por mensagem/versão.
3. Criar retries com backoff.
4. Persistir estado e erro por etapa.
5. Permitir reprocessamento seletivo.

**Aceite:** nova mensagem entra mesmo quando a IA está indisponível; o job pode ser retomado.

## F05.2 — Saída estruturada por schema

**História:** Como sistema, quero receber interpretações tipadas e validáveis.

**Tasks:**

1. Criar JSON Schema estrito para entidades, eventos, intenções, ações, tempo e evidência.
2. Definir `additionalProperties: false` onde aplicável.
3. Validar resposta do modelo com Zod.
4. Rejeitar ou reprocessar JSON inválido.
5. Registrar versão do prompt e modelo.

**Aceite:** nenhum resultado semântico inválido entra na camada operacional.

## F05.3 — Entidades, menções e aliases

**História:** Como sistema, quero distinguir a entidade real de como ela foi mencionada.

**Tasks:**

1. Criar `entities`, `entity_mentions` e `entity_aliases`.
2. Extrair pessoas, empresas, projetos e objetos mencionados.
3. Normalizar aliases e nomes.
4. Resolver entidade conhecida com score e evidência.
5. Enviar ambiguidade para revisão.

**Aceite:** “ela”, “XP” ou “o projeto” não são vinculados como fato sem contexto suficiente.

## F05.4 — Intenções, ações e eventos

**História:** Como sistema, quero identificar o que foi comunicado e o que precisa acontecer.

**Tasks:**

1. Criar vocabulário inicial de atos: solicitação, pergunta, proposta, aprovação, rejeição, reclamação, elogio, compromisso, decisão e cancelamento.
2. Criar vocabulário inicial de ações: agendar, reagendar, comprar, contratar, vender, cobrar, pagar, entregar, enviar, revisar e concluir.
3. Criar `interaction_events`.
4. Suportar múltiplos eventos na mesma janela de conversa.
5. Preservar literal, interpretação e confiança.

**Aceite:** uma mensagem pode gerar mais de um evento e o sistema não precisa transformar toda intenção em um módulo de produto.

## F05.5 — Fatos, relações e afirmações

**História:** Como sistema, quero representar conhecimento contextual sem transformar inferência em verdade absoluta.

**Tasks:**

1. Criar `semantic_assertions`.
2. Separar fato, evento, decisão e relação.
3. Persistir validade temporal, contexto e status.
4. Criar estados `proposed`, `confirmed`, `rejected`, `expired`.
5. Registrar contradições sem apagar histórico.

**Aceite:** o sistema consegue responder por que acredita em uma afirmação e retornar suas evidências.

## F05.6 — Evidência, confiança e revisão

**História:** Como usuário, quero conferir e corrigir o que a IA encontrou.

**Tasks:**

1. Criar `evidence_spans` com message ID e offsets/trechos.
2. Criar confidence por resultado.
3. Criar review state.
4. Criar ações confirmar, corrigir e ignorar.
5. Versionar correções.

**Aceite:** todo objeto derivado possui evidência; baixa confiança não é apresentada como fato confirmado.

## F05.7 — Tempo e prazos

**História:** Como sistema, quero interpretar “amanhã”, “sexta” e datas explícitas sem perder a expressão original.

**Tasks:**

1. Criar `time_expressions`.
2. Persistir valor normalizado, timezone, precisão, fonte e confiança.
3. Diferenciar `occurred_at`, `due_at`, `scheduled_at` e `expected_at`.
4. Testar expressões relativas e ambíguas.
5. Exibir “até sexta” como interpretação quando não houver hora explícita.

**Aceite:** data inferida não é apresentada como horário confirmado.

---

# E06 — Objetos de gestão

## F06.1 — Objeto universal

**História:** Como sistema, quero uma unidade operacional comum para diferentes domínios.

**Tasks:**

1. Criar `management_objects`.
2. Definir `object_type`, title, summary, status, owner, priority, due_at e source.
3. Conectar object a event, evidence, party, project e conversation.
4. Criar `state_transitions`.
5. Criar API de detalhe e histórico.

**Aceite:** um objeto pode aparecer em timeline, Agora, calendário e Kanban sem duplicação.

## F06.2 — Tarefa e compromisso

**História:** Como usuário, quero acompanhar o que alguém ficou de fazer e até quando.

**Tasks:**

1. Criar tipos `task` e `commitment`.
2. Mapear owner, prazo, estado e relação.
3. Permitir confirmar/corrigir origem.
4. Criar alerta de sem responsável e atraso.
5. Exibir evidência.

**Aceite:** promessa textual pode virar sugestão de objeto, mas só vira confirmado com regra ou revisão suficiente.

## F06.3 — Decisão

**História:** Como usuário, quero ver decisões e aprovações separadas de tarefas.

**Tasks:**

1. Criar tipo `decision`.
2. Persistir proposta, decisão, decisor, assunto e evidência.
3. Suportar estados proposta, revisar, aprovada, rejeitada e executada.
4. Permitir criar tarefa derivada sem apagar a decisão.
5. Implementar `Mostrar na conversa`.

**Aceite:** decisão aprovada não é automaticamente considerada executada.

## F06.4 — Arquivo

**História:** Como usuário, quero encontrar arquivos relevantes junto do contexto.

**Tasks:**

1. Criar tipo `file_object` ou projeção equivalente.
2. Ligar arquivo à mensagem, entidade, projeto e objeto.
3. Exibir nome, tipo, data e origem.
4. Tratar processamento falho sem esconder o original.
5. Criar abertura autorizada.

**Aceite:** arquivo aparece como objeto/evidência e leva à mensagem de origem.

## F06.5 — Atenção

**História:** Como usuário, quero ser alertado sobre atraso, risco ou falta de retorno.

**Tasks:**

1. Criar tipo `attention` ou `attention_state`.
2. Definir regras determinísticas iniciais para prazo, atraso, sem owner e bloqueio.
3. Mostrar motivo e evidência.
4. Permitir silenciar/reativar.
5. Registrar criação e encerramento.

**Aceite:** atenção nunca aparece sem explicação e não altera dados externos automaticamente.

---

# E07 — Conversas, grupos e seleção

## F07.1 — Lista de conversas

**História:** Como usuário, quero visualizar as conversas disponíveis depois da conexão.

**Tasks:**

1. Criar `conversation.list` protegido.
2. Exibir última atividade, participantes e fonte.
3. Mostrar estados de sincronização e processamento.
4. Implementar paginação por cursor.
5. Criar empty state e retry.

**Aceite:** lista é rápida, autorizada e explicita quando está parcial.

## F07.2 — Abas 1:1 e grupos

**História:** Como usuário, quero selecionar uma conversa individual ou um grupo de forma explícita.

**Tasks:**

1. Criar abas `Conversas 1:1` e `Grupos`.
2. Criar cards distintos para pessoa e grupo.
3. Mostrar participantes e contexto.
4. Permitir seleção por teclado.
5. Registrar tipo selecionado.

**Aceite:** o usuário não confunde conversa direta com grupo.

## F07.3 — Busca e filtros

**História:** Como usuário, quero encontrar a conversa por nome, empresa ou projeto.

**Tasks:**

1. Implementar full-text inicial por nome/participante.
2. Adicionar filtros recentes, com arquivos, com pendências e mais ativas.
3. Exibir resultado zero com alternativa.
4. Preservar query na URL.
5. Aplicar ACL no backend.

**Aceite:** busca não retorna conversa não autorizada.

## F07.4 — Contexto sugerido

**História:** Como usuário, quero que o sistema sugira empresa e projeto sem me obrigar a configurar tudo.

**Tasks:**

1. Criar sugestões de party e project.
2. Mostrar “sugerido”, não “confirmado”.
3. Permitir confirmar, corrigir ou deixar para depois.
4. Persistir `context_link` com origem/confiança.
5. Não bloquear a timeline.

**Aceite:** primeira conversa pode ser organizada sem criar uma empresa ou projeto.

## F07.5 — Seleção e confirmação

**História:** Como usuário, quero confirmar a conversa e o escopo antes de processar.

**Tasks:**

1. Criar tela de resumo da conversa.
2. Mostrar participantes, período, mensagens e arquivos.
3. Mostrar contexto sugerido.
4. Criar `ConversationSelection`.
5. Iniciar processing run somente após CTA explícito.

**Aceite:** usuário sabe qual fonte e período serão organizados.

---

# E08 — Timeline dual

## F08.1 — Conversa original

**História:** Como usuário, quero ver a conversa como aconteceu.

**Tasks:**

1. Criar lista cronológica de mensagens.
2. Renderizar texto, replies e attachments.
3. Mostrar participantes e timestamps.
4. Criar paginação/virtualização.
5. Implementar janela de contexto.

**Aceite:** nenhuma mensagem é alterada pela camada semântica.

## F08.2 — Timeline estruturada

**História:** Como usuário, quero ver decisões, ações, arquivos e objetos sem reler tudo.

**Tasks:**

1. Criar `conversation_timeline_items`.
2. Materializar itens por evento/objeto/evidência.
3. Ordenar por ocorrido, mensagem e mudança de estado.
4. Exibir tipo, resumo, status, confiança e evidência.
5. Criar estado parcial.

**Aceite:** timeline diferencia item confirmado, sugerido e não classificado.

## F08.3 — Alternância Conversa/Timeline/Ambas

**História:** Como usuário, quero alternar entre as duas leituras sem perder meu contexto.

**Tasks:**

1. Criar tabs `Conversa`, `Timeline`, `Ambas`.
2. Preservar filtros e posição quando possível.
3. Criar layout split no desktop.
4. Criar abas empilhadas no mobile.
5. Sincronizar IDs de item e mensagem.

**Aceite:** alternância não reinicia a busca nem perde a conversa selecionada.

## F08.4 — Filtros e busca

**História:** Como usuário, quero filtrar a timeline por significado e contexto.

**Tasks:**

1. Criar filtros por tipo, intenção, ação, objeto, arquivo e status.
2. Criar filtros por período, palavra, pessoa, empresa, projeto e owner.
3. Combinar filtros com AND/OR documentado.
4. Criar busca literal inicial e busca semântica posterior.
5. Mostrar quantidade e itens ocultos por contexto.

**Aceite:** resultado é explicável e filtrado pelo escopo autorizado.

## F08.5 — Mostrar na conversa

**História:** Como usuário, quero verificar a origem de um item estruturado.

**Tasks:**

1. Retornar `primary_message_id`, `message_ids` e highlight selector.
2. Carregar mensagens anteriores/posteriores.
3. Rolar para a mensagem principal.
4. Destacar o trecho relevante.
5. Oferecer `Voltar para timeline` preservando filtro.

**Aceite:** clicar no objeto leva à mensagem correta e o usuário entende a evidência.

## F08.6 — Preview e primeira ativação

**História:** Como usuário novo, quero uma síntese rápida antes da profundidade.

**Tasks:**

1. Contabilizar decisões, compromissos, solicitações, arquivos e pendências.
2. Exibir “possível” ou “para revisar” quando necessário.
3. Tornar cada categoria clicável.
4. Criar CTA `Ver timeline estruturada`.
5. Registrar ativação.

**Aceite:** preview não apresenta hipótese como fato confirmado.

## F08.7 — Estados de timeline

**História:** Como usuário, quero entender timeline parcial, vazia ou indisponível.

**Tasks:**

1. Criar estados `loading`, `partial`, `ready`, `empty`, `no_evidence`, `permission_limited`, `error`.
2. Mostrar número de mensagens ainda processando.
3. Permitir ver conversa original mesmo sem eventos.
4. Criar retry seletivo.
5. Criar mensagem “nenhum item estruturado ainda” sem sugerir que nada aconteceu.

**Aceite:** não há confusão entre conversa vazia, filtro sem resultado e processamento incompleto.

---

# E09 — Fallback e agente mínimo

## F09.1 — Encaminhar conteúdo

**História:** Como usuário, quero testar o valor mesmo sem sincronização completa.

**Tasks:**

1. Criar instrução de encaminhamento para o agente.
2. Criar fonte `forwarded_content`.
3. Persistir mensagem/arquivo recebido com consentimento.
4. Criar escolha 1:1, grupo ou recorte.
5. Enviar para o mesmo pipeline semântico.

**Aceite:** fallback produz uma timeline mínima sem duplicar o core.

## F09.2 — Importar arquivo autorizado

**História:** Como usuário, quero importar uma conversa autorizada.

**Tasks:**

1. Criar upload com validação de formato/tamanho.
2. Criar parser inicial do formato suportado.
3. Associar participantes e timestamps.
4. Mostrar confirmação de autorização.
5. Reutilizar ingestão e processamento.

**Aceite:** arquivo importado mantém original e evidência.

## F09.3 — Pergunta read-only do agente

**História:** Como usuário, quero perguntar sobre a conversa após ver a timeline.

**Tasks:**

1. Criar endpoint de consulta read-only.
2. Recuperar timeline, objetos e evidências.
3. Responder com fontes e links para a conversa.
4. Bloquear ações mutáveis no primeiro release.
5. Registrar feedback de resposta.

**Prioridade:** P1. Não bloquear publicação se a timeline estiver completa.

---

# E10 — Segurança, confiabilidade e operação

## F10.1 — Segredos e tokens

**História:** Como operador, quero proteger credenciais de integração.

**Tasks:**

1. Manter tokens somente server-side.
2. Mascarar logs e respostas.
3. Rotacionar credenciais documentadamente.
4. Criar estados de revogação.
5. Testar vazamento por erro e debug.

**Aceite:** revisão de código não encontra segredo no client bundle, logs ou repositório.

## F10.2 — Auditoria

**História:** Como gestor, quero saber quem confirmou ou alterou conhecimento/objetos.

**Tasks:**

1. Criar `audit_events`.
2. Registrar actor, timestamp, before/after, source e correlation ID.
3. Auditar confirmação, correção, exclusão, mudança de estado e permissão.
4. Criar consulta administrativa mínima.
5. Definir retenção inicial.

**Aceite:** toda mudança de objeto ou interpretação possui histórico.

## F10.3 — Retries e dead letters

**História:** Como sistema, quero recuperar falhas transitórias sem duplicar dados.

**Tasks:**

1. Definir retry por tipo de erro.
2. Implementar backoff.
3. Criar limite de tentativas.
4. Persistir dead-letter lógico com causa.
5. Criar reprocessamento manual autorizado.

**Aceite:** falha de IA, storage ou fonte pode ser investigada e reprocessada.

## F10.4 — Observabilidade

**História:** Como equipe, quero detectar onde o primeiro acesso falha.

**Tasks:**

1. Criar logs estruturados.
2. Propagar correlation ID.
3. Medir latência de webhook, sync, pipeline e timeline.
4. Registrar eventos de funil.
5. Criar dashboard operacional mínimo ou exportação de métricas.

**Aceite:** é possível rastrear uma seleção de conversa até a timeline e evidência.

## F10.5 — Privacidade e ciclo de dados

**História:** Como usuário, quero saber o que foi armazenado e poder revogar a fonte.

**Tasks:**

1. Criar tela de fonte, escopo e revogação.
2. Documentar retenção de mensagens e attachments.
3. Criar desligamento lógico da fonte.
4. Criar job de deleção/anonimização conforme política definida.
5. Testar remoção sem quebrar auditoria necessária.

**Aceite:** revogar interrompe ingestão futura e o estado é visível.

---

# E11 — QA, beta e publicação

## F11.1 — Fixtures e dados de teste

**História:** Como equipe, quero testar com dados controlados e seguros.

**Tasks:**

1. Criar fixtures anonimizadas de conversa 1:1.
2. Criar fixtures anonimizadas de grupo.
3. Criar casos com mensagens duplicadas, reply, arquivo e datas relativas.
4. Criar casos ambíguos e multi-intenção.
5. Proibir uso de conversa real em testes versionados.

**Aceite:** suíte cobre o caminho crítico sem dados pessoais reais.

## F11.2 — Testes de integração

**História:** Como equipe, quero confiar na cadeia completa.

**Tasks:**

1. Testar autenticação e workspace.
2. Testar conexão simulada e callback.
3. Testar webhook, idempotência e ingestão.
4. Testar processamento semântico validado.
5. Testar timeline e `Mostrar na conversa`.

**Aceite:** o caminho completo passa em ambiente de staging com fixtures.

## F11.3 — Testes de browser/E2E

**História:** Como usuário, quero completar o primeiro acesso sem travar.

**Tasks:**

1. Testar login.
2. Testar onboarding com fonte simulada.
3. Testar escolha 1:1.
4. Testar escolha grupo.
5. Testar processamento parcial e retry.
6. Testar timeline, filtro e evidência.

**Aceite:** happy path e principais erros são reproduzíveis e documentados.

## F11.4 — Segurança e performance

**História:** Como proprietário, quero publicar sem risco óbvio ou lentidão evitável.

**Tasks:**

1. Verificar ACL em todas as procedures.
2. Verificar injection, XSS, upload e exposição de tokens.
3. Testar paginação e grandes conversas.
4. Testar timeout e retry de webhook.
5. Testar graceful degradation quando IA falha.

**Aceite:** checklist de segurança e performance é aprovado antes do beta.

## F11.5 — Beta controlado

**História:** Como equipe, quero validar o primeiro valor com usuários reais autorizados.

**Tasks:**

1. Definir perfil de 3–10 usuários beta.
2. Criar onboarding e suporte de feedback.
3. Observar taxa de conexão, seleção, timeline e evidência.
4. Coletar falsos positivos e falsos negativos.
5. Corrigir os três maiores pontos de abandono.

**Aceite:** usuários conseguem alcançar ativação sem treinamento síncrono obrigatório.

## F11.6 — Publicação e rollback

**História:** Como proprietário, quero publicar e recuperar uma versão com segurança.

**Tasks:**

1. Configurar domínio/URL e TLS.
2. Configurar variáveis de produção.
3. Aplicar migrações com backup/rollback planejado.
4. Publicar release candidate.
5. Executar smoke tests.
6. Criar plano de rollback.
7. Publicar changelog e documentação.

**Aceite:** aplicação está acessível, autenticada, observável e com caminho crítico verificado em produção.

---

# Backlog pós-MVP

Os itens abaixo devem permanecer fora do caminho crítico:

```text
Calendário completo dia/semana/mês/ano
Kanban customizável
Neo4j ou graph database separado
Visualização abstrata do grafo
GraphRAG avançado com relações indiretas
Agente com escrita e ações externas
Envio automático de mensagens
Financeiro completo
CRM/ERP integrations
Mobile nativo
Billing e planos pagos
OCR/áudio para todos os formatos
```

A existência desses itens no roadmap não deve contaminar o primeiro release.
