// Property Drafts: rascunhos de imóveis propostos a partir de conversas,
// aguardando aprovação humana antes de serem persistidos como properties/deals.
// Fase 3 (#291) — B01: nunca cria property/deal sem aprovação humana.
import { db } from "@/db";
import { property_drafts, type NewPropertyDraftRow, type PropertyDraftRow } from "@/db/schema/propertyDrafts";
import { properties } from "@/db/schema/properties";
import { crmPersonPropertyRoles } from "@/db/schema/properties";
import { deals } from "@/db/schema/pipeline";
import { deal_properties } from "@/db/schema/dealProperties";
import { pipelines, pipeline_stages } from "@/db/schema/pipelines";
import { contacts } from "@/db/schema/contacts";
import { isValidTenantUuid } from "@/lib/tenancy";
import { eq, and } from "drizzle-orm";

// Tipo público consumido pelas telas (lista pendente, detalhe, card no inbox).
// Mantém snake_case do banco como fonte única de verdade + aliases
// opcionais usados pela UI (contato anexado via join e camelCase legado).
export type PropertyDraft = PropertyDraftRow & {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  evidenceMessageId?: string | null;
  evidenceText?: string | null;
};

export interface CreatePropertyDraftInput {
  tenantId: string;
  contactId: string;
  conversationId?: string | null;
  name: string;
  type?: string;
  status?: string;
  availabilityStatus?: string | null;
  description?: string | null;
  areaSqm?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  price?: number | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  unit?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  evidenceMessageId?: string | null;
  evidenceText?: string | null;
  evidenceSummary?: string | null;
  operationType?: string | null;
  intentionScore?: number | null;
}

export interface CreatePropertyDraftResult {
  success: boolean;
  draftId?: string;
  error?: string;
}

/**
 * Cria um draft de imóvel a partir de evidências de conversa.
 * O draft fica com status 'pending' aguardando aprovação humana.
 * Nunca persiste property ou deal diretamente.
 */
export async function createPropertyDraft(
  input: CreatePropertyDraftInput
): Promise<CreatePropertyDraftResult> {
  const toNumericString = (v: number | null | undefined): string | null =>
    v === null || v === undefined || Number.isNaN(v) ? null : String(v);

  // Validar que o contato existe e pertence ao tenant
  try {
    const where = isValidTenantUuid(input.tenantId)
      ? and(eq(contacts.id, input.contactId), eq(contacts.tenant_id, input.tenantId))
      : eq(contacts.id, input.contactId);
    const [contact] = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(where)
      .limit(1);
    if (!contact) {
      return { success: false, error: "contact_not_found" };
    }
  } catch {
    return { success: false, error: "contact_not_found" };
  }

  const draftPayload: NewPropertyDraftRow = {
    tenant_id: input.tenantId,
    contact_id: input.contactId,
    conversation_id: input.conversationId ?? null,
    name: input.name,
    type: (input.type || "apartment") as NewPropertyDraftRow["type"],
    status: (input.status || "vacant") as NewPropertyDraftRow["status"],
    availability_status: input.availabilityStatus as NewPropertyDraftRow["availability_status"] ?? null,
    description: input.description ?? null,
    area_sqm: toNumericString(input.areaSqm),
    rooms: toNumericString(input.rooms),
    bathrooms: toNumericString(input.bathrooms),
    price: toNumericString(input.price),
    cep: input.cep ?? null,
    street: input.street ?? null,
    number: input.number ?? null,
    complement: input.complement ?? null,
    unit: input.unit ?? null,
    neighborhood: input.neighborhood ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    evidence_message_id: input.evidenceMessageId ?? null,
    evidence_text: input.evidenceText ?? null,
    evidence_summary: input.evidenceSummary ?? null,
    operation_type: input.operationType ?? "venda",
    intention_score: toNumericString(input.intentionScore),
    draft_status: "pending",
  };

  try {
    const [draft] = await db.insert(property_drafts).values(draftPayload).returning({ id: property_drafts.id });
    return { success: true, draftId: draft.id };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { success: false, error: error.message };
  }
}

export interface ApprovePropertyDraftInput {
  tenantId: string;
  draftId: string;
  reviewedBy?: string | null;
}

export interface ApprovePropertyDraftResult {
  success: boolean;
  propertyId?: string;
  dealId?: string | null;
  draftId?: string;
  error?: string;
}

/**
 * Aprova um draft de imóvel pendente.
 * Cria property, deal_properties e person_property_roles (proprietário)
 * somente após aprovação humana. Opcionalmente cria um deal no pipeline
 * adequado conforme o tipo de operação (venda/locação).
 */
export async function approvePropertyDraft(
  input: ApprovePropertyDraftInput
): Promise<ApprovePropertyDraftResult> {
  const [draft] = await db
    .select()
    .from(property_drafts)
    .where(
      and(
        eq(property_drafts.id, input.draftId),
        eq(property_drafts.tenant_id, input.tenantId)
      )
    )
    .limit(1);

  if (!draft) {
    return { success: false, error: "draft_not_found" };
  }

  if (draft.draft_status !== "pending") {
    return { success: false, error: `draft_already_${draft.draft_status}` };
  }

  const now = new Date();

  // 1. Criar o property a partir dos dados do draft
  const [newProperty] = await db
    .insert(properties)
    .values({
      tenant_id: input.tenantId,
      name: draft.name,
      type: draft.type,
      status: draft.status,
      availability_status: draft.availability_status ?? null,
      description: draft.description ?? null,
      area_sqm: draft.area_sqm ?? null,
      rooms: draft.rooms ?? null,
      bathrooms: draft.bathrooms ?? null,
      price: draft.price ?? null,
      cep: draft.cep ?? null,
      street: draft.street ?? null,
      number: draft.number ?? null,
      complement: draft.complement ?? null,
      unit: draft.unit ?? null,
      neighborhood: draft.neighborhood ?? null,
      city: draft.city ?? null,
      state: draft.state ?? null,
    })
    .returning();

  const propertyId = newProperty.id;

  // 2. Criar deal e deal_properties com base no tipo de operação (B04)
  let dealId: string | null = null;

  if (draft.operation_type === "venda" || draft.operation_type === "locacao") {
    const pipelineType = draft.operation_type === "venda" ? "SALE" : "RENT";

    const [pipeline] = await db
      .select()
      .from(pipelines)
      .where(
        and(
          eq(pipelines.tenant_id, input.tenantId),
          eq(pipelines.type, pipelineType)
        )
      )
      .limit(1);

    if (pipeline) {
      const [firstStage] = await db
        .select()
        .from(pipeline_stages)
        .where(eq(pipeline_stages.pipeline_id, pipeline.id))
        .orderBy(pipeline_stages.order)
        .limit(1);

      if (firstStage) {
        const [newDeal] = await db
          .insert(deals)
          .values({
            tenant_id: input.tenantId,
            contact_id: draft.contact_id,
            title: `Negócio: ${draft.name}`,
            value: draft.price ?? null,
            currency: "BRL",
            stage_id: firstStage.id,
            status: "open",
            notes: `Criado a partir de imóvel pendente ${input.draftId}`,
          })
          .returning({ id: deals.id });

        dealId = newDeal.id;

        await db.insert(deal_properties).values({
          tenant_id: input.tenantId,
          deal_id: dealId,
          property_id: propertyId,
          status: "MATCHED",
          interest_level: draft.intention_score
            ? draft.intention_score > 70
              ? "high"
              : draft.intention_score > 40
                ? "medium"
                : "low"
            : null,
          notes: `Imóvel aprovado via fluxo de conversa WhatsApp. Draft: ${input.draftId}`,
        });
      }
    }
  }

  // 3. Vincular contato como proprietário do imóvel (B03)
  await db.insert(crmPersonPropertyRoles).values({
    tenant_id: input.tenantId,
    person_id: draft.contact_id,
    property_id: propertyId,
    role: "proprietario",
    source: "property_creation_approval",
    interest_notes: `Contato vinculado como proprietário na aprovação do imóvel pendente ${input.draftId}`,
  });

  // 4. Atualizar o draft como aprovado
  await db
    .update(property_drafts)
    .set({
      draft_status: "approved",
      reviewed_by: input.reviewedBy ?? null,
      reviewed_at: now,
      created_property_id: propertyId,
      created_deal_id: dealId ?? undefined,
    })
    .where(eq(property_drafts.id, input.draftId));

  return {
    success: true,
    propertyId,
    dealId,
    draftId: input.draftId,
  };
}

export interface RejectPropertyDraftInput {
  tenantId: string;
  draftId: string;
  reason: string;
  reviewedBy?: string | null;
}

export interface RejectPropertyDraftResult {
  success: boolean;
  draftId?: string;
  error?: string;
}

/**
 * Rejeita um draft de imóvel pendente.
 * Exige justificativa (reason) para auditoria.
 */
export async function rejectPropertyDraft(
  input: RejectPropertyDraftInput
): Promise<RejectPropertyDraftResult> {
  if (!input.reason?.trim()) {
    return { success: false, error: "rejection_reason_required" };
  }

  const [draft] = await db
    .select()
    .from(property_drafts)
    .where(
      and(
        eq(property_drafts.id, input.draftId),
        eq(property_drafts.tenant_id, input.tenantId)
      )
    )
    .limit(1);

  if (!draft) {
    return { success: false, error: "draft_not_found" };
  }

  if (draft.draft_status !== "pending") {
    return { success: false, error: `draft_already_${draft.draft_status}` };
  }

  const now = new Date();

  await db
    .update(property_drafts)
    .set({
      draft_status: "rejected",
      reviewed_by: input.reviewedBy ?? null,
      reviewed_at: now,
      reviewer_note: input.reason.trim(),
    })
    .where(eq(property_drafts.id, input.draftId));

  return {
    success: true,
    draftId: input.draftId,
  };
}