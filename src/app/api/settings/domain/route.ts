import { NextResponse } from 'next/server';
import {
  getActiveDomainKey,
  setActiveDomainKey,
  saveCustomDomainManifest,
  getAllDomainManifests,
} from '@/lib/server-storage';

export async function GET() {
  return NextResponse.json({
    activeDomainKey: getActiveDomainKey(),
    manifests: Object.values(getAllDomainManifests()),
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (typeof body?.activeDomainKey === 'string') {
    setActiveDomainKey(body.activeDomainKey);
  }
  return NextResponse.json({ activeDomainKey: getActiveDomainKey() });
}

export async function POST(request: Request) {
  const manifest = await request.json();
  if (manifest?.domain_key && manifest?.display_name) {
    saveCustomDomainManifest(manifest);
  }
  return NextResponse.json(
    { activeDomainKey: getActiveDomainKey(), manifest },
    { status: 201 }
  );
}
