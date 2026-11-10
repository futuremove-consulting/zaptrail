import Link from 'next/link';
import type { UniversalInterpretationEnvelope } from '@/packages/core/types';
import type { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/review/confidence-badge';

interface TimelineExtractionProps {
  envelope: UniversalInterpretationEnvelope;
  manifest: DomainPackUIManifest;
  onHover?: (quotesByMessageId: Record<string, string>) => void;
}

export function TimelineExtraction({
  envelope,
  manifest,
  onHover,
}: TimelineExtractionProps) {
  const handleMouseEnter = () => {
    if (!onHover) return;
    const map: Record<string, string> = {};
    for (const ev of envelope.evidence_refs ?? []) {
      map[ev.message_id] = ev.exact_quote;
    }
    for (const opp of envelope.opportunities ?? []) {
      for (const ev of opp.evidence_refs ?? []) {
        map[ev.message_id] = ev.exact_quote;
      }
    }
    onHover(map);
  };

  const handleMouseLeave = () => {
    if (onHover) onHover({});
  };

  const avgConfidence =
    envelope.evidence_refs.length > 0
      ? envelope.evidence_refs.reduce((acc, r) => acc + r.confidence, 0) /
        envelope.evidence_refs.length
      : 0.88;

  return (
    <Card
      data-testid={`extraction-${envelope.envelope_id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-xs font-semibold text-foreground">
            {envelope.envelope_id}
          </CardTitle>
          <ConfidenceBadge confidence={avgConfidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 p-4 pt-2 text-xs">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">
            {envelope.participants.length} participante(s)
          </Badge>
          <Badge variant="default">
            {envelope.opportunities.length} oportunidade(s)
          </Badge>
        </div>

        {envelope.opportunities.map((opp) => (
          <div
            key={opp.opportunity_id}
            className="rounded-md bg-muted/40 p-2 text-xs"
          >
            <span className="font-medium text-foreground">
              {manifest.opportunity_labels[opp.opportunity_type] ??
                opp.opportunity_type}
            </span>
          </div>
        ))}

        <div>
          <Link
            href={`/extractions/${envelope.envelope_id}`}
            className="font-medium text-primary hover:underline"
          >
            Ver detalhes do envelope →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
