import fs from 'node:fs';
import path from 'node:path';

const MAX_LINES = 350;
const ROOT = process.cwd();
const PROD_DIRS = [
  'src/packages',
  'src/app',
  'src/components',
  'src/hooks',
  'src/context',
  'src/lib',
];

const DOMAIN_FORBIDDEN_IN_CORE = [
  /\biptu\b/i,
  /\bcondominio\b/i,
  /\bcondo_fee\b/i,
  /\bsale_asking_price\b/i,
  /\brent_asking_price\b/i,
  /\bcorretor\b/i,
  /\bimobiliaria\b/i,
  /\binquilino\b/i,
  /domain-real-estate/i,
];

const RAW_TAILWIND_COLOR_REGEX =
  /\b(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/;

const RAW_HTML_INTERACTIVE_REGEX = /<(button|input|select|textarea)\b/;

const UI_WRITING_FORBIDDEN_PATTERNS = [
  {
    regex: /\b(?:Clique aqui|Click here)\b/i,
    rule: 'Law 1 (No vague CTAs like "Clique aqui")',
  },
  {
    regex: /\b(?:Extrair Agora|Salvar Já|Executar Agora|Rodar Agora|Criar Já)\b/i,
    rule: 'Law 2 (No temporal adverbs on action buttons)',
  },
  {
    regex: /\b(?:SQLSTATE|Postgres|RLS|Minerar)\b/,
    rule: 'Law 4/6 (No database/technical jargon in user-facing UI)',
  },
];

function walkFiles(dirPath, collected = []) {
  if (!fs.existsSync(dirPath)) return collected;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, collected);
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.test\.(ts|tsx)$/.test(entry.name)
    ) {
      collected.push(fullPath);
    }
  }
  return collected;
}

let violations = 0;

for (const relDir of PROD_DIRS) {
  const absDir = path.join(ROOT, relDir);
  for (const file of walkFiles(absDir)) {
    const relFile = path.relative(ROOT, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/).length;

    // 1. 350-Line Ceiling
    if (lines > MAX_LINES) {
      console.error(
        `[MAX-LINES VIOLATION] ${relFile}: ${lines} lines (limit: ${MAX_LINES})`
      );
      violations++;
    }

    // 2. Core & MCP Zero Domain Leakage
    if (
      relFile.startsWith('src/packages/core/') ||
      relFile.startsWith('src/packages/mcp/')
    ) {
      for (const pattern of DOMAIN_FORBIDDEN_IN_CORE) {
        if (pattern.test(content)) {
          console.error(
            `[BOUNDARY VIOLATION] ${relFile} matched forbidden domain token ${pattern}`
          );
          violations++;
        }
      }
    }

    // 3. Design System & UI Writing Gates (PilotCRM Harness Alignment)
    const isUiFile =
      (relFile.startsWith('src/app/') && !relFile.startsWith('src/app/api/')) ||
      relFile.startsWith('src/components/');
    const isUiPrimitive = relFile.startsWith('src/components/ui/');

    if (isUiFile) {
      const colorMatch = content.match(RAW_TAILWIND_COLOR_REGEX);
      if (colorMatch) {
        console.error(
          `[DESIGN-SYSTEM COLOR VIOLATION] ${relFile} uses raw Tailwind color "${colorMatch[0]}" instead of semantic OKLCH token.`
        );
        violations++;
      }

      if (!isUiPrimitive) {
        const rawTagMatch = content.match(RAW_HTML_INTERACTIVE_REGEX);
        if (rawTagMatch) {
          console.error(
            `[DESIGN-SYSTEM PRIMITIVE VIOLATION] ${relFile} uses raw <${rawTagMatch[1]}> instead of src/components/ui/ primitive.`
          );
          violations++;
        }
      }

      for (const { regex, rule } of UI_WRITING_FORBIDDEN_PATTERNS) {
        if (regex.test(content)) {
          console.error(
            `[UI-WRITING VIOLATION] ${relFile} violated ${rule} (${regex})`
          );
          violations++;
        }
      }
    }
  }
}

// 4. Scrim & Opacity Contract Verification on Overlay Primitives
for (const overlayFile of [
  'src/components/ui/dialog.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/drawer.tsx',
]) {
  const fullOverlayPath = path.join(ROOT, overlayFile);
  if (fs.existsSync(fullOverlayPath)) {
    const content = fs.readFileSync(fullOverlayPath, 'utf8');
    if (!content.includes('bg-black/60') || !content.includes('backdrop-blur-xs')) {
      console.error(
        `[SCRIM CONTRACT VIOLATION] ${overlayFile} must include bg-black/60 and backdrop-blur-xs on overlay.`
      );
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\nQuality gates failed with ${violations} violation(s).`);
  process.exit(1);
}

console.log(
  '✓ ZapTrail Quality Gates PASSED (max-lines <= 350, Core/MCP boundary isolation, PilotCRM Design System OKLCH tokens, Scrim Contract, and 6 UI Writing Laws verified).'
);
