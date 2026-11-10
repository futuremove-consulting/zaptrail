import type { OpportunityAssessment } from '@/packages/core/types';
import type { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/review/confidence-badge';
import { EpistemicBadge } from '@/components/review/epistemic-badge';

interface OpportunityCardProps {
  opportunity: OpportunityAssessment;
  manifest: DomainPackUIManifest;
}

const STAGE_LABELS: Record<OpportunityAssessment['stage'], string> = {
  detected: 'Detectada',
  qualified: 'Qualificada',
  conditional: 'Condicional',
  nurture: 'Nutrição',
  closed_lost: 'Perdida',
};

export function OpportunityCard({ opportunity, manifest }: OpportunityCardProps) {
  const typeLabel =
    manifest.opportunity_labels[opportunity.opportunity_type] ??
    opportunity.opportunity_type;

  const attributeEntries = Object.entries(opportunity.attributes ?? {});

  return (
    <Card className="shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {typeLabel}
            </CardTitle>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {opportunity.entity_key}
            </p>
          </div>
          <ConfidenceBadge confidence={opportunity.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">
            {STAGE_LABELS[opportunity.stage] ?? opportunity.stage}
          </Badge>
          <EpistemicBadge status={opportunity.epistemic_status} />
        </div>

        {attributeEntries.length > 0 && (
          <dl className="divide-y divide-border rounded-md border border-border bg-muted/30 text-xs">
            {attributeEntries.map(([key, val]) => (
              <div key={key} className="flex justify-between px-2.5 py-1.5">
                <dt className="text-muted-foreground">{key}</dt>
                <dd className="font-mono font-medium text-foreground">
                  {typeof val === 'number' && key.includes('price')
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      }).format(val)
                    : String(val)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
