# ZapTrail — Onboarding conversacional iniciado pelo primeiro “Oi”

**Versão:** 1.0  
**Produto:** ZapTrail  
**Decisão:** o onboarding deve começar no WhatsApp, em conversa com o agente do ZapTrail.  
**Autor:** Manus AI  
**Data:** 26 de agosto de 2026

## 1. Decisão executiva

Sim, é possível — e é recomendável — que o **primeiro passo do onboarding seja o usuário enviar uma mensagem ao agente do ZapTrail no próprio WhatsApp**. A experiência inicial, a explicação do produto, o consentimento, a criação do workspace, a escolha do modo de conexão, o acompanhamento do status, a seleção da primeira conversa e a apresentação do primeiro resultado podem ocorrer na própria conversa com o agente.

A formulação correta, porém, não é “conexão 100% sem sair da conversa”. A formulação correta é:

> **O onboarding do ZapTrail é iniciado, conduzido e acompanhado 100% pelo WhatsApp; a autenticação técnica do número que será analisado pode exigir uma ação de pareamento no próprio celular, normalmente por QR Code, código de pareamento ou confirmação adicional.**

Essa distinção é fundamental. O usuário pode conversar com o agente e receber um código no WhatsApp, mas ainda precisa autorizar o vínculo no menu de dispositivos conectados do seu celular. O agente não deve fingir que essa autorização aconteceu apenas porque recebeu o primeiro “Oi”.

A decisão transforma o primeiro acesso em uma experiência de **“produto que responde”**, e não em um formulário de cadastro. O usuário não começa criando uma conta, preenchendo campos e procurando uma integração. Ele começa dizendo “Oi”, entende o valor em poucos turnos e só executa uma ação técnica quando o ZapTrail explica claramente por que ela é necessária.

## 2. O modelo mental correto: duas conexões diferentes

O onboarding precisa distinguir duas identidades técnicas que podem ser confundidas pelo usuário, mas têm funções diferentes no sistema.

| Conexão | O que representa | Para que serve | Quando nasce |
|---|---|---|---|
| **AgentConnection** | O número do usuário que conversa com o agente ZapTrail | Receber consultas, comandos, confirmações e links de retorno | No primeiro “Oi” |
| **SourceConnection** | O número ou conta WhatsApp que o usuário autoriza o ZapTrail a organizar | Ler/sincronizar conversas, grupos, mensagens e mídias dentro do escopo permitido pelo provider | Após consentimento e pareamento |
| **Workspace** | O espaço de trabalho do usuário ou empresa | Manter objetos, projetos, entidades, evidências, permissões e histórico | Durante o onboarding, antes ou junto da SourceConnection |

Na configuração mais provável, o usuário conversa com o agente por um número do ZapTrail e autoriza o **próprio número operacional** como fonte de dados. São números tecnicamente distintos: o primeiro é o canal de interação com o agente; o segundo é a conta que será conectada ao provider para leitura e organização.

Essa separação permite que o ZapTrail continue funcionando mesmo quando o usuário decidir conectar outro número comercial, um número de atendimento ou uma conta dedicada. Também evita conceder acesso a dados somente porque alguém enviou uma mensagem ao agente.

## 3. O que pode ser 100% conversacional

A camada conversacional pode cuidar integralmente das seguintes etapas:

| Etapa | Pode ocorrer no WhatsApp? | Observação |
|---|---:|---|
| Boas-vindas e explicação do ZapTrail | Sim | Mensagens curtas, com respostas rápidas ou comandos |
| Identificação do número que iniciou a conversa | Sim | O WhatsApp fornece o identificador técnico do remetente ao provider do agente |
| Criação do workspace inicial | Sim | Nome provisório pode ser confirmado depois na aplicação |
| Consentimento informado | Sim | Deve ser explícito, versionado e armazenado |
| Escolha do tipo de fonte | Sim | Mesmo número, outro número ou demonstração |
| Acompanhamento da conexão | Sim | O agente informa “aguardando”, “conectando”, “conectado” ou “falhou” |
| Seleção da primeira conversa | Sim, se o provider devolver chats | Pode usar lista interativa ou nome/número/grupo digitado |
| Importação inicial limitada | Sim | O processamento pode ocorrer no backend enquanto o agente atualiza o usuário |
| Resumo da timeline | Sim | O agente entrega uma síntese curta e links para aprofundamento |
| Consulta e comandos read-only | Sim | É o principal caso de uso móvel do MVP |
| Abertura da análise profunda | Parcialmente | O agente envia um deep link seguro para a aplicação web |

O desenho ideal é que o usuário nunca precise entender a arquitetura interna. Ele deve perceber apenas uma progressão natural: **“falei com o ZapTrail → autorizei o acesso → escolhi uma conversa → recebi a organização → posso perguntar sobre ela”.**

## 4. O que não deve ser prometido como puramente conversacional

A etapa de autenticação da SourceConnection é a exceção. Providers que operam com sessão de WhatsApp Web ou mecanismos equivalentes normalmente exigem que o usuário vincule a sessão no próprio aplicativo WhatsApp.

A documentação pública da Evolution API descreve conexão de instância com geração de QR Code e também apresenta resposta com `pairingCode` para conexão por número de telefone [1]. A documentação da WAHA descreve que uma sessão precisa ser criada, iniciada e autenticada por QR Code ou pairing code, além de listar estados como `SCAN_QR_CODE`, `PASSKEY_REQUIRED`, `PASSKEY_CONFIRMATION_REQUIRED`, `WORKING` e `FAILED` [2].

No caso do UAZAPI, a documentação pública descreve o ciclo de vida da instância — conexão, desconexão, reinício e verificação de status — e os estados `disconnected`, `connecting`, `connected` e `hibernated`. Ela recomenda o uso de contas WhatsApp Business e alerta para possíveis inconsistências, desconexões, limitações e instabilidades com contas WhatsApp normais [3].

A conclusão prática é a seguinte:

| Afirmação | Decisão |
|---|---|
| “O usuário começa o onboarding mandando uma mensagem ao agente” | **Sim** |
| “O usuário faz o onboarding inteiro pelo WhatsApp” | **Sim, com ressalva de pareamento** |
| “O usuário conecta a conta sem qualquer ação adicional no dispositivo” | **Não prometer** |
| “O agente pode enviar instruções, pairing code e acompanhar o status” | **Sim, se o provider oferecer** |
| “O usuário pode receber QR no chat” | **Sim, mas para escanear normalmente precisará de outro dispositivo** |
| “Pairing code é melhor para quem está usando um único celular” | **Em geral, sim, quando disponível** |
| “A disponibilidade do recurso é igual em todos os providers” | **Não** |

O QR Code enviado na própria conversa pode ser útil para quem tem notebook ou um segundo telefone, mas não resolve bem o caso de quem está com apenas um celular na mão. Por isso, o adapter do ZapTrail deve preferir **pairing code** quando o provider oferecer essa modalidade de forma confiável, mantendo QR e aplicação web como fallbacks.

## 5. Fluxo recomendado: do primeiro “Oi” à primeira timeline

### 5.1 Passo 0 — descoberta

O usuário encontra o número do agente ZapTrail e envia uma mensagem simples, como “Oi”, “Olá” ou “Quero organizar meu WhatsApp”. Esse é o primeiro evento do sistema.

O backend cria ou localiza a `AgentConnection` pelo identificador do remetente, mas ainda não concede acesso a nenhuma conversa de origem. O primeiro “Oi” prova apenas que o usuário controla aquele número que está falando com o agente; não prova que ele autorizou a leitura de outra conta.

Mensagem sugerida:

> **Olá. Eu sou o agente do ZapTrail. Transformo conversas do WhatsApp em uma visão organizada de tarefas, compromissos, decisões, arquivos, pendências e próximos passos.**
>
> Posso te conduzir por aqui e, depois, mostrar a análise completa na aplicação web. O que você quer fazer?
>
> **1. Conectar meu WhatsApp**  
> **2. Ver uma demonstração**  
> **3. Entender como funciona**

O agente deve aceitar tanto respostas numeradas quanto linguagem natural. Entretanto, o fluxo precisa ser opinionated: apresentar poucas opções, evitar menus longos e sempre oferecer um próximo passo claro.

### 5.2 Passo 1 — explicação curta e consentimento

Se o usuário escolher conectar, o agente explica o escopo antes de qualquer pareamento:

> Para organizar suas conversas, o ZapTrail precisará receber e processar as mensagens da conta WhatsApp que você escolher conectar. No início, vou organizar somente **uma conversa ou grupo**, para você avaliar o resultado antes de ampliar o escopo.
>
> O ZapTrail separa a conversa original dos itens interpretados — como tarefas, decisões, compromissos e evidências — e mantém a origem de cada item. Você poderá pausar a conexão e excluir os dados depois.
>
> Você autoriza iniciar essa configuração?
>
> **Sim, continuar**  
> **Quero saber mais**  
> **Agora não**

O consentimento deve gerar um `ConsentRecord` com versão do texto, timestamp, número/identificador do remetente, workspace, finalidade, provider selecionado e escopo inicial. O consentimento para conversar com o agente não deve ser reutilizado silenciosamente como consentimento para importar todo o histórico.

### 5.3 Passo 2 — escolha da fonte

O agente deve perguntar explicitamente qual conta será organizada:

> Qual WhatsApp você quer organizar primeiro?
>
> **1. Este mesmo número que está falando comigo**  
> **2. Outro número de WhatsApp**  
> **3. Apenas testar com uma demonstração**

A opção de demonstração é estratégica. Ela permite provar o valor do ZapTrail com `MockWhatsAppProvider`, sem pagamento, sem conexão real e sem risco operacional. O usuário deve conseguir chegar à primeira timeline mesmo antes de contratar ou configurar um provider real.

Se o usuário escolher “este mesmo número”, o sistema prepara uma SourceConnection para o número que está conversando com o agente, mas não assume que ela esteja autorizada até o pareamento ser confirmado.

Se escolher “outro número”, o agente explica que a conversa com o agente continuará no número atual, enquanto o número de origem será conectado por uma etapa de pareamento. A coleta do número deve ser mínima e nunca deve pedir senha, token ou código de autenticação enviado pelo WhatsApp.

### 5.4 Passo 3 — preparação técnica

O backend cria uma tentativa idempotente de conexão. O adapter recebe algo equivalente a:

```ts
interface StartSourceConnectionInput {
  workspaceId: string;
  sourcePhoneHint?: string;
  preferredPairingMode: "pairing_code" | "qr" | "provider_default";
  initialScope: "one_conversation";
}
```

O adapter não deve vazar credenciais do provider para o agente. Ele devolve somente um artefato de pareamento seguro e temporário, além do estado normalizado:

```ts
interface PairingChallenge {
  attemptId: string;
  mode: "pairing_code" | "qr" | "external_page";
  code?: string;
  qrImageRef?: string;
  instructions: string[];
  expiresAt: string;
}
```

### 5.5 Passo 4 — pareamento guiado

Quando o provider disponibilizar código, o agente deve preferi-lo para o caso de uso de um único celular:

> A conexão está pronta. No seu celular, abra o WhatsApp e vá até:
>
> **Configurações → Aparelhos conectados → Conectar aparelho → Conectar com número de telefone**.
>
> Quando aparecer o campo para o código, use:
>
> **ABCD-EFGH**
>
> Esse código expira em poucos minutos e só serve para esta tentativa. Não envie códigos recebidos por SMS nem sua senha para mim. Quando terminar, responda **PRONTO**.

O código real nunca deve ser persistido em texto aberto nos logs. O sistema deve armazenar apenas hash ou referência protegida, com validade curta, uso único e associação ao `attemptId`.

Quando somente QR estiver disponível, o agente envia a imagem ou um link temporário para a aplicação:

> O provider disponibilizou um QR Code. Se você estiver usando outro dispositivo, abra **Aparelhos conectados** no WhatsApp e escaneie o QR Code abaixo. Se estiver usando apenas este celular, toque em **Abrir no navegador** para continuar por uma tela maior ou escolha outro método, se disponível.

O fluxo nunca deve forçar o usuário a mandar uma foto de QR, código, senha ou token de volta ao agente. A única confirmação necessária deve ser “PRONTO”, enquanto a confirmação verdadeira vem do evento de status do provider.

### 5.6 Passo 5 — acompanhamento de status

A aplicação recebe eventos do provider por webhook autenticado ou consulta controlada quando o provider não oferecer evento confiável. O agente traduz o estado técnico para linguagem humana:

| Estado interno ZapTrail | Mensagem ao usuário |
|---|---|
| `provisioning` | Estou preparando a conexão. |
| `awaiting_user_pairing` | A conexão está aguardando sua confirmação no WhatsApp. |
| `connecting` | O pareamento foi recebido; estou validando a sessão. |
| `connected` | WhatsApp conectado com sucesso. |
| `reconnecting` | A conexão caiu temporariamente; estou tentando recuperar. |
| `failed` | Não consegui concluir esta tentativa. Vou explicar o motivo e oferecer outro caminho. |
| `disconnected` | Esta fonte foi desconectada e não será mais sincronizada. |
| `expired` | O código expirou; posso gerar uma nova tentativa. |

Mensagem de sucesso:

> **Conexão concluída.** Agora consigo trabalhar com a fonte autorizada, respeitando o escopo que você escolheu. Para começar com segurança, vou listar suas conversas e organizar somente uma delas.

### 5.7 Passo 6 — seleção de uma conversa ou grupo

Se o provider devolver a lista de chats, o agente apresenta uma seleção curta, priorizando conversas recentes e distinguindo 1:1 de grupo:

> Escolha a primeira conversa que você quer organizar:
>
> **1. Cliente Alfa — conversa individual**  
> **2. Projeto Reforma — grupo**  
> **3. Fornecedor Beta — conversa individual**  
> **4. Digitar outro nome ou número**

O usuário também pode responder com linguagem natural, como “organiza a conversa com o Cliente Alfa” ou “quero o grupo Projeto Reforma”. O domínio deve resolver a intenção contra os chats disponíveis, mas pedir confirmação quando houver ambiguidade.

A primeira ingestão deve ser deliberadamente limitada: uma conversa, janela de tempo configurável e limite de mensagens/mídias. Isso reduz custo, risco, tempo de espera e frustração, além de criar um momento claro para o usuário avaliar a qualidade.

### 5.8 Passo 7 — organização e primeira entrega

O pipeline processa as mensagens em camadas:

```text
mensagem bruta
→ normalização e deduplicação
→ intenção/ato linguístico
→ evento e evidência
→ semantic assertion com confiança
→ objeto de gestão
→ timeline estruturada
```

O agente informa o andamento sem gerar falsas certezas:

> Estou organizando a conversa. Primeiro preservo a fonte original; depois identifico eventos, intenções, decisões, arquivos, tarefas e compromissos. Itens inferidos ficam marcados com evidência e confiança para você revisar.

Entrega sugerida:

> **Primeira organização concluída.**
>
> Encontrei **3 possíveis tarefas**, **1 decisão**, **2 compromissos**, **4 arquivos** e **1 ponto de atenção**. Um dos compromissos parece depender de confirmação, então marquei-o como **a revisar**, não como fato definitivo.
>
> O que você quer ver?
>
> **Resumo** · **Tarefas** · **Decisões** · **Arquivos** · **Abrir timeline completa**

A aplicação web é usada para evidência, contexto e revisão profunda. O WhatsApp é usado para síntese, consulta e decisão rápida.

## 6. Handoff entre WhatsApp e aplicação web

O WhatsApp deve ser suficiente para chegar ao primeiro valor, mas não precisa carregar toda a complexidade visual da timeline dual. Para análises profundas, o agente envia um deep link curto, assinado e de validade limitada:

> Esta é a visão completa da conversa, com a mensagem original, evidências, filtros e timeline estruturada:
>
> **Abrir timeline do Cliente Alfa**
>
> O link expira em 10 minutos. Se necessário, entre na aplicação com sua conta ZapTrail.

O link não deve conter token de sessão reutilizável, segredo do provider ou identificadores sensíveis em texto claro. O ideal é um código de handoff de uso único, resolvido pelo backend depois da autenticação do usuário.

## 7. Arquitetura técnica do onboarding

```text
Usuário envia “Oi”
        ↓
Provider do número do agente
        ↓ webhook inbound
AgentConnection Resolver
        ↓
Onboarding State Machine
        ├── Consent Service
        ├── Workspace Service
        ├── SourceConnection Service
        └── Agent Command Router
                ↓
        WhatsAppProvider Adapter
        ├── MockProvider
        ├── UAZAPIProvider
        ├── EvolutionProvider
        ├── WahaProvider
        └── MetaProvider futuro
                ↓ eventos/status
        Connection Event Normalizer
                ↓
        Import Queue / Idempotency
                ↓
        Raw → Semantic → Knowledge → Retrieval
                ↓
        Timeline Web + respostas do agente
```

O agente não acessa o banco diretamente. Ele chama ferramentas de domínio tipadas, por exemplo `getOnboardingState`, `acceptConsent`, `startSourcePairing`, `getConnectionStatus`, `listChats`, `selectConversation`, `getTimelineSummary` e `createWebHandoff`. Cada ferramenta aplica autorização, workspace, escopo e auditoria.

A máquina de estados do onboarding deve ser determinística:

```text
NEW
→ WELCOMED
→ CONSENT_PENDING
→ SOURCE_SELECTION
→ CONNECTION_PROVISIONING
→ PAIRING_PENDING
→ CONNECTION_VERIFYING
→ SOURCE_CONNECTED
→ CHAT_SELECTION
→ IMPORTING
→ FIRST_TIMELINE_READY
→ ACTIVE
```

Estados de erro devem permitir retomada sem reiniciar tudo:

```text
PAIRING_EXPIRED
CONNECTION_FAILED
PROVIDER_UNAVAILABLE
WEBHOOK_UNVERIFIED
CHAT_NOT_FOUND
IMPORT_PARTIAL
```

## 8. Identidade, consentimento e segurança

O primeiro “Oi” deve ser tratado como uma **identidade de canal**, não como prova suficiente de autorização sobre dados de outras conversas. O ZapTrail pode criar um onboarding pendente e um workspace provisório, mas somente a SourceConnection pareada e confirmada deve liberar ingestão.

O sistema deve aplicar as seguintes regras:

| Risco | Controle obrigatório |
|---|---|
| Alguém conversa com o agente sem ser dono do workspace | Vincular o workspace ao identificador verificado do canal e exigir pareamento da fonte |
| Usuário autoriza mais dados do que pretendia | Consentimento por finalidade e escopo; começar com uma conversa |
| Código de pareamento exposto em logs | Redação, expiração curta e uso único |
| Webhook falsificado | Assinatura, segredo, replay protection e idempotência |
| Mensagens induzem o agente a executar ações | Tratar conteúdo como dado não confiável; separar análise de comando |
| Agente altera ou exclui dados sem querer | Consultas read-only primeiro; mutações exigem confirmação explícita |
| Vazamento entre workspaces | RLS/ACL antes de busca, resumo ou geração de link |
| Provider desconecta ou perde sessão | Estado visível, retry limitado, reconexão controlada e opção de desconectar |
| Usuário quer interromper o acesso | Comandos `PAUSAR`, `DESCONECTAR` e `EXCLUIR DADOS`, com confirmação apropriada |

O agente deve sempre distinguir “foi encontrado na mensagem” de “foi inferido”. Uma tarefa, decisão, compromisso ou fato sem evidência suficiente deve aparecer como hipótese ou item a revisar. O onboarding não pode criar uma impressão de que o ZapTrail possui certeza absoluta sobre conteúdo ambíguo.

## 9. Fallbacks indispensáveis

O fluxo principal deve ser conversacional, mas precisa sobreviver a falhas de provider e limitações do dispositivo.

| Situação | Fallback recomendado |
|---|---|
| Provider não oferece pairing code | Gerar QR e enviar imagem; oferecer tela web temporária |
| Usuário está em um único celular e QR não é prático | Usar pairing code, se disponível; caso contrário, abrir tela web ou orientar segundo dispositivo |
| Código expirou | Gerar novo desafio sem criar outra SourceConnection |
| Webhook não chega | Consultar status com backoff curto e registrar alerta operacional |
| Provider não lista grupos adequadamente | Permitir seleção por identificador/nome e marcar limitação do provider |
| Conexão falhou | Exibir motivo genérico seguro, tentar reconexão limitada e oferecer outro provider |
| UAZAPI não passa no spike | Trocar para adapter Evolution/WAHA/WPPConnect sem alterar o domínio ZapTrail |
| Usuário ainda não quer conectar o WhatsApp | Rodar demonstração com MockProvider ou permitir importação controlada no futuro |
| Histórico excede limites do plano ou do provider | Mostrar limites e processar em lotes sob demanda |

A existência de fallback não deve transformar a conversa em um manual técnico. O agente deve apresentar uma alternativa por vez e guardar o estado para retomada.

## 10. MVP e ordem de implementação

A ordem correta não é começar conectando UAZAPI. O primeiro fluxo deve ser demonstrável sem custo e sem depender de uma sessão real.

| Incremento | Objetivo | Critério de conclusão |
|---|---|---|
| **MVP-0 — Mock conversacional** | Simular o primeiro “Oi”, consentimento, conexão e seleção de conversa | Usuário chega a uma timeline real com fixtures 1:1 e grupo |
| **MVP-1 — Contrato de provider** | Implementar `WhatsAppProvider`, estados, artefatos de pareamento e eventos normalizados | Mock e testes de contrato passam pelo mesmo domínio |
| **Spike UAZAPI** | Validar criação/conexão de instância, status, webhook, chats, grupos e recuperação de histórico | Checklist de sucesso/falha preenchido em ambiente controlado |
| **MVP-2 — Conexão real limitada** | Liberar uma SourceConnection real, uma conversa e janela de importação limitada | Pareamento, ingestão, timeline e desconexão funcionam de ponta a ponta |
| **MVP-3 — Agente read-only** | Consultar timeline, objetos, pessoas, empresas e projetos pelo WhatsApp | Respostas corretas, autorizadas e com evidência/deep link |
| **MVP-4 — Web responsiva** | Revisar timeline dual, filtros, evidências e objetos no notebook/celular | Usuário consegue alternar conversa original e timeline estruturada |

O spike deve validar, no mínimo, criação e reconexão da instância, pairing code ou QR, status, webhook autenticado, deduplicação, lista de chats, distinção entre 1:1 e grupo, histórico suficiente, desconexão, reconexão, logout, limite de mensagens, estabilidade e custo real. Se qualquer critério essencial falhar, o provider deve ser substituído atrás do adapter, sem reescrever o produto.

## 11. Critérios de aceite do primeiro fluxo

O onboarding conversacional será considerado pronto quando:

1. Um usuário puder iniciar enviando apenas “Oi” ao número do agente.
2. O ZapTrail identificar a `AgentConnection` e criar um onboarding pendente sem liberar dados indevidos.
3. O consentimento for claro, versionado, persistido e revogável.
4. O usuário puder escolher demonstração, mesmo sem provider real.
5. O usuário puder escolher o mesmo número ou outro número como SourceConnection.
6. O sistema gerar um desafio de pareamento, quando suportado, sem expor segredos internos.
7. O agente acompanhar e explicar os estados da conexão.
8. O sistema não confirmar conexão apenas com base na resposta textual “PRONTO”; a confirmação deverá vir do provider.
9. O usuário puder selecionar uma conversa individual ou grupo.
10. O sistema importar uma janela limitada, deduplicar mensagens e preservar evidências.
11. O usuário receber um resumo estruturado da primeira timeline dentro do WhatsApp.
12. O agente oferecer um link seguro para a visão profunda na aplicação web.
13. O usuário puder pausar, desconectar e retomar o onboarding.
14. Falhas de provider não corromperem o workspace nem criarem duplicatas.
15. O comportamento do MockProvider e do provider real for coberto pelos mesmos testes de contrato.

## 12. Conclusão estratégica

O primeiro “Oi” deve ser tratado como o **momento zero do ZapTrail**. Essa escolha reduz fricção, respeita o comportamento natural do usuário e materializa a proposta de que o produto vive no canal em que o trabalho acontece.

A experiência recomendada é, portanto, **100% conversacional na superfície e explicitamente assistida na etapa de pareamento**. O agente conduz tudo, mas não esconde a ação técnica que o usuário precisa autorizar. Essa honestidade é mais importante do que tentar vender uma promessa de conexão invisível.

O princípio de produto fica:

> **WhatsApp inicia, orienta e responde. A aplicação web explica, organiza, revisa e governa.**

Com esse desenho, o ZapTrail pode provar valor com custo zero usando MockProvider, validar o caminho real com um spike de UAZAPI e manter liberdade para trocar de provider. A complexidade fica encapsulada na integração; o domínio proprietário permanece concentrado no que diferencia o produto: evidência, semântica, objetos de gestão, timeline dual, confiança e ação.

## Referências

[1]: https://mintlify.wiki/EvolutionAPI/evolution-api/api/instance/connect "Evolution API — Connect Instance"

[2]: https://waha.devlike.pro/docs/how-to/sessions/ "WAHA — Sessions"

[3]: https://docs.uazapi.com/ "uazapiGO V2 — documentação pública da API"
