# ZapTrack — consultas, ações, métricas e governança por relação

## 1. O usuário não deve escolher um agente por assunto

A aplicação pode ser organizada por áreas da empresa, mas o WhatsApp deve oferecer um agente unificado. O usuário pergunta sobre cliente, colaborador, parceiro, fornecedor, pedido, reunião, pagamento ou reclamação no mesmo lugar.

O roteador identifica:

```text
quem → relação → assunto/objeto → ação → estado → tempo/valor → próximo passo
```

## 2. Matriz de relação e uso

| Relação | Objetos prioritários | Consultas comuns | Ações comuns |
|---|---|---|---|
| Cliente/prospect | Lead, venda, proposta, pedido, pagamento, reclamação, feedback | “Quem está sem retorno?”, “O que o cliente pediu?”, “Quais reclamações continuam abertas?” | Criar follow-up, responder internamente, escalar, atualizar estágio |
| Colaborador | Tarefa, reunião, decisão, aprovação, projeto, avaliação | “O que está atrasado?”, “O que foi aprovado?”, “Quem ficou responsável?” | Atribuir, delegar, lembrar, concluir, registrar decisão |
| Parceiro | Indicação, oportunidade, contrato, entrega, reunião, comissão | “Quais indicações estão abertas?”, “O que combinamos com o parceiro?” | Criar follow-up, registrar compromisso, revisar acordo |
| Fornecedor | Cotação, compra, contrato, fatura, entrega, qualidade | “Qual fornecedor está atrasado?”, “Quais pagamentos vencem?” | Cobrar internamente, abrir ocorrência, revisar cotação, escalar |
| Prestador | Serviço, agenda, contrato, entrega, pagamento | “Qual serviço está agendado?”, “O que falta receber?” | Reagendar, confirmar, abrir pendência, aprovar |
| Sócio/gestor | Decisão, risco, aprovação, métrica, iniciativa | “Quais decisões estão pendentes?”, “O que ameaça a operação?” | Aprovar, priorizar, delegar, alterar política |
| Grupo/comunidade | Discussão, consenso, anúncio, conflito, evento | “O que foi decidido no grupo?”, “Quais pedidos surgiram?” | Encaminhar, resumir, criar objeto quando houver evidência |

## 3. Padrões de consulta

As consultas devem ser classificadas em padrões reutilizáveis:

| Padrão | Exemplo |
|---|---|
| Lista | “Mostre todas as pendências abertas.” |
| Filtro | “Quais pagamentos vencem esta semana?” |
| Busca de evidência | “Onde o cliente confirmou o preço?” |
| Estado | “O que foi cancelado ontem?” |
| Comparação | “Quais fornecedores atrasaram mais?” |
| Resumo | “Resuma a relação com a Alfa.” |
| Contagem | “Quantas vendas foram aprovadas?” |
| Tendência | “As reclamações aumentaram?” |
| Explicação | “Por que essa oportunidade está em risco?” |
| Próximo passo | “O que devo fazer agora?” |
| Comando | “Crie uma tarefa para cobrar o fornecedor.” |
| Correção | “Isso não foi compra; foi apenas cotação.” |

## 4. Métricas universais

Em vez de criar um dashboard para cada verbo, usar métricas universais que recebem `object_type`, `relationship_type`, `business_action_type`, período e escopo:

| Família | Métricas |
|---|---|
| Volume | Quantidade de eventos, objetos, mensagens ou ações |
| Conversão | Proposto → aprovado, cotado → comprado, lead → venda |
| Tempo | Tempo até resposta, aprovação, pagamento, entrega ou resolução |
| Cumprimento | Compromissos no prazo, tarefas concluídas, reuniões realizadas |
| Exceção | Atrasos, falhas, cancelamentos, reaberturas, disputas |
| Qualidade | Reclamações, elogios, avaliações, correções e retrabalho |
| Financeiro | Valor cotado, vendido, cobrado, pago, estornado e pendente |
| Relacionamento | Recorrência, renovação, resposta, satisfação e risco |
| Carga operacional | Pendências por owner, equipe, área ou parceiro |

Toda métrica precisa ter definição, fórmula, fonte, filtros, período, timezone, frescor e versão.

## 5. Ações por risco

| Nível | Exemplos | Resposta do ZapTrack |
|---|---|---|
| Baixo | Resumir, buscar, listar, classificar, sugerir | Pode executar automaticamente |
| Médio | Criar tarefa interna, adicionar lembrete, atribuir owner | Executa conforme política do workspace ou pede confirmação inicial |
| Alto | Atualizar CRM/ERP, alterar prazo contratual, mudar estágio comercial | Confirmação explícita e auditoria |
| Crítico | Enviar mensagem a cliente, cobrar, pagar, cancelar, estornar, excluir | Bloqueado no MVP; depois, step-up auth e confirmação forte |

## 6. Modelos de resposta

### Consulta operacional

> **Há 7 solicitações abertas de clientes.** 3 estão sem responsável, 2 vencem hoje e 1 contém reclamação sobre prazo. Dados atualizados às 17h42. Quer ver as três mais urgentes?

### Consulta financeira

> **Foram identificados 5 compromissos de pagamento nesta semana, totalizando R$ 18.400.** Dois estão vencidos e um foi apenas prometido, não confirmado. Posso abrir a lista detalhada na aplicação.

### Consulta de equipe

> **Ana tem 3 tarefas vencidas e participou de 2 decisões sem owner definido.** Posso criar um resumo para a reunião de alinhamento ou abrir as evidências.

### Comando ambíguo

> Encontrei uma cotação aprovada e um pedido efetivamente comprado para a Alfa. Você quer atualizar a **cotação** ou o **pedido**?

### Ação com confirmação

> Posso criar uma tarefa interna para cobrar o fornecedor Beta amanhã às 9h, atribuí-la a Gus e vincular a conversa de 26/08. Responda **CONFIRMAR**.

## 7. Eventos que não viram objetos automaticamente

“Bom dia”, “obrigado”, “ok”, “vamos ver”, “talvez”, “depois conversamos” e respostas sociais não devem gerar tarefas ou compromissos por padrão. Podem ser armazenados como eventos de interação e alimentar contexto, relação ou sentimento, mas só viram objeto quando houver necessidade de acompanhamento.

A mesma cautela se aplica a perguntas e hipóteses:

- “Podemos comprar?” não é compra.
- “Você consegue pagar sexta?” não é pagamento realizado.
- “Talvez a gente cancele” não é cancelamento.
- “O cliente parece interessado” é sinal de oportunidade, não venda.
- “Acho que foi enviado” não é entrega confirmada.

## 8. Governança por relação

O mesmo tipo de ação pode exigir regras diferentes conforme a relação:

| Ação | Cliente | Colaborador | Parceiro | Fornecedor |
|---|---|---|---|---|
| Criar tarefa interna | Pode ser automático | Pode ser automático | Pode ser automático | Pode ser automático |
| Enviar mensagem externa | Confirmação forte | Conforme política | Confirmação | Confirmação |
| Registrar pagamento | Nunca inferir sem evidência | Financeiro/admin | Financeiro/admin | Financeiro/admin |
| Alterar contrato | Bloqueado no MVP | Admin/jurídico | Admin/jurídico | Admin/jurídico |
| Classificar sentimento | Sinal auxiliar | Não usar para reputação individual | Sinal auxiliar | Sinal auxiliar |
| Exportar histórico | Conforme consentimento | Conforme acesso | Conforme contrato | Conforme acesso |

## 9. Correção e aprendizagem

O usuário deve poder corrigir com linguagem natural:

```text
“Não é cancelamento, é reagendamento.”
“Essa pessoa é fornecedora, não cliente.”
“Não crie tarefa para elogios.”
“Pagamento confirmado significa apenas quando houver comprovante.”
“Tudo que envolver contrato exige minha aprovação.”
```

A correção deve atualizar regra/preferência do workspace somente quando o usuário tiver permissão e a mudança for clara. A aplicação mostra o impacto da nova regra antes de aplicá-la amplamente.

## 10. Princípio de cobertura

O ZapTrack deve suportar todos os domínios como combinações de relação, ação, objeto, estado, evidência e próximo passo. Novos casos entram pela taxonomia versionada e pelo valor `other`, não pela criação de telas e agentes independentes.

A universalidade é uma propriedade do núcleo. O MVP é uma escolha de exposição e confiabilidade, não uma negação do restante do universo.
