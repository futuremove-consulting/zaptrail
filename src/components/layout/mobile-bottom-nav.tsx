'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  pendingReviewCount?: number;
}

export function MobileBottomNav({
  pendingReviewCount = 0,
}: MobileBottomNavProps) {
  const pathname = usePathname() ?? '/';

  const items = [
    { href: '/dashboard', label: 'Painel', ariaLabel: 'Atalho móvel Painel' },
    {
      href: '/review',
      label: 'Fila',
      ariaLabel: 'Atalho móvel Fila',
      badge: pendingReviewCount,
    },
    {
      href: '/extractions',
      label: 'Envelopes',
      ariaLabel: 'Atalho móvel Envelopes',
    },
    { href: '/settings', label: 'Menu', ariaLabel: 'Atalho móvel Menu' },
  ];

  return (
    <nav
      aria-label="Navegação móvel"
      data-testid="mobile-bottom-nav"
      className="fixed right-0 bottom-0 left-0 z-40 flex h-14 items-center justify-around border-t border-border bg-card px-2 lg:hidden"
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.ariaLabel}
            className={cn(
              'flex min-h-11 min-w-11 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              active
                ? 'font-semibold text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant="warning" className="font-mono text-[10px]">
                {item.badge} pend.
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
