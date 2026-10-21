import { z } from 'zod';
import {
  StoragePort,
  UniversalInterpretationEnvelope,
} from '../core/types';
import {
  SupabaseStoragePort,
  assertTenantScope,
} from '../core/supabase-storage';
import { ReviewInboxService } from '../core/review-inbox';
import { HybridInterpretationEngine } from '../core/hybrid-engine';
import {
  ingestWhatsappTurn,
  getDefaultStoragePort,
} from '../api/ingest-handler';

export const MCP_TOOLS = [
  {
    name: 'analyze_conversation',
    description: 'Analyze conversation turns and extract structured semantic interpretations, observations, and recommendations.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier for multi-tenant isolation' },
        conversation_id: { type: 'string', description: 'Conversation identifier' },
        provider: { type: 'string', description: 'Messaging channel provider (default: whatsapp)' },
        domain_key: { type: 'string', description: 'Domain pack identifier (default: real_estate)' },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              external_message_id: { type: 'string' },
              sender_id: { type: 'string' },
              sender_name: { type: 'string' },
              body: { type: 'string' },
              raw_text: { type: 'string' },
              timestamp: { type: 'string' },
              direction: { type: 'string', enum: ['inbound', 'outbound'] },
            },
            required: ['external_message_id', 'sender_id'],
          },
          description: 'List of messages in the conversation turn window',
        },
      },
      required: ['tenant_id', 'conversation_id', 'messages'],
    },
  },
  {
    name: 'get_entity_memory',
    description: 'Retrieve entity memory, observations, and historical values for a given tenant and conversation.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier for isolation' },
        conversation_id: { type: 'string', description: 'Conversation identifier' },
      },
      required: ['tenant_id', 'conversation_id'],
    },
  },
  {
    name: 'resolve_review_item',
    description: 'Resolve a review inbox item with human decision (approve, edit, reject) and record audit trail.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier for isolation' },
        review_id: { type: 'string', description: 'Review queue item identifier' },
        decision: { type: 'string', enum: ['approve', 'edit', 'reject'], description: 'Resolution decision' },
        reviewer_id: { type: 'string', description: 'Reviewer identifier' },
        reviewer_notes: { type: 'string', description: 'Optional rationale or notes' },
        resolved_payload: { type: 'object', description: 'Optional updated payload overrides' },
      },
      required: ['tenant_id', 'review_id', 'decision', 'reviewer_id'],
    },
  },
];

const AnalyzeConversationArgsSchema = z.object({
  tenant_id: z.string({ required_error: 'tenant_id is required' }).trim().min(1, 'tenant_id cannot be empty'),
  conversation_id: z.string({ required_error: 'conversation_id is required' }).trim().min(1, 'conversation_id cannot be empty'),
  messages: z.array(z.record(z.unknown())).min(1, 'messages must contain at least one valid message'),
  provider: z.string().optional().default('whatsapp'),
  domain_key: z.string().optional().default('real_estate'),
  prior_outbound_message: z.any().optional(),
  seeded_context: z.record(z.unknown()).optional(),
});

const GetEntityMemoryArgsSchema = z.object({
  tenant_id: z.string({ required_error: 'tenant_id is required' }).trim().min(1, 'tenant_id cannot be empty'),
  conversation_id: z.string({ required_error: 'conversation_id is required' }).trim().min(1, 'conversation_id cannot be empty'),
});

const ResolveReviewItemArgsSchema = z.object({
  tenant_id: z.string({ required_error: 'tenant_id is required' }).trim().min(1, 'tenant_id cannot be empty'),
  review_id: z.string({ required_error: 'review_id is required' }).trim().min(1, 'review_id cannot be empty'),
  decision: z.enum(['approve', 'edit', 'reject']),
  reviewer_id: z.string({ required_error: 'reviewer_id is required' }).trim().min(1, 'reviewer_id cannot be empty'),
  reviewer_notes: z.string().optional(),
  resolved_payload: z.record(z.unknown()).optional(),
});

export interface McpServerOptions {
  storage?: StoragePort;
  engine?: HybridInterpretationEngine;
  reviewService?: ReviewInboxService;
}

export class ZapTrailMcpServer {
  private readonly storage: StoragePort;
  private readonly engine?: HybridInterpretationEngine;
  private readonly reviewService: ReviewInboxService;

  constructor(options?: McpServerOptions) {
    this.storage = options?.storage ?? getDefaultStoragePort();
    this.engine = options?.engine;
    this.reviewService =
      options?.reviewService ??
      new ReviewInboxService(this.storage as SupabaseStoragePort);
  }

  public async handleMessage(rawMessage: unknown): Promise<unknown> {
    let req: any = rawMessage;

    if (typeof req === 'string') {
      try {
        req = JSON.parse(req);
      } catch {
        return {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error: Invalid JSON' },
        };
      }
    }

    if (!req || typeof req !== 'object' || Array.isArray(req)) {
      return {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32600, message: 'Invalid Request: payload must be an object' },
      };
    }

    if (req.jsonrpc !== '2.0' || typeof req.method !== 'string') {
      return {
        jsonrpc: '2.0',
        id: req.id ?? null,
        error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0" and method is required' },
      };
    }

    const id = req.id ?? null;
    const isNotification = req.id === undefined;

    if (isNotification && req.method.startsWith('notifications/')) {
      return null;
    }

    switch (req.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'zaptrail-mcp', version: '1.0.0' },
          },
        };

      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };

      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: MCP_TOOLS } };

      case 'tools/call':
        return this.handleToolsCall(id, req.params);

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${req.method}` },
        };
    }
  }

  private async handleToolsCall(id: unknown, params: unknown): Promise<unknown> {
    if (!params || typeof params !== 'object' || Array.isArray(params)) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Invalid params: params must be an object' },
      };
    }

    const { name, arguments: args } = params as { name?: unknown; arguments?: unknown };

    if (typeof name !== 'string' || !name.trim()) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Invalid params: name is required' },
      };
    }

    const knownTool = MCP_TOOLS.some((t) => t.name === name);
    if (!knownTool) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown tool: ${name}` },
      };
    }

    if (args === undefined || typeof args !== 'object' || args === null) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Invalid params: arguments must be an object' },
      };
    }

    try {
      let resultData: unknown;
      if (name === 'analyze_conversation') {
        resultData = await this.handleAnalyzeConversation(args);
      } else if (name === 'get_entity_memory') {
        resultData = await this.handleGetEntityMemory(args);
      } else if (name === 'resolve_review_item') {
        resultData = await this.handleResolveReviewItem(args);
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(resultData, null, 2) }],
          isError: false,
        },
      };
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: err?.message || String(err) }],
          isError: true,
        },
      };
    }
  }

  public async handleAnalyzeConversation(rawArgs: unknown): Promise<UniversalInterpretationEnvelope> {
    const args = AnalyzeConversationArgsSchema.parse(rawArgs);
    assertTenantScope(args.tenant_id);

    const turnResult = await ingestWhatsappTurn(args, {
      storage: this.storage,
      engine: this.engine,
    });

    return turnResult.envelope;
  }

  public async handleGetEntityMemory(rawArgs: unknown): Promise<Record<string, unknown>> {
    const args = GetEntityMemoryArgsSchema.parse(rawArgs);
    const tenantId = assertTenantScope(args.tenant_id);
    const conversationId = args.conversation_id;

    const values = await this.storage.getHistoricalValues(tenantId, conversationId);

    let extractionRuns: any[] = [];
    if (typeof (this.storage as any).getExtractionRuns === 'function') {
      extractionRuns = await (this.storage as any).getExtractionRuns(tenantId, conversationId);
    }

    const latestRun = extractionRuns.length > 0 ? extractionRuns[extractionRuns.length - 1] : null;

    return {
      tenant_id: tenantId,
      conversation_id: conversationId,
      values,
      extraction_runs_count: extractionRuns.length,
      latest_envelope: latestRun?.envelope_payload ?? null,
      all_facts: extractionRuns.flatMap((r) => r.envelope_payload?.facts || []),
      all_opportunities: extractionRuns.flatMap((r) => r.envelope_payload?.opportunities || []),
    };
  }

  public async handleResolveReviewItem(rawArgs: unknown): Promise<unknown> {
    const args = ResolveReviewItemArgsSchema.parse(rawArgs);
    assertTenantScope(args.tenant_id);

    const resolved = await this.reviewService.resolveReviewItem(args.tenant_id, args.review_id, {
      decision: args.decision,
      reviewer_id: args.reviewer_id,
      reviewer_notes: args.reviewer_notes,
      resolved_payload: args.resolved_payload,
    });

    return resolved;
  }
}

export function createMcpServer(options?: McpServerOptions): ZapTrailMcpServer {
  return new ZapTrailMcpServer(options);
}
