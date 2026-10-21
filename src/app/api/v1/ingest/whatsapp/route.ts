import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ingestWhatsappTurn } from '../../../../../packages/api/ingest-handler';

/**
 * Extracts tenant scope from request body or HTTP headers (E-04-01 / T-04-01).
 * Priority:
 * 1. body.tenant_id
 * 2. Header `x-zaptrail-tenant-id`
 * 3. Header `Authorization: Bearer <token>`
 */
function extractTenantId(body: any, request: Request): string | undefined {
  if (typeof body?.tenant_id === 'string' && body.tenant_id.trim().length > 0) {
    return body.tenant_id.trim();
  }

  const customHeader = request.headers.get('x-zaptrail-tenant-id');
  if (customHeader && customHeader.trim().length > 0) {
    return customHeader.trim();
  }

  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.length > 0) {
      return token;
    }
  }

  return undefined;
}

/**
 * POST /api/v1/ingest/whatsapp
 *
 * Webhook ingestion endpoint for WhatsApp provider integrations.
 * Supports turn coalescing, domain-pack interpretation, idempotency guards,
 * and tenant isolation.
 *
 * Status codes:
 * - 201 Created: New turn successfully processed and persisted.
 * - 200 OK: Duplicate webhook detected (idempotent cached envelope returned).
 * - 400 Bad Request: Malformed JSON, missing tenant scope, or schema validation failure.
 * - 500 Internal Server Error: Unhandled execution failure.
 */
export async function POST(request: Request) {
  let body: any;

  // 1. Safe JSON parsing
  try {
    body = await request.json();
  } catch (parseError: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Malformed JSON payload: ${parseError?.message ?? 'Invalid JSON syntax'}`,
      },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      {
        success: false,
        error: 'Request body must be a valid JSON object',
      },
      { status: 400 }
    );
  }

  // 2. Resolve tenant scope with header fallback
  const resolvedTenantId = extractTenantId(body, request);
  if (!resolvedTenantId) {
    return NextResponse.json(
      {
        success: false,
        error:
          'tenant_id is required and cannot be empty. Provide it in the JSON body or via x-zaptrail-tenant-id / Authorization header.',
      },
      { status: 400 }
    );
  }

  body.tenant_id = resolvedTenantId;

  // 3. Ingest turn through universal domain pipeline
  try {
    const result = await ingestWhatsappTurn(body);

    return NextResponse.json(
      {
        success: true,
        duplicate: result.duplicate,
        data: result.envelope,
      },
      { status: result.status }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal server error during turn ingestion',
      },
      { status: 500 }
    );
  }
}
