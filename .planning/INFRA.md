# ZapTrail — Infrastructure

## Stack (Option A — Recommended)
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **UI**: React + Tailwind + shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Storage, RLS, Edge Functions, Realtime)
- **Vector Search**: pgvector (within Supabase Postgres)
- **Jobs/Workflows**: Inngest
- **AI**: AI SDK with primary provider + fallback
- **WhatsApp**: WhatsApp Business Platform oficial (webhook + Baileys spike)
- **Storage**: Supabase Storage (media metadata, not bytes in DB)
- **Deploy**: Vercel para web/API + serviços gerenciados
- **Analytics**: PostHog (com minimização de dados de conversa)

## Infra Dependencies
- Supabase project (local development or Free tier)
- Node.js v20+ with pnpm
- pnpm (strictly — never npm or yarn)
- NVM for node version management
- RTK (Rust Token Killer) hook registered globally
- GSD Core framework (.planning/ directory)
- .env.local with APP_MODE=demo

## Supabase Configuration
- Local development: `supabase start`
- Free tier: https://supabase.com
- Required extensions: pgvector
- RLS policies: by tenant_id on all tables
- Edge Functions: for webhook processing

## Key Infrastructure Decisions (Fechado)
- Single app, single DB, single pipeline (no microservices)
- No K8s, no Kafka, no knowledge graph in v1
- English identifiers only (per global_rules.md §9)
- MockProvider first, UAZAPI spike depois, alternativa se falhar
- RLS by tenant_id on all tables
- Immutable messages, audit logs, configurable retention
- Abstention when confidence low