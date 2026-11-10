'use client';

import { PageHeader } from '@/components/shared/page-header';
import { IntegrationCard } from '@/components/settings/integration-card';

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações e Conectores"
        description="Monitore a saúde em tempo real do adaptador de CRM e do gateway de mensagens."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IntegrationCard
          type="crm"
          label="PilotCRM Hexagonal Adapter"
          status="ok"
          lastEventAt={new Date(Date.now() - 90_000)}
          eventsToday={47}
          url="https://app.pilotcrm.com.br/api/crm/whatsapp/ai-suggestions/ingest"
          token="zt_live_pilotcrm_982"
        />

        <IntegrationCard
          type="whatsapp"
          label="WhatsApp Webhook Ingest"
          status="ok"
          lastEventAt={new Date(Date.now() - 45_000)}
          eventsToday={128}
          url="https://zaptrail.app/api/v1/ingest/whatsapp"
          token="zt_wh_ingest_441"
        />
      </div>
    </div>
  );
}
