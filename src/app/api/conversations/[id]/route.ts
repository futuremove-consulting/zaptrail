import { NextResponse } from 'next/server';
import { DEFAULT_TENANT_ID, getSharedStorage } from '@/lib/server-storage';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await Promise.resolve(context.params);
  const storage = getSharedStorage();
  const originMessages = await storage.getOriginMessages(DEFAULT_TENANT_ID, id);
  const runs = await storage.getExtractionRuns(DEFAULT_TENANT_ID, id);

  const messages = originMessages.map((m) => ({
    message_id: m.external_message_id,
    external_message_id: m.external_message_id,
    tenant_id: m.tenant_id,
    provider: m.provider,
    conversation_id: m.conversation_id,
    direction: m.direction,
    sender_id: m.sender_id,
    raw_text: m.raw_text,
    normalized_text: m.normalized_text,
    timestamp: m.sent_at ?? m.created_at ?? new Date().toISOString(),
    attachments: [],
  }));

  const envelopes = runs.map((r) => r.envelope_payload);

  return NextResponse.json({ messages, envelopes });
}
