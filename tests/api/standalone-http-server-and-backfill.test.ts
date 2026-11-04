import { describe, it, expect, afterEach } from 'vitest';
import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { createZapTrailHttpServer } from '../../src/server';
import { runHistoricalBackfill } from '../../src/packages/api/backfill-runner';

describe('Standalone HTTP Server (src/server.ts) & Canonical TypeScript Backfill Runner', () => {
  const serversToClose: Server[] = [];

  afterEach(async () => {
    while (serversToClose.length > 0) {
      const srv = serversToClose.pop()!;
      await new Promise<void>((resolve) => srv.close(() => resolve()));
    }
    delete process.env.ZAPTRAIL_API_TOKEN;
  });

  it('serves GET /health and processes live TCP POST /api/v1/ingest/whatsapp with real HTTP callback roundtrip to PilotCRM', async () => {
    process.env.ZAPTRAIL_API_TOKEN = 'live-test-token-123';

    // 1. Start mock PilotCRM callback HTTP server on ephemeral port
    const receivedCallbacks: Array<{ headers: Record<string, string | string[] | undefined>; body: any }> = [];
    const pilotCrmCallbackServer = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (c) => chunks.push(Buffer.from(c)));
      req.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        receivedCallbacks.push({ headers: req.headers, body });
        res.statusCode = 201;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ success: true, inserted: body.suggestions?.length ?? 0 }));
      });
    });
    await new Promise<void>((resolve) => pilotCrmCallbackServer.listen(0, '127.0.0.1', () => resolve()));
    serversToClose.push(pilotCrmCallbackServer);
    const callbackPort = (pilotCrmCallbackServer.address() as AddressInfo).port;
    const callbackUrl = `http://127.0.0.1:${callbackPort}/api/crm/whatsapp/ai-suggestions/ingest`;

    // 2. Start ZapTrail standalone HTTP server on ephemeral port
    const zaptrailServer = createZapTrailHttpServer();
    await new Promise<void>((resolve) => zaptrailServer.listen(0, '127.0.0.1', () => resolve()));
    serversToClose.push(zaptrailServer);
    const zaptrailPort = (zaptrailServer.address() as AddressInfo).port;
    const baseUrl = `http://127.0.0.1:${zaptrailPort}`;

    // 3. Verify GET /health
    const healthRes = await fetch(`${baseUrl}/health`);
    expect(healthRes.status).toBe(200);
    const healthJson = await healthRes.json();
    expect(healthJson.status).toBe('ok');
    expect(healthJson.service).toBe('zaptrail');

    // 4. Verify 401 when Bearer token is wrong
    const unauthRes = await fetch(`${baseUrl}/api/v1/ingest/whatsapp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer wrong-token',
      },
      body: JSON.stringify({ tenant_id: '11111111-1111-4111-8111-111111111111', messages: [] }),
    });
    expect(unauthRes.status).toBe(401);

    // 5. Verify full TCP roundtrip: POST /api/v1/ingest/whatsapp -> 7-layer extraction -> HTTP callback to PilotCRM
    const ingestRes = await fetch(`${baseUrl}/api/v1/ingest/whatsapp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer live-test-token-123',
      },
      body: JSON.stringify({
        tenant_id: '11111111-1111-4111-8111-111111111111',
        provider: 'whatsapp',
        conversation_id: '22222222-2222-4222-8222-222222222222',
        callback_url: callbackUrl,
        callback_token: 'pilotcrm-cb-token-999',
        messages: [
          {
            external_message_id: 'wamid.live.tcp.001',
            sender_id: '5541999998888',
            sender_name: 'Helena Costa',
            direction: 'inbound',
            raw_text: 'Sou proprietária e quero vender meu apartamento duplex no Batel por R$ 1.350.000, venda urgente.',
            timestamp: '2026-11-04T10:50:00Z',
          },
        ],
      }),
    });

    expect(ingestRes.status).toBe(201);
    const ingestJson = await ingestRes.json();
    expect(ingestJson.success).toBe(true);
    expect(ingestJson.duplicate).toBe(false);
    expect(ingestJson.data.opportunities).toHaveLength(1);
    expect(ingestJson.data.opportunities[0].attributes.neighborhood).toBe('Batel');
    expect(ingestJson.data.opportunities[0].attributes.property_subtype).toBe('duplex');
    expect(ingestJson.data.opportunities[0].attributes.timing).toBe('immediate');

    // Verify PilotCRM callback server received the enriched proposal over HTTP
    expect(receivedCallbacks).toHaveLength(1);
    expect(receivedCallbacks[0].headers['authorization']).toBe('Bearer pilotcrm-cb-token-999');
    const addSuggestion = receivedCallbacks[0].body.suggestions.find(
      (s: any) => s.enrichment_action === 'ADD'
    );
    expect(addSuggestion).toBeDefined();
    expect(addSuggestion.payload.side).toBe('CAPTACAO');
    expect(addSuggestion.payload.targetValue).toBe('1350000');
    expect(addSuggestion.payload.neighborhood).toBe('Batel');
    expect(addSuggestion.payload.timing).toBe('immediate');
  });

  it('runs canonical TypeScript historical backfill (runHistoricalBackfill) with idempotency and metrics', async () => {
    const dispatchedPayloads: any[] = [];
    const mockFetch = async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      dispatchedPayloads.push(JSON.parse(String(init?.body || '{}')));
      return new Response(JSON.stringify({ success: true, inserted: 1 }), { status: 201 });
    };

    const historicalTurns = [
      {
        tenant_id: '11111111-1111-4111-8111-111111111111',
        conversation_id: '33333333-3333-4333-8333-333333333333',
        messages: [
          {
            external_message_id: 'hist-msg-1',
            sender_id: '5541988881111',
            sender_name: 'Carlos Eduardo',
            direction: 'inbound' as const,
            raw_text: 'Procuro casa em Moema, orçamento até 950 mil, mudança imediata',
            timestamp: '2026-11-04T09:00:00Z',
          },
        ],
      },
      // Duplicate turn to verify idempotency in backfill
      {
        tenant_id: '11111111-1111-4111-8111-111111111111',
        conversation_id: '33333333-3333-4333-8333-333333333333',
        messages: [
          {
            external_message_id: 'hist-msg-1',
            sender_id: '5541988881111',
            sender_name: 'Carlos Eduardo',
            direction: 'inbound' as const,
            raw_text: 'Procuro casa em Moema, orçamento até 950 mil, mudança imediata',
            timestamp: '2026-11-04T09:00:00Z',
          },
        ],
      },
    ];

    const summary = await runHistoricalBackfill({
      turns: historicalTurns,
      callbackUrl: 'https://pilotcrm.local/api/crm/whatsapp/ai-suggestions/ingest',
      callbackToken: 'cb-token',
      fetchFn: mockFetch as typeof fetch,
    });

    expect(summary.totalTurns).toBe(2);
    expect(summary.processedNew).toBe(1);
    expect(summary.duplicatesSkipped).toBe(1);
    expect(summary.opportunitiesExtracted).toBe(1);
    expect(summary.errors).toBe(0);
    expect(dispatchedPayloads).toHaveLength(1);
    const demandSuggestion = dispatchedPayloads[0].suggestions.find(
      (s: any) => s.enrichment_action === 'ADD'
    );
    expect(demandSuggestion).toBeDefined();
    expect(demandSuggestion.payload.side).toBe('DEMANDA');
    expect(demandSuggestion.payload.neighborhood).toBe('Moema');
    expect(demandSuggestion.payload.targetValue).toBe('950000');
  });
});
