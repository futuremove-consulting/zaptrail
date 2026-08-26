# ZapTrack — princípios arquiteturais traduzidos em decisões

## 1. Simplicidade genial

Simplicidade não significa poucos recursos isolados; significa um caminho único de valor. O sistema deve ter uma fonte principal de verdade, um modelo canônico de objetos, um pipeline de processamento, uma experiência principal e poucos defaults fortes.

Decisões:

- Uma aplicação web responsiva, não vários produtos no início.
- Um banco relacional como fonte de verdade.
- Uma fila/rotina de jobs gerenciada, sem microserviços independentes.
- Um pipeline canônico: ingestão → contexto → estruturação → objeto → revisão → ação.
- Cinco objetos iniciais: tarefa, decisão, oportunidade, compromisso e alerta/ocorrência.
- Uma interface principal: feed/inbox de itens que exigem atenção, com evidência da conversa.
- Uma forma padrão de criar, editar, delegar e concluir objetos.

## 2. Inteligência pragmática

Usar IA onde existe ambiguidade linguística e contexto; usar código determinístico onde a regra é clara. Não usar um LLM para decidir o que um parser, um schema validator ou uma regra de autorização resolve melhor.

Decisões:

- LLM para extração semântica, classificação multilabel, resumo e redação de recomendações.
- Regras determinísticas para permissões, idempotência, datas, moeda, deduplicação, severidade e ações proibidas.
- Saída de IA sempre em schema validado, com confiança, versão, evidência e possibilidade de abstention.
- Modelos menores/baratos para triagem e extração; modelos melhores somente para casos ambíguos ou geração complexa.
- Nenhuma ação externa crítica baseada somente em texto gerado.

## 3. Anticipatory design

A interface não deve esperar que o usuário pesquise tudo. Deve priorizar o que mudou, o que está em risco, o que está atrasado e o que provavelmente exige ação. Ao mesmo tempo, não deve agir de forma invisível ou irreversível.

Decisões:

- Feed “O que precisa de atenção” em vez de dashboard genérico como tela inicial.
- Cada item deve responder: o que aconteceu, por que importa, qual evidência sustenta isso e qual é o próximo passo.
- Defaults de prioridade, prazo sugerido, responsável provável e lembrete.
- Confirmação para ações sensíveis; execução automática somente em ações internas, reversíveis e aprovadas.
- Notificações agrupadas e digest, evitando ruído contínuo.
- Feedback de útil/não útil, aceitar/editar/rejeitar e desfazer.

## 4. Opinionated software

O produto deve tomar decisões boas pelo usuário em vez de transferir todo o trabalho para configurações. Customização existe depois que um padrão de uso se provar.

Decisões:

- Workspaces, papéis, status, prioridades e tipos de objeto com defaults pré-configurados.
- Taxonomia inicial fixa e editável apenas em limites controlados.
- Poucos filtros essenciais; salvar preferências automaticamente.
- Não oferecer um construtor de workflows genérico no MVP.
- Não pedir que o usuário configure prompt, modelo, vector database, thresholds ou dezenas de regras.
- Mostrar configurações avançadas somente quando o caso exigir.

## 5. Less custom, more building blocks

O núcleo proprietário deve ser a semântica de negócio, a proveniência, a resolução de contexto e o desenho do próximo passo. Tudo que for commodity deve ser comprado, integrado ou usado como serviço gerenciado.

| Problema | Preferência |
|---|---|
| Autenticação | Serviço/infraestrutura gerenciada, sem auth própria |
| Banco relacional | Postgres gerenciado |
| Busca textual | Full-text search do Postgres antes de motor dedicado |
| Busca semântica | pgvector no mesmo banco antes de vector DB separado |
| Arquivos | Object storage gerenciado; banco guarda apenas metadados |
| Jobs e retries | Orquestrador gerenciado de jobs/eventos |
| Observabilidade | Serviço gerenciado de logs, erros e métricas |
| IA | Gateway/provider com saída estruturada, não camada de modelos própria |
| UI | Design system e componentes prontos, customização apenas na experiência central |
| Integrações | APIs oficiais, conectores e webhooks; não browser automation como base comercial |
| Deploy | Plataforma gerenciada; evitar Kubernetes, service mesh e operação de cluster |

## 6. Anti-princípios

Não construir microserviços precoces, Kafka, Kubernetes, data lake, knowledge graph completo, vector database dedicado, sistema de agentes autônomos, workflow builder genérico, observabilidade caseira ou taxonomia universal no primeiro ciclo.

A arquitetura deve permitir evolução sem exigir que esses componentes existam desde o primeiro dia. O objetivo é manter a complexidade acidental baixa e preservar complexidade apenas onde ela cria diferenciação real.
