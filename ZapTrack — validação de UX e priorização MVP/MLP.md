# ZapTrack — validação de UX e priorização MVP/MLP

## 1. Teste de coerência

### Princípio 1 — uma fonte de verdade

A aplicação e o agente usam o mesmo workspace, objetos, estados, evidências, permissões e comandos. Não há conflito arquitetural.

### Princípio 2 — áreas, não agentes

A navegação primária é por Agora, Áreas, Conhecimento, Análise e Controle. O agente é capacidade transversal e canal, não módulo que fragmenta o produto.

### Princípio 3 — atenção antes de cadastro

A página Agora mostra o que mudou, venceu, bloqueou, aguarda resposta ou exige decisão. Cadastros são acessados por Conhecimento ou dentro de uma área.

### Princípio 4 — profundidade progressiva

O WhatsApp entrega resumo, evidência e próximo passo. A aplicação entrega revisão, relações, histórico, análise e governança.

### Princípio 5 — IA explicável

Sugestões têm confiança, motivo, evidência e estado de revisão. Nenhum objeto importante depende de uma interpretação invisível.

### Princípio 6 — universalidade sem caos

O modelo universal permanece no núcleo semântico. A interface apresenta recortes por área e tipo de trabalho, evitando expor milhares de intents.

## 2. Matriz de prioridade

| Capacidade | Valor | Complexidade | Prioridade |
|---|---:|---:|---|
| Auth, workspace e membros | Muito alto | Baixa | P0 |
| Dashboard Agora | Muito alto | Média | P0 |
| Pareamento com agente WhatsApp | Muito alto | Média | P0 |
| Importação/ingestão de mensagens e arquivos | Muito alto | Alta | P0 |
| Conversations + timeline + evidência | Muito alto | Média | P0 |
| InteractionEvent + confiança | Muito alto | Alta | P0 |
| Tarefa, compromisso, decisão, atenção e solicitação | Muito alto | Média | P0 |
| Consulta do agente sobre objetos/atenção | Muito alto | Média | P0 |
| Criar lembrete/tarefa interna pelo agente | Alto | Média | P0 |
| Revisão e correção da IA | Muito alto | Média | P0 |
| Busca global básica | Alto | Média | P0 |
| Módulo financeiro inicial | Muito alto | Alta | P0/P1 |
| Permissões básicas e auditoria | Muito alto | Média | P0 |
| Comercial e Atendimento como views | Alto | Média | P1 |
| Pedidos, entregas e Suprimentos | Alto | Alta | P1 |
| Arquivos com OCR/transcrição completa | Alto | Alta | P1 |
| Métricas definidas e drill-down | Alto | Média | P1 |
| Aprovações e ações controladas | Alto | Alta | P1 |
| Integrações CRM/ERP | Médio/alto | Alta | P1/P2 |
| Automações configuráveis | Médio | Alta | P2 |
| Agentes especializados por área | Médio | Alta | P2 |
| Grafo visual avançado | Médio | Alta | P2 |
| Ações financeiras externas automáticas | Alto risco | Muito alta | P3 |

## 3. MVP recomendado

O MVP deve provar esta transformação:

```text
WhatsApp/conversa
  → objeto estruturado com evidência
  → consulta no WhatsApp
  → atenção no Agora
  → revisão na aplicação
  → tarefa/compromisso interno
```

### Núcleo mínimo

- Auth, workspace, membros e roles básicas;
- conexão ou ingestão inicial validada;
- pareamento do número do usuário com o agente;
- Conversation, Message, Party, InteractionEvent, Evidence;
- objetos Task, Commitment, Decision, Request e AttentionItem;
- estados, confidence e revisão;
- agente com consultas de leitura;
- criação de tarefas/lembrtes internos com confirmação;
- aplicação Agora, Conversas, Objetos, Revisão da IA e Busca;
- auditoria mínima e permissões por workspace.

### Financeiro inicial

O módulo financeiro deve começar como uma **visão assistida por conversas**, não como contabilidade completa. Priorizar compromissos, cobranças mencionadas, pagamentos declarados, vencimentos, comprovantes e pendências de confirmação. O sistema não deve conciliar contas bancárias nem executar pagamentos no MVP.

## 4. MLP recomendado

O MLP adiciona:

- áreas Comercial, Atendimento, Financeiro e Operações;
- objetos Opportunity, Complaint, Invoice, Payment, Order e Delivery;
- arquivos e documentos com busca;
- métricas básicas com definição e frescor;
- aprovações e ações de baixo risco;
- alertas agrupados e preferências;
- busca híbrida;
- importação/exportação e integração inicial com sistemas prioritários.

## 5. O que fica fora do MVP

CRM completo, ERP, omnichannel, workflow builder genérico, leitura indiscriminada de WhatsApp pessoal, acesso geral a grupos existentes, cobrança automática, pagamento, assinatura de contrato, agente autônomo de atendimento, grafo visual completo, score comportamental de colaboradores, dashboard executivo com dezenas de indicadores e configuração livre de todo o vocabulário.

## 6. Sequência de lançamento

```text
P0: acesso e fonte
  → P0: conversa e evidência
  → P0: objetos e Agora
  → P0: agente de consulta
  → P0: revisão/correção
  → P0: tarefa interna
  → P1: áreas e financeiro assistido
  → P1: arquivos, métricas e aprovações
  → P1: pedidos/entregas/atendimento
  → P2: integrações e automações
```

## 7. Critérios de sucesso de UX

| Indicador | Pergunta |
|---|---|
| Tempo até primeiro valor | O usuário conseguiu encontrar uma pendência real? |
| Taxa de revisão aceita | As sugestões têm utilidade? |
| Taxa de correção | Onde a semântica falha? |
| Uso recorrente do WhatsApp | O agente virou hábito diário? |
| Abertura de evidência | O usuário confia e verifica a origem? |
| Criação de objetos | Conversas realmente viram gestão? |
| Conclusão de tarefa | O sistema ajudou o trabalho a acontecer? |
| Alertas úteis | Atenção antecipada evita perda ou ruído? |
| Tempo de resposta | O usuário resolve mais rápido? |
| Incidentes de autorização | Houve vazamento ou ação indevida? |

## 8. Testes qualitativos

Realizar testes moderados com proprietário, gestor e operador. Pedir que encontrem uma promessa, corrijam uma interpretação, consultem uma cobrança, localizem uma evidência e criem uma tarefa. Observar se entendem diferença entre “proposto”, “confirmado” e “concluído”.

Testar também a aplicação sem treinamento: se o usuário não consegue explicar de onde veio um objeto ou por que recebeu uma atenção, a interface falhou.

## 9. Testes de acessibilidade e robustez

Verificar contraste, foco de teclado, leitura por screen reader, mensagens de erro, estados sem conteúdo, responsividade, textos longos, fusos horários, datas relativas, nomes semelhantes, ausência de evidência, perda de conexão e ações duplicadas.

## 10. Regra final de priorização

Uma capacidade entra no produto quando atende simultaneamente a quatro condições:

1. resolve uma dor frequente e economicamente relevante;
2. utiliza o núcleo universal sem criar um sistema paralelo;
3. pode apresentar evidência e estado confiáveis;
4. possui ação segura e mensurável.

Se não atender às quatro, deve permanecer como hipótese, sugestão ou backlog.
