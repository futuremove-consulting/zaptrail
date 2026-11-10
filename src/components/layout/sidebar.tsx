'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DomainIndicator } from './domain-indicator';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, ariaLabel: 'Dashboard' },
  { href: '/review', label: 'Revisão', icon: ClipboardList, ariaLabel: 'Revisão' },
  { href: '/extractions', label: 'Extrações', icon: FileText, ariaLabel: 'Extrações' },
  { href: '/conversations', label: 'Conversas', icon: MessageSquare, ariaLabel: 'Conversas' },
  { href: '/settings', label: 'Configurações', icon: Settings, ariaLabel: 'Configurações' },
];

interface SidebarProps {
  domainKey: string;
  pendingReviewCount: number;
}

export function Sidebar({ domainKey, pendingReviewCount }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      {/* Logo / brand */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="text-primary">⚡</span>
          <span>ZapTrail</span>
        </Link>
      </div>

      {/* Domain indicator */}
      <div className="border-b border-border px-3 py-2">
        <DomainIndicator domainKey={domainKey} />
      </div>

      {/* Nav links */}
      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            const isReview = item.href === '/review';

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {isReview && pendingReviewCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {pendingReviewCount}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
