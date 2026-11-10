import { NextResponse } from 'next/server';
import {
  DOMAIN_MANIFESTS,
  registerDomainManifest,
} from '@/lib/domain-manifest';

let activeDomainKey = 'real_estate';

export async function GET() {
  return NextResponse.json({
    activeDomainKey,
    manifests: Object.values(DOMAIN_MANIFESTS),
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (typeof body?.activeDomainKey === 'string') {
    activeDomainKey = body.activeDomainKey;
  }
  return NextResponse.json({ activeDomainKey });
}

export async function POST(request: Request) {
  const manifest = await request.json();
  if (manifest?.domain_key && manifest?.display_name) {
    registerDomainManifest(manifest);
    activeDomainKey = manifest.domain_key;
  }
  return NextResponse.json({ activeDomainKey, manifest }, { status: 201 });
}
