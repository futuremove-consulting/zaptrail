import Link from 'next/link';
import { getDomainManifest } from '@/lib/domain-manifest';
import { DEFAULT_TENANT_ID, getSharedStorage } from '@/lib/server-storage';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ExtractionDetail } from '@/components/extractions/extraction-detail';

export default async function ExtractionDetailPage(context: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(context.params);
  const storage = getSharedStorage();
  const runs = await storage.getExtractionRuns(DEFAULT_TENANT_ID);
  const match = runs.find((run) => run.envelope_id === id);

  if (!match) {
    return (
      <div className="p-6">
        <EmptyState
          title={`Envelope ${id} não encontrado`}
          description="Verifique o identificador ou retorne à lista de extrações."
        />
      </div>
    );
  }

  const manifest = getDomainManifest(match.domain_key);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={`Envelope ${match.envelope_id}`}
        description={`Conversa ${match.conversation_id} • Domínio ${manifest.display_name}`}
      >
        <Link
          href="/extractions"
          className="text-xs font-medium text-primary hover:underline"
        >
          ← Voltar para Extrações
        </Link>
      </PageHeader>

      <ExtractionDetail
        envelope={match.envelope_payload}
        manifest={manifest}
      />
    </div>
  );
}
