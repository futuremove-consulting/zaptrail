const fs = require("fs");
const p = "C:/Users/Gustavo/.cline/data/workspaces/chat/pilotcrm/apps/pilotcrm/src/app/crm/properties/[id]/components/PropertyDetail.tsx";
const c = `
  return (
    <PageShell variant="fluid">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/crm" },
          { label: "Imóveis", href: "/crm/properties" },
          { label: property.name, ariaCurrentPage: true },
        ]}
      />

      <RecordLayout
        leftRailClassName="space-y-4"
        centerClassName="space-y-4"
        rightRailClassName="space-y-4"
      >
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">{typeLabel}</span>
                  {property.developmentName ? (
                    <Link href={"/crm/properties/developments/" + property.developmentId} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium bg-category-visit-alt-muted text-category-visit-alt-foreground border border-category-visit-alt-border hover:opacity-90 transition-opacity">
                      <Building2 className="h-3.5 w-3.5" /> {property.developmentName}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium bg-warning/10 text-warning border border-warning/20">
                      <Home className="h-3.5 w-3.5" /> Avulso de Rua
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{property.name}</h1>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                  <span>{formatAddress(property)}</span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-2 shrink-0">
                <div className="text-2xl font-extrabold text-foreground">{formattedPrice}</div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={copyDossier} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-input bg-card hover:bg-accent transition-colors cursor-pointer">
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copiado!" : "Copiar Ficha"}
                  </button>
                  <a target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                    <Share2 className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
`;
fs.appendFileSync(p, c, "utf8");
console.log("Part 2a appended.");
