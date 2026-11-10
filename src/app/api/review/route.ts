import { NextResponse } from 'next/server';
import {
  DEFAULT_TENANT_ID,
  getSharedReviewService,
} from '@/lib/server-storage';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenant_id') ?? DEFAULT_TENANT_ID;
  const status = url.searchParams.get('status') as
    | 'pending'
    | 'approved'
    | 'edited'
    | 'rejected'
    | null;
  const severity = url.searchParams.get('severity') as
    | 'low'
    | 'medium'
    | 'high'
    | null;
  const conversationId = url.searchParams.get('conversation_id') ?? undefined;

  const service = getSharedReviewService();
  const items = await service.listReviews(tenantId, {
    status: status && status !== ('all' as unknown) ? status : undefined,
    severity: severity && severity !== ('all' as unknown) ? severity : undefined,
    conversation_id: conversationId,
  });

  return NextResponse.json({ items });
}
