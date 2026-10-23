"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { property_drafts, properties, deal_properties, deal } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { PropertyDraft } from "@/lib/properties/draft-service";

export async function getPendingDrafts() {
  try {
    const items = await db
      .select()
      .from(property_drafts)
      .where(eq(property_drafts.draft_status, "pending"))
      .orderBy(property_drafts.created_at);

    return items as PropertyDraft[];
  } catch {
    return [];
  }
}

export async function getDraftById(id: string) {
  try {
    const [draft] = await db
      .select()
      .from(property_drafts)
      .where(eq(property_drafts.id, id));
    return draft as PropertyDraft | undefined;
  } catch {
    return undefined;
  }
}

export async function approvePropertyDraft(
  draftId: string,
  reviewerId: string,
  reviewerNote: string,
  contactId: string
) {
  const client = await db;
  const now = new Date().toISOString();

  return await client.transaction(async (tx) => {
    const [draft] = await tx
      .select()
      .from(property_drafts)
      .where(eq(property_drafts.id, draftId));

    if (!draft) {
      throw new Error("draft_not_found");
    }

    if (draft.draft_status !== "pending") {
      throw new Error("draft_already_approved");
    }

    const propertyId = uuidv4();

    await tx.insert(properties).values({
      id: propertyId,
      name: draft.name,
      type: draft.type,
      status: "available",
      price: draft.price,
      area_sqm: draft.area_sqm,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      location: {
        cep: draft.cep,
        street: draft.street,
        number: draft.number,
        complement: draft.complement,
        neighborhood: draft.neighborhood,
        city: draft.city,
        state: draft.state,
      },
      source: "manual",
      is_avulso: draft.isAvulso ?? false,
      intention_score: draft.intention_score,
      created_by: reviewerId,
      created_at: now,
      updated_at: now,
    });

    if (draft.dealData) {
      const dealId = uuidv4();
      await tx.insert(deal).values({
        id: dealId,
        property_id: propertyId,
        type: draft.dealData.type,
        price: draft.dealData.price,
        area_sqm: draft.dealData.area_sqm,
        bedrooms: draft.dealData.bedrooms,
        bathrooms: draft.dealData.bathrooms,
        created_by: reviewerId,
        created_at: now,
        updated_at: now,
      });

      await tx.insert(deal_properties).values({
        property_id: propertyId,
        deal_id: dealId,
        status: "pending",
        created_at: now,
      });
    }

    await tx.insert(property_drafts).values({
      id: draftId,
      name: draft.name,
      type: draft.type,
      status: "pending",
      draft_status: "approved",
      operation_type: draft.operation_type,
      intention_score: draft.intention_score,
      price: draft.price,
      area_sqm: draft.area_sqm,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      evidence_message_id: draft.evidence_message_id,
      evidence_text: draft.evidence_text,
      cep: draft.cep,
      street: draft.street,
      number: draft.number,
      complement: draft.complement,
      neighborhood: draft.neighborhood,
      city: draft.city,
      state: draft.state,
      is_avulso: draft.isAvulso,
      contact_id: contactId,
      contact_email: draft.contact_email,
      contact_phone: draft.contact_phone,
      full_name: draft.full_name,
      reviewed_by: reviewerId,
      reviewer_note: reviewerNote,
      created_at: draft.created_at,
      updated_at: now,
    });
  });
}

export async function rejectPropertyDraft(
  draftId: string,
  reason: string,
  reviewerId: string
) {
  const client = await db;
  const now = new Date().toISOString();

  return await client.transaction(async (tx) => {
    const [draft] = await tx
      .select()
      .from(property_drafts)
      .where(eq(property_drafts.id, draftId));

    if (!draft) {
      throw new Error("draft_not_found");
    }

    if (draft.draft_status !== "pending") {
      throw new Error("draft_already_rejected");
    }

    if (!reason.trim()) {
      throw new Error("rejection_reason_required");
    }

    await tx.update(property_drafts)
      .set({
        draft_status: "rejected",
        reviewer_note: reason,
        reviewed_by: reviewerId,
        reviewed_at: now,
        updated_at: now,
      })
      .where(eq(property_drafts.id, draftId));
  });
}

