import { notFound } from "next/not-found";
import { redirect } from "next/navigation";
import { PageHeader } from "@repo/ui";
import { PendingPropertyDetail } from "../components/PendingPropertyDetail";
import { getDraftById } from "../actions";

export const dynamic = "force-dynamic";

export default async function PendingPropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const draft = await getDraftById(params.id);

  if (!draft) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalhes do imóvel"
        description="Visualização completa dos dados do imóvel em espera de aprovação."
      />
      <PendingPropertyDetail draft={draft} />
    </div>
  );
}