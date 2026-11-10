import { buildShowInConversationLink } from '@/packages/core/review-inbox';

interface EvidenceHighlightProps {
  messageBody: string;
  quote: string;
  conversationId?: string;
  messageId?: string;
}

export function EvidenceHighlight({
  messageBody,
  quote,
  conversationId = 'conv_preview',
  messageId = 'msg_preview',
}: EvidenceHighlightProps) {
  if (!messageBody || !quote) {
    return (
      <span data-testid="evidence-fallback" className="text-muted-foreground">
        {messageBody || quote}
      </span>
    );
  }

  const linkResult = buildShowInConversationLink(
    {
      conversation_id: conversationId,
      message_id: messageId,
      exact_quote: quote,
    },
    messageBody
  );

  if (!linkResult.highlighted_text) {
    return (
      <span data-testid="evidence-fallback" className="text-muted-foreground">
        {messageBody}
      </span>
    );
  }

  return (
    <span className="leading-relaxed text-foreground">
      <span data-testid="before-text">{linkResult.before_text}</span>
      <mark
        role="mark"
        aria-label="Trecho citado como evidência"
        className="rounded-xs bg-warning/20 px-1 py-0.5 font-semibold text-foreground underline decoration-warning decoration-2"
      >
        {linkResult.highlighted_text}
      </mark>
      <span data-testid="after-text">{linkResult.after_text}</span>
    </span>
  );
}
