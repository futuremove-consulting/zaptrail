import type { ConversationMessage } from '@/packages/core/types';
import { EvidenceHighlight } from '@/components/review/evidence-highlight';
import { cn } from '@/lib/utils';

interface TimelineMessageProps {
  message: ConversationMessage;
  highlightQuote?: string;
  isAnchor?: boolean;
}

export function TimelineMessage({
  message,
  highlightQuote,
  isAnchor = false,
}: TimelineMessageProps) {
  const isInbound = message.direction === 'inbound';

  return (
    <div
      id={message.message_id}
      data-testid={`message-${message.message_id}`}
      className={cn(
        'flex flex-col rounded-lg border border-border p-3 text-sm transition-all',
        isInbound
          ? 'mr-8 bg-card text-card-foreground'
          : 'ml-8 bg-primary/10 text-foreground',
        isAnchor && 'ring-2 ring-primary'
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          {message.sender_name ?? message.sender_id}
        </span>
        <span className="font-mono">
          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <p className="text-sm leading-relaxed">
        {highlightQuote ? (
          <EvidenceHighlight
            messageBody={message.raw_text}
            quote={highlightQuote}
            conversationId={message.conversation_id}
            messageId={message.message_id}
          />
        ) : (
          message.raw_text
        )}
      </p>
    </div>
  );
}
