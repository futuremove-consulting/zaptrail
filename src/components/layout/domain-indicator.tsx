'use client';

import { Building2, Layers, Heart, Briefcase } from 'lucide-react';
import { getDomainManifest } from '@/lib/domain-manifest';
import type { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DomainIndicatorProps {
  domainKey?: string;
  manifest?: DomainPackUIManifest;
  onClick?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Layers,
  Heart,
  Briefcase,
};

export function DomainIndicator({ domainKey, manifest: manifestProp, onClick }: DomainIndicatorProps) {
  const manifest = manifestProp ?? getDomainManifest(domainKey ?? 'real_estate');
  const Icon = ICON_MAP[manifest.icon] ?? Layers;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left text-xs"
      aria-label={`Domínio ativo: ${manifest.display_name}. Clique para trocar.`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span className="font-medium text-foreground">{manifest.display_name}</span>
      {manifest.official && (
        <Badge variant="secondary" className="ml-auto text-2xs leading-tight py-0">
          Oficial
        </Badge>
      )}
    </Button>
  );
}
