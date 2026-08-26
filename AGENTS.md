# ZapTrail — Agent Instructions

You are working on ZapTrail, a platform that transforms authorized conversations into objects of management rastreáveis (trackable).

**Objective**: Transform conversations authorized by the user into trackable management objects (Task, Decision, Opportunity, Commitment, Alert) with evidence, ownership, and deadlines.

**Core Thesis**: Conversations contain opportunities, commitments, decisions, pending items that normally get lost. AI transforms these into trackable actions with owner, deadline, evidence, history.

**ICP**: SMBs using WhatsApp for sales/service who lose follow-ups.

**Nomenclature**: All identifiers must be English-only. `gestao_object` is invalid — use English terms: Task, Decision, Opportunity, Commitment, Alert.

**Canonical Architectural Decisions** (all Fechado / frozen):
- Marca: ZapTrail; ZapTrack é histórico
- Dois momentos: WhatsApp = mobilidade/baixa atenção; Web responsiva = análise, revisão, operação
- Frontend externo: Web responsiva mobile-first, excelente no notebook; app nativo não é prioridade
- Fonte de verdade: Backend e banco compartilhados por agente e aplicação
- Identidade: UserAccount, Workspace, AgentConnection e SourceConnection separados
- Provider: Adapter substituível; MockProvider primeiro; spike UAZAPI depois; alternativa se falhar
- Banco: Relacional, grafo lógico e proveniência; sem Neo4j no MVP
- IA: Server-side adapter, saída estruturada, evidência, confiança e revisão
- Objetos iniciais: Task, Decision, Opportunity, Commitment, Alert
- Interface principal: Agora, Conversas/Grupos, Empresas/Pessoas, Projetos, Timeline e Controle
- Timeline: Conversa original + timeline semântica + "Mostrar na conversa"
- Agente: Read-only primeiro; mutações internas limitadas e confirmadas; nenhuma ação externa irreversível
- Custo inicial: Mock/local/Supabase Free para provar valor; custo real de provider depois

**Build-first Principle**: "Pronto antes de customizado" — use building blocks (Supabase, shadcn/ui, pgvector) before custom solutions.

**Key Constraints**: No microservices, no Kafka, no K8s, no knowledge graph, no autonomous agents in v1. Single responsive web app. Single DB. Managed services. English identifiers only.

**Security/Governance**: RLS by tenant_id, immutable messages, audit logs, configurable retention, export, encryption, secret rotation, abstention when confidence low.

**Roadmap Horizons**:
- 0-30d: Proof of problem (import CSV, AI extraction, basic inbox, one tenant)
- 31-60d: Prototyp usable (WhatsApp import/Baileys, full AI pipeline, confirmation flow, RLS)
- 61-90d: Pilot with 3-5 companies (real conversations, feedback loop, quality metrics, first paid sign-ups)
- 3-6mo: Paid product (stable connector, permissions, retention/exclusion, simple reports, pricing)
- 6-12mo: Controlled expansion (second domain, limited external integrations, low-risk automations)
- 12+mo: Platform (verticals, supervised agents, specific metrics, knowledge graph when needed)

**First Request to Opencode**: Limited to foundation and contracts (ZT-001 to ZT-005). Not to "build the entire ZapTrail".

**Implementation Priority** (P0 to P3):
- P0: Congelar produto e ADRs, criar repositório e contratos, MockProvider + fixtures, timeline dual com evidência, segurança/RLS/idempotência
- P1: Spike UAZAPI, integração real limitada, agente read-only, piloto com usuários
- P2: confirmações internas e projetos, calendário e Kanban
- P3: app nativo, múltiplas fontes e automações (após evidência de demanda e escala)