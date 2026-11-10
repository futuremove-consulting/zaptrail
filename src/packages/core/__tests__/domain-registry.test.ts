import { describe, it, expect, beforeEach } from 'vitest';
import { DomainRegistry } from '../domain-registry';
import { DomainPack } from '../types';
import { resolveDomainPack } from '../../api/ingest-handler';

describe('DomainRegistry & resolveDomainPack', () => {
  beforeEach(() => {
    DomainRegistry.clear();
  });

  it('resolveDomainPack("real_estate") returns RealEstateDomainPack', () => {
    const pack = resolveDomainPack('real_estate');
    expect(pack.domain_key).toBe('real_estate');
  });

  it('resolveDomainPack("unknown") returns RealEstateDomainPack fallback without throwing', () => {
    const pack = resolveDomainPack('unknown');
    expect(pack.domain_key).toBe('real_estate');
  });

  it('after DomainRegistry.register(mockPack), resolveDomainPack(mockPack.domain_key) returns mockPack', () => {
    const mockPack: DomainPack = {
      domain_key: 'custom_logistics',
      parser_version: '1.0.0',
      interpretTurnWindow: async () => ({
        participants: [],
        intents: [],
        facts: [],
        values: [],
        relationships: [],
        conditions: [],
        opportunities: [],
        actions: [],
        media_results: [],
        evidence_refs: [],
        review_items: [],
      }),
    };
    DomainRegistry.register(mockPack);
    const resolved = resolveDomainPack('custom_logistics');
    expect(resolved).toBe(mockPack);
    expect(resolved.domain_key).toBe('custom_logistics');
  });
});
