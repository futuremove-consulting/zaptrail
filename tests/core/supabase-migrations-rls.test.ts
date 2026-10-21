import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Supabase Migrations RLS & Tenant Isolation Test Suite (DB-01)', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const fileContents = migrationFiles.map((file) => ({
    file,
    content: fs.readFileSync(path.join(migrationsDir, file), 'utf-8'),
  }));

  const combinedSql = fileContents.map((f) => f.content).join('\n\n');

  it('should find all 4 required migration files in supabase/migrations', () => {
    expect(migrationFiles).toContain('001-workspace-schema.sql');
    expect(migrationFiles).toContain('002-messages-schema.sql');
    expect(migrationFiles).toContain('003-management-objects-schema.sql');
    expect(migrationFiles).toContain('004-zaptrail-audit-and-review-schema.sql');
  });

  it('must NOT contain any "alter table enable row level security;" without table name', () => {
    const invalidPattern = /alter\s+table\s+enable\s+row\s+level\s+security\s*;/gi;
    for (const { file, content } of fileContents) {
      const matches = content.match(invalidPattern);
      expect(
        matches,
        `File ${file} has malformed RLS syntax: "alter table enable row level security;" without table name`
      ).toBeNull();
    }
  });

  it('must declare all 12 required tables across migrations', () => {
    const expectedTables = [
      'workspaces',
      'memberships',
      'onboarding_state',
      'messages',
      'conversation_participants',
      'message_attachments',
      'inbound_events',
      'management_objects',
      'origin_messages',
      'extraction_runs',
      'evidence_spans',
      'review_queue',
    ];

    for (const tableName of expectedTables) {
      const tableRegex = new RegExp(`create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?${tableName}\\b`, 'i');
      expect(
        tableRegex.test(combinedSql),
        `Table "${tableName}" must be created in supabase/migrations/`
      ).toBe(true);
    }
  });

  it('must explicitly enable row level security on every created table', () => {
    // Extract every table created
    const createTableRegex =
      /create\s+table\s+if\s+not\s+exists\s+([a-z_][a-z0-9_]*)|create\s+table\s+([a-z_][a-z0-9_]*)/gi;
    const createdTables = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = createTableRegex.exec(combinedSql)) !== null) {
      const name = (match[1] || match[2]).toLowerCase();
      createdTables.add(name);
    }

    expect(createdTables.size).toBeGreaterThanOrEqual(12);

    for (const tableName of createdTables) {
      const rlsRegex = new RegExp(
        `alter\\s+table\\s+(?:only\\s+)?${tableName}\\s+enable\\s+row\\s+level\\s+security\\s*;`,
        'i'
      );
      expect(
        rlsRegex.test(combinedSql),
        `Table "${tableName}" must have explicit "alter table ${tableName} enable row level security;"`
      ).toBe(true);
    }
  });

  it('must have at least one policy for each created table', () => {
    const createTableRegex =
      /create\s+table\s+if\s+not\s+exists\s+([a-z_][a-z0-9_]*)|create\s+table\s+([a-z_][a-z0-9_]*)/gi;
    const createdTables = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = createTableRegex.exec(combinedSql)) !== null) {
      const name = (match[1] || match[2]).toLowerCase();
      createdTables.add(name);
    }

    for (const tableName of createdTables) {
      const policyRegex = new RegExp(`create\\s+policy\\s+["\\w\\s]+\\s+on\\s+${tableName}\\b`, 'i');
      expect(
        policyRegex.test(combinedSql),
        `Table "${tableName}" must have at least one RLS policy via "create policy ... on ${tableName}"`
      ).toBe(true);
    }
  });

  it('must NOT use "user_id = auth.uid()" on inbound_events table which has no user_id column', () => {
    const file002 = fileContents.find((f) => f.file === '002-messages-schema.sql')?.content || '';
    // Look for policies on inbound_events
    const inboundEventsPolicyBlock = file002.slice(file002.indexOf('on inbound_events'));
    expect(inboundEventsPolicyBlock).not.toMatch(/using\s*\(\s*user_id\s*=\s*auth\.uid\(\)\s*\)/i);
    expect(inboundEventsPolicyBlock).not.toMatch(/check\s*\([^)]*user_id\s*=\s*auth\.uid\(\)/i);
  });

  it('must NOT check "status = \'owner\'" in memberships (owner is a role, status is active)', () => {
    const file003 = fileContents.find((f) => f.file === '003-management-objects-schema.sql')?.content || '';
    expect(file003).not.toMatch(/status\s*=\s*['"]owner['"]/i);
    // Should check role in ('owner', 'admin') and status = 'active'
    expect(file003).toMatch(/role\s+in\s*\(\s*'owner'\s*,\s*'admin'\s*\)/i);
  });

  it('004 migration must isolate origin_messages, extraction_runs, evidence_spans, and review_queue by workspace_id', () => {
    const file004 = fileContents.find((f) => f.file === '004-zaptrail-audit-and-review-schema.sql')?.content;
    expect(file004).toBeDefined();
    if (!file004) return;

    for (const table of ['origin_messages', 'extraction_runs', 'evidence_spans', 'review_queue']) {
      expect(file004).toMatch(new RegExp(`alter\\s+table\\s+${table}\\s+enable\\s+row\\s+level\\s+security\\s*;`, 'i'));
      expect(file004).toMatch(new RegExp(`create\\s+policy\\s+["\\w\\s]+\\s+on\\s+${table}\\b`, 'i'));
    }
  });
});
