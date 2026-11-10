import { NextResponse } from 'next/server';
import { DEFAULT_TENANT_ID, getSharedStorage } from '@/lib/server-storage';
import type { ConversationSummaryItem } from '@/components/conversations/conversations-table';

export async function GET() {
  const storage = getSharedStorage();
  const runs = await storage.getExtractionRuns(DEFAULT_TENANT_ID);
  const messages = await storage.getOriginMessages(DEFAULT_TENANT_ID);

  const map = new Map<string, ConversationSummaryItem>();

  for (const msg of messages) {
    const existing = map.get(msg.conversation_id) ?? {
      conversation_id: msg.conversation_id,
      contact_name: msg.sender_id,
      messages_count: 0,
      extractions_count: 0,
      opportunities_count: 0,
      last_activity_at: msg.created_at ?? new Date().toISOString(),
    };
    existing.messages_count += 1;
    map.set(msg.conversation_id, existing);
  }

  for (const run of runs) {
    const existing = map.get(run.conversation_id) ?? {
      conversation_id: run.conversation_id,
      contact_name:
        run.envelope_payload.participants?.[0]?.contact_name ??
        run.conversation_id,
      messages_count: 0,
      extractions_count: 0,
      opportunities_count: 0,
      last_activity_at: run.created_at ?? new Date().toISOString(),
    };
    existing.extractions_count += 1;
    existing.opportunities_count +=
      run.envelope_payload.opportunities?.length ?? 0;
    map.set(run.conversation_id, existing);
  }

  return NextResponse.json({
    conversations: Array.from(map.values()),
  });
}
