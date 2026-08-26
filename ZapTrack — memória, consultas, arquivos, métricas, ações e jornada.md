# ZapTrack — memória, consultas, arquivos, métricas, ações e jornada

## 1. Memórias separadas

O agente precisa de três camadas de memória, com finalidades e retenções diferentes:

| Memória | O que contém | Papel |
|---|---|---|
| Conversacional | Perguntas, respostas, confirmações e referências recentes | Permitir continuidade sem confundir conversa com dado oficial |
| Operacional | Objetos, status, prazos, owners, decisões, ações e resultados | Fonte principal para consultas e comandos |
| Semântica | Entidades, relações, embeddings, análises e evidências versionadas | Recuperar contexto e responder perguntas abertas |

A conversa do agente não pode ser a fonte de verdade. “Conclua aquele item” deve ser resolvido contra o estado atual do objeto, o workspace e as permissões. Se houver mais de um candidato, o agente pede desambiguação.

## 2. Roteamento de intenção

Cada mensagem recebida pelo agente deve passar por um roteador simples:

1. Identificar se é consulta, comando, confirmação, correção, navegação, ajuda ou conversa livre.
2. Resolver workspace, identidade, escopo, período e timezone.
3. Consultar primeiro objetos e métricas estruturadas.
4. Buscar evidências de mensagens, arquivos e análises quando necessário.
5. Compor resposta com frescor, escopo, evidência e próximo passo.
6. Se for comando, passar por policy gate antes de executar.

Não começar com um agente que decide sozinho quais bancos ou APIs chamar. Começar com um roteador determinístico + ferramentas tipadas; permitir planejamento multi-step somente quando as consultas reais exigirem.

## 3. Consultas que precisam funcionar cedo

| Pergunta do usuário | Fonte primária |
|---|---|
| “Quais pendências vencem hoje?” | `management_objects` |
| “O que prometi para a Alfa?” | Objetos + evidências por empresa |
| “Quais oportunidades estão sem retorno?” | Oportunidades + mensagens recentes |
| “Qual foi a decisão sobre o fornecedor?” | Decisões + busca semântica |
| “Mostre as reclamações da última semana” | Alertas/ocorrências + evidências |
| “Quantas propostas foram enviadas este mês?” | Métrica definida + objetos |
| “Resuma a conversa com João” | Conversa + análises + evidências |
| “Encontre o áudio sobre preço” | Busca de mensagens/anexos/transcrição |
| “Crie tarefa para amanhã” | Comando de objeto |
| “Marque a tarefa como concluída” | Comando de objeto + autorização |

A resposta deve mostrar a janela temporal e a definição da métrica. “Este mês” usa timezone do workspace. “Oportunidade” deve ter definição operacional explícita, não apenas uma classificação opaca da IA.

## 4. Arquivos e mídia

O agente pode receber ou consultar áudio, imagem, PDF, documento e link quando o arquivo estiver em uma fonte autorizada ou tiver sido enviado/encaminhado ao próprio número do agente.

O pipeline é:

```text
mídia recebida
  → checksum e storage
  → tipo e tamanho
  → transcrição/OCR quando permitido
  → indexação do texto e metadados
  → vínculo com conversa/mensagem/objeto
  → resumo ou resposta com origem
```

No WhatsApp, a resposta deve ser compacta. Para arquivo pequeno, o agente pode devolver resumo ou mídia. Para arquivos grandes, múltiplos resultados ou auditoria completa, deve enviar link seguro para a aplicação externa.

O agente nunca deve fingir que acessou o arquivo se não houver texto, OCR, transcrição ou permissão para abrir o conteúdo. Deve informar “não consegui interpretar este arquivo” e oferecer a abertura na aplicação.

## 5. Métricas pelo WhatsApp

Métricas precisam ser objetos definidos, não respostas calculadas improvisadamente pelo LLM. Cada métrica possui:

```text
metric_id
name
definition
formula
source_objects
filters
period
timezone
freshness
owner
version
```

O agente consulta a métrica por ferramenta e apenas redige o resultado. O dashboard externo permite drill-down para objetos e evidências. O agente deve responder “12 oportunidades” apenas quando souber o que conta como oportunidade, qual período foi usado e quando os dados foram atualizados.

## 6. Ações e confirmação

Ações de baixo risco podem ser executadas com defaults do workspace. Ações externas, financeiras, reputacionais, irreversíveis ou que enviem mensagem para terceiros precisam de confirmação explícita.

Formato recomendado:

> Encontrei 3 pendências sem responsável. Posso criar as tarefas internas com prazo para amanhã e atribuir ao gestor da conta? Responda **CRIAR TAREFAS** ou diga quais itens deseja revisar.

Para ações sensíveis:

> Você está autorizando o ZapTrack a atualizar o CRM com a oportunidade Alfa, valor R$ 12.000, etapa Proposta e responsável Gus. Responda **CONFIRMAR ALFA** ou revise na aplicação.

A confirmação deve estar vinculada a um `command_id`, ter escopo e expirar. O backend usa idempotency key para não executar duas vezes se o webhook for repetido.

## 7. Proatividade

O agente pode iniciar mensagens como digest diário, alerta de prazo ou aviso de falha, mas somente quando o usuário ativar essa preferência, houver finalidade clara e a comunicação estiver dentro das regras aplicáveis ao canal. O padrão inicial deve ser digest agrupado, não uma sequência de notificações.

A aplicação externa configura horário, tipos de alerta, fontes, destinatários e silêncio. No WhatsApp, o usuário pode pausar com `PAUSAR ALERTAS` e reativar com `ATIVAR ALERTAS`.

## 8. Jornada recomendada

### Primeiro dia

O usuário cria o workspace na aplicação, escolhe fontes, pareia o telefone do agente, define seu papel e vê uma conversa demonstrativa. O agente confirma o escopo: “Posso consultar os dados do workspace X; não tenho acesso a outros workspaces”.

### Primeira semana

O agente entrega consultas simples e objetos de baixo risco. A aplicação mostra evidência, confiança e correções. O sistema aprende preferências de horário, owner e nomenclatura, mas não altera políticas críticas sem revisão.

### Uso recorrente

O usuário consulta o agente no WhatsApp durante o dia e abre a aplicação para revisar o feed, explorar conversas, aprovar ações, analisar métricas, gerenciar arquivos e revisar auditoria.

### Situação ambígua

O agente não improvisa. Ele oferece opções:

> Encontrei duas conversas com a Alfa: proposta de agosto e renovação de setembro. Você quer consultar qual delas?

## 9. Comandos simples

Comandos opinativos iniciais:

```text
AJUDA
VINCULAR <código>
MINHAS PENDÊNCIAS
VENCENDO HOJE
OPORTUNIDADES SEM RETORNO
DECISÕES DA SEMANA
RESUMIR <empresa/conversa>
CRIAR TAREFA <descrição>
CONCLUIR <id>
PAUSAR ALERTAS
ABRIR NA APLICAÇÃO
```

A linguagem natural continua sendo a principal interface, mas comandos previsíveis tornam o sistema confiável para confirmações e situações de baixa conectividade.

## 10. Papel da aplicação externa

A aplicação externa continua essencial para:

- configurar fontes, escopos, permissões, retenção e alertas;
- revisar baixa confiança e objetos em massa;
- explorar a conversa completa e a evidência;
- administrar arquivos e métricas;
- aprovar ações externas;
- consultar auditoria e exportar dados;
- criar regras avançadas somente quando o padrão estiver validado.

A dupla interface não é duplicação. É **progressive disclosure**: o WhatsApp mostra a resposta e o próximo passo; a aplicação mostra a complexidade quando ela é necessária.

## 11. Regra de experiência

> **Perguntar no WhatsApp deve ser tão fácil quanto perguntar a um assistente; confiar na resposta deve ser tão rigoroso quanto auditar um sistema; aprofundar deve ser possível na aplicação sem perder o contexto.**
