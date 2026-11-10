import Link from 'next/link';
import type { EpistemicStatus } from '@/packages/core/types';
import { ConfidenceBadge } from '@/components/review/confidence-badge';
import { EpistemicBadge } from '@/components/review/epistemic-badge';
import { cn } from '@/lib/utils';

interface ObservationRowProps {
  label: string;
  value: React.ReactNode;
  confidence: number;
  epistemicStatus: EpistemicStatus;
  evidenceQuote?: string;
  conversationId?: string;
  messageId?: string;
  testId?: string;
}

export function ObservationRow({
  label,
  value,
  confidence,
  epistemicStatus,
  evidenceQuote,
  conversationId,
  messageId,
  testId,
}: ObservationRowProps) {
  const isSuperseded = epistemicStatus === 'superseded';

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span
            data-testid={testId ?? (isSuperseded ? 'value-superseded' : undefined)}
            className={cn(
              'text-sm font-semibold text-foreground',
              isSuperseded && 'line-through text-muted-foreground'
            )}
          >
            {value}
          </span>
        </div>

        {evidenceQuote && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="italic">&ldquo;{evidenceQuote}&rdquo;</span>
            {conversationId && (
              <Link
                href={`/conversations/${conversationId}${
                  messageId ? `?anchor=${messageId}` : ''
                }`}
                className="font-medium text-primary hover:underline"
              >
                Mostrar na conversa →
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
        <EpistemicBadge status={epistemicStatus} />
        <ConfidenceBadge confidence={confidence} />
      </div>
    </div>
  );
}
