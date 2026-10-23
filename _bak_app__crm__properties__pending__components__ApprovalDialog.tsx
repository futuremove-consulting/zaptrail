"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Field,
  FieldLabel,
  FieldError,
  Textarea,
} from "@repo/ui";
import type { PropertyDraft } from "@/lib/properties/draft-service";
import { showToast } from "@/lib/toast";

interface ApprovalDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  draft?: PropertyDraft | null;
  onApprove?: (draftId: string) => void;
  onReject?: (draftId: string, reason: string) => void;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  draft,
  onApprove,
  onReject,
}: ApprovalDialogProps) {
  const [localDraft, setLocalDraft] =
    React.useState<PropertyDraft | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejecting, setRejecting] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);

  React.useEffect(() => {
    if (draft) {
      setLocalDraft(draft);
      setRejectReason("");
      setRejecting(false);
      setApproved(false);
      setRejected(false);
    }
  }, [draft]);

  if (!draft) return null;

  const handleConfirmApprove = () => {
    if (!onApprove) return;
    setApproved(true);
    onApprove(draft.id);
    showToast("success", "Imóvel aprovado");
  };

  const handleConfirmReject = () => {
    if (!onReject || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      onReject(draft.id, rejectReason.trim());
      setRejecting(false);
      setRejected(true);
      showToast("success", "Imóvel rejeitado", "Justificativa registrada no histórico.");
    } catch {
      setRejecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {localDraft.draft_status === "pending" && "Confirmar ação"}
            {localDraft.draft_status === "approved" && "Aprovação registrada"}
            {localDraft.draft_status === "rejected" && "Rejeição registrada"}
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{localDraft.name}</span>
            {"id" in localDraft && (
              <span className="block text-xs text-muted-foreground mt-1">
                ID do imóvel: {localDraft.id}
              </span>
            )}
            {"created_at" in localDraft && (
              <span className="block text-xs text-muted-foreground mt-1">
                Criado em: {localDraft.created_at}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {localDraft.draft_status === "pending" ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/30 p-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">
                  O contato{" "}
                  <span className="font-medium text-foreground">
                    {localDraft.full_name}
                  </span>{" "}
                  será vinculado como proprietário do imóvel ao ser aprovado.
                </span>
              </div>

              <Field className="mt-4">
                <FieldLabel>Justificativa da rejeição</FieldLabel>
                <Textarea
                  placeholder="Informe o motivo da rejeição..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  disabled={rejected || rejecting}
                  className="resize-none"
                />
                <FieldError>
                  {rejectReason.trim().length < 5 &&
                    rejected === false &&
                    "Informe um motivo para a rejeição."}
                </FieldError>
              </Field>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onReject) onReject(draft.id, rejectReason.trim());
                  }}
                  disabled={rejecting || !rejectReason.trim()}
                  className="flex-1 gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
                <Button
                  onClick={handleConfirmApprove}
                  className="flex-1 gap-2"
                  disabled={approved}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprovar
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={handleConfirmApprove}
                className="flex-1 gap-2"
                disabled={approved}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmar
              </Button>
              <Button
                variant="outline"
                onClick={handleConfirmReject}
                className="flex-1 gap-2"
                disabled={rejected}
              >
                <XCircle className="h-4 w-4" />
                Rejeitar
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            Aprovar salva o imóvel no acervo permanentemente. A rejeição
            descarta o rascunho sem alterar o acervo.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            Aprovar salva o imóvel no acervo permanentemente. A rejeição
            descarta o rascunho sem alterar o acervo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}