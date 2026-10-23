import { Suspense } from "react";
import { PageHeader } from "@repo/ui";
import { PendingPropertiesList } from "./components/PendingPropertiesList";
import { getPendingDrafts } from "./actions";
import { db } from "@/db";
import { property_drafts } from "@/db/schema/propertyDrafts";
import { eq } from "drizzle-orm";
import type { PropertyDraft } from "@/lib/properties/draft-service";

export const dynamic = "force-dynamic";

async function getInitialData() {
  const [approved, rejected] = await Promise.all([
    db
      .select()
      .from(property_drafts)
      .where(eq(property_drafts.draft_status, "approved"))
      .limit(10),
    db
      .select()
      .from(property_drafts)
      .where(eq(property_drafts.draft_status, "rejected"))
      .limit(10),
  ]);

  const all = [...approved, ...rejected];
  return {
    items: all as PropertyDraft[],
    total: all.length,
  };
}

export default async function PendingPropertiesPage() {
  const { items, total } = await getInitialData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propriedades em aprovação"
        description="Lista das propriedades em rascunho aguardando aprovação. Aprovar integra o imóvel ao acervo e vincula o contato como proprietário."
      />

      <PendingPropertiesList
        initialItems={items}
        total={total}
      />
    </div>
  );
}

// Suspense boundary para componentes client-side
function PendingPropertiesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}

export { PendingPropertiesListSkeleton };
