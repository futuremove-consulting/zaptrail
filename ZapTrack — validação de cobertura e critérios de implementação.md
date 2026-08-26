# ZapTrack — validação de cobertura e critérios de implementação

## 1. Cenários de cobertura

| Mensagem | Interpretação | Objetos/eventos esperados | Risco |
|---|---|---|---|
| “Quero agendar uma reunião para amanhã às 10h.” | Solicitação de agendamento | InteractionEvent + Appointment proposed/requested | Médio |
| “Reunião confirmada para terça, com Ana e o fornecedor.” | Confirmação de compromisso | Appointment confirmed + participantes + time | Médio |
| “Pode cancelar o pedido 482?” | Comando de cancelamento | ActionCommand targeting Order; não executar sem política/confirm. | Alto |
| “Reagendamos a entrega para sexta.” | Mudança de agenda logística | Delivery rescheduled + previous/new time | Médio |
| “Vou comprar 20 unidades, se o preço ficar em R$ 50.” | Intenção/negociação condicional | PurchaseRequest/Offer proposed + condition + value | Alto se tratado como compra |
| “A compra foi aprovada pelo diretor.” | Aprovação | Approval + authority + PurchaseRequest/PurchaseOrder | Alto |
| “O cliente reclamou do atraso e pediu reembolso.” | Feedback + solicitação financeira | Complaint + RefundRequest, mesma evidência | Crítico |
| “Enviei o contrato, favor assinar.” | Documento + solicitação | Document received + SignatureRequest | Alto |
| “Pagamento feito ontem, segue comprovante.” | Evento financeiro com evidência | Payment completed candidate + Attachment + Evidence | Crítico |
| “Você consegue entregar amanhã?” | Pergunta | Delivery inquiry; não Delivery confirmed | Médio |
| “Sim, entrego amanhã.” | Compromisso | Commitment by supplier + Delivery expected | Alto |
| “O fornecedor atrasou de novo.” | Exceção/risco | Delivery risk + supplier relationship + recurrence | Alto |
| “Parabéns pelo atendimento, nota 10.” | Elogio/avaliação | Praise + Rating(10) + Feedback | Baixo |
| “Não gostei; se não resolver, vou cancelar.” | Reclamação + risco de cancelamento | Complaint + CancellationRisk, não cancellation | Alto |
| “Aprovem a proposta e marquem uma ligação.” | Multi-intenção | ApprovalRequest + CallAppointmentRequest | Alto |
| “Não precisa fazer nada agora, só queria avisar.” | Informação sem ação | Informative event; nenhum task automático | Baixo |
| “Depois a gente vê isso.” | Abertura vaga | Ambiguous/low confidence; sem compromisso automático | Médio |
| “A reunião de hoje foi cancelada e a nova ficou para sexta.” | Dois estados relacionados | Old Appointment cancelled + new/rescheduled Appointment confirmed/proposed | Alto |
| “Pode cobrar o cliente, mas não envie ainda.” | Comando condicionado | Internal ChargeFollowUp + outbound action blocked | Alto |
| “O contrato com a Beta venceu.” | Evento contratual/risco | Contract expired + alert + renewal opportunity candidate | Alto |
| “A Ana fica responsável por entregar o relatório.” | Delegação/compromisso | Task assigned + Commitment + due date if present | Médio |

## 2. Casos de erro que precisam de abstenção

O sistema deve abstain quando não conseguir distinguir hipótese de fato, proposta de confirmação, sentimento de ato, intenção de execução ou autoridade de opinião.

Exemplos: “acho que pagaram”, “talvez cancelem”, “o cliente parece interessado”, “deve chegar amanhã”, “pode aprovar?” e “foi resolvido?” não devem gerar estados conclusivos sem evidência adequada.

## 3. Multi-intenção

A decomposição deve criar eventos ligados por uma correlação comum, e não uma única etiqueta genérica:

```text
Mensagem M
├── Evento E1: cancelamento solicitado do Appointment A
├── Evento E2: reagendamento proposto para sexta
└── Evento E3: envio/atualização solicitado da Proposal P
```

A execução pode respeitar dependências: reagendar só depois de cancelar ou alterar a mesma instância; enviar proposta depois de localizar a versão correta; atualizar sistema externo somente após confirmação.

## 4. Resolução de entidades

A resolução deve combinar:

- identificador explícito: telefone, e-mail, número do pedido ou contrato;
- alias e nome normalizado;
- participantes da conversa;
- histórico de relações no workspace;
- organização/unidade/site;
- contexto temporal;
- similaridade semântica;
- confirmação humana quando houver colisão.

Não fundir duas pessoas ou empresas apenas porque possuem o mesmo nome. Manter hipóteses de identidade e permitir merge/unmerge auditável.

## 5. Validação de relações

A ontologia precisa de constraints executáveis:

| Constraint | Verificação |
|---|---|
| Todo objeto | Possui workspace, tipo, estado e origem |
| Todo evento | Possui ator ou unknown, ação, evidência e confiança |
| Agendamento | Possui participante/organizador e expressão temporal quando confirmado |
| Pagamento concluído | Possui valor/data e comprovante ou fonte transacional confiável |
| Aprovação | Ator possui autoridade para o objeto ou o estado é apenas proposto |
| Entrega | Possui pedido/objeto ou é explicitamente uma previsão incerta |
| Reclamação | Possui autor, alvo/contexto e texto/áudio que sustente a queixa |
| Ação externa | Possui comando, policy decision, confirmation e idempotency key |
| Métrica | Possui definição, fórmula, fontes, período e timezone |
| Evidência | Aponta para mensagem/anexo e selector válido |

## 6. Dicionário de estados

Cada tipo de objeto deve declarar estados permitidos e transições válidas. Não usar uma enumeração global sem perfil.

| Objeto | Estados fundamentais |
|---|---|
| Appointment | Proposed, requested, confirmed, rescheduled, cancelled, completed, no_show |
| Task | Suggested, open, assigned, in_progress, blocked, completed, cancelled |
| Opportunity | New, qualified, proposal, negotiation, won, lost, renewal |
| Order | Requested, approved, confirmed, processing, shipped, delivered, returned, cancelled |
| Contract | Draft, proposed, approved, signed, active, expired, renewed, terminated |
| Invoice | Draft, issued, sent, due, overdue, paid, disputed, cancelled |
| Payment | Promised, initiated, pending, completed, failed, reversed, disputed |
| Delivery | Planned, scheduled, picked, shipped, in_transit, delayed, delivered, refused, returned |
| Case/Complaint | Open, acknowledged, assigned, in_progress, resolved, reopened, closed |
| Decision | Proposed, under_review, approved, rejected, communicated, executed, superseded |

## 7. Score de confiança operacional

A confiança não deve ser uma única probabilidade opaca. Guardar confiança por dimensão:

```text
confidence_detection
confidence_action
confidence_subject
confidence_state
confidence_actor
confidence_time
confidence_value
confidence_evidence
```

A decisão de automatizar usa o pior ou uma função conservadora das dimensões críticas. Um evento pode ter alta confiança de que é um pagamento e baixa confiança de que está concluído; nesse caso, criar “pagamento mencionado/pendente de confirmação”, não “pagamento concluído”.

## 8. Critérios de pronto

A camada semântica pode ser considerada apta para piloto quando:

1. mensagens reais de cada relação podem ser transformadas em eventos e objetos;
2. perguntas, propostas, compromissos e fatos são distinguidos;
3. múltiplas intenções da mesma mensagem são preservadas;
4. datas relativas mantêm expressão original, timezone e valor normalizado;
5. atores, contrapartes, papéis e owners são resolvidos com possibilidade de correção;
6. evidências são clicáveis e auditáveis;
7. `unknown/other/ambiguous` funcionam sem quebrar o pipeline;
8. estados inválidos são rejeitados ou marcados para revisão;
9. ações sensíveis exigem confirmação proporcional;
10. o modelo pode ser exportado em JSON-LD sem perder IDs, relações e proveniência.

## 9. Estratégia de implementação

Implementar primeiro o núcleo em Postgres com schemas fortes e relações explícitas. Adotar Zod/JSON Schema para contratos e uma suíte de validação equivalente a shapes. Manter a projeção gráfica como view materializada ou consulta relacional; não introduzir um grafo dedicado antes de a exploração de relações provar necessidade.

O vocabulário deve ter versionamento semântico, exemplos em português brasileiro, aliases e feedback de correção. O pipeline deve ser avaliado por dimensão e por risco, não apenas por acurácia média.
