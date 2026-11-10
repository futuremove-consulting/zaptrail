import { NextResponse } from 'next/server';

let integrationsState = {
  crm: {
    label: 'PilotCRM Hexagonal Adapter',
    status: 'ok',
    url: 'https://app.pilotcrm.com.br/api/crm/whatsapp/ai-suggestions/ingest',
    token: 'zt_live_pilotcrm_982',
  },
  whatsapp: {
    label: 'WhatsApp Webhook Ingest',
    status: 'ok',
    url: 'https://zaptrail.app/api/v1/ingest/whatsapp',
    token: 'zt_wh_ingest_441',
  },
};

export async function GET() {
  return NextResponse.json(integrationsState);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  integrationsState = { ...integrationsState, ...body };
  return NextResponse.json(integrationsState);
}
