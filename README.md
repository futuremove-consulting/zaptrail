# ZapTrail

Conversations contain opportunities, commitments, decisions, pending items that normally get lost. AI transforms these into trackable actions with owner, deadline, evidence, history.

## ICP
SMBs using WhatsApp for sales/service who lose follow-ups.

## Core Thesis
Conversations → AI extraction → Management objects (Task, Decision, Opportunity, Commitment, Alert) with evidence, ownership, deadlines.

## Two Moments
- **WhatsApp**: Mobilidade, baixa atenção — agente responde perguntas rápidas, recupera pendências, registra novos objetos
- **Web Responsiva**: Análise, revisão, operação — timeline completa, filtros avançados, gestão de objetos, configurações

## Architecture
- Single responsive web app (Next.js + TypeScript + Supabase/Postgres)
- Shared backend and database between agent and application
- Provider adapter pattern: MockProvider first, then UAZAPI, then alternatives
- Management objects in English only: Task, Decision, Opportunity, Commitment, Alert
- English identifiers only (per global standards)

## Roadmap
- 0-30d: Proof of problem
- 31-60d: Prototyp usable
- 61-90d: Pilot with 3-5 companies
- 3-6mo: Paid product
- 6-12mo: Controlled expansion
- 12+mo: Platform

## Getting Started
See `.planning/DECISIONS.md`, `.planning/PROJECT_MAP.md`, and `.planning/roadmap/master.md` for detailed decisions, project map, and roadmap.