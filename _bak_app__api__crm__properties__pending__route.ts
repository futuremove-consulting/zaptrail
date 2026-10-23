import { NextResponse } from "next/server";
import { db } from "@/db";
import { property_drafts } from "@/db/schema/propertyDrafts";
import { desc, eq, and, or, like } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1"));
    const perPage = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("perPage") ?? "20")));
    const search = searchParams.get("search") ?? "";

    const whereConditions = ["pending", "approved", "rejected"].map((s) =>
      eq(property_drafts.draft_status, s)
    );
    const conditions = [or(whereConditions)];

    if (search) {
      conditions.push(
        or([
          like(property_drafts.name, `%${search}%`),
          like(property_drafts.full_name, `%${search}%`),
          like(property_drafts.email, `%${search}%`),
          like(property_drafts.city, `%${search}%`),
        ])
      );
    }

    const [totalResult] = await db
      .select({ count: property_drafts.id })
      .from(property_drafts)
      .where(and(...conditions));

    const offset = (page - 1) * perPage;

    const items = await db
      .select()
      .from(property_drafts)
      .where(and(...conditions))
      .orderBy(desc(property_drafts.created_at))
      .limit(perPage)
      .offset(offset);

    return NextResponse.json({
      items,
      total: totalResult.count,
      page,
      perPage,
      totalPages: Math.ceil(totalResult.count / perPage),
    });
  } catch (error) {
    console.error("[GET /api/crm/properties/pending]", error);
    return NextResponse.json(
      { error: "Falha ao listar propriedades pendentes" },
      { status: 500 }
    );
  }
}
