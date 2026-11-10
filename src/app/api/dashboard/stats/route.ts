import { NextResponse } from 'next/server';
import {
  DEFAULT_TENANT_ID,
  getIntegrationsConfig,
  getSharedStorage,
} from '@/lib/server-storage';
import { evaluateConfidenceBand } from '@/packages/core/confidence-policy';

export async function GET() {
  const storage = getSharedStorage();
  const runs = await storage.getExtractionRuns(DEFAULT_TENANT_ID);
  const reviews = await storage.getReviewQueue(DEFAULT_TENANT_ID, 'pending');
  const integrations = getIntegrationsConfig();

  const confidenceDistribution = { high: 0, medium: 0, low: 0 };
  const intentCounts: Record<string, number> = {};
  let confidenceSum = 0;
  let confidenceTotal = 0;

  for (const run of runs) {
    const env = run.envelope_payload;
    for (const ev of env.evidence_refs ?? []) {
      const band = evaluateConfidenceBand(ev.confidence).band;
      confidenceDistribution[band]++;
      confidenceSum += ev.confidence;
      confidenceTotal++;
    }
    for (const intent of env.intents ?? []) {
      intentCounts[intent.intent_label] =
        (intentCounts[intent.intent_label] ?? 0) + 1;
    }
  }

  const topIntents = Object.entries(intentCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json({
    totalExtractions: runs.length,
    pendingReviews: reviews.length,
    averageConfidence:
      confidenceTotal > 0 ? confidenceSum / confidenceTotal : 0.9,
    confidenceDistribution,
    topIntents,
    integrationHealth: integrations,
  });
}
