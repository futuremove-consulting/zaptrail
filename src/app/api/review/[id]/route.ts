import { NextResponse } from 'next/server';
import {
  DEFAULT_TENANT_ID,
  getSharedReviewService,
} from '@/lib/server-storage';
import { ReviewResolutionInputSchema } from '@/packages/core/review-inbox';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await Promise.resolve(context.params);
  const body = await request.json();
  const parsed = ReviewResolutionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid resolution payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const service = getSharedReviewService();
  const updated = await service.resolveReviewItem(
    DEFAULT_TENANT_ID,
    id,
    parsed.data
  );

  return NextResponse.json({ item: updated });
}
