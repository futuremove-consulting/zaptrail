/* ZT-009 — ZapTrail Home Page (Dashboard)
 * Ponytail: mobile-first dashboard with quick actions and recent conversations
 */

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/lib/api";
import { ManagementObjectCard } from "@//components/management/ManagementObjectCard";
import { ConversationList } from "@//components/conversations/ConversationList";

export default function HomePage() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="h-[300px] flex items-center justify-center border-t border-b border-border/40">
          <span className="text-muted-foreground">Loading ZapTrail&hellip;</span>
        </div>
      }>
        <nav className="border-b border-border/40 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ZapTrailLogo className="h-8 w-8" />
              <h1 className="text-xl font-bold">ZapTrail</h1>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <a href="/workspaces" className="text-sm font-medium hover:underline">
                Workspaces
              </a>
              <a href="/conversations" className="text-sm font-medium hover:underline">
                Conversations
              </a>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-4 md:p-6">
          {!isLoading && conversations?.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conversations.map((conv) => (
                <ManagementObjectCard
                  key={conv.id}
                  conversation={conv}
                  onSelect={() => navigateToConversation(conv.id)}
                />
              ))}
            </div> : isLoading ? (
              <p className="text-muted-foreground">Loading conversations&hellip;</p>
            ) : (
              <div className="empty-state">
                <IconZap className="h-12 w-12 mb-3 text-muted-foreground" />
                <p className="text-muted-foreground no-conversations-yet">
                  No conversations yet. Start by connecting a WhatsApp provider.
                </p>
              </div>
            )}
          )}
        </main>
      </div>
    </div>
  );
}

function navigateToConversation(conversationId: string) {
  // Navigate to conversation timeline dual view
  window.location.href = `/conversations/${conversationId}`;
}