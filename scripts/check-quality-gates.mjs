import fs from 'node:fs';
import path from 'node:path';

const MAX_LINES = 350;
const ROOT = process.cwd();
const PROD_DIRS = ['src/packages', 'src/app', 'src/components', 'src/providers', 'src/semantic'];

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

function walkFiles(dirPath, collected = []) {
  if (!fs.existsSync(dirPath)) return collected;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, collected);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
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

    if (lines > MAX_LINES) {
      console.error(`[MAX-LINES VIOLATION] ${relFile}: ${lines} lines (limit: ${MAX_LINES})`);
      violations++;
    }

    if (relFile.startsWith('src/packages/core/') || relFile.startsWith('src/packages/mcp/')) {
      for (const pattern of DOMAIN_FORBIDDEN_IN_CORE) {
        if (pattern.test(content)) {
          console.error(`[BOUNDARY VIOLATION] ${relFile} matched forbidden domain token ${pattern}`);
          violations++;
        }
      }
    }
  }
}

if (violations > 0) {
  console.error(`\nQuality gates failed with ${violations} violation(s).`);
  process.exit(1);
}

console.log('✓ ZapTrail Quality Gates PASSED (max-lines <= 350 & domain boundary isolation verified).');
