import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getReviews } from '../route';
import { PATCH as patchReview } from '../[id]/route';
import { getSharedStorage, getSharedReviewService } from '@/lib/server-storage';
import { UniversalInterpretationEnvelope } from '@/packages/core/types';

describe('Review API Route Handlers (Multi-Tenant & Resolution)', () => {
  const tenantA = 'tenant_alpha';
  const tenantB = 'tenant_beta';

  beforeEach(async () => {
    const storage = getSharedStorage();
    const service = getSharedReviewService();

    const envelopeA: UniversalInterpretationEnvelope = {
      envelope_id: 'env_a',
      tenant_id: tenantA,
      conversation_id: 'conv_a',
      turn_id: 'turn_a',
      domain_key: 'real_estate',
      parser_version: '1.0.0',
      duplicate: false,
      review_required: true,
      do_not_contact: false,
      participants: [],
      intents: [],
      facts: [],
      values: [],
      relationships: [],
      conditions: [],
      opportunities: [],
      actions: [],
      media_results: [],
      evidence_refs: [],
      review_items: [
        {
          review_id: 'rev_a_1',
          reason: 'Ambiguous price',
          severity: 'high',
          target_id: 'target_1',
          evidence_refs: [
            {
              evidence_id: 'ev_1',
              conversation_id: 'conv_a',
              message_id: 'msg_1',
              exact_quote: 'quote a',
              timestamp: '2026-11-05T10:00:00Z',
              extractor_type: 'rule',
              parser_version: '1.0.0',
              confidence: 0.7,
            },
          ],
        },
      ],
    };
    await service.enqueueFromEnvelope(envelopeA);
  });

  it('GET /api/review isolates by tenant_id query param and header', async () => {
    // Tenant A should see the review item
    const reqA = new Request(`http://localhost/api/review?tenant_id=${tenantA}`);
    const resA = await getReviews(reqA);
    const dataA = await resA.json();
    expect(dataA.items.length).toBeGreaterThan(0);
    expect(dataA.items[0].review_id).toBe('rev_a_1');

    // Tenant B should not see Tenant A's review item
    const reqB = new Request(`http://localhost/api/review?tenant_id=${tenantB}`);
    const resB = await getReviews(reqB);
    const dataB = await resB.json();
    expect(dataB.items.length).toBe(0);
  });

  it('PATCH /api/review/[id] resolves item under tenant scope', async () => {
    const req = new Request(
      `http://localhost/api/review/rev_a_1?tenant_id=${tenantA}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'approve',
          reviewer_id: 'usr_gustavo',
          reviewer_notes: 'Validado com corretor',
        }),
      }
    );

    const res = await patchReview(req, {
      params: Promise.resolve({ id: 'rev_a_1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.item.status).toBe('approved');
  });
});
