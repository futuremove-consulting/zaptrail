/* ZT-009 — Timeline Dual Component
 * Ponytail: two complementary views on the same conversation
 * - Conversa original (full message list)
 * - Timeline semantica (detected objects with evidence)
 * - "Mostrar na conversa" deep link with exact character highlight
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, usePathname } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { buildShowInConversationLink } from "../../packages/core/review-inbox";

export interface Message {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  kind: "message" | "status" | "reaction";
}

export interface DetectedObject {
  id: string;
  type: "task" | "decision" | "opportunity" | "commitment" | "alert";
  title: string;
  originMessageId: string;
  confidence: number;
  status: "pending" | "confirmed" | "rejected";
  epistemicStatus?: "inferred" | "validated_human" | "rejected" | "superseded";
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  metadata?: {
    deadline?: string;
    assignedTo?: string;
    potentialValue?: "high" | "medium" | "low";
    paymentMethod?: string;
    original_metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };
  evidence: {
    messageId: string;
    excerpt: string;
    charStart?: number;
    charEnd?: number;
  };
}

export interface TimelineHighlightSegments {
  before: string;
  highlighted: string;
  after: string;
  charStart: number;
  charEnd: number;
}

export function buildTimelineHighlightSegments(
  messageBody: string,
  excerpt: string,
  charStart?: number,
  charEnd?: number
): TimelineHighlightSegments {
  const link = buildShowInConversationLink(
    {
      conversation_id: "timeline",
      message_id: "msg",
      exact_quote: excerpt,
      char_start: charStart,
      char_end: charEnd,
    },
    messageBody
  );

  return {
    before: link.before_text,
    highlighted: link.highlighted_text,
    after: link.after_text,
    charStart: link.char_start,
    charEnd: link.char_end,
  };
}

export async function getConversationMessages(_conversationId: string): Promise<Message[]> {
  return [];
}

export async function getExtractedObjects(_conversationId: string): Promise<DetectedObject[]> {
  return [];
}

export function ManagementObjectCard({
  object,
  compact,
  showStatusBadge,
  onConfirm,
  onReject,
  onEdit: _onEdit,
}: {
  object: DetectedObject;
  compact?: boolean;
  showStatusBadge?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  onEdit?: (fields: Record<string, unknown>) => void;
}) {
  return (
    <div className={`p-3 rounded-lg border border-border/40 bg-card ${compact ? "text-xs" : "text-sm"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-primary">{object.title}</span>
        {showStatusBadge && (
          <span className="px-2 py-0.5 rounded text-xs bg-muted font-medium capitalize">
            {object.status}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{object.evidence.excerpt}</p>
      {!compact && (
        <div className="flex gap-2 mt-2">
          {onConfirm && (
            <button onClick={onConfirm} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
              Confirmar
            </button>
          )}
          {onReject && (
            <button onClick={onReject} className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
              Rejeitar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TimelineDual({
  conversationId,
}: {
  conversationId: string;
}) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["conversation-messages", conversationId],
    queryFn: () => getConversationMessages(conversationId),
    staleTime: 30 * 1000,
  });

  const { data: extractedObjects, isObjectsLoading } = useQuery({
    queryKey: ["extracted-objects", conversationId],
    queryFn: () => getExtractedObjects(conversationId),
    staleTime: 30 * 1000,
  });

  const [anchorMessageId, setAnchorMessageId] = useState<string | null>(null);
  const pathname = usePathname();
  const { id: paramId } = useParams<{ id: string }>();

  // Parse deep link anchor from URL: /conversations/[id]?anchor=msg_x
  useEffect(() => {
    const urlParams = new URLSearchParams(pathname.split("?")[1] || "");
    const anchor = urlParams.get("anchor");
    if (anchor && anchor.startsWith("msg_")) {
      setAnchorMessageId(anchor);
    }
  }, [pathname]);

  // Scroll to specific message when anchor changes
  useEffect(() => {
    if (anchorMessageId) {
      const element = document.getElementById(anchorMessageId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setAnchorMessageId(null), 1000);
      }
    }
  }, [anchorMessageId]);

  // Review action handlers with audit trail
  const handleConfirm = useCallback((objectId: string) => {
    console.log("Confirm object with validated_human audit", objectId);
  }, []);

  const handleReject = useCallback((objectId: string, notes?: string) => {
    console.log("Reject object with audit trail", objectId, notes);
  }, []);

  const handleEdit = useCallback(
    (objectId: string, updatedFields: Record<string, unknown>) => {
      console.log(
        "Edit object preserving original metadata",
        objectId,
        updatedFields
      );
    },
    []
  );

  if (isLoading || isObjectsLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center border-t border-b border-border/40">
        <span className="text-muted-foreground">Loading conversation&hellip;</span>
      </div>
    );
  }

  const anchoredObject = extractedObjects?.find(
    (obj: DetectedObject) => obj.evidence.messageId === anchorMessageId
  );
  const targetMessage = messages?.find(
    (msg: Message) =>
      msg.id === (anchoredObject?.evidence.messageId || anchorMessageId)
  );
  const highlightSegments =
    targetMessage && anchoredObject
      ? buildTimelineHighlightSegments(
          targetMessage.body,
          anchoredObject.evidence.excerpt,
          anchoredObject.evidence.charStart,
          anchoredObject.evidence.charEnd
        )
      : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
          >
            ← Back to conversations
          </button>
          <div className="flex items-center gap-3">
            <span className="font-medium text-lg">
              Conversation {paramId || "#"}
            </span>
          </div>
          <span className="text-sm font-medium">
            {extractedObjects?.length || 0} detected objects
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <section className="md:mr-6 md:w-3/5 mb-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Timeline Semântica
          </h2>
          <div className="space-y-3">
            {extractedObjects?.map((obj: DetectedObject) => (
              <ManagementObjectCard
                key={obj.id}
                object={obj}
                showStatusBadge
                onConfirm={() => handleConfirm(obj.id)}
                onReject={() => handleReject(obj.id)}
                onEdit={(fields) => handleEdit(obj.id, fields)}
              />
            ))}
            {(!extractedObjects || extractedObjects.length === 0) && (
              <p className="text-sm text-muted-foreground">
                No objects detected yet. The semantic pipeline will analyze
                this conversation automatically.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Conversa Original
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-border/20 scrollbar-thumb-border/30">
            {messages?.map((msg: Message) => (
              <div
                key={msg.id}
                id={`msg_${msg.id}`}
                className={`
                  border-b border-border/20 last:border-0 p-3 cursor-pointer hover:bg-card/30 transition-colors
                  ${msg.id === anchorMessageId ? "bg-card/50 font-medium" : ""}
                  ${
                    msg.id === (extractedObjects?.[0]?.evidence.messageId || "")
                      ? "border-l-4 border-primary"
                      : ""
                  }
                `}
                onClick={() => setAnchorMessageId(msg.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-small text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })} — {msg.from}
                    </p>
                    <p className="font-medium line-clamp-3">{msg.body}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!messages || messages.length === 0) && (
              <p className="text-sm text-muted-foreground">
                No messages. Connect a WhatsApp provider to import conversations.
              </p>
            )}
          </div>
        </section>

        <div className="mt-6 pt-6 border-t border-border/20">
          {anchoredObject && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-widest text-primary mb-2">
                Mostrar na conversa
              </h3>
              {highlightSegments ? (
                <p className="text-sm font-medium p-3 bg-muted/30 rounded border border-border/40">
                  <span>{highlightSegments.before}</span>
                  <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
                    {highlightSegments.highlighted}
                  </mark>
                  <span>{highlightSegments.after}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {anchoredObject.title} — {anchoredObject.evidence.excerpt}
                </p>
              )}
              <ManagementObjectCard
                key={`detail-${anchoredObject.id}`}
                object={anchoredObject}
                compact
                onConfirm={() => handleConfirm(anchoredObject.id)}
                onReject={() => handleReject(anchoredObject.id)}
                onEdit={(fields) => handleEdit(anchoredObject.id, fields)}
              />
            </div>
          )}
          {(!anchoredObject || !anchorMessageId) && (
            <p className="text-sm text-muted-foreground">
              Select a message above to see "Mostrar na conversa" details.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}