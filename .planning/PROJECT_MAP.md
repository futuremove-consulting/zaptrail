# ZapTrail — Project Map

## Domain
ZapTrail transforms authorized conversations into trackable management objects (tasks, decisions, opportunities, commitments, alerts) with evidence, ownership, and deadlines. Target: SMBs using WhatsApp for sales/service who lose follow-ups.

## Entity Graph
UserAccount → Workspace → {AgentConnection, SourceConnection}
AgentConnection ↔ WhatsApp conversations → Semantic pipeline → Management objects
Workspace → Projects → Timelines → Objects → Evidence

Key entities:
- UserAccount: User identity in ZapTrail
- Workspace: Data scope, relationships, projects, permissions
- AgentConnection: WhatsApp number for agent conversation
- SourceConnection: WhatsApp number for message indexing
- Conversation: 1:1 or group chat history
- Management Object: Task, Decision, Opportunity, Commitment, Alert
- Evidence: Original message, metadata, confidence score
- Project: Container for related objects and timelines

## Critical Paths
1. User onboarding → SourceConnection setup → AgentConnection identification
2. Import/converse → Semantic analysis → Object extraction with evidence
3. Object presentation → User confirmation/editing → Feed update
4. Agent read-only queries → Context retrieval → Structured response
5. Deep link handoff → Application context loading → Timeline/Object view

## Project Gotchas
- Nomenclature: All identifiers must be English-only (no Portuguese mixing)
- `gestao_object` is invalid — use English: Task, Decision, Opportunity, Commitment, Alert
- Two-mode interaction: WhatsApp (mobile, low attention) vs Web (desktop, analysis)
- Agent is read-only first; no external irreversible actions in MVP
- MockProvider first, then UAZAPI spike, then alternatives
- Single tenant, single DB, managed services only (no K8s, no Kafka, no microservices)
- RLS by tenant_id, immutable messages, audit logs, configurable retention