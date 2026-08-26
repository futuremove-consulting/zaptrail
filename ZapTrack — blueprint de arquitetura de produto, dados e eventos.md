# ZapTrack — blueprint de arquitetura de produto, dados e eventos

## 1. Arquitetura escolhida

A arquitetura recomendada é um **monólito modular orientado a eventos**, com uma aplicação web, um banco Postgres gerenciado, object storage, busca híbrida no próprio Postgres e um orquestrador gerenciado de jobs.

Isso não é um monólito desorganizado. É uma única unidade de deploy com módulos internos e contratos explícitos. A separação existe no código e nos dados; a distribuição em microserviços só aparece quando houver um motivo operacional comprovado.

## 2. Módulos internos

| Módulo | Responsabilidade | Deve ser proprietário? |
|---|---|---:|
| Identity & Workspace | Usuários, membros, papéis, permissões e isolamento de tenant | Parcial |
| Connectors | Fontes, credenciais referenciadas, escopos, sync e status | Parcial |
| Ingestion | Webhooks/importação, deduplicação e persistência de payload bruto | Sim |
| Conversation Context | Conversas, participantes, threads, entidades e histórico | Sim |
| Semantic Processing | Normalização, extração, classificação, embeddings e confiança | Sim |
| Management Objects | Tarefas, decisões, oportunidades, compromissos e alertas | **Sim** |
| Action & Automation | Confirmação, criação, delegação, lembrete, integração e reversão | **Sim** |
| Search & Feed | Busca híbrida, ranking, filtros e feed de atenção | Sim |
| Insights & Metrics | Métricas descritivas, tendências e explicações | Parcial |
| Evaluation & Audit | Feedback, versões, qualidade, logs e trilha de auditoria | **Sim** |

O núcleo proprietário é composto por **contexto, semântica, objetos, proveniência, confiança e ação**. Autenticação, storage, filas, observabilidade, componentes de UI e modelos de linguagem devem ser aproveitados de blocos prontos.

## 3. Fluxo canônico

```text
Fonte autorizada/importação
          |
          v
Endpoint de ingestão -> evento bruto imutável -> deduplicação
          |
          v
Conversa e mensagens persistidas
          |
          v
Job assíncrono de processamento
  normalizar -> segmentar -> enriquecer -> extrair -> classificar
          |
          v
Contexto + evidências + confiança
          |
          v
Proposta de objeto de gestão
          |
          v
Feed de atenção -> aceitar / editar / rejeitar / pedir contexto
          |
          v
Objeto persistido -> ação interna/externa -> log e auditoria
          |
          v
Feedback + resultado -> avaliação e melhoria
```

## 4. Fonte de verdade e eventos

O Postgres é a fonte de verdade. Não adotar event sourcing completo. Persistir os fatos essenciais em tabelas relacionais e manter um ledger append-only apenas para eventos importantes de integração, processamento e ação.

Eventos internos canônicos:

| Evento | Disparado quando | Consumidores |
|---|---|---|
| `source.connected` | Fonte autorizada foi conectada | Sync/status |
| `message.received` | Mensagem nova ou importada foi persistida | Dedupe/processamento |
| `conversation.ready` | Janela de conversa está pronta para análise | Pipeline semântico |
| `analysis.completed` | Extração/classificação terminou | Propostas/feed |
| `object.proposed` | IA gerou objeto candidato | UI/notificação |
| `object.accepted` | Usuário aceitou ou editou | Ação/avaliação |
| `object.completed` | Trabalho foi concluído | Métricas/feedback |
| `action.requested` | Ação foi autorizada | Worker de ação |
| `action.succeeded` / `action.failed` | Ação terminou | UI/auditoria/retry |
| `feedback.recorded` | Usuário avaliou saída | Avaliação e tuning |

Cada evento deve possuir `event_id`, `event_type`, `schema_version`, `tenant_id`, `occurred_at`, `actor`, `correlation_id`, `idempotency_key` e referência para a entidade afetada. Webhooks e workers devem ser idempotentes.

## 5. Modelo de dados mínimo

| Tabela | Conteúdo |
|---|---|
| `workspaces` | Organização, plano, status e políticas de retenção |
| `workspace_members` | Usuário, papel e permissões |
| `connectors` | Fonte, tipo, escopo, status, última sincronização e referência de segredo |
| `conversations` | Canal, id externo, tipo, status e intervalo temporal |
| `conversation_participants` | Relação entre conversa e contato |
| `contacts` | Identidade externa, nome, empresa e atributos mínimos |
| `companies` | Empresa e dados mestres mínimos |
| `messages` | Conteúdo bruto, autor, timestamp, thread, tipo, hash e origem |
| `attachments` | Key de storage, MIME, tamanho, checksum, transcrição/OCR e retenção |
| `analyses` | Tipo, valor estruturado, confiança, versão do modelo/configuração e evidência |
| `entities` | Pessoa, empresa, produto, valor, prazo, pedido, contrato e resolução |
| `management_objects` | Tipo, título, status, prioridade, prazo, owner, confiança e origem |
| `object_relations` | Relações entre mensagens, entidades, objetos e empresas |
| `actions` | Tipo, destino, payload, autorização, estado, erro e reversão |
| `feedback` | Aceite, edição, rejeição, motivo e usuário |
| `audit_logs` | Acesso, alteração, processamento, decisão e ação externa |
| `job_runs` | Execução, tentativa, duração, estado, erro e correlation id |

A tabela `management_objects` deve ser polimórfica apenas no tipo, não no comportamento. Todos os objetos compartilham campos de ciclo de vida; campos específicos podem ficar em JSONB no início, com validação por schema. Se um domínio se provar, seus campos podem migrar para tabelas especializadas.

## 6. Estratégia de busca

Começar com busca lexical do Postgres e busca vetorial via pgvector no mesmo banco. A consulta híbrida combina correspondência textual, similaridade semântica, recência, relevância do objeto e permissões do usuário.

Não introduzir Elasticsearch, OpenSearch ou um vector database dedicado no MVP. Eles só entram quando volume, latência, filtros ou isolamento de carga demonstrarem necessidade concreta.

Todo resultado de busca deve retornar `source_message_id` ou intervalo de mensagens. Nenhum insight deve aparecer sem link de evidência.

## 7. Estratégia de processamento

O caminho síncrono deve fazer somente validação, autenticação, persistência e resposta rápida. Transcrição, OCR, embeddings, classificação, resumo e geração de objetos acontecem em jobs assíncronos com retries, timeout, backoff, concorrência controlada e registro de custo/latência.

O pipeline deve ser reexecutável por `conversation_id` e versão de processamento. Isso permite corrigir regras, reprocessar uma conversa e comparar versões sem perder histórico.

## 8. Frontend e experiência

A aplicação tem três superfícies principais:

1. **Feed de atenção:** “o que mudou”, “o que está em risco”, “o que ficou pendente” e “o que requer confirmação”.
2. **Contexto da conversa:** mensagens de origem, resumo, participantes, entidades e objetos derivados.
3. **Objeto de gestão:** status, owner, prazo, evidência, confiança, relações, histórico e ação.

A navegação deve ser pequena: Início/Minha atenção, Conversas, Objetos, Empresas/Contatos e Configurações. Relatórios e verticais entram depois. A UI deve ser opinionated: defaults fortes, filtros simples, confirmação clara e baixa configuração inicial.

## 9. Anticipatory design operacional

O sistema deve antecipar apenas com base em evidência suficiente. O ranking de atenção pode combinar impacto, urgência, recência, risco, ausência de resposta e proximidade do prazo, mas precisa exibir uma explicação humana e permitir correção.

Os defaults recomendados são:

- agrupar mensagens relacionadas em uma janela de contexto;
- sugerir prazo somente quando houver expressão temporal confiável;
- sugerir owner por participante ou equipe quando houver evidência;
- priorizar pendência vencida, promessa sem confirmação e reclamação sem resposta;
- consolidar notificações em digest quando não houver risco alto;
- evitar alertas repetidos para o mesmo problema;
- pedir confirmação quando a ação for externa, financeira, comercial ou irreversível.

## 10. Fronteira para microserviços

Não criar serviços separados no início. Extrair um módulo somente quando houver um motivo claro, como escala independente, limite de runtime, segurança isolada, necessidade de tecnologia diferente ou falha de confiabilidade.

A primeira extração plausível, se necessária, seria um worker de processamento de mídia/IA. A segunda poderia ser um gateway de conectores. O core de objetos, contexto e auditoria deve continuar centralizado enquanto o produto aprende.

## 11. Fronteira para o ecossistema futuro

ZapTrack permanece como produto externo. ZapAgents, ZapOps, ZapCRM, ZapMetrics e ZapFlow são camadas futuras ou nomes internos. Todos devem consumir contratos do núcleo: mensagens, análises, objetos, relações, ações e feedback.

A arquitetura, portanto, é extensível por **eventos e tipos de objeto**, não por uma proliferação inicial de aplicações.
