const fs = require("fs");
const p = "C:/Users/Gustavo/.cline/data/workspaces/chat/pilotcrm/apps/pilotcrm/src/app/crm/properties/[id]/components/PropertyDetail.tsx";
const c = `
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-[11px] text-muted-foreground block">Área Privativa</span>
                <span className="text-base font-semibold text-foreground">{property.area_sqm ? property.area_sqm + " m²" : "Não informada"}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-[11px] text-muted-foreground block">Dormitórios</span>
                <span className="text-base font-semibold text-foreground">{property.rooms ? property.rooms + " quartos" : "—"}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-[11px] text-muted-foreground block">Banheiros</span>
                <span className="text-base font-semibold text-foreground">{property.bathrooms ? property.bathrooms + " banheiros" : "—"}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-[11px] text-muted-foreground block">Vagas de Garagem</span>
                <span className="text-base font-semibold text-foreground">{property.parking_spots ? property.parking_spots + " vagas" : "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-success" /> Proprietários & Contatos Rápidos
            </h2>
            {property.ownerNames.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">Nenhum proprietário associado a esta oferta até o momento.</p>
            ) : (
              <div className="divide-y divide-border">
                {property.ownerNames.map((name, i) => {
                  const phone = property.ownerPhones[i];
                  const cleanPhone = phone ? phone.replace(/\\D/g, "") : "";
                  return (
                    <div key={name + "-" + i} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-medium text-sm text-foreground block">{name}</span>
                        {phone && <span className="text-xs text-muted-foreground">{phone}</span>}
                      </div>
                      {phone && (
                        <div className="flex items-center gap-2">
                          <a href={"tel:" + cleanPhone} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-input bg-card hover:bg-accent text-foreground transition-colors">
                            <Phone className="h-3 w-3 text-muted-foreground" /> Ligar
                          </a>
                          <a href={"https://wa.me/55" + cleanPhone} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-category-lead-muted text-category-lead border border-category-lead-border hover:opacity-90 transition-opacity">
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link href="/crm/properties" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium">
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Catálogo de Imóveis
              </Link>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted-foreground mr-1">Origem:</span>
                {property.sources.map((s) => {
                  const badge = SOURCE_BADGES[s.source] ?? SOURCE_BADGES.manual;
                  return <span key={s.source + "-" + s.source_record_id} className={cn("px-2 py-0.5 text-[10px] rounded border font-medium", badge.class)}>{badge.label}</span>;
                })}
              </div>
            </div>
          </div>
        </div>
      </RecordLayout>
    </PageShell>
  );
}
`;
fs.appendFileSync(p, c, "utf8");
console.log("Part 2b appended. Total lines:", fs.readFileSync(p, "utf8").split('\n').length);
