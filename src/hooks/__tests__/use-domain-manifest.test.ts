import { describe, it, expect } from 'vitest';
import { useDomainManifest } from '../use-domain-manifest';

describe('useDomainManifest', () => {
  it('returns Real Estate manifest for real_estate key', () => {
    const manifest = useDomainManifest('real_estate');
    expect(manifest.domain_key).toBe('real_estate');
    expect(manifest.display_name).toBe('Imobiliário');
  });

  it('returns generic fallback manifest for unknown domain key', () => {
    const manifest = useDomainManifest('unknown_domain');
    expect(manifest.domain_key).toBe('generic');
    expect(manifest.display_name).toBe('Domínio Personalizado');
  });
});
