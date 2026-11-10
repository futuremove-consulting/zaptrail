import { Sidebar } from './sidebar';

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
  const resolvedDomainKey = activeDomainKey ?? domainKey ?? 'real_estate';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar domainKey={resolvedDomainKey} pendingReviewCount={pendingReviewCount} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Datum line header */}
        <header
          className="h-14 flex items-center border-b border-border bg-card px-6"
          role="banner"
        >
          <div id="page-header-portal" className="flex flex-1 items-center gap-4" />
        </header>

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
