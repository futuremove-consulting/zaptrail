#!/usr/bin/env bash
# ZT-002 — Configure Supabase local/Free and environment secure
# Ponytail: use building blocks (Supabase Free tier) before custom solutions.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.local"

echo "🔧 Configuring Supabase for ZapTrail (ZT-002)..."

# 1. Verify .env.local exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.local not found. Creating template..."
  cat > "$ENV_FILE" <<'ENVEOF'
# ZT-001 (already set)
APP_MODE=demo

# ZT-002: Supabase configuration
# These values should be replaced with your actual Supabase project credentials
# Get them from: https://supabase.com/dashboard -> Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ENVEOF
  echo "✅ .env.local created. Please configure Supabase credentials."
  exit 1
fi

# 2. Verify required Supabase env vars are configured (not placeholder values)
SUPABASE_URL_SET=$(grep -c 'NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | head -1)
SUPABASE_ANON_KEY_SET=$(grep -c 'NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_FILE" | head -1)
SUPABASE_SERVICE_KEY_SET=$(grep -c 'SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | head -1)

if [ "$SUPABASE_URL_SET" -eq 0 ] || [ "$SUPABASE_ANON_KEY_SET" -eq 0 ] || [ "$SUPABASE_SERVICE_KEY_SET" -eq 0 ]; then
  echo "⚠️  Supabase environment variables not fully configured in .env.local"
  echo "   Please add:"
  echo "   - NEXT_PUBLIC_SUPABASE_URL"
  echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "   - SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Check if values are placeholders
SUPABASE_URL_VAL=$(grep 'NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
SUPABASE_ANON_KEY_VAL=$(grep 'NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
SUPABASE_SERVICE_VAL=$(grep 'SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [[ "$SUPABASE_URL_VAL" == "your-project"* ]] || [[ "$SUPABASE_ANON_KEY_VAL" == "your_anon"* ]] || [[ "$SUPABASE_SERVICE_VAL" == "your_service"* ]]; then
  echo "⚠️  Supabase credentials appear to be placeholder values."
  echo "   Please replace with actual Supabase project credentials."
  echo "   1. Create a Supabase project at https://supabase.com"
  echo "   2. Go to Settings → API"
  echo "   3. Copy the Project URL and anon public key"
  echo "   4. Copy the service_role key (keep secret!)"
  exit 1
fi

# 3. Verify Supabase project is accessible (optional - requires network)
echo "✅ Supabase environment variables configured in .env.local"
echo ""
echo "📋 Supabase setup summary:"
echo "   URL: $SUPABASE_URL_VAL"
echo "   Keys: configured (keep service_role key secret!)"
echo ""
echo "📝 Next steps (run when Docker is available):"
echo "   1. Run: supabase start    (requires Docker)"
echo "   2. Run: supabase db reset  (apply migrations)"
echo "   3. Run: supabase status   (verify services running)"
echo ""
echo "🔒 Security reminder: Never commit the service_role key to public repos."
echo "   Use environment variables or Vercel/Supabase secret management in production."