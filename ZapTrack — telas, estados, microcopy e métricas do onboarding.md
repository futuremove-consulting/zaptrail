# ZapTrack — telas, estados, microcopy e métricas do onboarding

## 1. Princípio de interface

O onboarding deve funcionar como um caminho guiado por tarefa real. A cada tela, o usuário deve saber:

```text
onde estou
por que isso importa
o que será acessado
qual é o próximo passo
o que acontece se eu não puder continuar
```

O fluxo deve ter progresso visível, mas não transformar o primeiro acesso em um tour longo.

## 2. Stepper recomendado

```text
1. Conectar
2. Preparar
3. Escolher conversa
4. Organizar
5. Ver timeline
```

A etapa atual deve aparecer no topo. Etapas futuras não precisam ser configuradas antecipadamente.

## 3. Tela: boas-vindas

### Título

> Veja o que realmente aconteceu nas suas conversas.

### Subtítulo

> Conecte uma fonte autorizada do WhatsApp, escolha uma conversa 1:1 ou grupo e transforme mensagens, decisões, pedidos, arquivos e pendências em uma timeline pesquisável.

### Ações

```text
[Conectar WhatsApp Business]
[Começar com mensagem ou arquivo encaminhado]
```

### Estado

`first_visit`.

## 4. Tela: conexão

### Título

> Conecte seu WhatsApp Business

### Blocos

```text
O que vamos organizar
✓ conversas disponíveis no escopo autorizado
✓ contatos/participantes disponibilizados
✓ arquivos que puderem ser processados

O que não faremos
× acessar conversas fora do escopo
× alterar mensagens no WhatsApp
× executar ações externas sem confirmação
```

### CTA

`Continuar para conexão segura`.

### Link secundário

`Entender permissões e privacidade`.

## 5. Tela: autorização em andamento

Mostrar o fluxo oficial em janela/modal. Fora da janela, manter:

> A conexão acontece em uma página oficial. Quando terminar, voltaremos para o ZapTrack automaticamente.

Estados:

```text
authorization_opened
authorization_returned
authorization_cancelled
authorization_failed
```

## 6. Tela: conexão concluída

### Sucesso

> WhatsApp conectado. Agora vamos preparar as conversas disponíveis para você escolher uma.

```text
Conta: nome/telefone mascarado
Fonte: WhatsApp Business
Escopo: status do escopo autorizado
Status: conectado
```

CTA: `Preparar conversas`.

### Falha

> Não conseguimos concluir a conexão. Nenhum dado foi alterado. Você pode tentar novamente ou começar encaminhando uma conversa ao agente.

## 7. Tela: preparação/sincronização

Mostrar progresso por etapas:

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

> Se estiver usando coexistência, mantenha o WhatsApp Business aberto para facilitar a sincronização.

A UI deve mostrar `atualizado há X minutos`, última contagem e estimativa somente se baseada em dados reais.

## 8. Tela: escolha de conversa

### Título

> Escolha onde começar

### Abas

```text
[Conversas 1:1] [Grupos]
```

### Busca

> Buscar por pessoa, empresa, grupo ou projeto

### Filtros rápidos

```text
Mais recentes
Com arquivos
Com pendências
Com decisões
Mais ativas
```

### Recomendação

> Recomendamos **Implantação Alfa** porque há decisões, arquivos e prazos recentes. Você pode escolher qualquer outra conversa.

### Cartões

Cada cartão deve mostrar tipo, nome, participantes principais, contraparte, projeto sugerido, última atividade e quantidade de mensagens disponíveis. Não mostrar “objetos encontrados” como confirmação; usar “possíveis itens para revisar”.

## 9. Tela: confirmação de conversa

### Título

> Organizar esta conversa?

### Resumo

```text
Tipo: Grupo
Nome: Implantação Alfa
Participantes: 8
Período: 01/08–26/08
Mensagens: 482
Arquivos: 36
```

### Contexto

```text
Empresa sugerida: Alfa Tecnologia
Projeto sugerido: Implantação Alfa
```

Ações:

```text
[Organizar conversa]
[Alterar contexto]
[Deixar para depois]
```

### Nota de confiança

> As associações sugeridas podem ser confirmadas ou corrigidas depois. Elas não alteram a conversa original.

## 10. Tela: organização em andamento

### Título

> Estamos organizando sua conversa

### Etapas

```text
✓ Mensagens preparadas
✓ Participantes identificados
● Intenções e ações sendo reconhecidas
○ Decisões e compromissos
○ Objetos e timeline
```

### Ação secundária

`Sair e continuar depois`.

Nunca exibir percentual de IA sem base. Se o processamento for parcial, liberar o que já estiver pronto.

## 11. Tela: preview de valor

### Título

> Encontramos os primeiros acontecimentos

### Resumo

```text
5 decisões ou aprovações
7 compromissos
4 solicitações
3 arquivos relevantes
2 pendências em aberto
1 possível atraso
```

Usar `possíveis` e `para revisar` quando necessário.

CTA: `Ver timeline estruturada`.

## 12. Tela: primeira timeline

### Cabeçalho

```text
Implantação Alfa
Grupo · 8 participantes
Alfa Tecnologia · Implantação Alfa
```

### Controles

```text
[Conversa] [Timeline] [Ambas]
Todos | Decisões | Ações | Pendências | Arquivos | Buscar
```

### Card inicial

```text
26/08 · 14:12 · Decisão proposta
A equipe aprovou iniciar a instalação em 01/09.
Evidência: 4 mensagens · confiança: revisar
[Confirmar] [Corrigir] [Mostrar na conversa]
```

## 13. Tela: primeiro retorno à evidência

Ao clicar em `Mostrar na conversa`, destacar:

```text
mensagem principal
2 mensagens anteriores de contexto
2 mensagens posteriores de contexto
marcador do objeto
botão “Voltar para timeline”
```

Mensagem contextual:

> Esta mensagem é a principal evidência da decisão proposta.

## 14. Tela: conclusão

> Sua primeira conversa foi organizada. Agora você pode acompanhar decisões, pendências, arquivos e próximos passos sem reler tudo.

Ações:

```text
[Explorar filtros]
[Ver pendências]
[Perguntar ao agente]
[Voltar ao Agora]
```

## 15. Estados de erro e recuperação

| Situação | Mensagem | Ação |
|---|---|---|
| Fonte não elegível | “Esta fonte não disponibiliza conversas para sincronização.” | Encaminhar/importar |
| Sem conversas | “Ainda não encontramos conversas disponíveis.” | Aguardar, revisar escopo, encaminhar |
| Sincronização lenta | “A preparação está demorando mais que o esperado.” | Continuar depois, tentar novamente |
| Sincronização parcial | “Parte das mensagens já está pronta.” | Ver parcial, aguardar restante |
| Arquivo não processável | “Este arquivo foi recebido, mas seu conteúdo não pôde ser lido.” | Abrir arquivo, substituir, ignorar |
| Baixa confiança | “Encontramos uma possível decisão, mas falta contexto.” | Ver evidência, corrigir |
| Permissão insuficiente | “Seu perfil não pode acessar esta conversa.” | Solicitar acesso, escolher outra |
| Erro temporário | “O serviço não respondeu agora.” | Tentar novamente, status |
| Código expirado | “Este código não é mais válido.” | Gerar novo código |
| Usuário abandona | “Você pode continuar depois; nada será perdido.” | Salvar estado |

## 16. Métricas de ativação

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
first_structured_item_opened
evidence_opened
show_in_conversation_used
activation_completed
```

### Definição de ativação

> Usuário conectou ou forneceu uma fonte autorizada, selecionou uma conversa 1:1 ou grupo, visualizou a timeline estruturada e abriu uma evidência na conversa original.

### Qualidade

```text
first_timeline_time
first_evidence_time
sync_completion_rate
conversation_selection_rate
timeline_ready_rate
evidence_open_rate
show_in_conversation_success_rate
suggestion_accept_rate
suggestion_correction_rate
onboarding_dropoff_by_step
```

## 17. Guardrails de UX

Não iniciar com um tour de funcionalidades. Não pedir que o usuário escolha todas as áreas, campos ou taxonomias. Não ocultar o escopo da conexão. Não mostrar progresso fictício. Não afirmar que a IA encontrou um fato quando encontrou apenas uma hipótese. Não bloquear a primeira timeline porque uma etapa secundária falhou. Não exigir a criação de empresa ou projeto para visualizar a conversa.

## 18. Critério de sucesso

O onboarding é bom quando o usuário, sem treinamento, consegue:

```text
entender o que será acessado
conectar ou escolher um fallback
escolher 1:1 ou grupo
ver o progresso
entender o que foi identificado
visualizar a timeline
voltar à mensagem de origem
```
