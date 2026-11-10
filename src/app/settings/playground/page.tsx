'use client';

import { PageHeader } from '@/components/shared/page-header';
import { PlaygroundSplitPane } from '@/components/playground/playground-split-pane';

export default function PlaygroundSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Playground de Extração"
        description="Simule conversas reais do WhatsApp e valide o comportamento determinístico e híbrido antes de publicar."
      />
      <PlaygroundSplitPane />
    </div>
  );
}
