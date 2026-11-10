import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface HealthIndicatorProps {
  label: string;
  status: 'ok' | 'warning' | 'error';
  lastEventAt?: Date | string;
  eventsToday?: number;
}

function computeEffectiveStatus(
  status: 'ok' | 'warning' | 'error',
  lastEventAt?: Date | string
): 'ok' | 'warning' | 'error' {
  if (status === 'error') return 'error';
  if (!lastEventAt) return status;

  const ts =
    typeof lastEventAt === 'string'
      ? new Date(lastEventAt).getTime()
      : lastEventAt.getTime();
  const elapsedMinutes = (Date.now() - ts) / 60_000;

  if (elapsedMinutes > 30) return 'error';
  if (elapsedMinutes > 5) return 'warning';
  return status;
}

function formatRelativeMinutes(lastEventAt?: Date | string): string {
  if (!lastEventAt) return 'Sem eventos recentes';
  const ts =
    typeof lastEventAt === 'string'
      ? new Date(lastEventAt).getTime()
      : lastEventAt.getTime();
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60_000));
  if (minutes === 1) return 'há 1 minuto';
  if (minutes < 60) return `há ${minutes} minutos`;
  const hours = Math.round(minutes / 60);
  return `há ${hours}h`;
}

export function HealthIndicator({
  label,
  status,
  lastEventAt,
  eventsToday,
}: HealthIndicatorProps) {
  const effectiveStatus = computeEffectiveStatus(status, lastEventAt);

  const dotClass = {
    ok: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  }[effectiveStatus];

  const statusLabel = {
    ok: 'Operacional',
    warning: 'Atenção',
    error: 'Indisponível',
  }[effectiveStatus];

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span
            data-testid={`health-dot-${effectiveStatus}`}
            className={cn('h-3 w-3 rounded-full', dotClass)}
            aria-label={`Status ${statusLabel}`}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">
              Último evento: {formatRelativeMinutes(lastEventAt)}
            </p>
          </div>
        </div>

        {eventsToday !== undefined && (
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-foreground">
              {eventsToday}
            </span>
            <p className="text-2xs text-muted-foreground">eventos hoje</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
