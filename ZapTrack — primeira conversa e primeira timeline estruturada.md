# ZapTrack — primeira conversa e primeira timeline estruturada

## 1. Objetivo do momento

O primeiro contato deve provar a transformação central do produto sem exigir que o usuário configure uma taxonomia completa.

```text
conversa real
  → processamento compreensível
  → preview do que foi encontrado
  → confirmação/correção opcional
  → timeline estruturada
  → evidência na conversa original
```

## 2. Tela de confirmação da seleção

### Cabeçalho

> Vamos organizar esta conversa.

### Resumo

```text
Tipo: Grupo
Nome: Implantação Alfa
Participantes: 8
Período: 01/08–26/08
Mensagens disponíveis: 482
Arquivos: 36
```

### Escopo

> O ZapTrack vai identificar acontecimentos, intenções, ações, decisões, compromissos, objetos, arquivos e pendências. Nada será alterado no WhatsApp.

### Contexto sugerido

```text
Empresa: Alfa Tecnologia · confirmar
Projeto: Implantação Alfa · sugerido
Área: Operações · sugerido
```

CTAs:

```text
[Organizar conversa]
[Alterar contexto]
[Deixar sem organizar agora]
```

O usuário deve alcançar a timeline mesmo se deixar empresa/projeto para depois.

## 3. Processamento progressivo

```text
1. Preparando mensagens
2. Identificando participantes
3. Reconhecendo arquivos e mídias
4. Encontrando intenções e ações
5. Estruturando decisões e compromissos
6. Montando objetos e timeline
```

Mostrar progresso real por etapa e permitir que o usuário saia. O processamento continua em background e a aplicação avisa quando a primeira versão estiver disponível.

## 4. Resultado mínimo

A primeira timeline pode ser exibida quando houver:

```text
mensagens persistidas
timestamps ordenáveis
pelo menos um evento estruturado ou uma mensagem sem classificação
evidência navegável
```

A timeline deve informar se está parcial:

> Esta é a primeira versão. 34 mensagens ainda estão sendo processadas.

## 5. Preview antes da timeline

Antes de abrir a experiência completa, mostrar uma síntese de valor:

```text
Encontramos nesta conversa

5 decisões ou aprovações
7 compromissos
4 pedidos/solicitações
3 arquivos relevantes
2 pendências em aberto
1 possível atraso
```

Usar “encontramos” ou “possíveis”, nunca afirmar que tudo está confirmado. Clicar em uma categoria abre a timeline já filtrada.

## 6. Primeira timeline

### Cabeçalho

```text
Implantação Alfa
Grupo · 8 participantes
Alfa Tecnologia · Projeto Implantação Alfa

[Conversa] [Timeline] [Ambas]
```

### Barra de filtros inicial

```text
Todos | Decisões | Ações | Pendências | Arquivos | Pessoas | Buscar
```

### Itens de exemplo

```text
26/08 · 18:05 · Compromisso identificado
João informou que enviará a lista de materiais até sexta.
Projeto: Implantação Alfa · Status: pendente
Evidência: 1 mensagem · confiança alta
[Ver objeto] [Mostrar na conversa]

26/08 · 16:40 · Arquivo recebido
proposta-fornecedor.pdf
Relacionados: Alfa Tecnologia · compra
[Abrir arquivo] [Mostrar na conversa]

26/08 · 14:12 · Decisão proposta
A equipe aprovou iniciar a instalação em 01/09.
Evidência: 4 mensagens · revisar
[Confirmar] [Corrigir] [Mostrar na conversa]
```

## 7. Aha moment

O onboarding deve conduzir automaticamente a três microações:

```text
1. ver o resumo de acontecimentos;
2. abrir um item estruturado;
3. clicar em Mostrar na conversa.
```

Depois disso, oferecer:

```text
[Explorar todos os filtros]
[Confirmar pendências]
[Organizar por projeto]
[Perguntar ao agente]
```

## 8. Revisão leve da primeira conversa

Não abrir uma fila de dezenas de correções. Mostrar no máximo 3 sugestões que mudam significativamente a experiência:

```text
Esta mensagem parece uma decisão.
Este grupo parece relacionado à Alfa Tecnologia.
Este compromisso tem prazo até sexta.
```

Para cada sugestão:

```text
[Confirmar]
[Corrigir]
[Ignorar]
```

O usuário pode continuar sem revisar tudo.

## 9. Alternância sincronizada

### Timeline → conversa

```text
clicar item
  → Mostrar na conversa
  → abrir mensagem principal
  → mostrar contexto antes/depois
  → destacar trecho
  → voltar para timeline filtrada
```

### Conversa → timeline

```text
clicar marcador [decisão]/[compromisso]/[arquivo]
  → abrir detalhe do evento/objeto
  → exibir status e evidência
  → permitir confirmar/corrigir/agir
```

## 10. Organização contextual após a primeira visualização

Depois do aha moment, sugerir contexto:

> Quer organizar esta conversa em um espaço para **Alfa Tecnologia**? Você poderá acompanhar pendências, documentos e decisões em um só lugar.

Opções:

```text
[Associar à empresa Alfa]
[Criar Espaço do cliente]
[Associar a projeto existente]
[Deixar para depois]
```

Essa etapa não pode bloquear a visualização da timeline.

## 11. Pergunta inicial do agente

Ao concluir a timeline, oferecer um exemplo clicável:

```text
Pergunte ao agente:
“Quais pendências deste grupo vencem esta semana?”
```

A pergunta deve abrir o agente com contexto `conversation_id`, sem o usuário precisar copiar o nome da conversa.

## 12. Resumo de conclusão

Ao final do fluxo:

> Sua primeira conversa foi organizada. Encontramos **5 decisões, 7 compromissos e 2 pendências**. A timeline continua sendo atualizada conforme novas mensagens chegarem.

CTA:

```text
[Explorar conversa]
[Ver pendências]
[Perguntar ao agente]
[Voltar ao Agora]
```

## 13. Falhas e recuperação

### Processamento incompleto

> A conversa foi carregada, mas alguns itens ainda estão sendo analisados. Você já pode navegar pelas mensagens e ver a timeline parcial.

### Sem eventos identificados

> Não encontramos ações ou decisões claras ainda. A conversa original está disponível e você pode criar um registro manual.

### Baixa confiança

> Encontramos possíveis compromissos, mas o contexto não foi suficiente para confirmar. Revise antes de transformar em objeto.

### Fonte indisponível

> A fonte deixou de responder. Seus dados já processados continuam disponíveis; novas mensagens serão atualizadas quando a conexão voltar.

### Falha de permissão

> Esta conversa não está disponível para seu perfil. Peça acesso ao administrador ou escolha outra conversa.

## 14. Instrumentação

Eventos:

```text
first_conversation_selection_started
first_conversation_selected
first_conversation_type_selected
first_processing_started
first_preview_seen
first_timeline_ready
first_timeline_filter_used
first_structured_item_opened
first_evidence_opened
first_show_in_conversation_used
first_suggestion_confirmed
first_suggestion_corrected
first_agent_question_started
first_activation_completed
```

## 15. Critério de ativação

O usuário está ativado quando:

```text
1. conectou/forneceu uma fonte autorizada;
2. selecionou uma conversa 1:1 ou grupo;
3. visualizou uma timeline estruturada;
4. abriu uma evidência na conversa original.
```

Confirmar uma sugestão ou criar uma tarefa é um segundo marco, não requisito para o primeiro valor.
