'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export interface FilterConfig {
  key: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

interface FilterToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onClearAll?: () => void;
}

export function FilterToolbar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Buscar por conversa, ID ou trecho...',
  filters = [],
  onClearAll,
}: FilterToolbarProps) {
  const hasActiveFilters =
    Boolean(searchQuery.trim()) || filters.some((f) => f.value && f.value !== 'all');

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      {onSearchChange && (
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-1.5">
          <label
            htmlFor={`filter-${filter.key}`}
            className="text-xs font-medium text-muted-foreground"
          >
            {filter.label}:
          </label>
          <Select
            id={`filter-${filter.key}`}
            aria-label={filter.label}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-auto min-w-[120px]"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      ))}

      {hasActiveFilters && onClearAll && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
