"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Building2, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import {
  DataTable,
  Button,
  Badge,
  SkeletonTable,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  type ColumnDef,
} from "@repo/ui";
import { cn } from "@/lib/cn";
import type { PropertyDraft } from "@/lib/properties/draft-service";
import { ApprovalDialog } from "./ApprovalDialog";
import { formatTimeAgo } from "@/lib/dates";

function formatStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Rejeitado";
    default:
      return status;
  }
}

export interface PendingPropertiesListProps {
  initialItems?: PropertyDraft[];
  total?: number;
  page?: number;
  perPage?: number;
}

function PendingPropertiesListInner({
  initialItems = [],
  total: _total = 0,
  page: initialPage = 1,
  perPage: _perPage,
}: PendingPropertiesListProps) {
  const [selecting, setSelecting] = useState(false);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [selectedDraft, setSelectedDraft] =
    useState<PropertyDraft | null>(null);

  const handleApprove = useCallback(
    (draftId: string) => {
      setApprovedIds((prev) => {
        const next = new Set(prev);
        next.add(draftId);
        return next;
      });
      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
      }
    },
    [selectedDraft]
  );

  const handleReject = useCallback(
    (draftId: string) => {
      setRejectedIds((prev) => {
        const next = new Set(prev);
        next.add(draftId);
        return next;
      });
      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
      }
    },
    [selectedDraft]
  );

  const columns: ColumnDef<PropertyDraft>[] = [
    {
      header: "Imóvel",
      render: (draft) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/crm/properties/pending/${draft.id}`}
              className="font-medium text-sm text-foreground hover:text-primary hover:underline truncate"
            >
              {draft.name}
            </Link>
            {draft.type && (
              <Badge variant="secondary" className="text-2xs">
                {draft.type}
              </Badge>
            )}
          </div>
          {draft.operation_type && (
            <div className="text-2xs text-muted-foreground">
              Operação: {draft.operation_type}
            </div>
          )}
          {draft.price != null && (
            <div className="text-xs text-muted-foreground">
              {draft.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          )}
          {draft.intention_score != null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {draft.intention_score}/100
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Contato",
      render: (draft) => (
        <div className="space-y-1 text-xs text-muted-foreground">
          {draft.full_name}
          {draft.email && <div>{draft.email}</div>}
          {draft.phone && <div>{draft.phone}</div>}
        </div>
      ),
    },
    {
      header: "Localização",
      render: (draft) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {draft.city || draft.state || "—"}
        </div>
      ),
    },
    {
      header: "Criado",
      render: (draft) => (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(draft.created_at)}
        </div>
      ),
    },
    {
      header: "Status",
      render: (draft) => (
        <Badge
          variant={
            draft.draft_status === "pending"
              ? "default"
              : draft.draft_status === "approved"
                ? "success"
                : "destructive"
          }
        >
          {formatStatusLabel(draft.draft_status)}
        </Badge>
      ),
    },
    {
      header: "Ações",
      render: (draft) => (
        <div className="flex items-center gap-1">
          <Dialog
            open={selectedDraft?.id === draft.id}
            onOpenChange={(open) => {
              if (!open) setSelectedDraft(null);
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">Ações</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Ações do imóvel</DialogTitle>
                <DialogDescription>
                  {draft.draft_status === "pending"
                    ? "Escolha aprovar ou rejeitar este imóvel."
                    : formatStatusLabel(draft.draft_status)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                {draft.draft_status === "pending" ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        handleApprove(draft.id);
                        setSelectedDraft(null);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aprovar e salvar no acervo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        setSelectedDraft(draft);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                    <p className="text-2xs text-muted-foreground">
                      Ao aprovar, o imóvel passará a integrar o acervo e o
                      contato será vinculado como proprietário.
                    </p>
                  </>
                ) : (
                  <p className="text-2xs text-muted-foreground">
                    {formatStatusLabel(draft.draft_status)}
                    {draft.draft_status === "rejected" && draft.reviewer_note && (
                      <span className="block mt-1 text-xs text-muted-foreground">
                        Justificativa: {draft.reviewer_note}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Exibindo {initialItems.length} imóvel(s) pendente(s)
        </p>
      </div>

      {initialItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground">
            Nenhum imóvel pendente
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            Imóveis capturados ainda não foram aprovados ou rejeitados.
            Quando houver imóveis aguardando, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={initialItems}
          getRowId={(d) => d.id}
          pagination={{
            page: initialPage,
            totalPages: 1,
            onPrev: () => {},
            onNext: () => {},
          }}
          emptyState={{
            icon: Clock,
            title: "Nenhum imóvel pendente",
            description:
              "Imóveis capturados ainda não foram aprovados ou rejeitados.",
          }}
        />
      )}

      <ApprovalDialog
        open={selectedDraft !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDraft(null);
        }}
        draft={selectedDraft ?? undefined}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

export async function PendingPropertiesList({
  initialItems = [],
  total: _total = 0,
  page: initialPage = 1,
  perPage: _perPage,
}: PendingPropertiesListProps) {
  return (
    <Suspense fallback={<SkeletonTable rows={5} columns={5} />}>
      <PendingPropertiesListInner
        initialItems={initialItems}
        total={_total}
        page={initialPage}
        perPage={_perPage}
      />
    </Suspense>
  );
}

function Suspense({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return <>{children}</>;
}
