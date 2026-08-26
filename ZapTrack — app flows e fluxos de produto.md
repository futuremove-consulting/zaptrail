# ZapTrack — app flows e fluxos de produto

## 1. Convenções

Os fluxos seguem a mesma gramática:

```text
entrada → contexto → interpretação → validação → decisão → ação → estado → evidência
```

`Confirmado` significa que a informação ou ação possui base suficiente conforme política. `Proposto` significa que pode virar objeto, mas depende de confirmação. `Concluído` significa que o resultado foi observado ou retornado por uma fonte confiável.

## 2. App flow 0 — entrada e autenticação

```text
Abrir ZapTrack
  ├── sem sessão → boas-vindas → entrar/criar conta
  ├── sessão sem workspace → criar workspace
  └── sessão com workspace → Agora
```

### Estados

`loading → authenticated → workspace_required → ready`.

### Erros

- sessão expirada: manter rota pretendida e pedir reautenticação;
- usuário sem permissão: explicar o motivo e sugerir solicitação ao administrador;
- workspace suspenso: mostrar status e canal de suporte;
- múltiplos workspaces: abrir o último usado e permitir troca explícita.

## 3. App flow 1 — criar workspace

```text
Boas-vindas
  → nome da empresa
  → segmento opcional
  → timezone e idioma
  → áreas habilitadas
  → convidar equipe ou pular
  → conectar uma fonte ou importar arquivo
  → parear WhatsApp do agente
  → primeira revisão
  → Agora
```

O onboarding deve pedir apenas decisões que mudam dados, acesso ou comportamento. Segmento pode ser editado depois. Não obrigar a configurar estados, campos e automações no início.

## 4. App flow 2 — conectar fonte

```text
Controle / Fontes
  → escolher tipo de fonte
  → ver o que será acessado
  → conceder consentimento
  → autenticar/autorizar
  → validar escopo
  → sincronizar
  → mostrar progresso
  → processar mensagens
  → revisar primeiro lote
```

### Estados da fonte

`not_connected → authorizing → connected → syncing → ready → degraded → paused → revoked → error`.

### Falha

Se a fonte não puder ser conectada ou não for elegível, não simular dados. Mostrar o que pode ser usado: conversa com o agente, encaminhamento de mensagem, upload ou integração alternativa.

## 5. App flow 3 — parear WhatsApp do usuário

```text
Aplicação: Controle / Fontes / WhatsApp do agente
  → gerar código único
  → exibir expiração e workspace
  → usuário envia VINCULAR <código>
  → webhook recebe mensagem
  → validar código/telefone
  → criar vínculo
  → confirmar escopo
  → agente responde “vínculo concluído”
```

### Estados

`code_created → awaiting_message → verified → linked → revoked → expired`.

O número do telefone não deve abrir acesso por si só. O agente deve informar qual workspace está ativo e oferecer `DESVINCULAR`.

## 6. App flow 4 — ingestão e transformação

```text
Mensagem/evento recebido
  → validar origem
  → deduplicar
  → persistir payload bruto
  → normalizar mensagem
  → identificar conversa/party
  → processar mídia
  → extrair evidência
  → interpretar semântica
  → validar schema
  → propor objeto/atenção/métrica
  → atualizar feed
```

### Estados técnicos

`received → persisted → normalized → enriching → interpreted → validated → projected → indexed`.

### Estados de revisão

`not_reviewed → suggested → needs_confirmation → accepted → corrected → rejected`.

O request do webhook deve ser rápido. Análise de texto, áudio, OCR, embeddings e projeções executam em background.

## 7. App flow 5 — revisão da IA

```text
Revisão da IA
  → filtrar por área/tipo/confiança
  → abrir sugestão
  → ver resumo
  → abrir evidência
  → aceitar / corrigir / rejeitar / adiar
  → escolher owner/status
  → salvar
  → próxima sugestão
```

### Aceitar

Cria ou atualiza objeto, grava `feedback_correction` quando aplicável, atualiza projeções e registra auditoria.

### Corrigir

Permite alterar tipo, party, ação, estado, prazo, valor, owner e relação. A correção deve preservar a sugestão original.

### Rejeitar

Marca como não aplicável, falso positivo, duplicata ou sem evidência suficiente. Não apagar a mensagem.

## 8. App flow 6 — conversa para objeto

```text
Conversa
  → mensagem com possível significado
  → painel “O que o ZapTrack identificou”
  → evento semântico
  → sugestão de objeto
  → confirmar detalhes
  → criar objeto
  → seguir para detalhe
```

O painel deve apresentar:

```text
O que foi entendido
Por que foi entendido
Qual mensagem sustenta
O que ainda falta
Que objeto pode ser criado
```

## 9. App flow 7 — consulta no WhatsApp

```text
Usuário pergunta
  → autenticar telefone/workspace
  → classificar consulta
  → resolver escopo
  → consultar objetos estruturados
  → buscar evidência/contexto se necessário
  → redigir resposta curta
  → incluir frescor e link
  → aguardar refinamento/ação
```

### Resposta nominal

```text
Conclusão
Contexto mínimo
Evidência ou origem
Próximo passo
```

Exemplo:

> Você tem **4 pendências vencendo hoje**. A mais urgente é a proposta da Alfa, prometida em 12/08 e sem confirmação. Quer abrir os detalhes ou criar um lembrete?

## 10. App flow 8 — consulta na aplicação

```text
Busca global
  → escolher escopo automático ou área
  → digitar pergunta/filtro
  → resultados agrupados
      ├── objetos
      ├── conversas
      ├── pessoas/organizações
      ├── arquivos
      └── métricas
  → filtrar
  → abrir detalhe
  → seguir relações/evidência
```

A busca deve explicar a origem do resultado. Não misturar uma correspondência exata com uma semântica sem sinalizar a diferença.

## 11. App flow 9 — criar tarefa ou compromisso

### Pelo WhatsApp

```text
“Crie uma tarefa para enviar a proposta da Alfa até sexta.”
  → resolver Alfa
  → resolver proposta
  → resolver prazo
  → mostrar resumo
  → confirmar ou criar rascunho conforme preferência
  → salvar
  → responder ID/status
```

### Pela aplicação

```text
Novo objeto
  → escolher tipo ou escrever descrição
  → preencher título
  → selecionar party
  → definir owner
  → definir prazo
  → associar conversa/projeto
  → salvar
```

O formulário deve sugerir campos com base no contexto, mas permitir edição explícita.

## 12. App flow 10 — desambiguação

```text
Usuário: “Conclua a tarefa da Alfa.”
  → encontrar candidatos
  ├── um candidato → exibir alvo e confirmar se necessário
  ├── vários candidatos → perguntar qual
  └── nenhum → informar que não encontrou e sugerir busca
```

Resposta:

> Encontrei duas tarefas da Alfa: **enviar proposta**, vencida hoje, e **confirmar entrega**, vencida ontem. Qual você quer concluir?

Não escolher silenciosamente o candidato “mais parecido” quando houver risco de erro.

## 13. App flow 11 — atenção proativa

```text
Evento/relógio
  → detectar regra
  → calcular impacto/urgência
  → verificar permissões e silêncio
  → agrupar atenção
  → criar AttentionItem
  → enviar digest ou mostrar Agora
  → usuário abrir/adiar/delegar/agir
```

### Ações disponíveis

`abrir`, `ver evidência`, `delegar`, `criar tarefa`, `lembrar depois`, `silenciar regra`, `marcar resolvido`, `ignorar com motivo`.

## 14. App flow 12 — agendamento, cancelamento e reagendamento

```text
Solicitação
  → identificar compromisso
  → extrair participantes/local/tempo
  → verificar conflitos
  → criar proposta
  → confirmação dos envolvidos ou do usuário
  → atualizar agenda
  → enviar mensagem externa somente se permitido
  → registrar estado
```

### Reagendamento

```text
Appointment A confirmado
  → pedido de mudança
  → criar transição rescheduled
  → preservar intervalo original
  → criar novo intervalo
  → pedir confirmação
  → atualizar aplicação e agente
```

### Cancelamento

```text
pedido de cancelamento
  → resolver objeto
  → verificar impacto e autoridade
  → pedir confirmação forte
  → executar somente se permitido
  → registrar cancelled
```

## 15. App flow 13 — comercial

```text
Conversa comercial
  → identificar party e contexto
  → extrair interesse/necessidade
  → criar Opportunity signal
  → avaliar confiança
  → sugerir follow-up
  → proposta/cotação
  → aprovação/aceite
  → Sale/Order
  → pós-venda/renovação
```

A aplicação mostra funil e histórico. O WhatsApp mostra oportunidades que exigem atenção e permite criar follow-up. O agente não deve declarar venda sem confirmação.

## 16. App flow 14 — atendimento e reclamação

```text
Mensagem de cliente
  → detectar reclamação/pergunta
  → resolver cliente e assunto
  → associar pedido/entrega/serviço
  → criar Case/Complaint
  → classificar severidade
  → atribuir equipe
  → acompanhar SLA
  → registrar resposta/resolução
  → pedir feedback
```

Se a reclamação envolver reembolso, contrato ou cobrança, criar relação com o objeto financeiro sem resolver automaticamente o caso.

## 17. App flow 15 — pedido, compra e entrega

```text
Pedido mencionado
  → extrair itens/quantidade/valor
  → identificar comprador/vendedor
  → criar Order/PurchaseRequest
  → aprovação se necessário
  → confirmar
  → acompanhar Shipment/Delivery
  → detectar atraso/exceção
  → notificar responsável
  → registrar entrega/recusa/devolução
```

“Quero comprar” é intenção ou solicitação; “pedido confirmado” é estado; “enviado” e “entregue” são eventos posteriores.

## 18. App flow 16 — financeiro

```text
Cobrança/fatura/pagamento mencionado
  → identificar party e documento
  → extrair valor/data/moeda
  → associar Order/Contract/Invoice
  → classificar promessa, cobrança, pagamento ou disputa
  → solicitar evidência se necessário
  → atualizar objeto com segurança
  → criar atenção para vencimento/divergência
```

O agente pode consultar e criar lembretes. Cobrança externa, pagamento, estorno ou alteração financeira exigem política e confirmação forte.

## 19. App flow 17 — arquivo e documento

```text
Arquivo recebido
  → validar tipo/tamanho
  → checksum/storage
  → OCR/transcrição
  → indexar
  → extrair entidades/eventos
  → vincular a conversa/party/objeto
  → mostrar resumo e evidência
```

O usuário pode enviar um arquivo ao agente ou fazer upload na aplicação. Documentos longos, múltiplas versões e comparação devem abrir na aplicação.

## 20. App flow 18 — métricas

```text
Usuário pergunta
  → reconhecer métrica
  → pedir período/escopo se ausente
  → buscar MetricDefinition
  → calcular deterministically
  → responder resultado/frescor
  → oferecer drill-down
```

Exemplo:

> Foram **18 pedidos criados** entre 1º e 26 de agosto; **3 estão atrasados**. A definição considera pedidos classificados como `Order`, com status `delayed` ou entrega posterior ao prazo. Abrir os 3 casos?

## 21. App flow 19 — ação no agente

```text
Mensagem
  → identificar comando
  → mostrar alvo/parâmetros
  → classificar risco
  ├── baixo → executar
  ├── médio → confirmação curta
  ├── alto → confirmação forte/link para aplicação
  └── bloqueado → explicar limite e oferecer alternativa
  → executar idempotente
  → retornar resultado
  → atualizar estado
```

### Confirmação curta

> Criar tarefa **enviar proposta da Alfa**, para **você**, até **sexta às 17h**. Confirmar?

### Confirmação forte

> Você está prestes a **cancelar o pedido 482 da Alfa**. Isso pode interromper a entrega. Para confirmar, responda: **CONFIRMAR CANCELAMENTO 482**.

## 22. App flow 20 — aprovações

```text
Ação sensível criada
  → policy gate
  → identificar aprovador
  → criar ApprovalRequest
  → enviar aviso
  → aprovador abre link seguro ou usa WhatsApp
  → aprovar/rejeitar/pedir alteração
  → executar se aprovado
  → auditar resultado
```

O aprovador deve ver objeto, impacto, evidência, parâmetros, quem solicitou e o que ocorrerá.

## 23. App flow 21 — correção e feedback

```text
Usuário diz “está errado”
  → localizar objeto/interpretação
  → pedir campo a corrigir se necessário
  → salvar correção
  → atualizar objeto/projeções
  → registrar feedback
  → recalcular avaliação
```

A correção não deve reprocessar silenciosamente todos os dados históricos. Mudanças de taxonomia devem possuir versão e migração explícita.

## 24. App flow 22 — permissões e privacidade

```text
Controle / Permissões
  → escolher membro/equipe
  → selecionar área/objeto/fonte/operação
  → conceder ou remover acesso
  → revisar impacto
  → confirmar
  → registrar audit log
```

Acesso à fonte não implica acesso universal a todo resultado. O filtro deve ocorrer antes da recuperação e antes da ação.

## 25. App flow 23 — revogação e exclusão

```text
Controle / Fontes ou Privacidade
  → pausar/revogar fonte
  → mostrar impacto
  → escolher retenção/exclusão
  → confirmar
  → interromper jobs
  → bloquear novas consultas
  → executar política de dados
  → emitir registro de conclusão
```

## 26. App flow 24 — falha de integração ou job

```text
Falha
  → registrar erro/correlation id
  → retry com backoff se seguro
  → verificar idempotência
  → reprocessar somente etapa necessária
  → atualizar status
  → alertar responsável se persistir
```

A interface deve diferenciar “ainda processando”, “não foi possível processar” e “não há permissão”.

## 27. Estados universais de interface

Toda tela e fluxo precisa cobrir:

```text
loading
empty
ready
partial
needs_review
ambiguous
no_permission
source_unavailable
processing
success
failed
blocked
archived
```

O estado não deve ser comunicado apenas por cor. Usar texto, ícone, estrutura e ação recomendada.

## 28. Eventos de produto

```text
onboarding.started
workspace.created
source.connected
source.sync_started
source.sync_completed
message.received
message.processed
analysis.completed
object.suggested
object.confirmed
object.corrected
object.rejected
attention.created
attention.opened
command.requested
command.confirmed
command.blocked
action.started
action.succeeded
action.failed
approval.requested
approval.approved
approval.rejected
feedback.recorded
permission.changed
source.revoked
```

## 29. Critério de conclusão de fluxo

Um fluxo só é considerado concluído quando o sistema consegue dizer:

```text
qual foi a entrada
qual foi o contexto
qual interpretação foi feita
qual evidência sustentou
qual objeto foi criado/alterado
qual autorização ocorreu
qual ação foi executada
qual resultado foi obtido
qual estado ficou vigente
```
