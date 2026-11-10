import { NextResponse } from 'next/server';
import { ingestWhatsappTurn } from '@/packages/api/ingest-handler';
import { DEFAULT_TENANT_ID, getSharedStorage } from '@/lib/server-storage';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const body = await request.json();
  const conversationText = String(body?.conversationText ?? '').trim();
  const domainKey = String(body?.domainKey ?? 'real_estate');

  if (!conversationText) {
    return NextResponse.json(
      { error: 'O texto da conversa é obrigatório para executar a extração.' },
      { status: 400 }
    );
  }

  const lines = conversationText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const messages = lines.map((line, idx) => ({
    external_message_id: `play_msg_${startedAt}_${idx}`,
    sender_id: 'playground_sender',
    sender_name: 'Participante Playground',
    raw_text: line,
    timestamp: new Date(startedAt + idx * 1000).toISOString(),
    direction: 'inbound' as const,
  }));

  const storage = getSharedStorage();
  const result = await ingestWhatsappTurn(
    {
      tenant_id: DEFAULT_TENANT_ID,
      provider: 'whatsapp',
      conversation_id: `conv_play_${startedAt}`,
      domain_key: domainKey,
      messages,
    },
    { storage }
  );

  const processingMs = Math.max(1, Date.now() - startedAt);
  return NextResponse.json({
    envelope: result.envelope,
    processingMs,
  });
}
