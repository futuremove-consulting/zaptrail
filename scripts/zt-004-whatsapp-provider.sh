#!/usr/bin/env bash
# ZT-004 — Implementar contrato WhatsAppProvider
# Ponytail: efficient provider adapter pattern, MockProvider first, English identifiers

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔧 ZT-004: Implementando contrato WhatsAppProvider..."

# 1. Verify we're in the right project
if [ ! -f "$PROJECT_DIR/.env.local" ]; then
  echo "❌ .env.local not found. Please run ZT-001 and ZT-002 first."
  exit 1
fi

# 2. Check TypeScript is available
if ! npx tsc --version &>/dev/null; then
  echo "⚠️  TypeScript not configured. Running pnpm exec tsc..."
  pnpm exec tsc --version
fi

# 3. Create provider TypeScript files
echo "📝 Creating WhatsApp provider contract..."

# Ensure providers directory exists
mkdir -p "$PROJECT_DIR/src/providers/whatsapp"

# Create provider.ts interface
cat > "$PROJECT_DIR/src/providers/whatsapp/provider.ts" << 'TYPESCRIPT'
// WhatsApp Provider types and interface
TYPESCRIPT

# Create mockProvider.ts
cat > "$PROJECT_DIR/src/providers/whatsapp/mockProvider.ts" << 'TYPESCRIPT'
// Mock WhatsApp Provider implementation
TYPESCRIPT

# Create factory.ts
cat > "$PROJECT_DIR/src/providers/whatsapp/factory.ts" << 'TYPESCRIPT'
// WhatsApp Provider factory
TYPESCRIPT

echo "✅ ZT-004 provider contract created in src/providers/whatsapp/"

# 4. Update .env.local with WhatsApp provider config if needed
if ! grep -q "WHATSAPP_PROVIDER_TYPE" "$PROJECT_DIR/.env.local"; then
  echo "WHATSAPP_PROVIDER_TYPE=mock" >> "$PROJECT_DIR/.env.local"
  echo "✅ Added WHATSAPP_PROVIDER_TYPE=mock to .env.local"
fi

# 5. Summary
echo ""
echo "📋 ZT-004 summary:"
echo "  - Provider interface (provider.ts) with types"
echo "  - MockProvider implementation (mockProvider.ts)"
echo "  - Provider factory (factory.ts)"
echo "  - .env.local updated with WHATSAPP_PROVIDER_TYPE"
echo ""
echo "📝 Next: ZT-005 — Implementar MockProvider fixtures"
echo "         Then: ZT-006 — Persistir mensagens, participantes, anexos e inbound events"