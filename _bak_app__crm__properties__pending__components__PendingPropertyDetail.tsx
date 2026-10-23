"use client";

import React from "react";
import { Building2, MapPin, DollarSign, Users, Clock, Copy, CheckCircle2 } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent, Button, Badge as UIBadge } from "@repo/ui";
import type { PropertyDraft } from "@/lib/properties/draft-service";
import { formatCurrency, formatTimeAgo } from "@/lib/dates";

interface PendingPropertyDetailProps {
  draft: PropertyDraft;
}

export function PendingPropertyDetail({ draft }: PendingPropertyDetailProps) {
  const statusTone =
    draft.draft_status === "pending"
      ? "default"
      : draft.draft_status === "approved"
        ? "success"
        : "destructive";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{draft.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Draft #{draft.id.slice(0, 8)}...
            </p>
          </div>
          <Badge variant={statusTone}>
            {draft.draft_status === "pending"
              ? "Pendente"
              : draft.draft_status === "approved"
                ? "Aprovado"
                : "Rejeitado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="Tipo">{draft.type}</DetailItem>
          <DetailItem label="Status">{draft.status}</DetailItem>
          <DetailItem label="Operação">
            {draft.operation_type}
            {draft.intention_score != null && (
              <span className="text-xs text-muted-foreground ml-2">
                ({draft.intention_score}/100)
              </span>
            )}
          </DetailItem>
          <DetailItem label="Preço">
            {draft.price != null
              ? formatCurrency(draft.price)
              : "Não informado"}
          </DetailItem>
          <DetailItem label="Área">
            {draft.area_sqm != null
              ? `${draft.area_sqm} m²`
              : "Não informado"}
          </DetailItem>
          <DetailItem label="Quartos">{draft.rooms ?? "—"}</DetailItem>
          <DetailItem label="Banheiros">{draft.bathrooms ?? "—"}</DetailItem>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="CEP">{draft.cep ?? "—"}</DetailItem>
          <DetailItem label="Rua">{draft.street ?? "—"}</DetailItem>
          <DetailItem label="Número">{draft.number ?? "—"}</DetailItem>
          <DetailItem label="Complemento">{draft.complement ?? "—"}</DetailItem>
          <DetailItem label="Bairro">{draft.neighborhood ?? "—"}</DetailItem>
          <DetailItem label="Cidade">
            {draft.city ?? "—"}
            {draft.state && (
              <span className="text-xs text-muted-foreground ml-1">
                - {draft.state}
              </span>
            )}
          </DetailItem>
        </div>

        <div className="flex flex-wrap gap-2">
          {draft.evidenceMessageId && (
            <UIBadge variant="outline" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Prova enviada via WhatsApp
            </UIBadge>
          )}
          <UIBadge variant="outline">
            {draft.evidenceText ? "Resumo: " : ""}
            {draft.evidenceText ?? ""}
          </UIBadge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>
              Capturado em{" "}
              {typeof draft.created_at === "string" ? draft.created_at : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            <span>Draft criado pelo fluxo de captação</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium">{children}</span>
    </div>
  );
}
