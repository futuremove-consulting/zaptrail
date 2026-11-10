import type { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopIntentsListProps {
  intents: Array<{ label: string; count: number }>;
  manifest: DomainPackUIManifest;
}

export function TopIntentsList({ intents, manifest }: TopIntentsListProps) {
  const maxCount = Math.max(1, ...intents.map((i) => i.count));

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">
          Principais Intenções Detectadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-2 text-xs">
        {intents.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            Nenhuma intenção contabilizada no período.
          </p>
        ) : (
          intents.map((item) => {
            const translated =
              manifest.intent_labels[item.label] ?? item.label;
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">
                    {translated}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {item.count}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
