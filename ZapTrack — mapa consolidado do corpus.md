# ZapTrack — mapa consolidado do corpus

## 1. Materiais analisados

- `pasted_content.txt`: suíte sintética de 280 frases em 14 clusters de intenção, com uma descrição curta do test suite.
- `pasted_content_2.txt`: Biblioteca Semântica ZapTrack; camadas conceituais, intents, entidades, clusters, objetos de gestão, regras de contexto, multi-intenção e aplicações ML/NLP.
- `pasted_content_3.txt`: Taxonomia Oficial v1.0/v1.1; entidades, atributos, relações e posicionamento dos objetos de gestão; distinção entre taxonomia e ontologia.
- `pasted_content_4.txt`: CTA, PRD Master v2.5 de setembro de 2025 e matriz por áreas/temas da empresa.
- `pasted_content_5.txt`: Metodologia de Testes e Cenários Inteligentes; pipeline, cenários, edge cases, métricas-alvo e camada neuro-simbólica.
- `pasted_content_6.txt`: objetos de gestão, integração com ontologia e hipótese de Food/Delivery.
- `pasted_content_7.txt`: seis formatos de resumo para 1:1 e seis para grupos; resumo histórico completo e personas de uso.
- `pasted_content_8.txt`: auditoria de landing page, objeções, buyer personas e home page conceitual.
- `pasted_content_9.txt`: campanha de marca “A Revolução das Conversas”, Founder’s Club e comunidade.
- `pasted_content_10.txt`: ZapTrack Feeds, módulo de eventos externos, mapa de módulos horizontais e verticais.
- `pasted_content_11.txt`: visão “organismo conversacional”, ZapCore, ZapAI, ZapOps, ZapCRM, ZapMetrics, ZapFlow e ZapAgents.
- `pasted_content_12.txt`: PRD base, catálogo de indicadores e recomendações práticas para MVP, UX, dados, monetização e KPIs internos.
- `pasted_content_13.txt`: backlog técnico v4.1.2, visão 360°, feed, dashboards, alertas, preditivos, copiloto e roadmap de 12 meses.

## 2. Evolução de produto observada

1. O ponto de partida é uma ferramenta de análise de conversas do WhatsApp.
2. O produto evolui para uma plataforma de estruturação semântica: mensagem → intenção/entidade → objeto de gestão → indicador/insight → ação.
3. Em seguida, torna-se um cockpit de gestão com empresas, contatos, locais, feed, dashboards e relatórios.
4. Depois, expande-se para motor de eventos externos e métricas de SaaS.
5. A visão mais recente passa a incluir um ecossistema completo com agentes de atendimento que conversam com clientes, além de ZapOps, ZapCRM, ZapMetrics e ZapFlow.
6. Paralelamente, a marca evolui para um movimento cultural (“A Revolução das Conversas”), com campanha, comunidade e programa de agentes/fundadores.

## 3. Núcleo consistente em quase todos os materiais

- Problema: informações e compromissos relevantes ficam dispersos em conversas, grupos e sistemas.
- Promessa: transformar conversa não estruturada em informação estruturada e acionável.
- Loop central: capturar → entender → estruturar → priorizar → agir → aprender.
- Ativos de produto recorrentes: indexação, busca, objetos de gestão, feed/timeline, resumos, alertas, indicadores e integração.
- Diferencial pretendido: contexto conversacional + inteligência transversal + ação, em vez de apenas armazenamento ou atendimento.
- Princípio de UX maduro: não começar com “zero interface”; começar com interface cognitiva/educadora, confirmação, explicabilidade e reversão.

## 4. Promessas que aparecem, mas não estão comprovadas no corpus

- “Primeiro” painel ou primeira IA organizacional conversacional nativa do WhatsApp.
- “IA proprietária”.
- Identificação de 90% das oportunidades.
- Redução de 70% do tempo de resposta.
- Conversão 2x maior em contatos WhatsApp.
- Redução de churn em 35%.
- Resultados visíveis em 30 dias.
- Ausência de risco de banimento.
- Escalabilidade universal de PME a enterprise.

Essas afirmações devem ser tratadas como hipóteses de marketing até haver fonte, método, amostra, período, definição do indicador e caso autorizado.

## 5. Contradições e riscos de definição

### 5.1 Nome e arquitetura

Os materiais alternam ZapTrack e ZapStack. Em alguns trechos ZapTrack é o produto inteiro; em outros, é apenas o cérebro analítico dentro do ecossistema ZapStack. Isso é uma decisão de arquitetura de marca, não apenas um detalhe editorial.

### 5.2 Categoria de produto

A documentação alterna entre inteligência conversacional, CRM leve, BI, gestão de tarefas, monitor de WhatsApp, plataforma de eventos, SaaS metrics e sistema de agentes. Essas categorias têm compradores, ciclos de venda, concorrentes, riscos e métricas diferentes.

### 5.3 Canal e ingestão

A conexão aparece como QR Code/bridge/WebSocket local em alguns materiais e como WhatsApp Business API em outros. Não são equivalentes em estabilidade, governança, escalabilidade, permissões, experiência de instalação e risco operacional.

### 5.4 Escopo horizontal versus vertical

A visão inclui SaaS, Food/Delivery, Imobiliário, Saúde, Vendas/CRM, Facilities, Franquias, Educação, Finanças, RH, Jurídico, Turismo, Construção e Automotivo. O próprio material recomenda começar por SaaS, Food/Delivery e Imobiliário, mas não define uma tese de beachhead com um ICP primário.

### 5.5 Objetos versus recursos

Em alguns pontos documento e áudio aparecem como objetos de gestão; em outros, mídias/documentos são corretamente tratados como recursos vinculados a objetos. A segunda formulação é mais consistente: documento/áudio é evidência ou artefato, enquanto tarefa, decisão, oportunidade, ocorrência e compromisso têm ciclo de vida gerencial.

### 5.6 Automação versus autonomia

A documentação oscila entre recomendação, execução mediante confirmação, execução automática e agente autônomo. Isso precisa virar uma matriz explícita de níveis de autonomia por tipo de ação e risco.

### 5.7 Métricas e validade

Há muitos indicadores propostos, porém sem dicionário de métricas, denominador, janela temporal, fonte, owner, tolerância de erro e regra de atualização. “Sentimento”, “influência”, “engajamento”, “risco de churn” e “probabilidade de fechamento” são especialmente suscetíveis a falsa precisão.

### 5.8 Test suite

A suíte tem 280 frases, mas a primeira versão contém linguagem genérica, distribuição artificialmente balanceada e pouca representação de contexto, mensagens reais encadeadas, conversas longas, múltiplos falantes, áudio, mídia e classes fora do escopo. Ela é adequada como smoke test/regressão inicial, não como evidência de performance de produção.

### 5.9 Marketing e produto

A campanha promete revolução, pertencimento e transformação cultural antes de a proposta funcional estar suficientemente estreita e comprovada. O movimento pode ser um ativo de marca, mas não substitui ICP, prova de ROI e demonstração clara do produto.

## 6. Melhor evidência de foco já presente

A combinação mais promissora e repetida é:

> Conversas de negócio → sinais de intenção/compromisso/risco → objetos de gestão → próximo passo priorizado.

O “momento de valor” mais claro é encontrar algo que já foi dito, prometido ou perdido e transformar isso em uma ação verificável, com origem na mensagem e possibilidade de correção humana.

## 7. Hipótese de produto mais plausível para auditoria

O produto vencedor provavelmente não é “toda a inteligência conversacional para qualquer setor”, nem um pacote simultâneo de CRM, BI, chatbot, automação, knowledge graph e métricas de SaaS. A hipótese mais forte a testar é um **copiloto de execução para operações comerciais atendidas por WhatsApp**, começando com captura autorizada, busca/contexto, extração de oportunidades/compromissos/tarefas e follow-up supervisionado.

A análise estratégica deve comparar essa hipótese com pelo menos três alternativas: plataforma horizontal de inteligência conversacional, vertical Food/Delivery e ecossistema ZapAgents + ZapTrack.

## 8. Critério de decisão para a recomendação final

A recomendação deverá privilegiar, nesta ordem:

1. Dor frequente e economicamente mensurável.
2. Dados disponíveis e integração viável.
3. Time-to-value curto.
4. Baixo risco regulatório e operacional para começar.
5. Comprador identificável e acesso comercial plausível.
6. Diferenciação demonstrável em uma demo.
7. Reuso técnico para expansão futura.
8. Capacidade de criar retenção por histórico, contexto e workflow.

O resultado final deverá separar claramente: visão de longo prazo, produto de entrada, módulos posteriores, mensagens de marketing comprováveis e claims que precisam de validação.
