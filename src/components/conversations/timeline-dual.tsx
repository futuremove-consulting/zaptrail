'use client';

import { useState, useEffect } from 'react';
import type {
  ConversationMessage,
  UniversalInterpretationEnvelope,
} from '@/packages/core/types';
import type { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { getDomainManifest } from '@/lib/domain-manifest';
import { TimelineMessage } from './timeline-message';
import { TimelineExtraction } from './timeline-extraction';

interface TimelineDualProps {
  messages: ConversationMessage[];
  envelopes: UniversalInterpretationEnvelope[];
  manifest?: DomainPackUIManifest;
  anchorMessageId?: string;
}

export function buildTimelineHighlightSegments(
  message: string,
  excerpt: string,
  charStart?: number,
  charEnd?: number
): { before: string; highlighted: string; after: string } {
  if (
    typeof charStart === 'number' &&
    typeof charEnd === 'number' &&
    charStart >= 0 &&
    charEnd <= message.length &&
    charStart < charEnd
  ) {
    return {
      before: message.slice(0, charStart),
      highlighted: message.slice(charStart, charEnd),
      after: message.slice(charEnd),
    };
  }
  const idx = message.indexOf(excerpt);
  if (idx === -1) {
    return { before: message, highlighted: '', after: '' };
  }
  return {
    before: message.slice(0, idx),
    highlighted: message.slice(idx, idx + excerpt.length),
    after: message.slice(idx + excerpt.length),
  };
}

export function TimelineDual({
  messages,
  envelopes,
  manifest: manifestProp,
  anchorMessageId,
}: TimelineDualProps) {
  const manifest = manifestProp ?? getDomainManifest('real_estate');
  const [hoveredQuotes, setHoveredQuotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!anchorMessageId) return;
    const el = document.getElementById(anchorMessageId);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [anchorMessageId]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Pane: Original Conversation Messages */}
      <section
        data-testid="messages-panel"
        aria-label="Mensagens da conversa"
        className="space-y-3 rounded-lg border border-border bg-card p-4"
      >
        <h2 className="text-xs font-semibold uppercase text-muted-foreground">
          Mensagens Originais ({messages.length})
        </h2>
        <div className="space-y-3">
          {messages.map((msg) => (
            <TimelineMessage
              key={msg.message_id}
              message={msg}
              highlightQuote={hoveredQuotes[msg.message_id]}
              isAnchor={anchorMessageId === msg.message_id}
            />
          ))}
        </div>
      </section>

      {/* Right Pane: Semantic Extractions */}
      <section
        data-testid="extractions-panel"
        aria-label="Extrações semânticas"
        className="space-y-3 rounded-lg border border-border bg-card p-4"
      >
        <h2 className="text-xs font-semibold uppercase text-muted-foreground">
          Extrações Semânticas ({envelopes.length})
        </h2>
        <div className="space-y-3">
          {envelopes.map((env) => (
            <TimelineExtraction
              key={env.envelope_id}
              envelope={env}
              manifest={manifest}
              onHover={setHoveredQuotes}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
