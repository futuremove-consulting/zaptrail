"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Inbox, FileText, Wrench } from "lucide-react";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import ContactContext from "./components/ContactContext";
import { cn } from "@/lib/cn";
import { Skeleton } from "@repo/ui";
import { db } from "@/db";
import { property_drafts } from "@/db/schema/propertyDrafts";
import { eq } from "drizzle-orm";
import type { PropertyDraft } from "@/lib/properties/draft-service";
import { PendingPropertyCardInChat } from "./components/PendingPropertyCardInChat";
import { showToast } from "@/lib/toast";

function InboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const convParam = searchParams.get("conv");
  const statusFilter = searchParams.get("status");
  const pendingDraftIdsParam = searchParams.get("pending");
  const pendingDraftIds = pendingDraftIdsParam
    ? pendingDraftIdsParam.split(",").filter(Boolean)
    : [];
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(convParam);
  const [pendingDrafts, setPendingDrafts] = useState<PropertyDraft[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function loadPendingDrafts() {
      try {
        const res = await fetch("/api/crm/properties/pending", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setPendingDrafts(data.items ?? []);
        }
      } catch {
        // erro de rede silencioso
      } finally {
        if (mounted) setLoadingPending(false);
      }
    }
    loadPendingDrafts();
    return () => {
      mounted = false;
    };
  }, []);

  const pendingCards = pendingDrafts.filter((d) =>
    pendingDraftIds.length === 0 || pendingDraftIds.includes(d.id)
  );

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("conv", conversationId);
    router.replace(`/crm/inbox?${params.toString()}`, { scroll: false });
  };

  const returnToList = () => {
    setSelectedConversationId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("conv");
    const query = params.toString();
    router.replace(query ? `/crm/inbox?${query}` : "/crm/inbox", { scroll: false });
  };

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] md:h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-7.5rem)] bg-muted md:rounded-2xl border border-border overflow-hidden shadow-sm" aria-label="Inbox de conversas">
      <h1 className="sr-only">Inbox de Mensagens e Atendimento</h1>

      {/* Column 1: Conversation List */}
      <div className={cn(
        "md:w-80 border-r bg-card flex-col flex-shrink-0",
        showList ? "flex" : "hidden md:flex"
      )} aria-label="Lista de conversas" role="region">
        <div className="p-3 border-b border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Inbox className="h-4 w-4" />
            Conversas
          </div>
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={selectConversation}
            statusFilter={statusFilter ?? undefined}
          />
        </div>
      </div>

      {/* Column 2: Chat Window */}
      <div className={cn(
        "flex-1 bg-muted flex-col min-w-0",
        showChat ? "flex" : "hidden md:flex"
      )} aria-label="Janela da conversa" role="region">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onBack={returnToList}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center" role="status">
            <div className="text-center max-w-xs">
              <MessageSquare className="h-10 w-10 mx-auto text-foreground mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Nenhuma conversa selecionada</p>
              <p className="text-xs text-muted-foreground mt-1">Escolha uma conversa ao lado para ver as mensagens</p>
            </div>
          </div>
        )}
      </div>

      {/* Column 3: Contact Context */}
      <div className={cn(
        "w-80 border-l bg-card flex-col flex-shrink-0",
        showChat ? "hidden lg:flex" : "hidden"
      )}>
        {selectedConversationId ? (
          <ContactContext conversationId={selectedConversationId} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic p-6 text-center">
            Detalhes do contato aparecerão aqui
          </div>
        )}
      </div>

      {/* Column 4: Pending Properties */}
      <div className={cn(
        "w-80 border-l bg-card flex-col flex-shrink-0",
        pendingDrafts.length > 0 ? "hidden lg:flex" : "hidden"
      )} aria-label="Propriedades pendentes" role="region">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Wrench className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Propriedades</span>
          <span className="text-xs text-muted-foreground">
            ({pendingDrafts.length})
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingPending ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : pendingCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
              <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
              <p>Nenhuma propriedade pendente</p>
            </div>
          ) : (
            pendingCards.map((draft) => (
              <PendingPropertyCardInChat
                key={draft.id}
                draft={draft}
                onApprove={async (id) => {
                  try {
                    await fetch(`/api/crm/properties/drafts/${id}/approve`, {
                      method: "POST",
                    });
                    setPendingDrafts((prev) =>
                      prev.filter((d) => d.id !== id)
                    );
                    showToast("success", "Imóvel aprovado");
                  } catch {
                    showToast("error", "Falha ao aprovar");
                  }
                }}
                onReject={async (id, reason) => {
                  try {
                    await fetch(`/api/crm/properties/drafts/${id}/reject`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ reason }),
                    });
                    setPendingDrafts((prev) =>
                      prev.filter((d) => d.id !== id)
                    );
                    showToast("success", "Imóvel rejeitado");
                  } catch {
                    showToast("error", "Falha ao rejeitar");
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100dvh-5.5rem)] md:h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-7.5rem)] gap-2"><div className="md:w-80 space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div><div className="flex-1"><Skeleton className="h-full w-full rounded-xl" /></div></div>}>
      <InboxContent />
    </Suspense>
  );
}
