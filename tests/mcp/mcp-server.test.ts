import { describe, it, expect, beforeEach } from 'vitest';
import { PassThrough } from 'stream';
import {
  createMcpServer,
  ZapTrailMcpServer,
  MCP_TOOLS,
} from '../../src/packages/mcp/server';
import { runMcpStdio } from '../../src/packages/mcp/index';
import { SupabaseStoragePort } from '../../src/packages/core/supabase-storage';
import { ReviewInboxService } from '../../src/packages/core/review-inbox';
import { UniversalInterpretationEnvelopeSchema } from '../../src/packages/core/types';

describe('ZapTrailMcpServer (MCP-01)', () => {
  let storage: SupabaseStoragePort;
  let reviewService: ReviewInboxService;
  let server: ZapTrailMcpServer;

  beforeEach(() => {
    storage = new SupabaseStoragePort();
    reviewService = new ReviewInboxService(storage);
    server = createMcpServer({ storage, reviewService });
  });

  describe('Protocol Handshake & Lifecycle', () => {
    it('handles "initialize" request according to MCP protocol', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
      })) as any;

      expect(res).toBeDefined();
      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(1);
      expect(res.result).toBeDefined();
      expect(res.result.protocolVersion).toBe('2024-11-05');
      expect(res.result.capabilities.tools).toBeDefined();
      expect(res.result.serverInfo.name).toBe('zaptrail-mcp');
    });

    it('handles "ping" request', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 2,
        method: 'ping',
      })) as any;

      expect(res).toEqual({
        jsonrpc: '2.0',
        id: 2,
        result: {},
      });
    });

    it('returns null for notifications like "notifications/initialized"', async () => {
      const res = await server.handleMessage({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      });

      expect(res).toBeNull();
    });
  });

  describe('tools/list', () => {
    it('returns the 3 core tools with schema definitions', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/list',
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(3);
      expect(res.result).toBeDefined();
      expect(Array.isArray(res.result.tools)).toBe(true);
      expect(res.result.tools).toHaveLength(3);

      const toolNames = res.result.tools.map((t: any) => t.name);
      expect(toolNames).toContain('analyze_conversation');
      expect(toolNames).toContain('get_entity_memory');
      expect(toolNames).toContain('resolve_review_item');

      for (const tool of res.result.tools) {
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      }
    });

    it('exports MCP_TOOLS matching tools/list result', () => {
      expect(MCP_TOOLS).toHaveLength(3);
      expect(MCP_TOOLS.map((t) => t.name)).toEqual([
        'analyze_conversation',
        'get_entity_memory',
        'resolve_review_item',
      ]);
    });
  });

  describe('tools/call - analyze_conversation', () => {
    it('analyzes inbound conversation messages and returns envelope in MCP format', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: {
          name: 'analyze_conversation',
          arguments: {
            tenant_id: 'tenant-test',
            conversation_id: 'conv-mcp-1',
            messages: [
              {
                external_message_id: 'msg-mcp-01',
                sender_id: 'client-1',
                body: 'Sou o proprietário, quero vender meu apartamento.',
                timestamp: '2026-10-21T10:00:00Z',
              },
            ],
          },
        },
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(10);
      expect(res.result).toBeDefined();
      expect(res.result.isError).toBeFalsy();
      expect(Array.isArray(res.result.content)).toBe(true);
      expect(res.result.content[0].type).toBe('text');

      const parsedEnvelope = JSON.parse(res.result.content[0].text);
      expect(parsedEnvelope.tenant_id).toBe('tenant-test');
      expect(parsedEnvelope.conversation_id).toBe('conv-mcp-1');
      expect(parsedEnvelope.intents.length).toBeGreaterThan(0);
      expect(parsedEnvelope.evidence_refs.length).toBeGreaterThan(0);
    });

    it('returns error if tenant_id or messages are missing', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 11,
        method: 'tools/call',
        params: {
          name: 'analyze_conversation',
          arguments: {
            conversation_id: 'conv-1',
          },
        },
      })) as any;

      const isErrorDetected = res.error?.code === -32602 || res.result?.isError === true;
      expect(isErrorDetected).toBe(true);
    });
  });

  describe('tools/call - get_entity_memory', () => {
    it('retrieves historical observations and values for a tenant conversation', async () => {
      // Seed an envelope first via analyze_conversation
      await server.handleMessage({
        jsonrpc: '2.0',
        id: 20,
        method: 'tools/call',
        params: {
          name: 'analyze_conversation',
          arguments: {
            tenant_id: 'tenant-mem',
            conversation_id: 'conv-mem-1',
            messages: [
              {
                external_message_id: 'msg-mem-01',
                sender_id: 'client-mem',
                body: 'Quero vender por R$ 850.000',
              },
            ],
          },
        },
      });

      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 21,
        method: 'tools/call',
        params: {
          name: 'get_entity_memory',
          arguments: {
            tenant_id: 'tenant-mem',
            conversation_id: 'conv-mem-1',
          },
        },
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(21);
      expect(res.result.isError).toBeFalsy();
      expect(res.result.content[0].type).toBe('text');

      const memory = JSON.parse(res.result.content[0].text);
      expect(memory.tenant_id).toBe('tenant-mem');
      expect(memory.conversation_id).toBe('conv-mem-1');
      expect(Array.isArray(memory.values)).toBe(true);
      expect(memory.values.length).toBeGreaterThan(0);
      expect(memory.values[0].field_key).toBe('sale_asking_price');
      expect(memory.values[0].amount).toBe(850000);
    });

    it('enforces multi-tenant isolation (T-04-03): empty or whitespace tenant_id fails', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 22,
        method: 'tools/call',
        params: {
          name: 'get_entity_memory',
          arguments: {
            tenant_id: '   ',
            conversation_id: 'conv-mem-1',
          },
        },
      })) as any;

      const isErrorDetected = res.error?.code === -32602 || res.result?.isError === true;
      expect(isErrorDetected).toBe(true);
    });

    it('returns empty memory for another tenant (cross-tenant leak check)', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 23,
        method: 'tools/call',
        params: {
          name: 'get_entity_memory',
          arguments: {
            tenant_id: 'other-tenant',
            conversation_id: 'conv-mem-1',
          },
        },
      })) as any;

      expect(res.result.isError).toBeFalsy();
      const memory = JSON.parse(res.result.content[0].text);
      expect(memory.tenant_id).toBe('other-tenant');
      expect(memory.values).toHaveLength(0);
    });
  });

  describe('tools/call - resolve_review_item', () => {
    it('approves a review item and records audit trail', async () => {
      // Seed a review item via storage
      const envelope = UniversalInterpretationEnvelopeSchema.parse({
        envelope_id: 'env-rev-1',
        tenant_id: 'tenant-rev',
        conversation_id: 'conv-rev-1',
        turn_id: 'turn-1',
        domain_key: 'real_estate',
        parser_version: '1.0.0',
        review_required: true,
        review_items: [
          {
            review_id: 'rev-001',
            reason: 'Low confidence property price',
            severity: 'high',
            target_id: 'val-1',
            evidence_refs: [
              {
                evidence_id: 'ev-1',
                message_id: 'msg-1',
                conversation_id: 'conv-rev-1',
                exact_quote: 'acho que 500k',
                char_start: 0,
                char_end: 13,
                timestamp: '2026-10-21T10:00:00Z',
                extractor_type: 'rule',
                parser_version: '1.0.0',
                confidence: 0.6,
              },
            ],
          },
        ],
      });
      await storage.saveEnvelope(envelope);

      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 30,
        method: 'tools/call',
        params: {
          name: 'resolve_review_item',
          arguments: {
            tenant_id: 'tenant-rev',
            review_id: 'rev-001',
            decision: 'approve',
            reviewer_id: 'user-broker-42',
            reviewer_notes: 'Valor confirmado por telefone.',
          },
        },
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(30);
      expect(res.result.isError).toBeFalsy();

      const resolved = JSON.parse(res.result.content[0].text);
      expect(resolved.review_id).toBe('rev-001');
      expect(resolved.status).toBe('approved');
      expect(resolved.reviewer_id).toBe('user-broker-42');
      expect(resolved.reviewer_notes).toBe('Valor confirmado por telefone.');
      expect(resolved.resolved_at).toBeTruthy();
    });

    it('returns isError: true for non-existent review item (E-04-05)', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 31,
        method: 'tools/call',
        params: {
          name: 'resolve_review_item',
          arguments: {
            tenant_id: 'tenant-rev',
            review_id: 'rev-nonexistent',
            decision: 'reject',
            reviewer_id: 'user-1',
          },
        },
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(31);
      expect(res.result.isError).toBe(true);
      expect(res.result.content[0].text).toContain('Review item not found');
    });
  });

  describe('Protocol Error Handling (T-04-04, E-04-04)', () => {
    it('returns -32700 on malformed JSON payload string', async () => {
      const res = (await server.handleMessage('this is not valid json {{{')) as any;
      expect(res.jsonrpc).toBe('2.0');
      expect(res.error).toBeDefined();
      expect(res.error.code).toBe(-32700);
    });

    it('returns -32600 on non-object or invalid jsonrpc version', async () => {
      const res1 = (await server.handleMessage(12345)) as any;
      expect(res1.error.code).toBe(-32600);

      const res2 = (await server.handleMessage({ jsonrpc: '1.0', method: 'ping' })) as any;
      expect(res2.error.code).toBe(-32600);

      const res3 = (await server.handleMessage({ jsonrpc: '2.0' })) as any;
      expect(res3.error.code).toBe(-32600);
    });

    it('returns -32601 on unknown method', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 40,
        method: 'unknown/method',
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(40);
      expect(res.error.code).toBe(-32601);
    });

    it('returns -32601 on unknown tool name in tools/call', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 41,
        method: 'tools/call',
        params: {
          name: 'non_existent_tool',
          arguments: {},
        },
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(41);
      expect(res.error.code).toBe(-32601);
    });

    it('returns -32602 on tools/call without valid params object', async () => {
      const res = (await server.handleMessage({
        jsonrpc: '2.0',
        id: 42,
        method: 'tools/call',
        params: 'invalid-params-type',
      })) as any;

      expect(res.jsonrpc).toBe('2.0');
      expect(res.id).toBe(42);
      expect(res.error.code).toBe(-32602);
    });
  });

  describe('runMcpStdio', () => {
    it('processes line-delimited JSON-RPC requests over stdio streams', async () => {
      const input = new PassThrough();
      const output = new PassThrough();

      const stop = runMcpStdio(server, input, output);

      const responses: string[] = [];
      output.on('data', (chunk) => {
        responses.push(chunk.toString());
      });

      const pingReq = JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'ping' }) + '\n';
      input.write(pingReq);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(responses.length).toBe(1);
      const parsed = JSON.parse(responses[0]);
      expect(parsed).toEqual({ jsonrpc: '2.0', id: 99, result: {} });

      stop();
    });

    it('ignores empty lines and notifications without outputting null', async () => {
      const input = new PassThrough();
      const output = new PassThrough();

      const stop = runMcpStdio(server, input, output);

      const responses: string[] = [];
      output.on('data', (chunk) => {
        responses.push(chunk.toString());
      });

      input.write('\n   \n');
      input.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(responses.length).toBe(0);

      stop();
    });

    it('recovers from malformed JSON lines writing JSON-RPC error without terminating', async () => {
      const input = new PassThrough();
      const output = new PassThrough();

      const stop = runMcpStdio(server, input, output);

      const responses: string[] = [];
      output.on('data', (chunk) => {
        responses.push(chunk.toString());
      });

      input.write('not-valid-json\n');
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(responses.length).toBe(1);
      const parsedErr = JSON.parse(responses[0]);
      expect(parsedErr.error.code).toBe(-32700);

      // Verify stream is still functioning for next request
      input.write(JSON.stringify({ jsonrpc: '2.0', id: 100, method: 'ping' }) + '\n');
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(responses.length).toBe(2);
      const parsedPing = JSON.parse(responses[1]);
      expect(parsedPing.id).toBe(100);

      stop();
    });
  });
});

