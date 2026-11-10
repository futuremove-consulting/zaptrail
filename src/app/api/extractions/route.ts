import { NextResponse } from 'next/server';
import { DEFAULT_TENANT_ID, getSharedStorage } from '@/lib/server-storage';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenant_id') ?? DEFAULT_TENANT_ID;
  const conversationId = url.searchParams.get('conversation_id') ?? undefined;

  const storage = getSharedStorage();
  const runs = await storage.getExtractionRuns(tenantId, conversationId);
  const envelopes = runs.map((run) => ({
    ...run.envelope_payload,
    created_at: run.created_at,
  }));

  return NextResponse.json({ envelopes });
}
