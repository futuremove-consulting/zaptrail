import { NextResponse } from 'next/server';
import { getIntegrationsConfig } from '@/lib/server-storage';

export async function GET() {
  return NextResponse.json(getIntegrationsConfig());
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const config = getIntegrationsConfig();
  if (body?.crm) Object.assign(config.crm, body.crm);
  if (body?.whatsapp) Object.assign(config.whatsapp, body.whatsapp);
  return NextResponse.json(config);
}
