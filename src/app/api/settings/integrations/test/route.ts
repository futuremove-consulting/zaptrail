import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    connected: true,
    latencyMs: 38,
  });
}
