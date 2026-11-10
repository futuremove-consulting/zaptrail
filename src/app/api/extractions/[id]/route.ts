import { NextResponse } from 'next/server';
import { DEFAULT_TENANT_ID, getSharedStorage } from '@/lib/server-storage';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await Promise.resolve(context.params);
  const url = new URL(request.url);
  const tenantId =
    url.searchParams.get('tenant_id') ??
    request.headers.get('x-zaptrail-tenant-id') ??
    DEFAULT_TENANT_ID;

  const storage = getSharedStorage();
  const runs = await storage.getExtractionRuns(tenantId);
  const match = runs.find((run) => run.envelope_id === id);

  if (!match) {
    return NextResponse.json(
      { error: 'Envelope não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    envelope: {
      ...match.envelope_payload,
      created_at: match.created_at,
    },
  });
}
