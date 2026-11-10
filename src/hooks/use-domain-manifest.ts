import { getDomainManifest } from '@/lib/domain-manifest';
import { DomainPackUIManifest } from '@/lib/domain-manifest.types';

export function useDomainManifest(domainKey?: string): DomainPackUIManifest {
  return getDomainManifest(domainKey ?? 'real_estate');
}
