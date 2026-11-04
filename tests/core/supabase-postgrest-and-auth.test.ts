import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  SupabaseStoragePort,
  PostgrestSupabaseClient,
} from '../../src/packages/core/supabase-storage';
import { interpretRealEstateTurn, coalesceTurnWindow } from '../../src/packages/domain-real-estate';
import { POST as ingestWhatsappPost } from '../../src/app/api/v1/ingest/whatsapp/route';
import { GET as getManagementObjects, setTestSupabaseClient } from '../../src/app/api/management-objects/route';

describe('Decision 4 & 5 + Review Cycle 2: Real Supabase PostgREST Storage, Auth Hardening & Next 16 Params', () => {
  const originalToken = process.env.ZAPTRAIL_API_TOKEN;

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.ZAPTRAIL_API_TOKEN;
    } else {
      process.env.ZAPTRAIL_API_TOKEN = originalToken;
    }
    setTestSupabaseClient(null);
    vi.restoreAllMocks();
  });

  it('persists and queries processed messages AND audit trail (saveEnvelope) via PostgrestSupabaseClient when configured (C2-02)', async () => {
    const calledUrls: string[] = [];
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = String(url);
      calledUrls.push(`${init?.method || 'GET'} ${urlStr}`);
      if (init?.method === 'POST') {
        return new Response(JSON.stringify([{ id: 'row-1' }]), { status: 201 });
      }
      if ((!init?.method || init.method === 'GET') && urlStr.includes('/rest/v1/zaptrail_origin_messages')) {
        return new Response(
          JSON.stringify([
            {
              tenant_id: 'tenant-123',
              provider: 'whatsapp',
              external_message_id: 'msg-ext-1',
            },
          ]),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify([]), { status: 200 });
    });

    const pgClient = new PostgrestSupabaseClient({
      supabaseUrl: 'https://example.supabase.co',
      serviceRoleKey: 'service-role-secret',
      fetchFn: fetchMock as unknown as typeof fetch,
    });

    const writerStorage = new SupabaseStoragePort(pgClient);
    await writerStorage.markProcessed('tenant-123', 'whatsapp', 'msg-ext-1');

    const turn = coalesceTurnWindow({
      tenant_id: 'tenant-123',
      provider: 'whatsapp',
      conversation_id: 'conv-audit-1',
      raw_messages: [
        {
          message_id: 'm1',
          external_message_id: 'msg-ext-1',
          sender_id: '5541999991111',
          direction: 'inbound',
          raw_text: 'Quero vender meu apartamento por 900 mil',
          timestamp: '2026-11-04T10:00:00Z',
        },
      ],
    });
    const env = await interpretRealEstateTurn(turn);
    await writerStorage.saveEnvelope(env);

    // Fresh reader storage simulates cold start reading from PostgREST
    const readerStorage = new SupabaseStoragePort(pgClient);
    const isProc = await readerStorage.isProcessed('tenant-123', 'whatsapp', 'msg-ext-1');

    expect(isProc).toBe(true);
    expect(calledUrls.some((u) => u.includes('/rest/v1/zaptrail_extraction_runs'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/rest/v1/zaptrail_evidence_spans'))).toBe(true);
  });

  it('rejects requests to POST /api/v1/ingest/whatsapp with 401 when ZAPTRAIL_API_TOKEN is set and Bearer token does not match', async () => {
    process.env.ZAPTRAIL_API_TOKEN = 'super-secret-zaptrail-token';

    const badReq = new Request('http://localhost/api/v1/ingest/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zaptrail-tenant-id': 'tenant-1',
        Authorization: 'Bearer wrong-token',
      },
      body: JSON.stringify({
        conversation_id: 'conv-1',
        messages: [{ message_id: 'm1', sender_id: 's1', direction: 'inbound', text: 'Oi', timestamp: '2026-11-04T10:00:00Z' }],
      }),
    });

    const badRes = await ingestWhatsappPost(badReq);
    expect(badRes.status).toBe(401);

    const goodReq = new Request('http://localhost/api/v1/ingest/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zaptrail-tenant-id': 'tenant-1',
        Authorization: 'Bearer super-secret-zaptrail-token',
      },
      body: JSON.stringify({
        conversation_id: 'conv-1',
        provider: 'whatsapp',
        messages: [
          {
            message_id: 'm1',
            external_message_id: 'ext-auth-1',
            sender_id: 's1',
            direction: 'inbound',
            raw_text: 'Oi, quero vender meu apartamento',
            timestamp: '2026-11-04T10:00:00Z',
          },
        ],
      }),
    });

    const goodRes = await ingestWhatsappPost(goodReq);
    expect(goodRes.status).toBe(201);
  });

  it('supports Next.js 16 async Promise params in management-objects GET handler', async () => {
    setTestSupabaseClient({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    });

    const req = new Request('http://localhost/api/management-objects?type=task');
    const res = await getManagementObjects(req as any, {
      params: Promise.resolve({ workspace: 'ws-next16' }),
    } as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.workspace).toBe('ws-next16');
  });
});
