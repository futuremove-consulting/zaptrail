# ZapTrack — escopo e requisitos semânticos

## Requisito central

O ZapTrack deve transformar atividade conversacional em uma representação gerencial consultável, explicável e acionável. A cobertura precisa incluir interações entre a organização e clientes, prospects, colaboradores, gestores, sócios, parceiros, fornecedores, prestadores, grupos e comunidades.

## Conteúdo a cobrir

A estrutura deve representar, no mínimo, mensagens, conversas, grupos, pessoas, empresas, equipes, locais, documentos, áudios, imagens, links, solicitações, informações, perguntas, decisões, aprovações, recusas, negociações, compromissos, agendamentos, reuniões, ligações, visitas, vendas, compras, pedidos, contratações, contratos, cobranças, pagamentos, entregas, envios, cancelamentos, reagendamentos, reclamações, elogios, avaliações, riscos, exceções, tarefas, projetos, métricas, indicadores, alertas, ações e resultados.

## Restrições conceituais

1. Taxonomia, ontologia, vocabulário e modelo de dados devem ser distinguidos.
2. Intenção não pode ser confundida com evento, estado, objeto ou ação executada.
3. Uma mensagem pode gerar múltiplos eventos e objetos.
4. Um evento relevante pode não gerar objeto de gestão.
5. Evidência precisa ser preservada e ligada às inferências.
6. Estado e transição precisam ser explícitos.
7. Papéis e relações entre participantes precisam ser modelados por contexto.
8. Dados de origem, interpretações e projeções gerenciais devem ter proveniência e versionamento.
9. A estrutura deve aceitar `other/unknown` e abstention.
10. A expansão deve ocorrer por composição e configuração versionada, não por explosão de telas ou agentes.

## Produto dual

O agente no WhatsApp consulta e opera o conhecimento estruturado; a aplicação externa permite exploração profunda, revisão, configuração, métricas, permissões e auditoria. Ambos devem usar os mesmos contratos e a mesma fonte de verdade.

## Critérios de qualidade

A modelagem final deve ser semanticamente coerente, expressiva, implementável em Postgres, compatível com busca textual e vetorial, adequada ao processamento por LLM e regras, auditável e simples o suficiente para um MVP evolutivo.

## Critérios de cobertura

A qualidade deve ser avaliada separadamente em detecção, ato linguístico, ação de negócio, objeto, estado, ator/contraparte, tempo, valor, evidência, próximo passo e risco. A estrutura deve suportar português brasileiro, regionalismos, abreviações, mensagens encadeadas, multi-intenção, áudio e mídias.
