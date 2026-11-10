import { NextResponse } from 'next/server';
import {
  getConfidenceConfig,
  setConfidenceConfig,
} from '@/lib/server-storage';

export async function GET() {
  return NextResponse.json(getConfidenceConfig());
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (typeof body?.high === 'number' && typeof body?.medium === 'number') {
    setConfidenceConfig({ high: body.high, medium: body.medium });
  }
  return NextResponse.json(getConfidenceConfig());
}
