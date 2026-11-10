import { NextResponse } from 'next/server';

let confidenceState = {
  high: 0.85,
  medium: 0.65,
};

export async function GET() {
  return NextResponse.json(confidenceState);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (typeof body?.high === 'number' && typeof body?.medium === 'number') {
    confidenceState = { high: body.high, medium: body.medium };
  }
  return NextResponse.json(confidenceState);
}
