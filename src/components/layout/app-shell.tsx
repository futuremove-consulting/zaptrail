'use client';

import { Sidebar } from './sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import { CommandPalette } from './command-palette';
import { useDomainContext } from '@/context/domain-context';

interface AppShellProps {
  children: React.ReactNode;
  domainKey?: string;
  activeDomainKey?: string;
  pendingReviewCount?: number;
}

export function AppShell({
  children,
  domainKey,
  activeDomainKey,
  pendingReviewCount = 0,
}: AppShellProps) {
  const { domainKey: contextDomainKey } = useDomainContext();
  const resolvedDomainKey =
    activeDomainKey ?? domainKey ?? contextDomainKey ?? 'real_estate';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        domainKey={resolvedDomainKey}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Datum line header */}
        <header
          className="flex h-14 items-center border-b border-border bg-card px-6"
          role="banner"
        >
          <div
            id="page-header-portal"
            className="flex flex-1 items-center gap-4"
          />
        </header>

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto pb-16 lg:pb-0"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav pendingReviewCount={pendingReviewCount} />

      {/* Universal Cmd+K Command Palette */}
      <CommandPalette />
    </div>
  );
}
