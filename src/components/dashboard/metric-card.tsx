import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  subtitle,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="font-mono text-2xl font-bold text-foreground">
            {value}
          </span>
          {trend !== undefined && (
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  'font-mono text-xs font-semibold',
                  trend >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                {trend >= 0 ? `↑ ${trend}%` : `↓ ${Math.abs(trend)}%`}
              </span>
              {trendLabel && (
                <span className="text-xs text-muted-foreground">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
