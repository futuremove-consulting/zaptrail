# ZapTrack — onboarding e primeiro acesso: WhatsApp → conversa → timeline estruturada

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Autor:** Manus AI  
**Escopo:** onboarding de primeiro acesso para conectar o WhatsApp, selecionar uma conversa 1:1 ou grupo, organizar a primeira conversa e visualizar a timeline estruturada.

![Fluxo de onboarding do ZapTrack](https://private-us-east-1.manuscdn.com/sessionFile/6kyDMg1hYN0vL138nYOYJh/sandbox/33f2BVrGbCiNRooyoIHi0K-images_1787772391701_na1fn_L2hvbWUvdWJ1bnR1L3phcHRyYWNrX29uYm9hcmRpbmdfZmxvdw.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNmt5RE1nMWhZTjB2TDEzOG5ZT1lKaC9zYW5kYm94LzMzZjJCVnJHYkNpTlJvb3lvSUhpMEstaW1hZ2VzXzE3ODc3NzIzOTE3MDFfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzcGhjSFJ5WVdOclgyOXVZbTloY21ScGJtZGZabXh2ZHcucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzg5NDMwNDAwfX19XX0_&Key-Pair-Id=K2QY5QTL8JSY6C&Signature=MEUCIF31uXkxyImfnxPKd1AB7FfKx9QwSYLQrv54-tbvPLlkAiEArQt7vzg4bL6-H9NNLudcZ4HRBPtzgHHqyWKDEJn6twE_)

> **Decisão central:** o onboarding não termina quando o usuário conecta o WhatsApp. Ele termina quando o usuário seleciona uma conversa real, visualiza o que foi estruturado, abre uma evidência e entende que pode voltar da timeline para a mensagem original.

---

## 1. Resultado-alvo

O primeiro acesso deve entregar esta transformação:

```text
WhatsApp conectado
  → conversa 1:1 ou grupo selecionada
  → mensagens preparadas
  → intenções, ações, decisões, objetos e arquivos identificados
  → timeline estruturada visualizada
  → evidência aberta na conversa original
  → usuário entende o valor e pode continuar pelo WhatsApp
```

O fluxo deve ser guiado por uma tarefa real, não por uma apresentação de funcionalidades. Essa decisão é coerente com boas práticas de onboarding orientado a ativação: começar pelo objetivo do usuário, reduzir etapas até o valor e definir o primeiro resultado comportamental do produto [3] [4].

---

## 2. Base de design e benchmarks

A documentação da Meta descreve o Embedded Signup como uma interface de autenticação e autorização que coleta informações empresariais, gera os ativos necessários e concede acesso aos ativos do WhatsApp Business Platform. O fluxo pode envolver credenciais Meta Business, termos, portfólio empresarial, WABA, número empresarial e nome de exibição; os identificadores retornados devem ser processados pelo servidor antes de a conexão ser considerada pronta [1].

Na coexistência com o WhatsApp Business App, a Meta documenta tópicos de histórico, sincronização de contatos e ecos de mensagens, além da necessidade de iniciar a sincronização logo após o onboarding e orientar o negócio a manter o aplicativo aberto durante o processo [2]. Logo, o ZapTrack deve mostrar escopo e progresso reais, não um spinner indefinido.

A Nielsen Norman Group alerta que tutoriais intrusivos podem interromper tarefas, ser ignorados e não melhorar necessariamente a execução; recomenda ajuda contextual e acionada quando o usuário precisa [5]. Por isso, o ZapTrack não deve abrir um tour longo. Deve orientar o usuário no momento da conexão, seleção, processamento, revisão e evidência.

Referências de onboarding orientado a produto convergem em três princípios: começar pelo objetivo do usuário, definir o evento de ativação e eliminar fricção que não aproxima o usuário do primeiro valor [3] [4]. Para o ZapTrack, o evento de ativação é específico e observável:

> **Usuário conecta ou fornece uma fonte autorizada, seleciona uma conversa 1:1 ou grupo, visualiza uma timeline estruturada e abre pelo menos uma evidência na conversa original.**

---

## 3. Arquitetura do fluxo

```text
Boas-vindas
  → escolha do caminho
  → escopo e consentimento
  → conexão oficial ou fallback
  → sincronização/indexação
  → seleção de conversa 1:1 ou grupo
  → confirmação de escopo/contexto
  → organização progressiva
  → preview de acontecimentos
  → timeline estruturada
  → mostrar na conversa
  → primeiro valor/ativação
```

O fluxo possui cinco etapas visíveis:

| Etapa | Pergunta do usuário |
|---|---|
| Conectar | O que vai ser acessado? |
| Preparar | O sistema já está pronto? |
| Escolher conversa | Onde começo? |
| Organizar | O que o ZapTrack está fazendo? |
| Ver timeline | O que aconteceu e qual é a evidência? |

---

## 4. Caminhos de entrada

O ZapTrack deve oferecer três caminhos, com uma recomendação principal:

| Caminho | Uso | Prioridade |
|---|---|---|
| Conectar WhatsApp Business | Negócio elegível para Cloud API/coexistência | Principal |
| Encaminhar mensagem ao agente | Teste rápido ou fonte não elegível | Fallback imediato |
| Importar conversa/arquivo | Exportação ou conteúdo autorizado | Fallback controlado |

O produto não deve prometer leitura indiscriminada de WhatsApp pessoal ou de todos os grupos existentes. A seleção de conversa deve listar somente fontes e conversas efetivamente disponíveis, autorizadas e processadas.

---

## 5. Tela 0 — boas-vindas

### Objetivo

Explicar o resultado em linguagem simples e levar o usuário diretamente ao primeiro valor.

### Microcopy

**Título:**

> Veja o que realmente aconteceu nas suas conversas.

**Subtítulo:**

> Conecte uma fonte autorizada do WhatsApp, escolha uma conversa individual ou grupo e transforme mensagens, decisões, pedidos, arquivos e pendências em uma timeline pesquisável.

**Ações:**

```text
[Conectar WhatsApp Business]
[Começar com mensagem ou arquivo encaminhado]
```

**Nota de confiança:**

> Você continua usando o WhatsApp normalmente. O ZapTrack organiza somente as fontes e conversas às quais você conceder acesso.

Não mostrar tour de todas as áreas, agentes, métricas e integrações.

---

## 6. Tela 1 — escolha do caminho

### Microcopy

> Como você quer começar?

```text
[Conectar meu WhatsApp Business]
Sincronize uma conta empresarial elegível e escolha uma conversa.

[Enviar uma conversa para o agente]
Encaminhe mensagens, áudio ou arquivos e veja o resultado rapidamente.

[Importar um arquivo de conversa]
Use um arquivo de exportação ou outro conteúdo autorizado.
```

O caminho recomendado deve ser o oficial, mas o fallback deve estar visível. O objetivo é evitar que uma limitação de fonte destrua o momento de demonstração do produto.

---

## 7. Tela 2 — escopo e consentimento

Antes de abrir a autorização, o ZapTrack deve explicar o que será acessado, para qual finalidade e quais limites existem.

### Conteúdo recomendado

```text
Você está conectando seu WhatsApp Business.

O ZapTrack poderá:
✓ receber mensagens e eventos dentro do escopo autorizado;
✓ organizar conversas e grupos disponibilizados pela fonte;
✓ identificar pessoas, empresas, projetos e objetos de gestão;
✓ indexar arquivos e mídias que puder processar.

O ZapTrack não poderá:
× acessar conversas fora do escopo autorizado;
× garantir acesso a grupos pessoais ou não disponibilizados pela fonte;
× alterar mensagens no WhatsApp;
× executar ações externas sem permissão e confirmação.
```

Links visíveis:

```text
Ver detalhes de privacidade
Ver dados que serão armazenados
Ver como revogar o acesso
```

CTA: `Continuar para conexão segura`.

Não usar um consentimento genérico e escondido. O usuário deve compreender o escopo antes de autorizar.

---

## 8. Tela 3 — conexão oficial

Abrir Embedded Signup oficial em janela ou modal compatível com desktop e mobile. O ZapTrack deve evitar duplicar informações que a Meta já coleta.

### Estado do frontend

```text
authorization_not_started
authorization_opened
authorization_returned
authorization_cancelled
authorization_failed
```

### Regra backend

O frontend não deve marcar a fonte como `connected` apenas porque a janela foi concluída. O backend precisa validar o retorno, processar os identificadores, registrar a fonte, configurar o canal necessário e confirmar a assinatura de eventos antes de liberar o próximo estágio.

### Microcopy fora da janela

> A conexão acontece em uma página oficial. Quando terminar, voltaremos para o ZapTrack automaticamente.

---

## 9. Tela 4 — conexão confirmada

### Sucesso

> WhatsApp conectado. Agora vamos preparar as conversas disponíveis para você escolher uma.

```text
Conta: nome/telefone mascarado
Fonte: WhatsApp Business
Escopo: resumo do escopo autorizado
Status: conectado
Próximo passo: preparar conversas
```

CTA: `Preparar conversas`.

### Estado parcial

> A conta foi conectada, mas o histórico ainda está sendo validado. Você pode aguardar ou começar encaminhando uma conversa ao agente.

### Falha

> Não conseguimos concluir a conexão. Nenhum dado foi alterado. Tente novamente ou comece encaminhando uma conversa ao agente.

---

## 10. Tela 5 — preparação e sincronização

A sincronização deve ser apresentada como uma atividade observável:

```text
Conta conectada                  concluído
Contatos e participantes         concluído/em andamento
Conversas disponíveis            em andamento
Mensagens                        42%
Arquivos                         aguardando
Indexação                        aguardando
```

### Microcopy

> Estamos preparando uma lista de conversas para você escolher. Você pode sair desta tela; o processo continuará em segundo plano.

Se o fluxo for de coexistência:

> Mantenha o WhatsApp Business aberto enquanto sincronizamos para facilitar a preparação.

### Estados

```text
sync_not_started
sync_queued
sync_running
sync_partial
sync_completed
sync_failed
sync_expired
```

O progresso deve refletir contagens e etapas reais. Não mostrar percentuais inventados. Se não houver estimativa confiável, mostrar etapa atual e última atualização.

### Regra de desbloqueio

A seleção de conversa pode ser liberada quando houver índice mínimo, mesmo que arquivos ou embeddings ainda estejam processando. A primeira timeline pode ser parcial, desde que a interface diga isso.

---

## 11. Tela 6 — seleção de conversa

### Cabeçalho

> Escolha onde começar.

### Abas principais

```text
[Conversas 1:1] [Grupos]
```

Essa escolha é explícita porque corresponde à estrutura real do WhatsApp. Não esconder grupo dentro de filtros secundários.

### Busca

> Buscar por pessoa, empresa, grupo ou projeto.

### Filtros rápidos

```text
Mais recentes
Com arquivos
Com pendências
Com decisões
Mais ativas
```

### Card 1:1

```text
Ana Souza
Cliente · Alfa Tecnologia
Última atividade: hoje, 14:32
Mensagens disponíveis: 186
Possíveis itens para revisar: 12
Projeto sugerido: Implantação Alfa
[Selecionar]
```

### Card de grupo

```text
Implantação Alfa
Grupo · 8 participantes
Última atividade: ontem, 18:05
Mensagens disponíveis: 482
Possíveis itens para revisar: 27
Projetos sugeridos: 2
[Selecionar]
```

As expressões “possíveis itens” e “projetos sugeridos” evitam apresentar uma interpretação como fato confirmado.

### Recomendação inteligente

> Recomendamos **Implantação Alfa** porque há decisões, prazos e arquivos recentes. Você pode escolher qualquer outra conversa.

A recomendação deve ser descartável e nunca substituir a escolha manual.

---

## 12. Tela 7 — confirmação da conversa

### Microcopy

> Organizar esta conversa?

```text
Tipo: Grupo
Nome: Implantação Alfa
Participantes: 8
Período: 01/08–26/08
Mensagens: 482
Arquivos: 36
```

### Contexto sugerido

```text
Empresa: Alfa Tecnologia · sugerida
Projeto: Implantação Alfa · sugerido
Área: Operações · sugerida
```

Ações:

```text
[Organizar conversa]
[Alterar contexto]
[Deixar para depois]
```

### Nota

> As associações sugeridas podem ser confirmadas ou corrigidas depois. Elas não alteram a conversa original.

Criar empresa ou projeto não deve ser obrigatório para abrir a timeline.

---

## 13. Tela 8 — organização progressiva

### Título

> Estamos organizando sua conversa.

### Etapas

```text
✓ Mensagens preparadas
✓ Participantes identificados
● Intenções e ações sendo reconhecidas
○ Decisões e compromissos
○ Objetos e timeline
```

O usuário pode sair. O processamento continua em background. Se a primeira versão ficar pronta antes do processamento completo, liberar a timeline parcial.

### Processamento sem caixa-preta

A interface deve explicar:

```text
O que estamos fazendo
Por que isso importa
O que já está pronto
O que ainda está sendo processado
```

---

## 14. Tela 9 — preview de valor

### Título

> Encontramos os primeiros acontecimentos.

### Resumo

```text
5 decisões ou aprovações
7 compromissos
4 solicitações
3 arquivos relevantes
2 pendências em aberto
1 possível atraso
```

O usuário pode clicar em cada categoria para abrir a timeline já filtrada. O preview deve ser curto; a informação detalhada fica na timeline.

---

## 15. Tela 10 — primeira timeline

### Cabeçalho

```text
Implantação Alfa
Grupo · 8 participantes
Alfa Tecnologia · Projeto Implantação Alfa

[Conversa] [Timeline] [Ambas]
```

### Filtros iniciais

```text
Todos | Decisões | Ações | Pendências | Arquivos | Buscar
```

### Item exemplo

```text
26/08 · 14:12 · Decisão proposta
A equipe aprovou iniciar a instalação em 01/09.
Evidência: 4 mensagens · confiança: revisar
[Confirmar] [Corrigir] [Mostrar na conversa]
```

### Tipos de itens

```text
mensagem relevante
intenção/ato
ação de negócio
decisão
compromisso
objeto criado
mudança de estado
arquivo
relação
atenção
ação do usuário
```

A conversa original deve continuar disponível e nenhuma mensagem deve desaparecer apenas porque não foi classificada.

---

## 16. Tela 11 — mostrar na conversa

Ao clicar em `Mostrar na conversa`:

```text
1. localizar evidência direta;
2. abrir modo Conversa ou Ambas;
3. carregar janela de contexto;
4. rolar até a mensagem principal;
5. destacar o trecho relevante;
6. mostrar mensagens anteriores e posteriores;
7. preservar filtros e posição da timeline;
8. permitir voltar à timeline.
```

### Microcopy

> Esta mensagem é a principal evidência da decisão proposta.

Se o objeto veio de várias mensagens:

> Este objeto foi criado a partir de 3 evidências. Ver mensagem principal ou todas.

A navegação deve usar IDs de mensagem e não somente posição percentual do scroll.

---

## 17. Conclusão do primeiro acesso

### Microcopy

> Sua primeira conversa foi organizada. Agora você pode acompanhar decisões, pendências, arquivos e próximos passos sem reler tudo.

Ações:

```text
[Explorar filtros]
[Ver pendências]
[Perguntar ao agente]
[Voltar ao Agora]
```

Pergunta sugerida para o agente:

> Quais pendências deste grupo vencem esta semana?

A pergunta deve carregar `conversation_id` como contexto, evitando que o usuário tenha que explicar novamente onde está.

---

## 18. Fallback por encaminhamento

Quando a fonte não puder ser sincronizada:

```text
Aplicação mostra instrução
  → usuário abre WhatsApp
  → encaminha mensagem, áudio ou arquivo ao agente
  → agente confirma recebimento
  → ZapTrack cria conversa importada/recorte
  → usuário escolhe 1:1, grupo ou recorte
  → processamento
  → timeline
```

Resposta do agente:

> Recebi o conteúdo. Quer organizar como **conversa 1:1**, **grupo** ou apenas analisar este recorte?

Esse fallback permite demonstrar a transformação sem esperar uma integração completa.

---

## 19. Estados e recuperação

| Situação | Mensagem | Recuperação |
|---|---|---|
| Fonte não elegível | “Esta fonte não disponibiliza conversas para sincronização.” | Encaminhar/importar |
| Sem conversas | “Ainda não encontramos conversas disponíveis.” | Aguardar, revisar escopo, usar fallback |
| Sincronização lenta | “A preparação está demorando mais que o esperado.” | Sair e continuar depois |
| Sincronização parcial | “Parte das mensagens já está pronta.” | Ver timeline parcial |
| Arquivo não processável | “O arquivo foi recebido, mas não conseguimos ler seu conteúdo.” | Abrir arquivo/substituir |
| Baixa confiança | “Encontramos uma possível decisão, mas falta contexto.” | Ver evidência/corrigir |
| Permissão insuficiente | “Seu perfil não pode acessar esta conversa.” | Solicitar acesso/escolher outra |
| Código expirado | “Este código não é mais válido.” | Gerar novo código |
| Falha temporária | “O serviço não respondeu agora.” | Tentar novamente/ver status |
| Usuário abandona | “Você pode continuar depois; seu progresso foi salvo.” | Retomar no mesmo ponto |

Não bloquear o primeiro valor por uma falha secundária, como OCR de um arquivo, desde que a conversa e a timeline mínima estejam disponíveis.

---

## 20. Arquitetura técnica do onboarding

### Entidades principais

```text
OnboardingSession
SourceConnection
SyncJob
ConversationSelection
ProcessingRun
TimelineProjection
ActivationEvent
```

### Estados da sessão

```text
started
path_selected
consent_viewed
authorization_started
authorization_completed
source_validating
source_connected
syncing
conversation_selection_ready
conversation_selected
processing
preview_ready
timeline_ready
evidence_opened
activated
abandoned
failed
```

### Eventos de produto

```text
onboarding.started
onboarding.path_selected
consent.viewed
authorization.started
authorization.completed
source.connected
sync.started
sync.progressed
sync.completed
conversation_picker.opened
conversation_type.selected
conversation.selected
first_processing.started
first_preview.viewed
first_timeline.ready
first_item.opened
first_evidence.opened
show_in_conversation.used
activation.completed
```

### Jobs assíncronos

```text
validate_source_connection
sync_contacts
sync_conversations
sync_messages
normalize_messages
process_media
extract_semantics
create_timeline_projection
index_search_documents
notify_timeline_ready
```

O webhook deve validar, deduplicar, persistir e responder rapidamente. Processamento de mensagens, mídia, OCR, embeddings e timeline ocorre em background.

---

## 21. Instrumentação e métricas

### Funil

```text
landing_viewed
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

### Métricas de experiência

| Métrica | O que responde |
|---|---|
| Tempo até primeiro valor | Quanto demora para a timeline e a evidência aparecerem? |
| Taxa de conexão | O usuário conclui autorização? |
| Taxa de seleção | O usuário encontra e escolhe uma conversa? |
| Taxa de timeline pronta | A organização chega ao resultado? |
| Abertura de evidência | O usuário verifica a origem? |
| Sucesso de “mostrar na conversa” | O salto para a mensagem funciona? |
| Taxa de abandono por etapa | Onde existe fricção? |
| Taxa de fallback | A fonte principal está falhando ou não é elegível? |
| Taxa de confirmação/correção | A qualidade semântica é suficiente? |

A métrica principal de ativação não deve ser “completou o onboarding”. Deve ser a execução do comportamento que prova o valor do produto.

---

## 22. Critérios de aceite

O onboarding está correto quando:

1. o usuário entende o escopo da conexão antes de autorizar;
2. a conexão só aparece como pronta após validação do backend;
3. o usuário consegue escolher explicitamente entre 1:1 e grupo;
4. a lista mostra somente conversas autorizadas e disponíveis;
5. o usuário entende o progresso da sincronização;
6. é possível sair e retomar sem perder o estado;
7. a organização da primeira conversa mostra preview antes da profundidade;
8. a timeline diferencia fato, interpretação, sugestão e objeto confirmado;
9. o usuário consegue alternar entre Conversa, Timeline e Ambas;
10. `Mostrar na conversa` leva à mensagem correta e destaca o contexto;
11. falhas secundárias não bloqueiam uma timeline parcial;
12. o sistema oferece fallback de encaminhamento/importação;
13. a ativação pode ser medida por eventos de comportamento;
14. nenhuma etapa exige conhecer a ontologia interna do ZapTrack.

---

## 23. Recomendação final

O melhor onboarding do ZapTrack é curto, orientado a uma conversa real e progressivo:

```text
conectar
  → escolher 1:1 ou grupo
  → confirmar escopo
  → organizar
  → ver o que foi encontrado
  → abrir timeline
  → mostrar na conversa
```

Ele deve começar pela experiência oficial de conexão do WhatsApp Business, mas possuir fallback imediato por encaminhamento e importação. Deve permitir que o usuário alcance o primeiro valor sem criar empresa, projeto, área, taxonomia ou automação.

> **A primeira vitória do ZapTrack não é conectar um canal. É fazer o usuário olhar para uma conversa conhecida e dizer: “agora eu consigo ver, encontrar e acompanhar tudo o que aconteceu aqui”.**

---

## Referências

[1]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview — Meta for Developers, “Embedded Signup”.

[2]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users — Meta for Developers, “Onboard WhatsApp Business app users”.

[3]: https://productled.com/book/onboarding — ProductLed, “Product-Led Onboarding”.

[4]: https://www.appcues.com/blog/product-led-onboarding — Appcues, “Product-led onboarding: The complete guide to activating users faster”.

[5]: https://www.nngroup.com/articles/onboarding-tutorials/ — Nielsen Norman Group, “Onboarding Tutorials vs. Contextual Help”.

## Documentos de apoio

- `zaptrack_onboarding_research.md`
- `zaptrack_onboarding_connection_selection.md`
- `zaptrack_first_conversation_timeline.md`
- `zaptrack_onboarding_screens_states_metrics.md`
- `zaptrack_onboarding_flow.mmd`
- `zaptrack_onboarding_flow.png`
