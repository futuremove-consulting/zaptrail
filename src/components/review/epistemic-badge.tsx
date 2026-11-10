import type { EpistemicStatus } from '@/packages/core/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EpistemicBadgeProps {
  status: EpistemicStatus;
  className?: string;
}

const EPISTEMIC_META: Record<
  EpistemicStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
    extraClass?: string;
  }
> = {
  declared: { label: 'Declarado', variant: 'info' },
  inferred: { label: 'Inferido', variant: 'warning' },
  validated_human: { label: '✓ Validado', variant: 'success' },
  validated_external: { label: '✓ Externo', variant: 'success' },
  superseded: {
    label: 'Substituído',
    variant: 'secondary',
    extraClass: 'line-through text-muted-foreground',
  },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
};

export function EpistemicBadge({ status, className }: EpistemicBadgeProps) {
  const meta = EPISTEMIC_META[status] ?? {
    label: status,
    variant: 'outline' as const,
  };

  return (
    <Badge
      data-testid={`epistemic-badge-${status}`}
      variant={meta.variant}
      className={cn('text-xs', meta.extraClass, className)}
    >
      {meta.label}
    </Badge>
  );
}
