/* ZT-009 — Conversation List Component
 * Ponytail: list conversations with search, filter, and preview data
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export interface ConversationPreview {
  id: string;
  type: "1:1" | "group";
  participants: string[];
  lastMessage?: {
    id: string;
    body: string;
    from: string;
    timestamp: string;
  };
  objectCount: number; // Number of management objects detected
  unreadCount: number;
}

export function ConversationList({
  onSelect,
}: { onSelect: (conv: ConversationPreview) => void }) {
  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ["conversations-list"],
    queryFn: getConversations,
    staleTime: 30 * 1000,
  });

  const navigate = useNavigate();

  const handleSelect = (conv: ConversationPreview) => {
    onSelect(conv);
    navigate(`/conversations/${conv.id}`);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center border-t border-b border-border/40">
        <span className="text-muted-foreground">Loading conversations&hellip;</span>
      </div>
    );
  }

  if (isError || !conversations || conversations.length === 0) {
    return (
      <div className="h-64 p-6 text-center text-muted-foreground">
        <IconZap className="h-8 w-8 mb-3 opacity-50" />
        <p>No conversations yet.</p>
        <p className="mt-2 text-sm opacity-60">
          Connect a WhatsApp provider to import conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => handleSelect(conv)}
          onMouseEnter => (/* hover state handled by CSS */)
          className="border rounded-lg p-4 hover:border-border transition-colors cursor-pointer hover:bg-card/50"
        >
          <div className="flex items-start gap-3">
            <Avatar
              className="h-8 w-8"
              src={`/avatars/${conv.participants[0] || "default"}.png`}
              fallback={conv.participants[0]?.charAt(0) || "Z"}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate line-clamp-1">
                {conv.participants
                  .slice(0, 2)
                  .map((p) => p.split("@")[0])
                  .join(", ")}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {conv.lastMessage?.body || "No messages yet"}
              </p>
            </div>
            <div className="self-end text-right text-sm">
              <span className="font-medium">
                {conv.objectCount} objects
              </span>
              <span className="text-xs text-muted-foreground">
                {conv.unreadCount} unread
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}