#!/usr/bin/env bash
# ZT-001 — Initialize ZapTrail project
# This script sets up the foundation for the ZapTrail platform.
# Ponytail: minimal, efficient setup using building blocks.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 Initializing ZapTrail project (ZT-001)..."

# 1. Verify rtk is available
if ! command -v rtk &>/dev/null; then
  echo "❌ rtk not found. Please install rtk first."
  exit 1
fi

# 2. Verify .env.local exists
if [ ! -f "$PROJECT_DIR/.env.local" ]; then
  echo "⚠️  .env.local not found. Creating from template..."
  cat > "$PROJECT_DIR/.env.local" <<'EOF'
APP_MODE=demo
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
  echo "✅ .env.local created. Please configure Supabase credentials."
fi

# 3. Verify .planning structure exists
if [ ! -d "$PROJECT_DIR/.planning" ]; then
  echo "❌ .planning directory not found. Please run project onboarding first."
  exit 1
fi

# 4. Verify key planning files
for f in PROJECT_MAP.md DECISIONS.md roadmap/master.md config.json; do
  if [ ! -f "$PROJECT_DIR/.planning/$f" ]; then
    echo "❌ Missing .planning/$f. Please complete project onboarding."
    exit 1
  fi
done

# 5. Install dependencies (pnpm)
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "📦 Installing dependencies with pnpm..."
  cd "$PROJECT_DIR" && pnpm install
fi

# 6. Verify git repo
if [ ! -d "$PROJECT_DIR/.git" ]; then
  echo "� initializing git repository..."
  cd "$PROJECT_DIR" && git init
  git branch -m main
  git config user.email "zaptrail@zaptrail.com"
  git config user.name "ZapTrail"
  echo "Initial commit will be created after first file changes."
fi

# 7. Summary
echo ""
echo "✅ ZT-001 foundation complete."
echo ""
echo "Next steps:"
echo "  1. Configure Supabase credentials in .env.local"
echo "  2. Run: pnpm supabase:init (ZT-002)"
echo "  3. Review .planning/DECISIONS.md and .planning/PROJECT_MAP.md"
echo ""
echo "📝 Remember: All identifiers must be English-only per global_rules.md §9"
echo "               gestao_object is invalid — use: Task, Decision, Opportunity, Commitment, Alert"