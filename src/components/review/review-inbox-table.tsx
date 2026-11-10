'use client';

import type { ReviewQueueRecord } from '@/packages/core/supabase-storage';
import { Badge } from '@/components/ui/badge';
import { useReviewKeyboard } from '@/hooks/use-review-keyboard';
import { cn } from '@/lib/utils';

interface ReviewInboxTableProps {
  items: ReviewQueueRecord[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
}

const SEVERITY_META: Record<
  ReviewQueueRecord['severity'],
  { label: string; variant: 'destructive' | 'warning' | 'secondary' }
> = {
  high: { label: 'Alta', variant: 'destructive' },
  medium: { label: 'Média', variant: 'warning' },
  low: { label: 'Baixa', variant: 'secondary' },
};

const STATUS_LABELS: Record<ReviewQueueRecord['status'], string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  edited: 'Editado',
  rejected: 'Rejeitado',
};

export function ReviewInboxTable({
  items,
  selectedId,
  onSelect,
  onApprove,
  onEdit,
  onReject,
}: ReviewInboxTableProps) {
  useReviewKeyboard({
    items: items.map((item) => ({ id: item.review_id })),
    selectedId,
    onSelect,
    onApprove,
    onEdit,
    onReject,
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Severidade
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Conversa
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Razão
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Evidência
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const isSelected = selectedId === item.review_id;
            const sev = SEVERITY_META[item.severity];
            const firstQuote = item.evidence_refs?.[0]?.exact_quote ?? '—';
            const previewQuote =
              firstQuote.length > 50 ? `${firstQuote.slice(0, 50)}…` : firstQuote;

            return (
              <tr
                key={item.review_id}
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => onSelect(item.review_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(item.review_id);
                  }
                }}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-accent/50',
                  isSelected && 'bg-primary/10'
                )}
              >
                <td className="px-4 py-3">
                  <Badge
                    data-testid={`severity-badge-${item.severity}`}
                    variant={sev.variant}
                  >
                    {sev.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">
                  {item.conversation_id}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {item.reason}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {previewQuote}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('pt-BR')
                    : 'Agora'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
