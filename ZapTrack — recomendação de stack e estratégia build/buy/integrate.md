# ZapTrack — recomendação de stack e estratégia build/buy/integrate

## 1. Decisão resumida

Para uma versão independente e comercial do ZapTrack, a stack recomendada é:

> **Next.js + TypeScript + Supabase/Postgres + pgvector + Inngest + AI SDK + WhatsApp Business Platform oficial + object storage gerenciado.**

Essa escolha mantém uma aplicação única, um banco único, uma camada de jobs, um gateway de modelos e poucos serviços especializados. Supabase reúne Postgres, autenticação, RLS, storage, realtime, APIs e vetores em uma mesma plataforma.[1] Inngest cobre funções disparadas por eventos, cron ou webhook, com retries, steps e execução durável sem exigir uma fila/workflow engine própria.[2] O AI SDK oferece uma interface comum para múltiplos provedores e saída estruturada validada por schema.[3] A Meta documenta webhooks oficiais para mensagens e outros eventos da WhatsApp Business Platform, com retries e possibilidade de duplicidade que precisam ser tratados pelo produto.[4]

## 2. Stack recomendada

| Camada | Escolha | Decisão opinativa |
|---|---|---|
| Aplicação web | Next.js com App Router | Uma aplicação para marketing, onboarding e produto; evitar frontend e backend separados no início. |
| Linguagem | TypeScript | Tipagem compartilhada entre UI, API, jobs, schemas e objetos de gestão. |
| UI | React + Tailwind + shadcn/ui | Componentes prontos; customizar apenas Feed, Evidência e Objeto. |
| API | Route Handlers + Server Actions | Contratos pequenos; não criar REST genérico para tudo. |
| Validação | Zod | Um schema para input, output de IA e comandos de domínio. |
| Banco | Supabase Postgres | Fonte única de verdade, relacional e portátil. |
| Autorização | Supabase Auth + RLS | Isolamento por workspace na borda e no banco. |
| ORM/acesso | Supabase client + SQL/RPC tipado | Evitar duplicar abstrações com ORM no primeiro ciclo. |
| Busca | Postgres FTS + pgvector | Busca lexical e semântica no mesmo banco; sem vector DB dedicado. |
| Arquivos | Supabase Storage | Mensagens de mídia guardam metadados e referência, não bytes no banco. |
| Jobs | Inngest | Ingestão, IA, transcrição, digest, retries e workflows longos. |
| IA | AI SDK + um provedor primário + fallback | Interface agnóstica sem construir camada própria de modelos. |
| Extração | JSON Schema/Zod + classificação multilabel | A saída de IA vira objeto validado, não texto solto. |
| WhatsApp | WhatsApp Business Platform/Cloud API oficial | Webhook rápido, persistência, deduplicação e processamento assíncrono. |
| Transcrição | Serviço gerenciado de speech-to-text | Começar com um único provedor; abstrair apenas a interface. |
| Observabilidade | Sentry + logs estruturados + métricas do job runner | Comprar visibilidade; não criar observabilidade caseira. |
| Deploy | Vercel para web/API + serviços gerenciados | Zero operação de cluster; separar worker somente se necessário. |
| Analytics de produto | PostHog ou ferramenta equivalente, com minimização | Medir ativação e retenção sem enviar conteúdo bruto de conversa. |

## 3. Opções viáveis

A decisão depende de o objetivo principal ser **portabilidade independente** ou **velocidade de construção dentro do ambiente Manus**. As duas opções abaixo preservam o mesmo modelo de domínio; muda o conjunto de blocos gerenciados.

| Abordagem | Tradeoffs | Custo | Complexidade de setup |
|---|---|---|---|
| **A. Next.js + Supabase + Inngest** | Mais portátil, familiar para o ecossistema SaaS e forte em Postgres/RLS; exige configurar contas, secrets, deploy e integrações externas. | Baixo a médio no início; varia por uso de banco, jobs, storage, IA e WhatsApp. | Média |
| **B. Stack gerenciada do ambiente Manus**: React/Vite + Express/tRPC + Drizzle/TiDB/MySQL + S3 + OAuth e LLM integrados | Mais rápida para prototipar dentro do ambiente atual e reduz setup operacional; fica mais acoplada ao ambiente e usa um banco diferente do desenho Supabase/Postgres. | Baixo para iniciar; depende de uso do ambiente e chamadas de IA. | **Baixa** |
| C. Low-code/automation-first | Muito rápida para validar uma demo; baixa durabilidade, governança e controle do pipeline semântico; tende a espalhar estado entre ferramentas. | Baixo para protótipo, potencialmente médio/alto quando volume e workflows crescem. | Muito baixa no início; alta na manutenção |

### Escolha recomendada

Para o **piloto de 90 dias dentro do ambiente Manus**, escolheria a opção B se a prioridade absoluta for velocidade e menor operação. Para um produto que será desenvolvido e operado como ativo independente, escolheria a opção A. A regra é não misturar A e B no mesmo projeto: escolha um banco, um sistema de auth, um modelo de API e um caminho de deploy.

Independentemente da opção, a arquitetura de domínio deve ser a mesma. O que não pode mudar é: `workspace → conversa → mensagem → análise → objeto de gestão → ação → feedback`.

## 4. Build, buy e integrate

| Componente | Estratégia | Motivo |
|---|---|---|
| Autenticação e sessão | **Buy** | Commodity e área de risco; não criar auth própria. |
| Banco, migrations e RLS | **Buy + configure** | Usar Postgres gerenciado e políticas explícitas. |
| Storage de mídia | **Buy** | Não armazenar bytes no banco. |
| Fila, retries e cron | **Buy** | Evitar construir worker, retry e scheduler próprios. |
| UI base | **Buy/use building blocks** | shadcn/ui/Tailwind; customizar só a experiência distintiva. |
| Modelos de linguagem | **Integrate** | Um provedor principal e um fallback através de interface comum. |
| Speech-to-text/OCR | **Integrate** | Serviço gerenciado, com opção de desativar por workspace. |
| WhatsApp | **Integrate** | API oficial; não depender de automação de navegador como base comercial. |
| Semântica de negócio | **Build** | Principal ativo proprietário do ZapTrack. |
| Taxonomia/ontologia | **Build** | Deve refletir o modelo de gestão e as relações do produto. |
| Proveniência e evidência | **Build** | Principal mecanismo de confiança e diferenciação. |
| Ranking de atenção | **Build, inicialmente simples** | Regras explícitas antes de ML sofisticado. |
| Objetos de gestão | **Build** | Núcleo da proposta “conversas viram gestão”. |
| Autorização de ações | **Build + policy engine leve** | Decidir informar, sugerir, confirmar ou executar. |
| CRM, ERP e delivery | **Integrate** | Não substituir sistemas transacionais no início. |
| Dashboards avançados | **Build depois** | Primeiro medir pendências, ações e resultados; depois expandir. |
| Knowledge graph | **Defer** | Só quando relações e consultas exigirem. |
| Agentes autônomos | **Defer/separar** | Outro produto, com risco maior de ação externa. |

## 5. Organização do repositório

A aplicação deve seguir um monólito modular, com módulos de domínio claros:

```text
src/
  app/
    (marketing)/
    (app)/
      attention/
      conversations/
      objects/
      workspaces/
      settings/
    api/
      webhooks/whatsapp/
      actions/
  components/
    ui/
    attention-feed/
    conversation-evidence/
    management-object/
  server/
    auth/
    connectors/
    ingestion/
    context/
    semantics/
    objects/
    actions/
    search/
    evaluation/
    audit/
  jobs/
    ingest-message.ts
    process-conversation.ts
    build-object-proposals.ts
    send-digest.ts
  db/
    schema.sql
    migrations/
    policies.sql
  shared/
    domain-schemas.ts
    event-contracts.ts
    object-types.ts
    priorities.ts
```

Os nomes mudam na opção Manus, mas a separação deve permanecer. O código de domínio não deve depender diretamente da UI; e a UI não deve montar objetos de gestão a partir de respostas livres de LLM.

## 6. Decisões técnicas opinativas

### 6.1 Não usar microserviços no início

Uma aplicação e um banco reduzem coordenação, deploy, observabilidade e falhas distribuídas. A modularidade fica no código e nos contratos. Extrair um worker ou gateway só depois de uma restrição real de escala, runtime ou segurança.

### 6.2 Não usar vector database dedicado

Busca semântica e filtros por tenant, conversa, empresa, status e período precisam conviver com dados relacionais. Começar com pgvector permite manter embeddings próximos da fonte de verdade. Um motor separado somente será justificado por volume, latência ou carga comprovados.

### 6.3 Não usar workflow builder genérico

O ZapTrack deve oferecer alguns fluxos opinativos: analisar, propor objeto, confirmar, delegar, lembrar e concluir. Um construtor “if this then that” transforma simplicidade em configuração e deve ficar para uma fase posterior.

### 6.4 Não expor escolha de modelo ao usuário

A aplicação deve escolher o modelo por política interna: triagem barata, extração confiável, geração mais capaz quando necessário. Usuário final não deve escolher entre modelos, temperature, prompt ou embedding.

### 6.5 Uma linguagem de domínio para todos os módulos

Termos como `conversation`, `message`, `evidence`, `analysis`, `management_object`, `action`, `feedback` e `audit_log` devem ser usados de forma consistente. “Insight”, “alerta”, “tarefa” e “decisão” não podem significar coisas diferentes em cada vertical.

## 7. Forma correta de processar eventos

O endpoint de webhook deve fazer somente autenticação da origem, validação básica, deduplicação inicial, persistência do payload e resposta rápida. A Meta documenta retries de entrega e possibilidade de notificações duplicadas; portanto, a tabela de mensagens precisa de uma chave única por identificador externo e o processamento precisa ser idempotente.[4]

Depois da persistência, o job assíncrono executa normalização, segmentação, transcrição/OCR se permitido, extração, classificação, resolução de contexto, proposta de objeto e atualização do feed. Toda execução recebe `correlation_id`, `job_run_id`, versão de pipeline e registro de custo/latência.

## 8. Deployment por estágio

| Estágio | Deployment recomendado |
|---|---|
| Exploração | Importação controlada, ambiente de desenvolvimento e dados anonimizados. |
| Piloto | Aplicação web gerenciada, Postgres gerenciado, jobs assíncronos e um conector limitado. |
| Primeiros clientes | Permissões completas, retenção/exclusão, auditoria, monitoramento e backup testado. |
| Escala | Worker de mídia/IA separado apenas se o perfil de carga exigir; conectores por domínio e limites de concorrência. |

Não criar um cluster Kubernetes, data lake ou arquitetura distribuída para o primeiro ciclo. A simplicidade operacional é parte do produto.

## 9. Referências técnicas

[1]: https://supabase.com/ — Supabase, Postgres, Authentication, Storage, Realtime, Edge Functions e Vector.

[2]: https://www.inngest.com/docs/learn/inngest-functions — Inngest, funções duráveis, eventos, cron, retries e steps.

[3]: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data — AI SDK, geração de dados estruturados e validação por schema.

[4]: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview — Meta for Developers, Webhooks da WhatsApp Business Platform.
