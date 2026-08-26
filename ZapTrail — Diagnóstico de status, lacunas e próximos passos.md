# ZapTrail — Diagnóstico de status, lacunas e próximos passos

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Objetivo:** transformar o trabalho conceitual acumulado em uma sequência executável para construir, testar e validar o MVP.

## 1. Veredito executivo

O ZapTrail já possui uma base conceitual acima da média. A proposta, a arquitetura de informação, a ontologia, a divisão de canais, a timeline dual, os objetos de gestão, o onboarding e a direção de stack foram suficientemente definidos para iniciar a construção.

O gargalo deixou de ser ideação. O gargalo agora é **convergência e execução**. Ainda existe documentação histórica em excesso, algumas decisões antigas contraditórias e nenhum caminho vertical implementado de ponta a ponta.

A prioridade não é produzir mais conceitos. É provar a transformação central:

> **Uma conversa autorizada vira uma timeline estruturada, com objetos de gestão rastreáveis, evidência de origem e uma resposta útil no WhatsApp.**

O próximo marco não deve ser “ter um dashboard”, “conectar o UAZAPI” ou “ter um agente inteligente”. O próximo marco deve ser:

> **um usuário consegue iniciar, escolher uma conversa 1:1 ou grupo, organizar essa conversa, abrir a timeline, voltar à evidência e fazer uma pergunta read-only ao agente.**

## 2. O que está decidido e deve ser congelado

| Tema | Decisão canônica do ZapTrail | Status |
|---|---|---:|
| Marca | ZapTrail; ZapTrack fica apenas como histórico | Fechado |
| Proposta | Organizador/estruturador de conversas que transforma significado em objetos de gestão e próximos passos | Fechado |
| Dois momentos | WhatsApp para mobilidade e baixa atenção; web responsiva para análise, revisão e operação | Fechado |
| Frontend externo | Web responsiva mobile-first, excelente no notebook; app nativo não é prioridade | Fechado |
| App nativo | Evolução futura, somente se offline, notificações nativas, lojas ou captura avançada provarem necessidade | Fechado |
| Fonte de verdade | Backend e banco compartilhados por agente e aplicação | Fechado |
| Identidade | `UserAccount`, `Workspace`, `AgentConnection` e `SourceConnection` separados | Fechado |
| Provider | Adapter substituível; MockProvider primeiro; spike UAZAPI depois; alternativa se falhar | Fechado |
| Meta oficial | Não entra no caminho inicial; fica como evolução futura | Fechado para o MVP atual |
| Banco | Relacional, com grafo lógico e proveniência; sem Neo4j no MVP | Fechado |
| IA | Adapter server-side, saída estruturada, evidência, confiança e revisão | Fechado |
| Objetos iniciais | Tarefa, compromisso, decisão, arquivo e atenção | Fechado |
| Interface principal | Agora, Conversas/Grupos, Empresas/Pessoas, Projetos, Timeline e Controle | Fechado |
| Timeline | Conversa original + timeline semântica + “Mostrar na conversa” | Fechado |
| Agente | Read-only primeiro; mutações internas limitadas e confirmadas; nenhuma ação externa irreversível | Fechado |
| Custo inicial | Mock/local/Supabase Free para provar valor; custo de provider real deve ser assumido antes do uso recorrente | Fechado |

Essas decisões não devem ser reabertas a cada nova ideia. O trabalho agora deve usar **ADRs — Architecture Decision Records** curtos para registrar exceções, não reescrever a visão inteira.

## 3. Documentos históricos que precisam ser corrigidos ou rebaixados

O material acumulado não precisa ser apagado. Ele precisa ser classificado.

| Material/assunto | Tratamento recomendado |
|---|---|
| Documentos com “ZapTrack” | Manter como histórico; toda nova entrega usa ZapTrail |
| Roadmap que assume Meta oficial | Arquivar como versão histórica e substituir por roadmap revisado |
| Roadmap que assume Expo/RN como frontend primário | Arquivar como alternativa futura; web responsiva é a decisão vigente |
| Arquitetura que mistura Next.js/Supabase e React/Vite/Express/Drizzle no mesmo produto | Separar “arquitetura canônica” de “piloto no ambiente de desenvolvimento”; não misturar em uma implementação |
| Recomendações genéricas de CRM, BI, agentes autônomos e verticais | Manter como horizonte; retirar do caminho crítico |
| Calendário e Kanban | Manter como projeções posteriores sobre os mesmos objetos; não bloquear timeline |
| Neo4j, GraphRAG e vector database separado | Manter como hipótese futura; não introduzir antes de uma restrição mensurável |

A correção mais importante é criar uma única página de decisão que diga: **“este é o produto que está sendo construído agora”**.

## 4. O que ainda falta — lacunas críticas

### 4.1 Lacunas de produto

A visão está clara, mas ainda falta reduzir o primeiro mercado e o primeiro problema para um caso observável. O ZapTrail não deve tentar validar “todas as conversas e todos os tipos de gestão” simultaneamente.

É necessário escolher um **ICP inicial** e um cenário de alto valor, por exemplo: profissionais liberais e pequenas empresas de serviços que gerenciam clientes, fornecedores e colaboradores pelo WhatsApp. Dentro desse grupo, o primeiro caso deve ser algo como: “o que ficou combinado?”, “qual é o próximo passo?” ou “o que está atrasado?”.

Também falta definir o conjunto mínimo de respostas que provará utilidade. Reconhecer solicitações, compras, reclamações, pagamentos, entregas e contratos pode estar no modelo semântico, mas não significa que cada categoria terá workflow próprio no MVP.

### 4.2 Lacunas de arquitetura executável

A arquitetura conceitual já existe; falta o contrato implementável. Antes de criar telas, é necessário fechar:

| Artefato | O que precisa ser definido |
|---|---|
| Schema físico | Tabelas, chaves, índices, enums, constraints e políticas |
| Eventos | Payload canônico de mensagem, conexão, importação, análise e alteração |
| Provider adapter | Interface para criar sessão, parear, status, chats, mensagens e webhooks |
| Agent adapter | Recepção, identificação, roteamento, ferramentas e envio de resposta |
| Pipeline | Estados e transições de Raw → Semantic → Knowledge → Retrieval |
| Proveniência | `primary_message_id`, spans, confiança, versão e estado de revisão |
| Idempotência | Chave externa, tabela de inbound events, cursor e reprocessamento |
| Jobs | Processamento assíncrono, retries, dead letter lógico e observabilidade |
| Deep links | Token curto, autorização server-side, expiração e uso único |
| Retenção | Política para mensagens, mídias, análises, exclusão e exportação |

O principal risco é começar pelo componente visual sem fechar esses contratos. O resultado seria uma demo bonita, mas difícil de corrigir quando o provider real chegar.

### 4.3 Lacunas do provider WhatsApp

O UAZAPI e as alternativas foram pesquisados, mas ainda não foram validados em um fluxo real de ponta a ponta. O spike precisa responder as perguntas que realmente podem bloquear o produto:

1. O provider consegue suportar, de forma operacional, o número do agente e a fonte que será indexada como conexões separadas?
2. O método preferencial de pareamento para um único celular está disponível e estável?
3. O provider entrega eventos confiáveis de conexão, mensagem e desconexão?
4. É possível distinguir conversas 1:1 de grupos e recuperar histórico suficiente?
5. A sessão reconecta e pode ser revogada sem deixar acesso residual?
6. O webhook pode ser autenticado, deduplicado e processado em um endpoint público?
7. A conta recomendada pelo provider é compatível com o perfil do piloto?
8. Qual é o custo real por instância, dispositivo, volume e retenção?

A documentação pública da Evolution API descreve QR Code e pairing code [1]. A WAHA descreve sessões, QR, pairing code, eventos e estados de autenticação [2]. A documentação pública do UAZAPI descreve ciclo de vida e estados de instância, recomenda contas WhatsApp Business e alerta para limitações e instabilidades com contas normais [3]. Isso é suficiente para justificar o spike, mas não para prometer produção.

### 4.4 Lacunas da inteligência

O ZapTrail já definiu o princípio correto — o LLM interpreta, o domínio valida —, mas ainda falta construir a avaliação.

É necessário criar um conjunto pequeno e curado de conversas sintéticas, anonimizadas ou autorizadas, contendo conversa 1:1, grupo, reply, múltiplas intenções, datas relativas, contradições, mensagens ambíguas, arquivo, áudio não processável e ausência de evidência. Para cada exemplo, registrar o resultado esperado e o que seria um erro grave.

Sem essa suíte, não será possível saber se o produto está melhorando ou apenas produzindo resumos convincentes. A qualidade deve ser medida por evidência, aceite, correção, rejeição, abstention, falsos positivos e utilidade operacional.

### 4.5 Lacunas legais, de segurança e governança

Ainda falta transformar os princípios de segurança em artefatos e testes. O mínimo antes de dados reais inclui política de privacidade, consentimento versionado, revogação, exclusão, retenção, exportação, isolamento de workspace, RLS/ACL, segredo server-side, logs sem conteúdo sensível e proteção contra prompt injection.

Também é preciso distinguir claramente “conta que conversa com o agente” de “conta que foi autorizada para indexação”. O primeiro “Oi” cria uma identidade de canal e um onboarding pendente; não concede automaticamente acesso a todas as conversas.

### 4.6 Lacunas de validação de mercado

Ainda não há piloto, entrevistas estruturadas, baseline de dor ou evidência de retenção. Antes de expandir escopo, é necessário validar com poucos usuários do mesmo perfil e observar:

| Pergunta | Evidência desejada |
|---|---|
| A pessoa entende a proposta? | Consegue explicar em suas palavras |
| Ela autoriza uma conversa? | Conclui o caminho sem treinamento síncrono obrigatório |
| A timeline é útil? | Abre evidência e corrige/aceita um objeto |
| A resposta do agente economiza tempo? | Faz nova pergunta contextual ou retorna depois |
| Existe dor recorrente? | Reutiliza o produto na semana seguinte |
| O produto evita perda ou retrabalho? | Relato concreto, não apenas aprovação verbal |

## 5. Sequência correta de execução

### Fase 0 — Congelar o contrato do MVP

Criar uma pasta de produto no repositório com `PRODUCT.md`, `DECISIONS.md`, `SECURITY.md`, `AGENTS.md` e `README.md`. O contrato deve conter uma frase de produto, ICP inicial, caso de uso, ativação, escopo, não-escopo, eventos e critérios de sucesso.

O gate é conseguir explicar o ZapTrail sem mencionar CRM, ERP, grafo, agentes autônomos ou dezenas de verticais.

### Fase 1 — Construir o vertical slice sem WhatsApp real

Implementar autenticação, workspace, schema mínimo, MockProvider, fixtures 1:1/grupo, seleção de conversa, pipeline semântico mínimo, objetos com evidência e timeline dual.

O usuário precisa conseguir percorrer:

```text
entrar
→ criar workspace
→ escolher conversa de demonstração
→ processar
→ revisar preview
→ abrir timeline
→ filtrar
→ Mostrar na conversa
→ fazer uma pergunta simulada ao agente
```

O gate é uma conversa completa transformada em estrutura útil, sem qualquer dependência do UAZAPI.

### Fase 2 — Validar o contrato real do provider

Executar o spike UAZAPI com um número controlado, preferencialmente em conta compatível com a recomendação do provider. Não construir a integração inteira. Construir apenas o caminho mínimo: provisionar, parear, status, webhook, listar chats, selecionar conversa, recuperar janela de histórico, desconectar e reconectar.

O gate é uma matriz de sucesso/falha assinada e reproduzível. Se o provider não passar, testar o próximo adapter sem alterar o domínio.

### Fase 3 — Unir conexão real e timeline

Substituir o MockProvider somente atrás da interface. O usuário deve iniciar no agente, obter consentimento, conectar a fonte, escolher uma conversa, aguardar a ingestão e abrir a timeline web. O escopo inicial deve ser uma conversa ou grupo e uma janela limitada.

O gate é ativação comportamental: timeline pronta, evidência aberta e primeira pergunta respondida.

### Fase 4 — Liberar o agente read-only

Implementar perguntas sobre contexto, pendências, decisões, últimos contatos, compromissos e evidências. O agente consulta ferramentas autorizadas; não consulta o banco diretamente e não responde apenas com memória conversacional.

O gate é a consistência entre WhatsApp e web: correções feitas na aplicação aparecem na próxima consulta do agente, e nenhuma resposta cruza workspaces.

### Fase 5 — Piloto fechado e hardening

Testar com três a dez usuários do mesmo ICP, acompanhar abandono por etapa, tempo até primeira timeline, evidência aberta, correções e retorno em sete dias. Corrigir primeiro os três maiores pontos de fricção, não adicionar funcionalidades novas.

O gate é uso recorrente e uma evidência concreta de tempo poupado, pendência recuperada, decisão encontrada ou perda evitada.

## 6. Primeiro pacote de implementação para Opencode

A primeira solicitação ao Opencode deve ser limitada a fundação e contratos. Não pedir “construa o ZapTrail inteiro”.

| ID | História | Dependências | Critério de aceite |
|---|---|---|---|
| `ZT-001` | Criar repositório, README, `AGENTS.md`, scripts e convenções | Nenhuma | Projeto sobe, testa, faz typecheck e build |
| `ZT-002` | Configurar Supabase local/Free e ambiente seguro | `ZT-001` | Migrações e variáveis documentadas; segredos fora do Git |
| `ZT-003` | Criar schema de workspace, membership e onboarding state | `ZT-002` | RLS/ACL e testes negativos passam |
| `ZT-004` | Implementar contrato `WhatsAppProvider` | `ZT-001` | Tipos cobrem sessão, pairing, status, chats, mensagens e eventos |
| `ZT-005` | Implementar `MockProvider` | `ZT-004` | Fixtures 1:1 e grupo simulam sucesso, falha e desconexão |
| `ZT-006` | Persistir mensagens, participantes, anexos e inbound events | `ZT-003`, `ZT-004` | Payload repetido não duplica dados |
| `ZT-007` | Implementar pipeline semântico mínimo | `ZT-006` | Saída validada, evidência obrigatória e confiança persistida |
| `ZT-008` | Implementar objetos de gestão iniciais | `ZT-007` | Tarefa, compromisso, decisão, arquivo e atenção apontam para evidência |
| `ZT-009` | Criar aplicação web mobile-first e timeline dual | `ZT-003`, `ZT-008` | Conversa, timeline, filtros e “Mostrar na conversa” funcionam |
| `ZT-010` | Criar onboarding com MockProvider | `ZT-005`, `ZT-009` | Usuário chega da entrada até primeira timeline sem provider real |
| `ZT-011` | Criar agente simulado read-only | `ZT-008`, `ZT-009` | Perguntas retornam objetos, contexto e evidência |
| `ZT-012` | Executar spike UAZAPI | `ZT-004`, `ZT-010` | Checklist técnico de sucesso/falha preenchido |
| `ZT-013` | Implementar conexão real limitada | `ZT-012` | Uma fonte e uma conversa funcionam de ponta a ponta |
| `ZT-014` | Liberar agente WhatsApp read-only | `ZT-013` | Pergunta real consulta o mesmo núcleo da aplicação |

Cada história deve ser implementada como uma fatia pequena, com inspeção inicial, plano curto, arquivos prováveis, não-escopo, testes, revisão de diff e commit isolado.

## 7. Prompt inicial recomendado para Opencode

```text
Você está trabalhando no ZapTrail, uma plataforma que transforma conversas autorizadas em objetos de gestão rastreáveis.

Objetivo desta história: ZT-001 — criar a fundação do repositório.

Decisões canônicas:
- marca: ZapTrail;
- web responsiva mobile-first como aplicação externa;
- WhatsApp como canal móvel do agente;
- Supabase/Postgres como backend de produto;
- WhatsAppProvider como adapter;
- MockProvider antes de qualquer provider real;
- nenhuma integração UAZAPI nesta história;
- nenhum app nativo, Neo4j, calendário, Kanban avançado ou agente autônomo nesta história.

Antes de editar:
1. inspecione a estrutura existente;
2. apresente um plano de até oito passos;
3. liste arquivos que serão alterados;
4. liste riscos e itens explicitamente fora do escopo.

Depois de editar:
1. execute typecheck, testes e build;
2. revise o diff;
3. relacione cada mudança aos critérios de aceite;
4. informe pendências e próximo passo sugerido.
```

## 8. O que não fazer agora

Não começar pelo UAZAPI como se ele fosse o produto. O provider pode falhar, mudar, cobrar ou não oferecer o histórico necessário. O produto deve ser demonstrável antes dele.

Não começar por React Native. O canal móvel prioritário é o WhatsApp e a aplicação externa precisa ser uma web responsiva que funcione bem no celular e no notebook.

Não começar por calendário, Kanban, CRM, métricas SaaS, múltiplos agentes, automações externas, pagamentos, contratos, cobranças automáticas ou leitura indiscriminada de grupos.

Não permitir que o LLM grave diretamente no banco, execute ações externas ou trate inferências como fatos. O domínio deve validar schema, evidência, confiança, permissão e confirmação.

Não transformar a arquitetura em microserviços, grafo separado ou infraestrutura de alta escala antes de existir uma restrição mensurável.

## 9. Priorização por decisão

| Prioridade | Próximo passo | Por que vem agora |
|---:|---|---|
| P0 | Congelar produto e ADRs | Evita reabrir decisões e gastar Opencode em retrabalho |
| P0 | Criar repositório e contratos | Converte documentação em execução verificável |
| P0 | MockProvider + fixtures | Prova o núcleo sem custo ou dependência externa |
| P0 | Timeline dual com evidência | Demonstra o valor central do ZapTrail |
| P0 | Segurança/RLS/idempotência | Evita construir uma demo que não pode receber dados reais |
| P1 | Spike UAZAPI | Valida o maior risco externo depois do núcleo |
| P1 | Integração real limitada | Conecta valor comprovado a uma fonte real |
| P1 | Agente read-only | Materializa o momento móvel sem aumentar risco de ação |
| P1 | Piloto com usuários | Valida utilidade, fricção e retenção |
| P2 | Confirmações internas e projetos | Aumenta a operação depois que a leitura estiver confiável |
| P2 | Calendário e Kanban | Projeções do objeto, não núcleo de aquisição |
| P3 | App nativo, múltiplas fontes e automações | Somente após evidência de demanda e escala |

## 10. Critério para declarar o MVP pronto

O MVP não estará pronto quando tiver muitas telas. Estará pronto quando cumprir o seguinte caminho com dados reais ou controlados:

```text
usuário autenticado
→ workspace isolado
→ AgentConnection identificada
→ SourceConnection autorizada ou MockProvider explícito
→ conversa 1:1 ou grupo selecionada
→ mensagens persistidas e deduplicadas
→ análise semântica validada
→ objeto com evidência e confiança
→ timeline original/estruturada aberta
→ Mostrar na conversa funcionando
→ pergunta read-only respondida pelo mesmo núcleo
→ auditoria, revogação e falhas testadas
```

## 11. Próxima ação concreta

A próxima ação prática deve ser **criar o repositório ZapTrail e implementar `ZT-001` a `ZT-005`**, nesta ordem: fundação, ambiente, identidade mínima, contrato do provider e MockProvider. Só depois deve ser construída a timeline com fixtures.

O spike UAZAPI vem depois da primeira experiência demonstrável, não antes. Essa ordem é a melhor combinação entre velocidade, custo zero inicial, aprendizado e proteção contra dependência de um conector externo.

## Referências externas

[1]: https://mintlify.wiki/EvolutionAPI/evolution-api/api/instance/connect "Evolution API — Connect Instance"

[2]: https://waha.devlike.pro/docs/how-to/sessions/ "WAHA — Sessions"

[3]: https://docs.uazapi.com/ "uazapiGO V2 — documentação pública da API"

## Documentos internos principais

- `/home/ubuntu/zaptrail_mvp_recalibration.md`
- `/home/ubuntu/zaptrail_channel_architecture.md`
- `/home/ubuntu/zaptrail_journeys_commands_handoff.md`
- `/home/ubuntu/ZapTrail_Onboarding_Conversacional_Primeiro_Oi.md`
- `/home/ubuntu/ZapTrail_Fluxo_Device_Pareamento.md`
- `/home/ubuntu/ZapTrack_Roadmap_MVP_Opencode_Master.md` — histórico a revisar, não fonte canônica
- `/home/ubuntu/ZapTrack_Arquitetura_Stack_Master.md` — blueprint histórico a harmonizar
