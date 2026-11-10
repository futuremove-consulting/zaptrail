'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SETTINGS_LINKS = [
  { href: '/settings/general', label: 'Geral' },
  { href: '/settings/domain', label: 'Domínio' },
  { href: '/settings/integrations', label: 'Integrações' },
  { href: '/settings/team', label: 'Equipe' },
  { href: '/settings/confidence', label: 'Confiança' },
  { href: '/settings/playground', label: 'Playground' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação de configurações" className="w-full md:w-52">
      <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col">
        {SETTINGS_LINKS.map((link) => {
          const isActive =
            pathname === link.href || pathname?.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'block rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
