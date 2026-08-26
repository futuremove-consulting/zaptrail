# ZapTrack — onboarding: conexão do WhatsApp e seleção da primeira conversa

## 1. Objetivo do fluxo

O primeiro acesso deve levar o usuário ao primeiro resultado, não a uma configuração completa. O resultado-alvo é:

```text
WhatsApp conectado
  → conversa 1:1 ou grupo selecionada
  → conversa processada
  → timeline estruturada visualizada
  → evidência aberta
  → usuário entende o valor do ZapTrack
```

## 2. Regra de viabilidade

O fluxo deve distinguir três caminhos:

| Caminho | Quando usar | Resultado |
|---|---|---|
| Conectar WhatsApp Business | Negócio elegível para Cloud API/coexistência | Lista de conversas disponíveis após sincronização |
| Conversa do agente | Usuário conversa com o número do agente | Conteúdo enviado ao agente pode ser organizado |
| Encaminhar/importar conversa | Fonte não elegível ou usuário quer testar rápido | Mensagens/arquivo/áudio importados tornam-se fonte autorizada |

O ZapTrack não deve declarar que lê todo o WhatsApp pessoal nem todos os grupos existentes. A interface deve explicar o escopo efetivamente disponível.

## 3. Primeiro acesso: visão geral

```text
Boas-vindas
  → escolha do objetivo
  → conectar WhatsApp Business
  → consentimento e escopo
  → Embedded Signup
  → validação do backend
  → sincronização
  → selecionar 1:1 ou grupo
  → organizar primeira conversa
  → revisar interpretação
  → ver timeline
  → abrir evidência
```

## 4. Tela 0 — boas-vindas orientada ao resultado

### Título

> Organize sua primeira conversa e veja o que realmente aconteceu.

### Texto

> Conecte uma fonte autorizada do WhatsApp, escolha uma conversa individual ou grupo e o ZapTrack vai separar mensagens, decisões, pedidos, compromissos, arquivos e pendências em uma timeline pesquisável.

### CTA principal

`Conectar WhatsApp Business`

### CTA alternativo

`Começar com uma conversa encaminhada`

### Ajuda

> Você continua usando o WhatsApp normalmente. O ZapTrack só organiza as fontes e conversas às quais você conceder acesso.

Não exibir tour de todas as áreas nesta etapa.

## 5. Tela 1 — escolha do caminho

```text
Como você quer começar?

[Conectar meu WhatsApp Business]
Sincronize uma conta empresarial elegível e selecione uma conversa.

[Enviar uma conversa para o agente]
Encaminhe mensagens, áudio ou arquivos para organizar agora.

[Importar um arquivo de conversa]
Use um arquivo de exportação ou conteúdo autorizado.
```

A opção recomendada depende do contexto. Para um usuário sem conexão configurada, mostrar WhatsApp Business como principal e fallback de encaminhamento sem esconder.

## 6. Tela 2 — escopo e consentimento

Antes de abrir a autorização, mostrar:

```text
Você está conectando
WhatsApp Business de [nome/telefone se disponível]

O ZapTrack poderá:
✓ receber mensagens e eventos dentro do escopo autorizado
✓ organizar conversas e grupos disponibilizados pela fonte
✓ identificar pessoas, empresas, projetos e objetos de gestão
✓ indexar arquivos e mídias que puder processar

O ZapTrack não poderá:
× ler conversas fora do escopo autorizado
× garantir acesso a grupos pessoais ou grupos não disponibilizados pela fonte
× executar ações externas sem sua permissão
```

Mostrar finalidade, retenção, equipe com acesso, como revogar e link para privacidade. A ação deve ser `Continuar para autorização`, não um checkbox genérico escondido.

## 7. Tela 3 — Embedded Signup

Abrir o fluxo oficial da Meta em janela ou modal compatível com desktop/mobile. O fluxo pode envolver autenticação, termos, portfólio empresarial, WABA, telefone e nome de exibição. O ZapTrack deve evitar duplicar campos que a autorização oficial já coleta.

O frontend recebe o resultado de inicialização, mas o estado só vira `connected` depois de validação server-to-server, troca segura de token, registro do número e assinatura de webhooks.

## 8. Tela 4 — conexão confirmada

### Estado de sucesso

> WhatsApp conectado. Agora estamos preparando suas conversas para você escolher a primeira.

Mostrar:

```text
Conta: [nome/telefone mascarado]
Fonte: WhatsApp Business
Escopo: [resumo]
Status: conectado
Próximo passo: sincronizar histórico e contatos
```

CTA: `Acompanhar sincronização`.

### Estado parcial

> A conta foi conectada, mas ainda estamos validando o histórico disponível. Você pode aguardar ou começar encaminhando uma conversa ao agente.

## 9. Tela 5 — sincronização

A sincronização deve apresentar progresso real e instruções:

```text
Conectando       concluído
Contatos         concluído
Conversas        em andamento
Mensagens        42%
Arquivos         aguardando
Indexação        aguardando
```

Mensagem operacional:

> Mantenha o WhatsApp Business aberto enquanto sincronizamos. Esse processo pode levar algum tempo dependendo do volume disponível.

Não usar um spinner indefinido. Mostrar contagem, última atualização, etapa atual e alternativa de continuar depois.

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

Se a sincronização não for iniciada dentro do prazo operacional da fonte, explicar o que ocorreu e orientar novo fluxo, sem culpar o usuário.

## 10. Tela 6 — escolher a primeira conversa

Quando houver índice mínimo, mostrar:

```text
Escolha uma conversa para organizar

[Conversas 1:1] [Grupos]

Buscar por nome, telefone, empresa ou projeto
Filtros: recentes · com arquivos · com pendências · mais mensagens
```

### Cartão de conversa 1:1

```text
[avatar] Ana Souza
Cliente · Alfa Tecnologia
Última atividade: hoje, 14:32
Mensagens disponíveis: 186
Objetos potenciais: 12
Projetos relacionados: Implantação Alfa
[Selecionar]
```

### Cartão de grupo

```text
[ícone grupo] Implantação Alfa
Grupo · 8 participantes
Última atividade: ontem, 18:05
Mensagens disponíveis: 482
Objetos potenciais: 27
Projetos relacionados: 2 sugeridos
[Selecionar]
```

Não mostrar “objetos potenciais” como fatos confirmados. Usar linguagem de sugestão e explicar que a análise será revisada.

## 11. Seleção inteligente

O sistema pode recomendar uma conversa com base em:

```text
atividade recente
quantidade suficiente de mensagens
presença de decisões/prazos/arquivos
relação com empresa/projeto
qualidade de processamento
```

Mensagem:

> Recomendamos começar por **Implantação Alfa** porque há decisões, prazos e arquivos recentes. Você pode escolher outra conversa.

A recomendação nunca deve remover a escolha manual.

## 12. Fonte sem conversas disponíveis

Mostrar:

> Ainda não encontramos conversas disponíveis nesta fonte. Você pode manter a sincronização em andamento, verificar o escopo autorizado ou começar encaminhando uma mensagem ao agente.

CTAs:

```text
Ver status da sincronização
Revisar escopo
Começar com encaminhamento
Tentar novamente
```

## 13. Fallback — encaminhar para o agente

```text
Aplicação mostra instrução
  → usuário abre WhatsApp
  → encaminha uma ou mais mensagens para o número do agente
  → agente confirma recebimento
  → aplicação cria uma conversa importada/caixa de teste
  → usuário seleciona contexto
  → processamento
  → timeline
```

Mensagem do agente:

> Recebi sua conversa. Quer organizar como **1:1**, **grupo** ou apenas analisar estas mensagens como um recorte?

Esse caminho permite demonstrar o valor sem esperar uma sincronização completa.

## 14. Fallback — upload/importação

```text
Escolher arquivo
  → mostrar formato/tamanho/privacidade
  → upload
  → validar
  → importar mensagens
  → identificar conversa/grupo
  → revisar participantes
  → escolher contexto
  → processar
```

O usuário deve confirmar que possui autorização para importar o conteúdo. O arquivo original permanece como fonte e evidência.

## 15. Seleção sem contexto formal

Depois de escolher a conversa, não obrigar a criar empresa ou projeto. Mostrar:

```text
Como quer organizar este contexto?

[Deixar sem organizar agora]
[Associar a uma empresa/pessoa]
[Associar a um projeto]
[Criar Espaço do cliente]
```

Recomendação:

> Parece haver uma relação com **Alfa Tecnologia**. Quer confirmar ou deixar para depois?

A primeira timeline deve ser alcançada mesmo que o usuário ignore a organização contextual.

## 16. Confirmação antes de processar

Mostrar resumo:

```text
Você escolheu
Tipo: Grupo
Nome: Implantação Alfa
Período: últimos 180 dias disponíveis
Mensagens: 482
Mídias/arquivos: 36

Vamos identificar decisões, compromissos, pedidos, arquivos,
pendências e outros acontecimentos. Nada será alterado no WhatsApp.
```

CTA: `Organizar esta conversa`.

## 17. O que acontece durante a organização

```text
Lendo estrutura da conversa
  → agrupando mensagens
  → reconhecendo participantes
  → extraindo arquivos/mídia
  → identificando acontecimentos
  → propondo objetos
  → montando timeline
```

Mostrar progresso por etapas, não precisão fictícia. Permitir sair e retornar; o processamento continua em background.

## 18. Resultado mínimo para liberar a timeline

Liberar a timeline quando houver:

```text
mensagens persistidas
timestamps válidos
ordenação básica
pelo menos um item estruturado ou estado “nenhum item identificado”
link para evidência
```

Não esperar que todos os arquivos, embeddings e objetos estejam prontos para mostrar a primeira versão.

## 19. Permissões durante a seleção

A lista de conversas deve ser filtrada no servidor por workspace, fonte, escopo e permissão. Não carregar todas as conversas no navegador para filtrar depois.

Se uma conversa possui partes sem acesso, mostrar escopo parcial:

> Esta visão contém apenas mensagens disponibilizadas pela fonte e permitidas para você.

## 20. Métricas do onboarding

```text
onboarding_started
connection_path_selected
consent_viewed
embedded_signup_started
embedded_signup_completed
source_connected
sync_started
sync_completed
conversation_picker_opened
conversation_type_selected
conversation_selected
first_processing_started
first_timeline_ready
first_evidence_opened
first_object_confirmed
first_show_in_conversation_used
```

O evento de ativação recomendado é:

> **Usuário seleciona uma conversa 1:1 ou grupo, visualiza a timeline estruturada e abre pelo menos uma evidência na conversa original.**

## 21. Regra de ouro

O onboarding não termina quando o usuário conecta o WhatsApp. Ele termina quando o usuário entende o que o ZapTrack fez com uma conversa real e consegue verificar a origem.
