"use client";

import React from "react";
import { MapPin, Building2, CheckCircle2, XCircle } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Field, Textarea } from "@repo/ui";
import type { PropertyDraft } from "@/lib/properties/draft-service";
import { formatTimeAgo } from "@/lib/dates";
import { showToast } from "@/lib/toast";

interface PendingPropertyCardInChatProps {
  draft: PropertyDraft;
  onApprove: (draftId: string) => Promise<void>;
  onReject: (draftId: string, reason: string) => Promise<void>;
}

export function PendingPropertyCardInChat({ draft, onApprove, onReject }: Props) {
  const [showReject, setShowReject] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [rejecting, setRejecting] = React.useState(false);
  const [approved, setApproved] = React.useState(false);

  const submitReject = async () => {
    if (!reason.trim() || !onReject) return;
    setRejecting(true);
    try {
      await onReject(draft.id, reason.trim());
      setShowReject(false);
      setReason("");
      showToast("success", "Imóvel rejeitado");
    } catch {
      showToast("error", "Falha ao rejeitar");
    } finally {
      setRejecting(false);
    }
  };

  const submitApprove = async () => {
    if (!onApprove) return;
    setApproved(true);
    try {
      await onApprove(draft.id);
      showToast("success", "Imóvel aprovado");
    } catch {
      showToast("error", "Falha ao aprovar");
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm truncate">{draft.name}</CardTitle>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {draft.city || draft.state || "Local não informado"}
              </p>
            </div>
          </div>
          <Badge
            variant={
              draft.draft_status === "pending"
                ? "default"
                : draft.draft_status === "approved"
                  ? "success"
                  : "destructive"
            }
          >
            {draft.draft_status === "pending"
              ? "Pendente"
              : draft.draft_status === "approved"
                ? "Aprovado"
                : "Rejeitado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            {draft.full_name}
          </span>
          {draft.email && <span>{draft.email}</span>}
          {draft.phone && <span>{draft.phone}</span>}
          {draft.price != null && (
            <span className="text-foreground font-medium">
              {draft.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            ({draft.intention_score ?? "—"}/100)
          </Badge>
          <Badge variant="outline" className="text-xs">
            {draft.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {draft.operation_type}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowReject(true)}
            className="flex-1 gap-1.5 h-9 text-xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            Rejeitar
          </Button>
          <Button
            variant="default"
            onClick={submitApprove}
            disabled={approved}
            className="flex-1 gap-1.5 h-9 text-xs"
          >
            {approved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirmado
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aprovar
              </>
            )}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {formatTimeAgo(draft.created_at)} • Capturado pelo fluxo de identificação de propriedade
        </p>
      </CardContent>

      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Rejeitar imóvel</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para manter o histórico de aprovação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/30 p-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">
                O contato será vinculado como proprietário (opt-in) do imóvel ao ser aprovado. Esta ação vincula permanentemente o contato ao imóvel.
              </span>
            </div>
            <Field>
              <FieldLabel>Justificativa</FieldLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="O imóvel não atende aos critérios..."
                rows={3}
                className="resize-none"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowReject(false)}
              disabled={rejecting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={submitReject}
              disabled={rejecting || !reason.trim()}
              className="gap-1.5"
            >
              {rejecting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-transparent" />
                  Confirmando...
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Rejeitar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}