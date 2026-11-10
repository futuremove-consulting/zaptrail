import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 8, columns = 5 }: SkeletonTableProps) {
  return (
    <div className="w-full" aria-label="Carregando dados..." aria-busy="true">
      {/* Header row */}
      <div className="flex gap-4 border-b border-border px-4 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 border-b border-border px-4 py-3">
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton
              key={col}
              className={`h-4 ${col === 0 ? 'w-6' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
