import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfidenceHistogramProps {
  distribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export function ConfidenceHistogram({ distribution }: ConfidenceHistogramProps) {
  const total =
    Math.max(1, distribution.high + distribution.medium + distribution.low);
  const highPct = Math.round((distribution.high / total) * 100);
  const medPct = Math.round((distribution.medium / total) * 100);
  const lowPct = Math.round((distribution.low / total) * 100);

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">
          Distribuição de Confiança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-2 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alta (≥ 85%)</span>
            <span className="font-mono font-medium">
              {distribution.high} ({highPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-success"
              style={{ width: `${highPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Média (65%–84%)</span>
            <span className="font-mono font-medium">
              {distribution.medium} ({medPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-warning"
              style={{ width: `${medPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Baixa (&lt; 65%)</span>
            <span className="font-mono font-medium">
              {distribution.low} ({lowPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-destructive"
              style={{ width: `${lowPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
