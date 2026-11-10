'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { getDomainManifest } from '@/lib/domain-manifest';
import { DomainPackUIManifest } from '@/lib/domain-manifest.types';

interface DomainContextValue {
  domainKey: string;
  manifest: DomainPackUIManifest;
  setDomainKey: (key: string) => void;
}

const DomainContext = createContext<DomainContextValue>({
  domainKey: 'real_estate',
  manifest: getDomainManifest('real_estate'),
  setDomainKey: () => {},
});

interface DomainProviderProps {
  initialDomainKey?: string;
  children: ReactNode;
}

export function DomainProvider({
  initialDomainKey = 'real_estate',
  children,
}: DomainProviderProps) {
  const [domainKey, setDomainKey] = useState(initialDomainKey);
  const manifest = getDomainManifest(domainKey);

  return (
    <DomainContext.Provider value={{ domainKey, manifest, setDomainKey }}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomainContext(): DomainContextValue {
  return useContext(DomainContext);
}
