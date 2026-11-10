'use client';

import { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DomainPackCardProps {
  manifest: DomainPackUIManifest;
  isActive: boolean;
  comingSoon?: boolean;
  description?: string;
  onSelect: (domainKey: string) => void;
}

export function DomainPackCard({
  manifest,
  isActive,
  comingSoon = false,
  description,
  onSelect,
}: DomainPackCardProps) {
  return (
    <Card className={isActive ? 'border-primary ring-1 ring-primary' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          {manifest.display_name}
        </CardTitle>
        {isActive ? (
          <Badge variant="success">Ativo</Badge>
        ) : comingSoon ? (
          <Badge variant="outline">Em breve</Badge>
        ) : (
          <Badge variant="secondary">Disponível</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-2 text-xs">
        <p className="text-muted-foreground">
          {description ??
            `Regras determinísticas, vocabulário e taxonomia para o setor ${manifest.display_name}.`}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {Object.values(manifest.intent_labels)
            .slice(0, 3)
            .map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
        </div>

        <div className="pt-2">
          {isActive ? (
            <Button type="button" size="sm" variant="secondary" disabled>
              Domínio Ativo
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={comingSoon}
              onClick={() => onSelect(manifest.domain_key)}
            >
              Selecionar domínio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
