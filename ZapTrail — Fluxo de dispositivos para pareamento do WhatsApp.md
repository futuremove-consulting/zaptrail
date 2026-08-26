# ZapTrail — Fluxo de dispositivos para pareamento do WhatsApp

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Decisão:** o usuário inicia no WhatsApp; o pareamento deve preferir código no mesmo celular; QR Code e aplicação web funcionam como fallback.

## 1. Resposta direta

A partir do momento em que o usuário chega à autenticação da conta que será indexada, o fluxo recomendado é:

> **WhatsApp do usuário → consentimento → escolha da conta → código de pareamento no mesmo celular, quando disponível → confirmação no menu de dispositivos conectados → status confirmado pelo provider → seleção da primeira conversa.**

O **dispositivo principal** deve ser o celular em que está instalada a conta WhatsApp que será indexada. O usuário continua conversando com o agente no mesmo celular. O agente envia instruções e, quando suportado pelo provider, envia o código de pareamento para que o usuário o digite dentro do próprio WhatsApp.

O QR Code não deve ser o caminho principal para um usuário que tem apenas um celular, porque ele não consegue escanear com o mesmo aparelho a imagem que está sendo exibida nesse aparelho. QR Code deve ser usado quando houver **notebook, tablet ou segundo celular**, ou quando a tela web for a forma mais confiável de concluir a conexão.

## 2. Os dispositivos e suas responsabilidades

Para evitar ambiguidades, o produto deve modelar os dispositivos da seguinte forma:

| Elemento | Nome no desenho | Responsabilidade |
|---|---|---|
| Celular com a conta que será indexada | **Device A — celular-fonte** | Abrir o WhatsApp da conta autorizada, entrar em “Aparelhos/Dispositivos conectados” e confirmar o vínculo |
| Conversa com o agente ZapTrail | **Agent Channel** | Receber instruções, código, estados, confirmações, erros e resumo do resultado. Pode estar no próprio Device A |
| Notebook, tablet ou segundo celular | **Device B — tela auxiliar** | Exibir QR Code, página de conexão, status detalhado ou recuperação quando o Device A não puder fazer tudo sozinho |
| Infraestrutura do provider | **Provider Session** | Criar e manter a sessão, emitir QR/pairing code, receber a autenticação e informar status |
| Aplicação web ZapTrail | **Web Control Center** | Exibir a conexão, permissões, auditoria, QR fallback, estado e ações de desconectar/retomar |

Na experiência ideal, o usuário precisa apenas do **Device A**. O **Device B** não é requisito do onboarding; é um recurso de contingência e de melhor visualização.

## 3. Cenário principal: um único celular

### 3.1 Quando usar

Este é o fluxo preferencial para o público do ZapTrail: profissional liberal, dono ou gestor de pequena empresa que está na rua ou usando apenas o smartphone.

Ele deve ser usado quando o provider oferecer **pairing code** ou outra forma de vinculação que possa ser digitada no próprio celular. A documentação pública da Evolution API descreve QR Code e pairing code [1]. A documentação da WAHA também descreve autenticação por QR ou pairing code e estados de conexão que podem ser acompanhados [2].

### 3.2 Sequência de telas e mensagens

#### Passo 1 — confirmar a conta

O agente pergunta qual conta será conectada:

> Você quer organizar o WhatsApp deste número que está falando comigo?
>
> **Sim, este número**  
> **Não, outro número**  
> **Quero testar sem conectar**

Se o usuário escolher o próprio número, o sistema cria uma tentativa de `SourceConnection` em estado pendente. Ainda não há leitura de conversas.

#### Passo 2 — explicar o que acontecerá

> Vou preparar uma conexão segura para que o ZapTrail possa organizar suas conversas. No primeiro teste, vou importar somente **uma conversa ou grupo**, e não o histórico inteiro.
>
> Você continuará controlando o acesso pelo WhatsApp. Posso iniciar o pareamento?
>
> **Sim, iniciar**  
> **Quero entender melhor**  
> **Cancelar**

Essa confirmação é necessária antes de criar uma sessão real no provider.

#### Passo 3 — preparar o código

O backend cria a tentativa, solicita ao provider o método preferencial e inicia um temporizador. O agente responde:

> Estou preparando o pareamento. Não feche esta conversa. Isso deve levar alguns segundos.

O estado técnico é `provisioning` ou `awaiting_user_pairing`.

#### Passo 4 — usuário abre o menu do WhatsApp

O agente orienta o usuário a abrir o WhatsApp no **Device A**:

> No seu celular, abra o WhatsApp e procure:
>
> **Configurações → Aparelhos conectados → Conectar aparelho**.
>
> Se aparecer a opção **“Conectar com número de telefone”**, escolha essa opção. Os nomes podem variar conforme a versão do WhatsApp.

O ZapTrail não deve instruir o usuário a abrir menus de desenvolvedor, fornecer senha, encaminhar SMS ou compartilhar códigos de autenticação recebidos por outros canais.

#### Passo 5 — entregar o pairing code

Quando o provider devolver um código, o agente envia:

> Digite este código no campo exibido pelo WhatsApp:
>
> **ABCD-EFGH**
>
> O código é temporário e serve somente para esta tentativa. **Nunca envie para mim códigos recebidos por SMS, senha, PIN ou código de verificação.** Depois de concluir no WhatsApp, responda **PRONTO**.

A palavra “PRONTO” serve apenas para o agente consultar o status e orientar o usuário. Ela não é a prova de que a conexão foi concluída.

#### Passo 6 — confirmação verdadeira

O backend espera o evento do provider ou consulta o estado com backoff limitado. A conexão somente passa a `connected` quando o provider confirmar a sessão. A documentação do UAZAPI descreve estados como `disconnected`, `connecting`, `connected` e `hibernated` [3]; o adapter do ZapTrail deve normalizar esses estados para o domínio próprio.

Mensagem durante a espera:

> Recebi sua confirmação. Estou verificando diretamente com o provider se a conta foi conectada. Ainda não vou importar nada até essa confirmação chegar.

Mensagem de sucesso:

> **WhatsApp conectado.** Agora vou listar suas conversas e você escolherá somente uma para o primeiro teste.

Mensagem de falha:

> Não consegui confirmar a conexão. O código pode ter expirado ou o WhatsApp pode não ter concluído o vínculo. Posso gerar um novo código ou abrir uma tela alternativa de conexão.

### 3.3 Dispositivo usado em cada ação

| Ação | Device A — celular-fonte | Device B — tela auxiliar | Agent Channel | Backend/provider |
|---|---:|---:|---:|---:|
| Receber o primeiro “Oi” | Sim | Não | Sim | Recebe evento |
| Ler consentimento | Sim | Não | Sim | Persiste registro |
| Solicitar conexão | Sim | Não | Sim | Cria tentativa |
| Abrir “Aparelhos conectados” | **Sim** | Não | Orienta | Não participa diretamente |
| Digitar pairing code | **Sim** | Não | Envia o código | Valida sessão |
| Responder “PRONTO” | Sim | Não | Sim | Consulta status |
| Confirmar conexão | Não manualmente | Não | Informa | **Sim, pelo evento/status do provider** |
| Escolher conversa | Sim | Opcional | Sim | Lista chats |
| Abrir timeline profunda | Opcional | Recomendado | Envia deep link | Autoriza acesso web |

## 4. Cenário com notebook ou segundo dispositivo

### 4.1 Quando usar

Este fluxo deve ser oferecido automaticamente quando:

- o provider não oferecer pairing code confiável;
- o QR Code for o único método disponível;
- o usuário quiser visualizar detalhes da conexão em uma tela maior;
- o usuário estiver no escritório ou em casa;
- o pareamento pelo celular falhar;
- a conta-fonte estiver em outro telefone.

### 4.2 Fluxo com QR Code

O **Device B** exibe o QR Code. O **Device A** escaneia esse QR Code pelo WhatsApp.

Fluxo:

```text
Device A: usuário conversa com o agente e confirma conexão
        ↓
Backend: cria a sessão no provider
        ↓
Device B: usuário abre a aplicação web e vê o QR Code
        ↓
Device A: WhatsApp → Aparelhos conectados → Conectar aparelho
        ↓
Device A: escaneia o QR exibido no Device B
        ↓
Provider: confirma sessão
        ↓
Agent Channel: informa sucesso
```

Mensagem do agente:

> Para este tipo de conexão, o QR Code precisa aparecer em uma segunda tela. Abra o link abaixo no notebook ou em outro celular:
>
> **Abrir conexão do ZapTrail**
>
> No seu celular, abra **WhatsApp → Aparelhos conectados → Conectar aparelho** e escaneie o QR Code exibido nessa tela.
>
> Quando terminar, responda **PRONTO**. Eu confirmarei a conexão diretamente com o sistema.

A imagem do QR Code também pode ser enviada dentro da conversa do agente, mas isso deve ser considerado uma conveniência para quem possui outra tela. Não deve ser o caminho padrão para o usuário que está usando apenas um celular.

### 4.3 O que a aplicação web deve mostrar

A tela web de pareamento deve ser simples e temporária, não um dashboard completo. Ela deve mostrar:

| Bloco | Conteúdo |
|---|---|
| Identidade | “Conectando o WhatsApp de [nome/número mascarado]” |
| Escopo | “Primeiro teste: uma conversa ou grupo” |
| Método | QR Code ou instrução de código |
| Status | Aguardando ação, conectando, conectado ou falhou |
| Expiração | Contagem regressiva do QR/código |
| Segurança | Aviso para nunca compartilhar senha ou código de SMS |
| Próximo passo | “Voltar para o WhatsApp” ou “Escolher conversa” |
| Controle | Cancelar tentativa |

A tela não deve permitir que o usuário veja tokens, headers, URL interna do provider ou credenciais de instância.

## 5. Cenário em que a conta-fonte é outro número

Se o usuário conversa com o agente a partir de um número e deseja indexar outro, o ZapTrail deve tornar essa diferença explícita:

> Você está falando comigo pelo número **final 1234**, mas escolheu conectar outro WhatsApp. O agente continuará neste chat; o pareamento deverá ser confirmado no celular que possui a conta que você quer organizar.

### 5.1 Se os dois números estão no mesmo celular

O usuário alterna para o perfil/conta WhatsApp da fonte, abre **Aparelhos conectados**, insere o pairing code ou escaneia o QR exibido no Device B. Depois retorna à conversa com o agente e responde “PRONTO”.

### 5.2 Se a fonte está em outro celular

O usuário mantém a conversa com o agente no Device A e realiza a ação no Device B, que é o celular da conta-fonte. Para reduzir cópia manual, o ZapTrail deve exibir o pairing code tanto na conversa quanto na aplicação web; ainda assim, o código deve ser de uso único e expirar rapidamente.

Quando houver QR Code, a relação fica mais natural: o QR é exibido no notebook ou na aplicação web e o celular que contém a conta-fonte faz o escaneamento.

### 5.3 O que o agente não deve fazer

O agente não deve pedir que o usuário envie:

- código de verificação recebido por SMS;
- PIN de duas etapas;
- senha do WhatsApp;
- token administrativo do provider;
- foto de documento para concluir a conexão;
- foto do QR Code se a plataforma conseguir receber o QR diretamente do provider;
- conteúdo de conversas como prova de propriedade.

A propriedade da conta deve ser comprovada pelo mecanismo de pareamento, não por informações secretas enviadas ao agente.

## 6. Ordem de preferência dos métodos

A ordem recomendada para o adapter do ZapTrail é:

| Prioridade | Método | Device necessário | Uso recomendado |
|---:|---|---|---|
| 1 | Pairing code | Apenas Device A | Usuário móvel com um único celular |
| 2 | QR na aplicação web | Device A + Device B | Usuário em casa/escritório ou provider sem código |
| 3 | QR enviado pelo agente | Device A + segunda tela | Fallback rápido quando o provider entrega imagem diretamente |
| 4 | Página externa do provider | Device A + browser | Último recurso operacional, com aviso de domínio |
| 5 | Suporte/manual | Device A ou B | Falha persistente, conta incompatível ou provider indisponível |

A página externa do provider não deve ser apresentada como se fosse uma tela nativa do ZapTrail. Se for necessária, o agente deve informar claramente que o usuário está sendo encaminhado para uma etapa de conexão do fornecedor.

## 7. Máquina de estados e comportamento do agente

O fluxo deve ser controlado por uma máquina de estados, e não pela interpretação livre do LLM:

```text
SOURCE_AUTH_NOT_STARTED
→ CONSENT_CONFIRMED
→ SOURCE_SELECTED
→ SESSION_PROVISIONING
→ PAIRING_METHOD_SELECTED
→ AWAITING_USER_ACTION
→ PROVIDER_VERIFYING
→ SOURCE_CONNECTED
→ CHAT_SELECTION
```

Estados de exceção:

```text
PAIRING_EXPIRED
PAIRING_REJECTED
PROVIDER_UNAVAILABLE
WEBHOOK_TIMEOUT
SOURCE_DISCONNECTED
MAX_RETRIES_REACHED
CANCELLED_BY_USER
```

O LLM pode redigir a mensagem, mas o sistema deve decidir se é permitido enviar código, criar sessão, considerar conectado ou iniciar importação. Esse controle reduz o risco de o agente interpretar “acho que deu certo” como uma confirmação técnica.

## 8. Retentativas e expiração

A tentativa deve ser resumível. Se o usuário abandonar o fluxo e voltar algumas horas depois, o agente deve informar o estado atual:

> Você tem uma tentativa de conexão pendente, mas o código expirou. Quer gerar um novo código?

Um novo código deve reutilizar a tentativa lógica quando possível, evitando múltiplas instâncias abandonadas. Se o provider exigir uma nova sessão, o sistema deve marcar a anterior como expirada e revogar seus artefatos.

O comportamento recomendado é:

| Evento | Ação |
|---|---|
| Código não usado antes da expiração | Expirar automaticamente |
| Usuário pede novo código | Invalidar o anterior e emitir apenas um novo |
| Provider confirma conexão | Invalidar qualquer código restante |
| Usuário cancela | Encerrar tentativa e não importar dados |
| Falha transitória | Fazer poucas tentativas com intervalo crescente |
| Falha persistente | Oferecer QR/web ou outro provider |
| Conexão confirmada mas importação falha | Manter a SourceConnection e permitir retomar somente a importação |

## 9. Experiência ideal para os dois momentos de uso

O ZapTrail deve adaptar o fluxo ao contexto, sem criar dois produtos diferentes.

| Contexto | Método preferido | Papel do WhatsApp | Papel da web |
|---|---|---|---|
| Rua, mobilidade, baixa atenção | Pairing code | Conduzir tudo e confirmar cada passo | Apenas fallback se necessário |
| Casa/escritório, tela maior | QR na web | Iniciar, autorizar e receber status | Exibir QR, permissões e diagnóstico |
| Notebook + celular | QR na web | Escanear e responder ao agente | Controlar o processo |
| Conta em outro aparelho | QR ou pairing code | Orientar pelo canal do agente | Exibir o desafio também |
| Provider instável | Fallback e retomada | Explicar sem jargão | Mostrar diagnóstico operacional |

O usuário não deve ser obrigado a abrir a aplicação web para descobrir o produto. Ele deve conseguir começar e entender o valor no WhatsApp. A web entra quando o pareamento exigir uma segunda tela ou quando o usuário quiser revisar a conexão em profundidade.

## 10. Recomendação final

O fluxo definitivo do ZapTrail deve ser:

1. O usuário envia “Oi” para o agente.
2. O agente identifica a `AgentConnection`, cria um onboarding pendente e explica o valor.
3. O usuário confirma que quer conectar o próprio número ou escolhe outro.
4. O agente explica o escopo e obtém consentimento versionado.
5. O backend cria a `SourceConnection` e solicita primeiro o **pairing code**.
6. O agente orienta o usuário no **Device A**, em “Aparelhos conectados”.
7. O usuário digita o código dentro do WhatsApp.
8. O agente recebe “PRONTO”, mas consulta o provider antes de confirmar.
9. Quando o provider retornar `connected`, o agente anuncia o sucesso.
10. Se pairing code não estiver disponível, o agente abre o fallback de QR no **Device B**, preferencialmente pela aplicação web.
11. Depois da conexão, o usuário escolhe uma conversa individual ou grupo.
12. O ZapTrail importa uma janela limitada e apresenta a primeira timeline.

A decisão de produto é, portanto:

> **Um único celular deve ser suficiente para o caminho principal. Notebook ou segundo dispositivo entram somente quando o método técnico exigir QR ou quando melhorarem a compreensão.**

Essa decisão preserva o princípio mobile-first sem obrigar o usuário a instalar um app nativo. O WhatsApp continua sendo o cockpit do onboarding; a aplicação web funciona como centro de comando, fallback técnico e ambiente de análise.

## Referências

[1]: https://mintlify.wiki/EvolutionAPI/evolution-api/api/instance/connect "Evolution API — Connect Instance"

[2]: https://waha.devlike.pro/docs/how-to/sessions/ "WAHA — Sessions"

[3]: https://docs.uazapi.com/ "uazapiGO V2 — documentação pública da API"
