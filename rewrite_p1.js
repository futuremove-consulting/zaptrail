const fs = require("fs");
const p = "C:/Users/Gustavo/.cline/data/workspaces/chat/pilotcrm/apps/pilotcrm/src/app/crm/properties/[id]/components/PropertyDetail.tsx";
let c = `"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Building2,
  MapPin,
  ArrowLeft,
  Share2,
  Phone,
  MessageCircle,
  Copy,
  Check,
  UserCheck,
} from "lucide-react";
import { Breadcrumbs, Skeleton, PageShell, RecordLayout } from "@repo/ui";
import { cn } from "@/lib/cn";
import type { PropertyCatalogItem } from "@/lib/properties/catalog-types";

const SOURCE_BADGES = {
  captei: { label: "Captei", class: "bg-blue-100 text-blue-800 border-blue-200" },
  eemovel: { label: "eEmóvel", class: "bg-purple-100 text-purple-800 border-purple-200" },
  fisgar: { label: "Fisgar", class: "bg-teal-100 text-teal-800 border-teal-200" },
  manual: { label: "Manual", class: "bg-zinc-100 text-zinc-800 border-zinc-200" },
};

const TYPE_LABELS = { apartment: "Apartamento", house: "Casa Residencial", commercial: "Comercial", land: "Terreno", penthouse: "Cobertura", studio: "Studio / Kitnet" };

function formatAddress(p) {
  const parts = [p.street, p.number != null && p.number !== "" ? String(p.number) : null, p.complement != null && p.complement !== "" ? String(p.complement) : null, p.unit != null && p.unit !== "" ? \`(\${String(p.unit)})\` : null].filter(Boolean);
  const addr = parts.join(", ") || "Sem endereço cadastrado";
  const loc = [p.neighborhood, p.city, p.state].filter(Boolean).join(" - ");
  return loc ? \`\${addr} — \${loc}\` : addr;
}

export default function PropertyDetail() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const res = await fetch(\`/api/crm/properties/\${encodeURIComponent(id)}\`);
        if (res.ok) { const json = await res.json(); if (active && json.data) setProperty(json.data); }
      } catch (err) { console.error("Erro ao carregar detalhes do imóvel:", err); }
      finally { if (active) setLoading(false); }
    }
    if (id) loadData();
    return () => { active = false; };
  }, [id]);

  const copyDossier = () => {
    if (!property) return;
    const priceFormatted = property.price ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(property.price) : "Sob Consulta";
    const text = \`🏡 *\${property.name}*\\n📍 \${formatAddress(property)}\\n💰 \${priceFormatted}\\n📐 \${property.area_sqm || "—"} m² | \${property.rooms || "—"} qts | \${property.parking_spots || "—"} vgs\`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <PageShell variant="fluid" className="space-y-6" role="status" aria-label="Carregando detalhes do imóvel">
        <Skeleton className="h-4 w-48" />
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <Skeleton className="h-8 w-72" /><Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
            <Skeleton className="h-16 rounded-lg" /><Skeleton className="h-16 rounded-lg" /><Skeleton className="h-16 rounded-lg" /><Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!property) {
    return (
      <PageShell variant="fluid" className="space-y-6">
        <div className="rounded-xl border bg-card p-8 text-center space-y-4">
          <p className="text-muted-foreground text-sm">Imóvel não encontrado no catálogo.</p>
          <Link href="/crm/properties" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Catálogo
          </Link>
        </div>
      </PageShell>
    );
  }

  const typeLabel = TYPE_LABELS[property.type ?? ""] ?? property.type ?? "Apartamento";
  const formattedPrice = property.price ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price) : "Sob Consulta";

`;
fs.writeFileSync(p, c, "utf8");
console.log("Part 1 written, lines:", c.split('\n').length);
