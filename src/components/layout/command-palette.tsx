'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COMMAND_ITEMS = [
  { id: 'nav-dashboard', label: 'Ir para Dashboard', href: '/dashboard' },
  { id: 'nav-review', label: 'Abrir Fila de Revisão', href: '/review' },
  { id: 'nav-extractions', label: 'Explorar Extrações', href: '/extractions' },
  { id: 'nav-conversations', label: 'Ver Conversas', href: '/conversations' },
  {
    id: 'act-playground',
    label: 'Testar conversa no Playground',
    href: '/settings/playground',
  },
  {
    id: 'act-domain',
    label: 'Configurar Pacotes de Domínio',
    href: '/settings/domain',
  },
];

interface CommandPaletteProps {
  initialOpen?: boolean;
}

export function CommandPalette({ initialOpen = false }: CommandPaletteProps) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[selectedIndex];
      if (target) {
        setOpen(false);
        router.push(target.href);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-4">
        <DialogTitle className="text-sm font-semibold text-foreground">
          Busca Rápida de Comandos
        </DialogTitle>
        <div className="mt-2 space-y-3">
          <Input
            placeholder="Buscar tela, extração ou comando..."
            aria-label="Buscar comando"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />

          {filtered.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Nenhum resultado encontrado
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-command-item="true"
                    aria-selected={isSelected}
                    className={cn(
                      'w-full justify-start text-xs',
                      isSelected && 'bg-accent font-medium text-accent-foreground'
                    )}
                    onClick={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
