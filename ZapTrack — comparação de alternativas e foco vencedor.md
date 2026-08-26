# ZapTrack — comparação de alternativas e foco vencedor

## 1. Opções avaliadas

Foram comparadas seis direções que aparecem no corpus ou surgem naturalmente da sua combinação: plataforma horizontal de inteligência conversacional; copiloto comercial/operacional para WhatsApp; vertical Food/Delivery; vertical Imobiliário; módulo de métricas para SaaS; e ecossistema de agentes autônomos.

A avaliação abaixo é uma **opinião estratégica estruturada**, não uma medição objetiva de mercado. A nota serve para tornar explícitos os critérios e evitar que a decisão seja guiada apenas por entusiasmo conceitual.

## 2. Critérios e pesos

| Critério | Peso | Pergunta |
|---|---:|---|
| Dor e disposição potencial a pagar | 20% | O problema é frequente, caro e reconhecido? |
| Disponibilidade de dados e integração | 15% | É possível obter dados suficientes sem projeto de implantação desproporcional? |
| Time-to-value | 15% | O cliente percebe valor em pouco tempo? |
| Clareza do comprador | 15% | Há ICP, usuário e patrocinador identificáveis? |
| Diferenciação demonstrável | 15% | A proposta pode ser provada em uma demonstração e não apenas afirmada? |
| Risco de execução | 10% | O produto pode ser entregue com confiança e governança? |
| Reuso e expansão | 10% | A infraestrutura e o aprendizado abrem novas receitas? |

## 3. Matriz de decisão

Notas de 1 a 5; quanto maior, melhor. No critério “risco de execução”, a nota maior significa **menor risco**.

| Alternativa | Dor/WTP | Dados | TTV | Comprador | Diferenciação | Execução | Expansão | Nota ponderada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Copiloto comercial/operacional para WhatsApp** | 5 | 4 | 4 | 4 | 4 | 3 | 5 | **84/100** |
| Imobiliário conversacional | 4 | 3 | 4 | 4 | 4 | 3 | 4 | **75/100** |
| Food/Delivery — inteligência de exceções | 5 | 3 | 3 | 4 | 3 | 2 | 4 | **71/100** |
| Ecossistema ZapAgents + ZapTrack | 5 | 2 | 2 | 3 | 3 | 1 | 5 | **62/100** |
| Plataforma horizontal desde o início | 4 | 3 | 2 | 2 | 3 | 2 | 5 | **60/100** |
| ZapTrack Metrics para SaaS | 4 | 2 | 2 | 4 | 2 | 2 | 3 | **56/100** |

## 4. Alternativa vencedora: Copiloto de Execução Conversacional

O melhor produto para construir primeiro é o **ZapTrack Copiloto de Execução Conversacional**: uma camada que observa conversas de vendas e atendimento, encontra oportunidades, compromissos, decisões e pendências, e transforma esses sinais em próximos passos rastreáveis.

O produto não deve ser vendido como “mais um CRM de WhatsApp”. O CRM organiza o que foi registrado; o ZapTrack deve capturar aquilo que normalmente não foi registrado. Também não deve começar como “um agente que conversa com o cliente”; o agente é uma camada de ação posterior, com riscos e requisitos próprios.

### Proposta de valor recomendada

> **O ZapTrack encontra nas suas conversas o que pode ser perdido — oportunidades, promessas, decisões e pendências — e transforma cada sinal em um próximo passo com responsável, prazo e evidência.**

### Primeiro comprador

O comprador inicial é o dono, diretor ou gestor de uma operação comercial/atendimento que depende do WhatsApp e não possui controle confiável sobre follow-ups, promessas e pendências. O usuário cotidiano é o gestor ou membro da equipe que precisa revisar e concluir os itens; o CEO recebe a visão de impacto, mas não deve ser o único público da experiência.

### Primeira demonstração

A demonstração ideal não começa por dashboard. Ela mostra uma sequência curta:

1. Uma conversa contém um pedido de proposta ou uma promessa de retorno.
2. O ZapTrack mostra a mensagem original e explica a interpretação.
3. O usuário confirma ou edita uma tarefa/oportunidade.
4. O sistema define responsável, prazo e lembrete.
5. O feed mostra o item até sua conclusão.

A prova de valor é “algo que seria esquecido agora está sob controle”, e não “a IA classificou uma frase”.

## 5. O que o produto deve fazer no MVP

| Capacidade | Entrega de produto |
|---|---|
| Conectar/importar | Receber uma fonte de conversa de forma autorizada, com status de sincronização e tratamento de duplicidade |
| Pesquisar | Busca lexical e semântica por conversa, contato, empresa e objeto, sempre com origem |
| Entender | Extrair tarefa, decisão, oportunidade, compromisso, prazo, responsável e sinal básico de risco |
| Explicar | Mostrar evidência, confiança, contexto usado e campos ainda incertos |
| Organizar | Feed de pendências e objetos com status, prioridade, prazo e owner |
| Agir | Criar, editar, delegar, lembrar e concluir itens; notificar internamente de forma segura |
| Aprender | Registrar aceite, edição, rejeição, correção e resultado sem retreino opaco |
| Resumir | Gerar resumo acionável da conversa ou período, com decisões e próximos passos |

O MVP deve ter poucos objetos bem resolvidos: **tarefa, decisão, oportunidade, compromisso e alerta operacional**. Empresa, contato, local e mensagem são entidades de contexto. Documento, áudio e imagem são evidências ou recursos indexáveis. Sentimento é um sinal auxiliar, não o produto central.

## 6. O que não construir agora

Não construir simultaneamente CRM completo, BI executivo avançado, métricas de SaaS, gestão de pedidos de delivery, omnichannel, agente de atendimento autônomo, knowledge graph, gamificação, score de influência, score de compliance, previsão de churn e integração com todos os sistemas.

Não prometer “zero interface”, “IA que decide”, “primeiro produto do mercado”, “90% das oportunidades”, “70% menos tempo”, “2x conversão” ou ausência de risco de banimento sem evidência documentada. Esses claims só devem entrar em marketing após pilotos medidos, metodologia definida e autorização para uso dos casos.

## 7. Papel das demais alternativas

### 7.1 Food/Delivery

Food/Delivery é uma boa oportunidade **como camada de inteligência sobre operação existente**, não como sistema completo de pedidos. A análise externa da Anota AI mostra que a categoria já reúne cardápio, robô de atendimento, pedidos por WhatsApp, áudio, CRM, campanhas, fidelidade, PDV, entrega e relatórios. Portanto, o espaço mais defensável para o ZapTrack seria detectar causas de atraso, reclamações recorrentes, pedidos problemáticos, oportunidades de recompra e falhas de execução entre conversa e sistema de pedido.

Esse vertical só deve virar prioridade se houver acesso real a restaurantes, integração com dados de pedidos/delivery e uma hipótese de resultado mensurável. Caso contrário, funcionará como distração de escopo.

### 7.2 Imobiliário

Imobiliário possui uma jornada naturalmente conversacional: lead, visita, proposta, negociação, documentação e fechamento. É uma boa segunda aposta porque há objetos claros e valor por oportunidade. Porém, requer integração com fontes de imóveis, agenda, CRM e identificação confiável de estágio. Deve ser ativado como pacote de domínio sobre o mesmo núcleo, não como produto independente antes de validar o motor geral.

### 7.3 SaaS Metrics

O módulo de SaaS Metrics deve ficar como vertical posterior ou integração complementar. Métricas como MRR, ARR, churn, LTV e CAC não são apenas eventos em um feed; exigem modelagem de assinaturas, faturamento, refunds, upgrades, overages, moedas e regras de receita. ChartMogul e Baremetrics mostram a maturidade e profundidade dessa categoria. O ZapTrack pode adicionar o “porquê conversacional” de uma mudança de receita, mas não deve começar tentando substituir sistemas especializados de subscription analytics.

### 7.4 ZapAgents

ZapAgents é uma oportunidade forte, mas é outro produto: conversa com clientes, gera obrigações de segurança, qualidade, tom de voz, consentimento, escalonamento e responsabilidade por ações externas. Deve consumir a ontologia e o histórico do ZapTrack, mas entrar depois que o núcleo de leitura, contexto, evidência e execução supervisionada tiver retenção e qualidade comprovadas.

### 7.5 Plataforma horizontal

A horizontalidade deve existir na arquitetura, no modelo de dados e no motor semântico. Não deve existir como promessa comercial inicial. “Qualquer conversa, qualquer empresa, qualquer setor” dificulta a compra e impede a empresa de aprender uma operação específica.

## 8. Estratégia de arquitetura de produto

Externamente, manter uma única marca: **ZapTrack**. Internamente, organizar componentes reutilizáveis como Ingestion, Context, Semantic Extraction, Objects, Actions, Metrics e Evaluation. Evitar lançar imediatamente ZapCore, ZapMem, ZapView, ZapOps, ZapCRM, ZapFlow, ZapMetrics e ZapAgents como um catálogo de produtos.

Quando houver dois ou mais produtos com usuários e receita independentes, avaliar uma marca guarda-chuva ZapStack. Antes disso, a arquitetura de nomes aumenta o discurso e a carga cognitiva sem aumentar a prova de valor.

## 9. Roadmap recomendado

| Horizonte | Resultado | Escopo |
|---|---|---|
| 0–30 dias | Prova do problema e do entendimento | Entrevistas, conversas anonimizadas, amostra real, dicionário inicial, definição de 5 objetos e 10–15 métricas internas |
| 31–60 dias | Protótipo utilizável | Importação/conector limitado, busca, evidência, extração estruturada, confirmação e feed de pendências |
| 61–90 dias | Piloto mensurável | 3–5 empresas do mesmo ICP, uso recorrente, feedback, métricas de qualidade e primeiros casos de resultado |
| 3–6 meses | Produto comercial inicial | Integração mais estável, permissões, retenção/exclusão, alertas, relatórios simples, pricing e onboarding |
| 6–12 meses | Expansão controlada | Segundo domínio, integração externa de destino, preditivos limitados e automações de baixo risco |
| 12+ meses | Plataforma/ecossistema | Verticalizações, agentes com supervisão, automações avançadas, métricas específicas e knowledge graph quando houver necessidade real |

## 10. Critério de go/no-go

Avançar para a próxima vertical somente quando o produto inicial demonstrar, em dados reais e anonimizados, que usuários conectam ou importam dados, encontram o primeiro insight, aceitam ou corrigem objetos, retornam para revisar pendências e conseguem apontar uma perda evitada ou um ganho de produtividade. Se o produto gerar elogios mas não criar hábito, ainda não está validado.

## 11. Veredito

A melhor decisão é construir **um produto só, para um fluxo só, com uma promessa só**:

> **ZapTrack: o copiloto que transforma conversas de negócio em próximos passos rastreáveis.**

A visão de plataforma universal, os módulos verticais, os agentes de atendimento e a campanha “A Revolução das Conversas” podem permanecer como expansão e marca. O erro seria colocar todos eles no primeiro produto. O caminho game changer não é fazer mais coisas; é fazer com que uma conversa importante deixe de morrer no chat e passe a produzir uma ação confiável, explicável e concluída.
