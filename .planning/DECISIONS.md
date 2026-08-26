# ZapTrail — Architecture Decision Records

## Canonical Decisions (Fechado / Frozen)

| Tema | Decisão | Status |
|---|---|---:|
| Marca | ZapTrail; ZapTrack fica apenas como histórico | Fechado |
| Dois momentos | WhatsApp para mobilidade e baixa atenção; web responsiva para análise, revisão e operação | Fechado |
| Frontend externo | Web responsiva mobile-first, excelente no notebook; app nativo não é prioridade | Fechado |
| App nativo | Evolução futura, somente se offline, notificações nativas, lojas ou captura avançada provarem necessidade | Fechado |
| Fonte de verdade | Backend e banco compartilhados por agente e aplicação | Fechado |
| Identidade | UserAccount, Workspace, AgentConnection e SourceConnection separados | Fechado |
| Provider | Adapter substituível; MockProvider primeiro; spike UAZAPI depois; alternativa se falhar | Fechado |
| Meta oficial | Não entra no caminho inicial; fica como evolução futura | Fechado para o MVP atual |
| Banco | Relacional, com grafo lógico e proveniência; sem Neo4j no MVP | Fechado |
| IA | Adapter server-side, saída estruturada, evidência, confiança e revisão | Fechado |
| Objetos iniciais | Task, Decision, Opportunity, Commitment, Alert (identificadores em inglês) | Fechado |
| Interface principal | Agora, Conversas/Grupos, Empresas/Pessoas, Projetos, Timeline e Controle | Fechado |
| Timeline | Conversa original + timeline semântica + "Mostrar na conversa" | Fechado |
| Agente | Read-only primeiro; mutações internas limitadas e confirmadas; nenhuma ação externa irreversível | Fechado |
| Custo inicial | Mock/local/Supabase Free para provar valor; custo real de provider depois | Fechado |

## Key Constraints
- No microservices, no Kafka, no K8s, no knowledge graph, no autonomous agents in v1
- Single responsive web app
- Single DB (Supabase/Postgres)
- Managed services only
- English identifiers only (per global_rules.md)
- Security: RLS by tenant_id, immutable messages, audit logs, configurable retention, export, encryption, secret rotation, abstention when confidence low

## Build-first Principle
"Pronto antes de customizado" — use building blocks (Supabase, shadcn/ui, pgvector) before custom solutions.

## Implementation Path (ZT-001 through ZT-014)
- ZT-001: Criar repositório, README, AGENTS.md, scripts e convenções
- ZT-002: Configurar Supabase local/Free e ambiente seguro
- ZT-003: Criar schema de workspace, membership e onboarding state
- ZT-004: Implementar contrato WhatsAppProvider
- ZT-005: Implementar MockProvider
- ZT-006: Persistir mensagens, participantes, anexos e inbound events
- ZT-007: Implementar pipeline semântico mínimo
- ZT-008: Implementar objetos de gestão iniciais (Task, Decision, Opportunity, Commitment, Alert)
- ZT-009: Criar aplicação web mobile-first e timeline dual
- ZT-010: Criar onboarding com MockProvider
- ZT-011: Criar agente simulado read-only
- ZT-012: Executar spike UAZAPI
- ZT-013: Implementar conexão real limitada
- ZT-014: Liberar agente WhatsApp read-only