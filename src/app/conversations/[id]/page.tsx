import Link from 'next/link';
import { getDomainManifest } from '@/lib/domain-manifest';
import { DEFAULT_TENANT_ID, getSharedStorage } from '@/lib/server-storage';
import { PageHeader } from '@/components/shared/page-header';
import { TimelineDual } from '@/components/conversations/timeline-dual';

export default async function ConversationDetailPage(context: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ anchor?: string }>;
}) {
  const { id } = await Promise.resolve(context.params);
  const resolvedSearch = context.searchParams
    ? await Promise.resolve(context.searchParams)
    : {};
  const anchorMessageId = resolvedSearch.anchor;

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
  const manifest = getDomainManifest(envelopes[0]?.domain_key ?? 'real_estate');

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={`Timeline Dual — ${id}`}
        description="Passe o mouse sobre os cards de extração à direita para destacar o trecho exato na mensagem original."
      >
        <Link
          href="/conversations"
          className="text-xs font-medium text-primary hover:underline"
        >
          ← Voltar para Conversas
        </Link>
      </PageHeader>

      <TimelineDual
        messages={messages}
        envelopes={envelopes}
        manifest={manifest}
        anchorMessageId={anchorMessageId}
      />
    </div>
  );
}
