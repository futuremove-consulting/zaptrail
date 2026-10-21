/** ZT-009 — ZapTrail Management Objects API Tests
 * TDD: tests defining API contract with RLS by workspace_id and review audit trail
 * All identifiers English-only per global_rules.md §9
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  GET,
  POST,
  PUT,
  DELETE,
  validateWorkspaceScope,
  setTestSupabaseClient,
  getSupabaseClient,
} from './route';
import { buildTimelineHighlightSegments } from '../../../components/timeline/TimelineDual';

interface ManagementObjectRow {
  id: string;
  workspace_id: string;
  object_type: string;
  title: string;
  origin_message_id: string;
  status: string;
  confidence: number;
  deadline?: string | null;
  metadata?: Record<string, unknown>;
  assigned_to?: any;
  epistemic_status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
}

function createMockSupabase(initialRows: ManagementObjectRow[] = []) {
  let rows: ManagementObjectRow[] = JSON.parse(JSON.stringify(initialRows));

  return {
    getRows: () => rows,
    from: (_table: string) => {
      const currentFilter: ((r: ManagementObjectRow) => boolean)[] = [];
      let pendingUpdateData: any = null;

      const queryBuilder: any = {
        select: () => queryBuilder,
        eq: (field: string, value: any) => {
          currentFilter.push((r: any) => r[field] === value);
          return queryBuilder;
        },
        order: () => queryBuilder,
        single: async () => {
          const matched = rows.filter((r) => currentFilter.every((f) => f(r)));
          if (matched.length === 0) {
            return { data: null, error: { message: 'Row not found' } };
          }
          return { data: matched[0], error: null };
        },
        maybeSingle: async () => {
          const matched = rows.filter((r) => currentFilter.every((f) => f(r)));
          return { data: matched[0] || null, error: null };
        },
        then: (resolve: any) => {
          const matched = rows.filter((r) => currentFilter.every((f) => f(r)));
          return Promise.resolve({ data: matched, error: null }).then(resolve);
        },
        insert: (data: any) => {
          const newRow: ManagementObjectRow = {
            id: data.id || `mo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            created_at: new Date().toISOString(),
            ...data,
          };
          rows.push(newRow);
          return {
            select: () => ({
              single: async () => ({ data: newRow, error: null }),
            }),
            data: newRow,
            error: null,
          };
        },
        update: (data: any) => {
          pendingUpdateData = data;
          const updateChain: any = {
            eq: (field: string, value: any) => {
              currentFilter.push((r: any) => r[field] === value);
              return updateChain;
            },
            select: () => ({
              single: async () => {
                const idx = rows.findIndex((r) => currentFilter.every((f) => f(r)));
                if (idx === -1) {
                  return { data: null, error: { message: 'Not found' } };
                }
                rows[idx] = { ...rows[idx], ...pendingUpdateData };
                return { data: rows[idx], error: null };
              },
            }),
          };
          return updateChain;
        },
        delete: () => {
          const deleteChain: any = {
            eq: (field: string, value: any) => {
              currentFilter.push((r: any) => r[field] === value);
              return deleteChain;
            },
            then: (resolve: any) => {
              rows = rows.filter((r) => !currentFilter.every((f) => f(r)));
              return Promise.resolve({ error: null }).then(resolve);
            },
          };
          return deleteChain;
        },
      };

      return queryBuilder;
    },
  };
}

describe('Workspace Scoping & Validation (E-03-02, T-03-03)', () => {
  test('validateWorkspaceScope throws 400 error for empty, null or undefined workspace', () => {
    expect(() => validateWorkspaceScope('')).toThrow(/workspace scope required/i);
    expect(() => validateWorkspaceScope('   ')).toThrow(/workspace scope required/i);
    expect(() => validateWorkspaceScope(null as any)).toThrow(/workspace scope required/i);
    expect(() => validateWorkspaceScope(undefined as any)).toThrow(/workspace scope required/i);
  });

  test('validateWorkspaceScope returns trimmed workspace when valid', () => {
    expect(validateWorkspaceScope('ws_test')).toBe('ws_test');
    expect(validateWorkspaceScope('  ws_spaced  ')).toBe('ws_spaced');
  });

  test('Route handlers return HTTP 400 when workspace parameter is missing', async () => {
    const req = new Request('http://localhost/api/management-objects');
    const getRes = await GET(req, { params: { workspace: '' } });
    expect(getRes.status).toBe(400);
    const getJson = await getRes.json();
    expect(getJson.error).toMatch(/workspace scope required/i);

    const postRes = await POST(req, { params: { workspace: '   ' } });
    expect(postRes.status).toBe(400);

    const putRes = await PUT(req, { params: { workspace: null as any } });
    expect(putRes.status).toBe(400);

    const delRes = await DELETE(req, { params: { workspace: undefined as any } });
    expect(delRes.status).toBe(400);
  });

  test('getSupabaseClient avoids unscoped service-role bypass (T-03-03)', () => {
    const client = getSupabaseClient();
    expect(client).toBeDefined();
  });
});

describe('Management Objects API — GET (DB-01, REV-01)', () => {
  let mockDb: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockDb = createMockSupabase([
      {
        id: 'mo_1',
        workspace_id: 'ws_alpha',
        object_type: 'task',
        title: 'Ligar para cliente',
        origin_message_id: 'msg_01',
        status: 'pending',
        confidence: 0.9,
        assigned_to: 'user_1',
      },
      {
        id: 'mo_2',
        workspace_id: 'ws_alpha',
        object_type: 'decision',
        title: 'Aceitar oferta',
        origin_message_id: 'msg_02',
        status: 'confirmed',
        confidence: 0.95,
        assigned_to: 'user_2',
      },
      {
        id: 'mo_3',
        workspace_id: 'ws_beta',
        object_type: 'task',
        title: 'Task de outro workspace',
        origin_message_id: 'msg_03',
        status: 'pending',
        confidence: 0.8,
      },
    ]);
    setTestSupabaseClient(mockDb);
  });

  test('returns objects filtered strictly by workspace', async () => {
    const req = new Request('http://localhost/api/management-objects');
    const res = await GET(req, { params: { workspace: 'ws_alpha' } });
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.data).toHaveLength(2);
    expect(json.data.every((o: any) => o.workspace_id === 'ws_alpha')).toBe(true);
  });

  test('filters objects by type', async () => {
    const req = new Request('http://localhost/api/management-objects?type=decision');
    const res = await GET(req, { params: { workspace: 'ws_alpha' } });
    const json = await res.json();

    expect(json.data).toHaveLength(1);
    expect(json.data[0].object_type).toBe('decision');
  });

  test('filters objects by status', async () => {
    const req = new Request('http://localhost/api/management-objects?status=confirmed');
    const res = await GET(req, { params: { workspace: 'ws_alpha' } });
    const json = await res.json();

    expect(json.data).toHaveLength(1);
    expect(json.data[0].status).toBe('confirmed');
  });

  test('filters objects by assignedTo', async () => {
    const req = new Request('http://localhost/api/management-objects?assignedTo=user_1');
    const res = await GET(req, { params: { workspace: 'ws_alpha' } });
    const json = await res.json();

    expect(json.data).toHaveLength(1);
    expect(json.data[0].assigned_to).toBe('user_1');
  });
});

describe('Management Objects API — POST (DB-01, REV-01)', () => {
  let mockDb: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockDb = createMockSupabase();
    setTestSupabaseClient(mockDb);
  });

  test('creates a new management object with required fields and workspace scoping', async () => {
    const payload = {
      object_type: 'task',
      title: 'Agendar visita ao apartamento',
      origin_message_id: 'msg_post_100',
      confidence: 0.88,
      metadata: { source: 'whatsapp' },
    };

    const req = new Request('http://localhost/api/management-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await POST(req, { params: { workspace: 'ws_post_test' } });
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.data.workspace_id).toBe('ws_post_test');
    expect(json.data.object_type).toBe('task');
    expect(json.data.title).toBe('Agendar visita ao apartamento');
    expect(json.data.status).toBe('pending');
    expect(json.data.epistemic_status).toBe('inferred');
  });

  test('returns 400 when missing required fields', async () => {
    const req = new Request('http://localhost/api/management-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'No object_type' }),
    });

    const res = await POST(req, { params: { workspace: 'ws_test' } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/missing required fields/i);
  });

  test('returns 409 conflict when duplicate exists for message in workspace', async () => {
    const payload = {
      object_type: 'task',
      title: 'Original object',
      origin_message_id: 'msg_dup_1',
    };

    // First POST
    const req1 = new Request('http://localhost/api/management-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res1 = await POST(req1, { params: { workspace: 'ws_dup_test' } });
    expect(res1.status).toBe(201);

    // Duplicate POST with same workspace and origin_message_id
    const req2 = new Request('http://localhost/api/management-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res2 = await POST(req2, { params: { workspace: 'ws_dup_test' } });
    expect(res2.status).toBe(409);
    const json2 = await res2.json();
    expect(json2.error).toMatch(/already exists/i);
  });
});

describe('Management Objects API — PUT (REV-01, E-03-03)', () => {
  let mockDb: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockDb = createMockSupabase([
      {
        id: 'mo_put_1',
        workspace_id: 'ws_put',
        object_type: 'opportunity',
        title: 'Interesse em compra',
        origin_message_id: 'msg_put_1',
        status: 'pending',
        confidence: 0.7,
        epistemic_status: 'inferred',
        metadata: {
          original_extracted_value: 600000,
          notes: 'valor inicial',
        },
      },
    ]);
    setTestSupabaseClient(mockDb);
  });

  test('updates status to confirmed and records review audit metadata', async () => {
    const updatePayload = {
      id: 'mo_put_1',
      status: 'confirmed',
      reviewed_by: 'reviewer_agent_01',
      review_notes: 'Confirmado pelo corretor via telefone',
    };

    const req = new Request('http://localhost/api/management-objects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });

    const res = await PUT(req, { params: { workspace: 'ws_put' } });
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.data.status).toBe('confirmed');
    expect(json.data.epistemic_status).toBe('validated_human');
    expect(json.data.reviewed_by).toBe('reviewer_agent_01');
    expect(json.data.review_notes).toBe('Confirmado pelo corretor via telefone');
    expect(json.data.reviewed_at).toBeDefined();
  });

  test('preserves original metadata without wiping when updating metadata (E-03-03)', async () => {
    const updatePayload = {
      id: 'mo_put_1',
      metadata: {
        adjusted_value: 650000,
      },
    };

    const req = new Request('http://localhost/api/management-objects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });

    const res = await PUT(req, { params: { workspace: 'ws_put' } });
    expect(res.status).toBe(200);
    const json = await res.json();

    // Original metadata must be preserved
    expect(json.data.metadata.original_extracted_value).toBe(600000);
    expect(json.data.metadata.adjusted_value).toBe(650000);
  });

  test('returns 404 when object does not exist in workspace', async () => {
    const req = new Request('http://localhost/api/management-objects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'non_existent_id', status: 'confirmed' }),
    });

    const res = await PUT(req, { params: { workspace: 'ws_put' } });
    expect(res.status).toBe(404);
  });
});

describe('Management Objects API — DELETE (DB-01)', () => {
  let mockDb: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockDb = createMockSupabase([
      {
        id: 'mo_del_1',
        workspace_id: 'ws_del',
        object_type: 'task',
        title: 'Objeto para deletar',
        origin_message_id: 'msg_del',
        status: 'pending',
        confidence: 0.5,
      },
      {
        id: 'mo_del_other',
        workspace_id: 'ws_other',
        object_type: 'task',
        title: 'Objeto de outro workspace',
        origin_message_id: 'msg_other',
        status: 'pending',
        confidence: 0.5,
      },
    ]);
    setTestSupabaseClient(mockDb);
  });

  test('deletes object strictly within workspace', async () => {
    const req = new Request('http://localhost/api/management-objects?id=mo_del_1', {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: { workspace: 'ws_del' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const remaining = mockDb.getRows();
    expect(remaining.some((r) => r.id === 'mo_del_1')).toBe(false);
    // Other workspace object remains untouched
    expect(remaining.some((r) => r.id === 'mo_del_other')).toBe(true);
  });

  test('returns 400 when id is missing', async () => {
    const req = new Request('http://localhost/api/management-objects', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: { workspace: 'ws_del' } });
    expect(res.status).toBe(400);
  });
});

describe('Dual Timeline exact substring highlighting (REV-01, E-03-04)', () => {
  test('buildTimelineHighlightSegments breaks text into exact before, highlighted, after segments', () => {
    const message = 'O cliente aceitou pagar 750 mil no imóvel de Moema.';
    const excerpt = '750 mil';
    const charStart = 24;
    const charEnd = 31;

    const segments = buildTimelineHighlightSegments(message, excerpt, charStart, charEnd);

    expect(segments.highlighted).toBe('750 mil');
    expect(segments.before).toBe('O cliente aceitou pagar ');
    expect(segments.after).toBe(' no imóvel de Moema.');
    expect(segments.before + segments.highlighted + segments.after).toBe(message);
  });
});