/* ZT-009 — Timeline Dual Component
 * Ponytail: two complementary views on the same conversation
 * - Conversa original (full message list)
 * - Timeline semantica (detected objects with evidence)
 * - "Mostrar na conversa" deep link
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, usePathname } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getConversationMessages } from "@/lib/api";
import { getExtractedObjects } from "@//providers/whatsapp/mockProvider";
import { ManagementObjectCard } from "@//components/management/ManagementObjectCard";

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
  metadata?: {
    deadline?: string;
    assignedTo?: string;
    potentialValue?: "high" | "medium" | "low";
    paymentMethod?: string;
  };
  evidence: {
    messageId: string;
    excerpt: string;
  };
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
        // Remove anchor after scrolling
        setTimeout(() => setAnchorMessageId(null), 1000);
      }
    }
  }, [anchorMessageId]);

  if (isLoading || isObjectsLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center border-t border-b border-border/40">
        <span className="text-muted-foreground">Loading conversation&hellip;</span>
      </div>
    );
  }

  // Filter objects to show only the one related to the anchored message, if any
  const anchoredObject = extractedObjects?.find(
    (obj) => obj.evidence.messageId === anchorMessageId
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button and conversation info */}
      <header className="border-b border-border/40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
          >
            ← Back to conversations
          </button>
          <div className="flex items-center gap-3">
            {/* Conversation header - participants */}
            <Avatar
              className="h-8 w-8"
              src="/avatars/default.png"
              fallback="Z"
            />
            <span className="font-medium text-lg">
              Conversation {paramId || "#"}
            </span>
          </div>
          {/* Object count badge */}
          <span className="text-sm font-medium">
            {extractedObjects?.length || 0} detected objects
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Timeline Semântica (left/large screen) */}
        <section className="md:mr-6 md:w-3/5 mb-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Timeline Semântica
          </h2>
          <div className="space-y-3">
            {extractedObjects?.map((obj) => (
              <ManagementObjectCard
                key={obj.id}
                object={obj}
                showStatusBadge
                onConfirm={() => console.log("Confirm object")}
                onReject={() => console.log("Reject object")}
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

        {/* Conversa Original (right/small screen or below timeline) */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Conversa Original
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-border/20 scrollbar-thumb-border/30">
            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`
                  border-b border-border/20 last:border-0 p-3 cursor-pointer hover:bg-card/30 transition-colors
                  ${msg.id === anchorMessageId ? "bg-card/50 font-medium" : ""}
                  ${msg.id === (extractedObjects?.[0]?.evidence.messageId || "") ? "border-l-4 border-primary" : ""}
                `}
                onClick={() => setAnchorMessageId(msg.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    className="h-6 w-6 flex-shrink-0"
                    src="/avatars/default.png"
                    fallback={msg.from.split("@")[0]?.charAt(0) || "U"}
                  />
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
            {!messages || messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No messages. Connect a WhatsApp provider to import conversations.
              </p>
            )}
          </div>
        </section>

        {/* "Mostrar na conversa" highlight + object details panel */}
        <div className="mt-6 pt-6 border-t border-border/20">
          {anchoredObject && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-widest text-primary mb-2">
                Mostrar na conversa
              </h3>
              <p className="text-xs text-muted-foreground">
                {anchoredObject.title} — {anchoredObject.evidence.excerpt}
              </p>
              <ManagementObjectCard
                key={`detail-${anchoredObject.id}`}
                object={anchoredObject}
                compact
              />
            </div>
          )}
          {(!anchoredObject || anchorMessageId) && (
            <p className="text-sm text-muted-foreground">
              Select a message above to see "Mostrar na conversa" details.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/* Management Object Card sub-component for the timeline */
ManagementObjectCard.propTypes = {
  object: required,
  compact: optional,
  showStatusBadge: optional,
  onConfirm: optional,
  onReject: optional,
};