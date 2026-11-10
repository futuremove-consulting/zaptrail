import { DomainPack } from './types';

const registeredPacks = new Map<string, DomainPack>();

export const DomainRegistry = {
  register(pack: DomainPack): void {
    registeredPacks.set(pack.domain_key, pack);
  },

  resolve(domainKey: string): DomainPack | undefined {
    return registeredPacks.get(domainKey);
  },

  list(): DomainPack[] {
    return Array.from(registeredPacks.values());
  },

  clear(): void {
    registeredPacks.clear();
  },
};
