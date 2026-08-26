# ZapTrack — semântica universal de conversas e gestão

## 1. Princípio central

O ZapTrack não deve tentar manter uma lista infinita de intenções isoladas. Deve interpretar cada trecho de conversa como um **evento de interação** e projetá-lo em dimensões estáveis.

A unidade universal recomendada é:

> **InteractionEvent = quem fez o quê, em relação a quem, sobre qual objeto, com qual intenção, em que estado, quando, com que valor, sustentado por qual evidência e exigindo qual próximo passo.**

Essa unidade permite cobrir solicitações, agendamentos, cancelamentos, compras, contratações, reclamações, pagamentos, entregas, reuniões e novas categorias sem alterar a fundação do sistema.

## 2. Dimensões semânticas

| Dimensão | Pergunta | Exemplos |
|---|---|---|
| Actor | Quem fala ou age? | Cliente, usuário, colaborador, parceiro, fornecedor |
| Counterparty | Com quem a ação se relaciona? | Empresa, cliente, equipe, fornecedor |
| Relationship | Qual é o tipo da relação? | Comercial, atendimento, interna, parceria, suprimentos |
| Speech act | O que a mensagem faz linguisticamente? | Perguntar, solicitar, informar, oferecer, aprovar, recusar |
| Business action | Que ação de negócio está envolvida? | Agendar, comprar, pagar, contratar, entregar |
| Object | Sobre o que é a ação? | Pedido, reunião, contrato, fatura, produto, entrega |
| State | Em que estágio está? | Mencionado, proposto, solicitado, confirmado, executado |
| Time | Quando ocorre ou deve ocorrer? | Hoje, amanhã, 15/09, recorrente |
| Value | Qual quantidade/valor existe? | R$ 500, 3 unidades, 2 horas |
| Place/channel | Onde ocorre? | WhatsApp, loja, reunião online, endereço |
| Sentiment/feedback | Qual reação ou avaliação? | Reclamação, elogio, nota, satisfação |
| Risk | O que pode dar errado? | Atraso, cancelamento, inadimplência, escalonamento |
| Evidence | Qual mensagem/mídia sustenta? | Texto, áudio, imagem, PDF, link |
| Commitment | O que alguém assumiu? | Promessa, prazo, pagamento, retorno |
| Next step | O que deve acontecer? | Responder, confirmar, delegar, executar |
| Confidence | Quão segura é a interpretação? | Alta, média, baixa, abstain |

## 3. Famílias de speech acts

Speech act e ação de negócio são coisas diferentes. “Posso remarcar?” é uma pergunta/solicitação sobre reagendamento; não é um reagendamento confirmado.

| Família | Classes iniciais |
|---|---|
| Solicitação | perguntar, pedir, solicitar, requisitar, encomendar |
| Informação | informar, comunicar, atualizar, avisar, notificar |
| Proposição | oferecer, cotar, sugerir, convidar, propor |
| Decisão | aprovar, autorizar, aceitar, recusar, rejeitar, vetar |
| Compromisso | prometer, assumir, confirmar prazo, garantir, reservar |
| Coordenação | agendar, convocar, marcar, reagendar, delegar, encaminhar |
| Mudança | alterar, atualizar, corrigir, prorrogar, renovar |
| Encerramento | cancelar, concluir, fechar, arquivar, rescindir |
| Feedback | reclamar, elogiar, avaliar, pontuar, recomendar |
| Escalonamento | cobrar, pressionar, contestar, reportar, escalar |
| Negociação | negociar, contrapropor, pedir desconto, condicionar |
| Social/relacional | agradecer, cumprimentar, apresentar, fazer follow-up |

## 4. Famílias de ações de negócio

| Família | Ações cobertas |
|---|---|
| Atendimento | solicitar suporte, responder dúvida, abrir chamado, escalar, resolver |
| Agenda e compromisso | reunião, ligação, visita, evento, agendamento, reagendamento, cancelamento, confirmação, lembrete |
| Comercial | prospectar, qualificar, cotar, enviar proposta, negociar, aprovar, vender, renovar, perder, recuperar |
| Compra e suprimentos | consultar fornecedor, solicitar cotação, comprar, encomendar, contratar, receber, devolver |
| Contrato e serviço | contratar, aprovar contrato, assinar, renovar, alterar escopo, rescindir |
| Financeiro | cobrar, faturar, pagar, receber, parcelar, estornar, reembolsar, conciliar |
| Pedido e entrega | criar pedido, alterar pedido, separar, enviar, entregar, retirar, atrasar, devolver |
| Operação | abrir tarefa, delegar, executar, bloquear, corrigir, inspecionar, concluir |
| Pessoas e equipe | admitir, alocar, orientar, avaliar, aprovar folga, escalar conflito |
| Marketing e relacionamento | divulgar, convidar, recomendar, avaliar campanha, cancelar inscrição |
| Parceria | apresentar, indicar, co-criar, negociar parceria, encaminhar, renovar |
| Feedback e reputação | reclamar, elogiar, avaliar, pontuar, recomendar, contestar |
| Risco e exceção | atraso, falha, indisponibilidade, fraude suspeita, conflito, violação, urgência |
| Conhecimento | explicar, resumir, decidir, documentar, perguntar, pesquisar |

A lista é um vocabulário inicial, não um limite do produto. Novas ações devem ser adicionadas por configuração versionada ou mapeadas para `other` até existir evidência de frequência e valor.

## 5. Objetos de negócio

O mesmo tipo de ação pode atuar sobre objetos diferentes. “Cancelar” pode cancelar reunião, pedido, contrato, assinatura, cobrança ou entrega.

| Objeto | Estados frequentes |
|---|---|
| Solicitação | Recebida, em análise, aprovada, recusada, atendida |
| Compromisso | Proposto, assumido, confirmado, cumprido, quebrado |
| Agendamento | Proposto, reservado, confirmado, reagendado, cancelado, realizado, no-show |
| Reunião/ligação/visita | Planejada, confirmada, realizada, resumida, com follow-ups |
| Lead/oportunidade/venda | Novo, qualificado, proposta, negociação, ganho, perdido, renovação |
| Cotação/proposta | Rascunho, enviada, vista, aprovada, recusada, expirada |
| Pedido/compra | Solicitado, aprovado, comprado, separado, enviado, entregue, devolvido |
| Contrato/serviço | Proposto, aprovado, assinado, ativo, renovado, suspenso, rescindido |
| Fatura/cobrança/pagamento | Emitida, enviada, vencendo, vencida, paga, parcial, contestada, estornada |
| Entrega/envio | Planejado, coletado, em trânsito, atrasado, entregue, recusado |
| Tarefa | Sugerida, aberta, atribuída, em andamento, bloqueada, concluída, cancelada |
| Reclamação/chamado | Recebida, classificada, atribuída, em tratamento, resolvida, reaberta |
| Avaliação/feedback | Recebido, classificado, respondido, convertido em melhoria |
| Decisão | Em discussão, proposta, aprovada, comunicada, executada, revisada |
| Documento/arquivo | Recebido, classificado, extraído, revisado, aprovado, arquivado |
| Iniciativa/projeto | Proposto, aprovado, em execução, bloqueado, concluído |

## 6. Estados universais

Para impedir que uma intenção seja confundida com um fato, todo evento e objeto devem usar um estado universal:

```text
mentioned → proposed → requested → acknowledged → approved
→ scheduled → committed → in_progress → completed
→ cancelled / rejected / failed / disputed / expired
```

Nem toda entidade usa todos os estados. A máquina de estados deve ser configurável por tipo, com transições válidas e histórico.

Exemplos:

- “Podemos reunir amanhã?” = `speech_act=request`, `business_action=meeting`, `state=proposed`.
- “Reunião confirmada para amanhã às 10h” = `business_action=meeting`, `state=confirmed`.
- “Cancele a reunião de amanhã” = `speech_act=request`, `business_action=cancel`, `object=meeting`, `state=requested`.
- “A reunião foi cancelada” = `business_action=meeting`, `state=cancelled`.
- “Vou pagar até sexta” = `business_action=payment`, `state=committed`, `commitment=true`.
- “O pagamento foi recebido” = `business_action=payment`, `state=completed`, `evidence=transaction/confirmation`.

## 7. Relações entre participantes

O modelo não deve assumir que toda conversa é empresa-cliente. Cada participante recebe um papel relacional:

| Papel | Exemplos de interação |
|---|---|
| Cliente | Compra, suporte, reclamação, renovação, pagamento |
| Prospect | Interesse, cotação, proposta, negociação |
| Colaborador | Delegação, reunião, aprovação, tarefa, feedback |
| Gestor/sócio | Decisão, aprovação, cobrança, prioridade |
| Parceiro | Indicação, co-venda, projeto, parceria |
| Fornecedor | Cotação, compra, contrato, entrega, cobrança |
| Prestador | Serviço, agenda, contrato, pagamento |
| Comunidade/grupo | Discussão, aviso, decisão, consenso, conflito |

Um participante pode possuir mais de um papel por workspace ou por conversa. Isso evita criar um produto separado para cliente, RH, fornecedor e parceiro.

## 8. Evento universal versus objeto persistente

Nem todo evento precisa virar um objeto de gestão.

| Situação | Persistência recomendada |
|---|---|
| “Obrigado” | Evento social; pode alimentar relacionamento, não necessariamente tarefa |
| “Pode me mandar o preço?” | Solicitação; objeto se exigir resposta/follow-up |
| “Enviei o contrato” | Evento de documento; criar objeto se exigir revisão |
| “Vamos marcar” | Proposta de agenda; ainda não é agendamento confirmado |
| “Agendado para terça” | Agendamento confirmado |
| “O cliente não gostou” | Feedback/risco; objeto se exigir tratamento |
| “Pagamento efetuado” | Evento financeiro; objeto se houver conciliação/pendência |

A regra é: **todo trecho relevante pode ser estruturado como evento; somente eventos que exigem acompanhamento, memória ou decisão viram objetos de gestão.**

## 9. Cobertura sem caos

A cobertura universal não significa lançar milhares de telas. A mesma interface e o mesmo modelo de objeto cobrem domínios diferentes por meio de:

- tipo de relação;
- tipo de ação;
- tipo de objeto;
- estado;
- evidência;
- responsável;
- prazo;
- valor;
- prioridade;
- próximo passo.

O usuário vê “o que precisa de atenção”, independentemente de ser venda, pagamento, entrega, contrato, reunião ou reclamação. Filtros por área da empresa aparecem depois, sem fragmentar o núcleo.

## 10. Limite epistemológico

Não é possível prometer identificar literalmente “tudo” com precisão perfeita. Linguagem é ambígua, incompleta e dependente de contexto. O contrato correto é:

- cobertura ampla por dimensões;
- `other/unknown` para casos não mapeados;
- abstention quando a confiança for baixa;
- evidência para cada inferência;
- correção humana simples;
- versionamento da taxonomia;
- avaliação por domínio e tipo de erro.

O produto deve preferir dizer “não consegui distinguir se isso foi apenas uma proposta ou um agendamento confirmado” a criar um falso compromisso.
