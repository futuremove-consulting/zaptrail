# ZapTrack — auditoria de produto, arquitetura, IA, dados e execução

## 1. Diagnóstico de produto

O desenho atual é intelectualmente consistente, mas operacionalmente grande demais. Há uma cadeia correta — captura, entendimento, estruturação, priorização e ação — porém muitos produtos são tratados como se fossem apenas módulos de uma mesma entrega: indexador, buscador, resumo, feed, dashboards, CRM, tarefas, métricas de SaaS, eventos externos, agentes de atendimento, automações e knowledge graph.

O maior risco é construir uma plataforma que impressiona em demonstração, mas não resolve uma rotina inteira com confiabilidade. O MVP deve ser definido pelo **loop de valor completo**, e não pela quantidade de telas ou modelos:

> **Uma conversa autorizada entra; um item importante é encontrado; a IA explica o que entendeu; o usuário confirma ou corrige; um próximo passo é criado; e o resultado pode ser acompanhado.**

## 2. Produto recomendado para a primeira versão

A primeira versão deve ser um **Copiloto de Conversas para Execução Comercial e Operacional**. Ele não deve tentar ser um CRM completo, um sistema de BI, um chatbot autônomo ou uma plataforma universal de métricas.

| Componente | MVP recomendado | Fora do MVP |
|---|---|---|
| Fonte | Um canal de WhatsApp com ingestão autorizada e um caminho de importação controlado | Todos os canais simultâneos, bridge genérica e sincronização universal |
| Unidades capturadas | Conversa, mensagem, contato, empresa/local | Comunidades complexas e grafo social completo |
| Entendimento | Intenção, entidade, sentimento básico, tarefa, decisão, oportunidade, compromisso, risco operacional | Preditivo de churn, influência social, humor organizacional e compliance automático |
| Saída | Feed de exceções, busca, resumo acionável e objetos rastreáveis | 12 formatos de resumo, storytelling avançado e dashboards extensos |
| Ação | Criar/editar tarefa, definir responsável, prazo, status e lembrete | Execução autônoma irreversível, cobrança, negociação ou promessa ao cliente |
| Confiança | Evidência da mensagem, score calibrado, explicação, confirmação e desfazer | “IA decide” sem supervisão |
| Integrações | Uma integração operacional prioritária e exportação simples | ERP/CRM/marketing/financeiro/analytics simultâneos |
| Interface | Inbox/feed cognitivo + detalhe da conversa + painel de pendências | Ecossistema com vários produtos e sidebars para cada módulo |

O objeto principal não deve ser “sentimento” ou “insight”. Deve ser o **próximo passo verificável**. Sentimento e insight servem para priorizar, explicar ou enriquecer a decisão; não devem ser o centro do produto.

## 3. Arquitetura recomendada

A arquitetura conceitual atual pode ser preservada, mas deve ser reduzida a camadas técnicas claras. A separação abaixo evita que nomes de marca virem serviços prematuros.

| Camada | Responsabilidade | Regra de desenho |
|---|---|---|
| Ingestão | Receber mensagens/eventos, validar origem e persistir payload bruto | O dado original é imutável e tem origem rastreável |
| Normalização | Padronizar idioma, timestamps, tipos de mídia e identificadores | Nunca destruir o conteúdo bruto |
| Enriquecimento | Transcrever, OCR, extrair entidades e classificar intenções | Cada saída tem modelo, versão, timestamp e confiança |
| Contexto | Recuperar histórico, empresa, contato, conversa e objetos relacionados | Contexto limitado por tenant, permissão e janela necessária |
| Orquestração | Transformar sinais em propostas de objetos e recomendações | Ações de risco passam por confirmação |
| Aplicação | Exibir feed, busca, objetos, pendências e evidências | A interface mostra “o que, por quê e o que fazer” |
| Ação | Criar tarefa, notificar, exportar ou chamar integração | Toda ação tem idempotência, log e reversão quando possível |
| Aprendizado | Capturar correções, feedbacks, resultados e erros | Feedback do usuário não significa retreino automático imediato |

O motor de eventos externos, a busca semântica, os resumos e os objetos devem compartilhar uma infraestrutura, mas não precisam virar produtos ou marcas independentes no início. A prioridade é uma arquitetura modular internamente e uma experiência unificada externamente.

## 4. Modelo de dados: correções indispensáveis

O modelo conceitual é um bom ponto de partida, mas ainda não sustenta auditoria, confiança e evolução de modelos. É necessário separar claramente **fato bruto**, **interpretação da IA**, **objeto de gestão** e **ação executada**.

| Entidade | Papel | Campos indispensáveis |
|---|---|---|
| Tenant/Workspace | Isolamento organizacional | id, plano, região, status, configurações, políticas de retenção |
| Usuário/Membro | Identidade e permissão | id, tenant_id, papel, permissões, status, último acesso |
| Fonte/Conector | Origem dos dados | tipo, conta, status, escopos, credenciais referenciadas, última sincronização |
| Local/Conversa | Contexto da interação | id externo, tipo, canal, participantes, período, status, política de inclusão |
| Contato | Pessoa ou identidade externa | ids externos, nome, telefone mascarado/criptografado, empresa, consentimento/relacionamento |
| Mensagem | Evidência bruta | conteúdo original, tipo, timestamp, autor, mensagem-pai, hash, origem, mídia, retenção |
| Análise | Saída de modelo | tipo, valor, confidence, model_version, prompt/config_version, timestamp, evidências |
| Objeto de Gestão | Item rastreável | tipo, título, origem, status, prioridade, prazo, owner, confidence, created_by, updated_by |
| Relação | Conexão explícita | sujeito, predicado, objeto, origem, confiança, validade temporal |
| Ação | Tentativa de produzir efeito | tipo, destino, payload, autorização, idempotency_key, status, erro, reversão |
| Feedback | Correção ou avaliação humana | usuário, alvo, decisão, motivo, timestamp, impacto no modelo |
| Auditoria | Registro de mudança e acesso | ator, evento, entidade, antes/depois, motivo, IP/cliente quando aplicável |

A mensagem nunca deve ser sobrescrita por uma versão “limpa”. A análise pode ser substituída por uma nova versão, mas a anterior precisa continuar disponível para auditoria e comparação. A origem deve chegar ao nível de **mensagem ou intervalo de mensagens**, não apenas ao nível da conversa.

## 5. Objetos de gestão: taxonomia operacional

A lista atual mistura objetos com recursos, indicadores e conclusões. Uma separação mais rigorosa é:

| Classe | Exemplos | Tem ciclo de vida? | Deve gerar ação? |
|---|---|---:|---:|
| Evidência | Mensagem, áudio, imagem, documento, link | Não, é registro de origem | Não diretamente |
| Entidade | Pessoa, empresa, conversa, pedido, imóvel, contrato | Sim, conforme domínio | Indiretamente |
| Trabalho | Tarefa, follow-up, ocorrência, atendimento | Sim | Sim |
| Compromisso | Promessa, decisão, prazo, aprovação | Sim | Sim, com cuidado |
| Oportunidade | Lead, oportunidade comercial, renovação | Sim | Sim |
| Estado/risco | Atraso, pendência, insatisfação, risco | Sim e temporal | Sim, como alerta/revisão |
| Conhecimento | FAQ, resumo, insight, decisão documentada | Sim, com versão | Normalmente não; recomenda |
| Métrica | Volume, SLA, conversão, tempo de resposta | Janela temporal | Não sozinha |
| Ação executada | Notificação, criação, exportação, chamada de API | Sim, com log | Já é o efeito |

“Documento” e “áudio” devem ser recursos indexáveis vinculados a uma evidência ou objeto; “insight” deve ser uma conclusão versionada com evidências e não um recipiente genérico. A ontologia pode conter relações como “mensagem evidencia tarefa”, “decisão gera tarefa”, “tarefa pertence a empresa” e “alerta decorre de condição”, mas não precisa começar com um knowledge graph completo.

## 6. Pipeline de IA confiável

O pipeline recomendado é híbrido. Modelos generativos podem interpretar linguagem e produzir rascunhos, mas ações críticas precisam de regras, validações de esquema e confirmação humana.

1. **Captura e validação:** aceitar apenas fontes e tipos de dados permitidos; detectar duplicidade e ordem temporal.
2. **Normalização:** resolver timezone, abreviações, erros e formatos sem perder o original.
3. **Segmentação contextual:** agrupar mensagens por conversa, janela e thread; preservar autor, resposta e sequência.
4. **Extração estruturada:** datas, valores, nomes, produtos, pedidos, responsáveis, verbos de compromisso e sinais de risco.
5. **Classificação multilabel:** permitir que uma mensagem tenha, por exemplo, oportunidade e prazo, sem forçar uma única classe.
6. **Resolução de entidade:** ligar “ele”, “o cliente” ou “aquele pedido” ao objeto correto somente quando a confiança e o contexto permitirem.
7. **Geração de objeto:** criar proposta de tarefa, decisão, oportunidade ou alerta com origem, confiança e justificativa.
8. **Política de ação:** decidir entre informar, sugerir, pedir confirmação ou executar automaticamente.
9. **Feedback e avaliação:** registrar aceitação, edição, rejeição, conclusão e resultado de cada objeto.

A saída da IA deve ser estruturada e validada. Nenhum texto gerado deve ser tratado como fato apenas porque parece plausível. Para cada objeto, mostrar: **o que foi detectado, em qual mensagem, qual a confiança, o que está faltando e qual ação é sugerida**.

## 7. Confiança, autonomia e risco

Os materiais estão corretos ao abandonar a ideia de “zero interface” como ponto de partida. O próximo refinamento é tornar a autonomia mensurável.

| Nível | Comportamento | Exemplos adequados |
|---|---|---|
| L0 | Apenas indexa e mostra evidência | Busca e resumo com fonte |
| L1 | Sugere sem alterar estado | “Parece haver uma tarefa; criar?” |
| L2 | Cria rascunho editável | Tarefa com prazo e responsável sugeridos |
| L3 | Executa ação reversível e notifica | Criar tarefa interna, enviar resumo ao gestor |
| L4 | Executa ação externa de baixo risco com política aprovada | Atualizar CRM ou criar ticket idempotente |
| L5 | Interage autonomamente com cliente ou altera condição comercial | Deve ficar fora do primeiro produto |

A autonomia deve depender do tipo de ação, não apenas do plano do cliente. Criar uma tarefa interna não equivale a enviar cobrança, conceder desconto, cancelar serviço, transmitir documento ou falar com um cliente. A experiência precisa possuir confirmação, desfazer, histórico e canal de escalonamento.

## 8. Auditoria da metodologia de testes

A suíte de 280 frases é útil como **teste de fumaça e regressão**, mas não sustenta as metas de precisão e recall apresentadas. A distribuição uniforme entre 14 clusters não representa a distribuição real de uma operação; frases isoladas não medem resolução de contexto; e exemplos sintéticos podem repetir o vocabulário usado para desenhar as regras.

A suíte deve ser reorganizada em camadas:

| Camada | Conteúdo | Objetivo |
|---|---|---|
| Smoke | Frases sintéticas simples | Detectar quebra grosseira |
| Contraste | Pares quase iguais com mudança de negação, ironia ou prazo | Medir sensibilidade a diferenças críticas |
| Contexto | Conversas multi-turno e mensagens dependentes de histórico | Validar resolução temporal e referencial |
| Multimídia | Áudio, imagem, documento, sticker e transcrição imperfeita | Medir degradação por modalidade |
| Produção anonimizada | Amostra real revisada por humanos | Estimar desempenho operacional |
| Fora de escopo | Mensagens não acionáveis ou ambíguas | Medir abstention e não forçar classificação |
| Regressão | Erros históricos e correções | Evitar reincidência |

O conjunto deve ser dividido por conversa, e não por frase aleatória, para evitar vazamento entre treinamento e teste. Deve haver anotação de multilabel, entidades, evidência, ação permitida e grau de ambiguidade. Além de precision e recall, medir **calibração da confiança, taxa de abstention, taxa de aceitação/edição/rejeição, severidade de falso positivo e tempo até ação**.

As metas por macroclasse podem ser mantidas apenas como metas internas provisórias. Não devem virar claims comerciais até que exista conjunto de validação representativo, protocolo documentado e monitoramento pós-lançamento.

## 9. Métricas: remover a falsa precisão

Alguns indicadores propostos são úteis, mas muitos ainda são nomes sem definição operacional. Cada KPI precisa de fórmula, fonte, janela, unidade, denominador, atualização, owner e limitações.

| Indicador | Problema atual | Ajuste recomendado |
|---|---|---|
| Sentimento | Pode confundir tom, contexto e resultado | Exibir como sinal probabilístico, com tendência e evidência |
| Engajamento | Mistura volume e qualidade | Separar atividade, reciprocidade, resposta e ação concluída |
| Influência | Pode incentivar comportamento superficial | Começar com centralidade descritiva, sem rótulos reputacionais |
| Churn | Exige definição de evento e histórico | Não prometer previsão sem rótulos de cancelamento e janela |
| Probabilidade de fechamento | Pode transformar linguagem em certeza | Exibir como hipótese e exigir evidência de etapa |
| Compliance score | Vago e potencialmente perigoso | Substituir por regras de conteúdo, revisão e trilha de auditoria |
| Valor estimado | Pode ser inferência frágil | Mostrar fonte, moeda, data e nível de confirmação |
| SLA | Depende de início, fim, horário e calendário | Definir evento de início/fim, timezone e exceções |

No MVP, escolher entre 15 e 20 métricas com uso claro. Uma lista inicial plausível inclui mensagens recebidas, conversas ativas, itens acionáveis detectados, itens aceitos, tarefas abertas, tarefas concluídas, tarefas vencidas, tempo até primeira ação, compromissos pendentes, oportunidades abertas, oportunidades com follow-up, tempo de resposta, alertas úteis, alertas rejeitados, taxa de edição e retorno semanal.

## 10. Canal WhatsApp e ingestão

A decisão de ingestão é uma decisão de produto e risco. Um caminho de QR Code ou bridge local pode acelerar um protótipo privado, mas não deve ser apresentado como fundamento de uma plataforma empresarial sem validação de estabilidade, autorização, continuidade e governança. O produto comercial deve priorizar uma forma oficial e documentada de acesso, com escopos mínimos, sincronização clara e tratamento de falhas.

Enquanto a integração principal não estiver pronta, a validação de valor pode ocorrer com importação controlada de conversas anonimizadas, arquivos exportados ou um conector limitado para piloto. Isso permite testar o núcleo de entendimento e ação sem prometer uma experiência de sincronização em tempo real que ainda não foi provada.

## 11. Segurança, privacidade e governança

Como o produto processa conversas, contatos, áudios, documentos e potenciais dados sensíveis, segurança e privacidade não podem ser um bloco posterior do PRD. Esta é uma orientação de produto e engenharia; a definição de bases legais, contratos, papéis e obrigações deve ser revisada com assessoria jurídica especializada.

Requisitos mínimos de lançamento:

- isolamento rigoroso por tenant e autorização por workspace, local, objeto e ação;
- coleta mínima, escopos explícitos e seleção granular de conversas;
- criptografia em trânsito e em repouso, gestão segura de segredos e rotação;
- retenção configurável, exclusão verificável e exportação dos dados do cliente;
- logs de acesso, processamento, decisão do modelo, alteração e ação externa;
- mascaramento de dados em logs, prompts, ambientes de desenvolvimento e exemplos;
- controle de acesso para mídias, documentos e transcrições;
- política clara sobre uso de dados para melhoria de modelos;
- bloqueio de ações irreversíveis sem confirmação ou política aprovada;
- observabilidade de falhas de ingestão, duplicidade, atraso e perda de eventos;
- processo de resposta a incidente, recuperação e restauração testado;
- explicabilidade suficiente para o usuário contestar uma classificação ou ação;
- mecanismos de abstention: quando a confiança é baixa, o sistema deve pedir contexto ou não agir.

É especialmente arriscado analisar conversas internas para classificar pessoas como “hater”, “detrator”, “influenciador” ou “risco” sem contexto, transparência e finalidade legítima. Gamificação e vigilância de colaboradores devem ser retiradas do MVP.

## 12. Backlog e execução

O backlog é detalhado, mas usa “Core”, “Growth” e “Game Changer” como prioridade sem um critério comum. Além disso, algumas features de alta complexidade aparecem ao lado de funcionalidades básicas como se fossem partes equivalentes do mesmo ciclo.

Uma priorização melhor é por dependência e risco:

| Ordem | Entrega | Critério de saída |
|---:|---|---|
| 1 | Workspace, autenticação, permissões e origem | Tenant isolado e auditoria básica |
| 2 | Ingestão/importação, normalização e deduplicação | Mensagens reproduzíveis e rastreáveis |
| 3 | Busca e contexto da conversa | Usuário encontra mensagem e intervalo correto |
| 4 | Extração de tarefa, decisão, oportunidade e prazo | Saída estruturada com evidência e edição |
| 5 | Feed de pendências e detalhe do objeto | Gestor entende o que fazer e por quê |
| 6 | Confirmação, atualização, lembrete e histórico | Ação idempotente, rastreável e reversível quando possível |
| 7 | Resumo acionável e relatório simples | Economia de tempo observável |
| 8 | Feedback, avaliação e monitoramento de qualidade | Correções entram no ciclo de melhoria |
| 9 | Primeira integração de destino | Atualização externa segura e auditável |
| 10 | Verticalização ou agentes | Apenas após retenção e prova de valor |

O backlog deve ter critérios de sucesso por outcome, não apenas critérios de implementação. “Tela carregou em dois segundos” é uma condição técnica; não prova que o usuário encontrou o que precisava. “Modelo com 80% de precisão” é insuficiente sem especificar classe, contexto, custo de erro e ação consequente.

## 13. Riscos críticos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---:|---:|---|
| Escopo horizontal inviabiliza entrega | Alta | Muito alto | Um ICP, um loop e poucos objetos |
| Integração de WhatsApp instável ou inadequada | Alta | Muito alto | Caminho oficial/comercial; importação para validação |
| Falsos positivos geram ações erradas | Alta | Muito alto | Evidência, abstention, confirmação e níveis de autonomia |
| Feed vira outro backlog | Média/alta | Alto | Priorizar exceções e próxima ação, não volume |
| Métricas de sentimento/influência criam falsa certeza | Alta | Alto | Sinais probabilísticos e escopo reduzido |
| Dados sensíveis expõem a empresa | Alta | Muito alto | Minimização, RBAC, retenção e revisão jurídica |
| Agentes autônomos ampliam superfície de falha | Alta | Muito alto | Produto separado e autonomia progressiva |
| Falta de rótulos reais impede predição | Alta | Alto | Começar com extração/assistência, não previsão |
| Muitos módulos diluem posicionamento | Alta | Alto | Comunicar um produto; modularizar internamente |

## 14. Conclusão técnica da fase

A base técnica mais forte do ZapTrack não é o dashboard nem o agente; é a combinação de **proveniência, contexto, extração estruturada e ação supervisionada**. Se essa fundação funcionar, métricas, verticais, agentes e automações podem ser adicionados progressivamente. Se ela falhar, a expansão apenas multiplicará erros e riscos.

O produto deve começar com uma arquitetura suficientemente geral para acomodar novas verticais, mas com uma experiência e um conjunto de objetos suficientemente estreitos para serem confiáveis. O princípio de engenharia é: **generalizar o modelo de dados, não generalizar prematuramente a promessa comercial**.
