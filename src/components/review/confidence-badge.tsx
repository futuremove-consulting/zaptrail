import { evaluateConfidenceBand } from '@/packages/core/confidence-policy';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const evaluation = evaluateConfidenceBand(confidence);
  const percentage = Math.round(confidence * 100);

  const variantMap = {
    high: 'success',
    medium: 'warning',
    low: 'destructive',
  } as const;

  const bgClassMap = {
    high: 'bg-success text-success-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-destructive text-destructive-foreground',
  } as const;

  return (
    <Badge
      data-testid="confidence-badge"
      variant={variantMap[evaluation.band]}
      className={cn('font-mono text-xs', bgClassMap[evaluation.band], className)}
    >
      {percentage}%
    </Badge>
  );
}
