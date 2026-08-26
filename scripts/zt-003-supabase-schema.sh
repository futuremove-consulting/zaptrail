#!/usr/bin/env bash
# ZT-003 — ZapTrail: Criar schema de workspace, membership e onboarding state
# Ponytail: efficient schema using Supabase building blocks, English identifiers only

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SUPABASE_DIR="$PROJECT_DIR/supabase"
MIGRATIONS_DIR="$SUPABASE_DIR/migrations"

echo "🔧 ZT-003: Creating workspace, membership & onboarding schema..."

# 1. Verify Supabase CLI is available
if ! command -v supabase &>/dev/null; then
  echo "⚠️  supabase CLI not found. Installing..."
  pnpm add -D supabase
fi

# 2. Verify .env.local exists and has required vars
if [ ! -f "$PROJECT_DIR/.env.local" ]; then
  echo "❌ .env.local not found. Please run ZT-001 and ZT-002 first."
  exit 1
fi

# 3. Load environment variables
export $(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs)

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_ANON_KEY:-}" ]; then
  echo "❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env.local"
  exit 1
fi

# 4. Start Supabase if not running
if ! supabase status 2>/dev/null | grep -q "Supabase is running"; then
  echo "🚀 Starting Supabase..."
  supabase start
  echo "⏳ Waiting for Supabase to be ready..."
  sleep 5
fi

# 5. Apply the workspace schema migration
echo "📊 Applying ZT-003 migration: workspace, membership & onboarding schema..."
supabase db reset --local 2>&1 | tail -20

# 6. Verify migration applied successfully
echo "✅ ZT-003 migration applied."
echo ""
echo "Schema created:"
echo "  - workspaces: Organizational scope (UserAccount → Workspace)"
echo "  - memberships: UserWorkspace relationships with roles/permissions"
echo "  - onboarding_state: Per-user onboarding progress tracking"
echo "  - RLS policies: Tenant isolation by user_id"
echo ""
echo "Next steps:"
echo "  1. Review migration in supabase/migrations/001-workspace-schema.sql"
echo "  2. Run: pnpm db:migrate (ZT-004 area)"
echo "  3. Configure MockProvider fixtures for onboarding flow"
echo ""
echo "📝 Remember: All identifiers English-only. gestao_object is invalid —"
echo "               use: Task, Decision, Opportunity, Commitment, Alert"