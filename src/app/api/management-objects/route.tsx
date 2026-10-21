/* ZT-009 — API Route: Management Objects (Next.js App Router)
 * Ponytail: English identifiers only, RLS by workspace, build-first Supabase
 */

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function validateWorkspaceScope(workspace?: string | null): string {
  if (!workspace || typeof workspace !== "string" || !workspace.trim()) {
    throw new Error("Workspace scope required");
  }
  return workspace.trim();
}

let testClientOverride: SupabaseClient | any = null;

export function setTestSupabaseClient(client: SupabaseClient | any): void {
  testClientOverride = client;
}

export function getSupabaseClient(_request?: Request): SupabaseClient | any {
  if (testClientOverride) {
    return testClientOverride;
  }
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "anon-key";
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  let workspaceId: string;
  try {
    workspaceId = validateWorkspaceScope(params?.workspace);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as
    | "task"
    | "decision"
    | "opportunity"
    | "commitment"
    | "alert"
    | null;
  const status = searchParams.get("status") as
    | "pending"
    | "confirmed"
    | "rejected"
    | null;
  const assignedTo = searchParams.get("assignedTo") || null;

  const supabase = getSupabaseClient(request);
  const { data, error } = await supabase
    .from("management_objects")
    .select(`
      *,
      workspaces(name, plan),
      messages(body, from_number, timestamp)
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let filtered = data || [];

  if (type && filtered.length > 0) {
    filtered = filtered.filter((obj: any) => obj.object_type === type);
  }

  if (status && filtered.length > 0) {
    filtered = filtered.filter((obj: any) => obj.status === status);
  }

  if (assignedTo && filtered.length > 0) {
    filtered = filtered.filter(
      (obj: any) =>
        obj.assigned_to?.id === assignedTo || obj.assigned_to === assignedTo
    );
  }

  return NextResponse.json({ data: filtered });
}

export async function POST(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  let workspaceId: string;
  try {
    workspaceId = validateWorkspaceScope(params?.workspace);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    const body = await request.json();

    if (!body.object_type || !body.title || !body.origin_message_id) {
      return NextResponse.json(
        { error: "Missing required fields: object_type, title, origin_message_id" },
        { status: 400 }
      );
    }

    const validTypes = ["task", "decision", "opportunity", "commitment", "alert"];
    if (!validTypes.includes(body.object_type)) {
      return NextResponse.json(
        { error: `Invalid object_type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(request);
    const { data: existing } = await supabase
      .from("management_objects")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("origin_message_id", body.origin_message_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An object already exists for this message in this workspace." },
        { status: 409 }
      );
    }

    const insertPayload = {
      workspace_id: workspaceId,
      object_type: body.object_type,
      title: body.title,
      origin_message_id: body.origin_message_id,
      status: body.status ?? "pending",
      confidence: body.confidence ?? 0.5,
      deadline: body.deadline ?? null,
      metadata: body.metadata ?? {},
      assigned_to: body.assigned_to ?? null,
      epistemic_status: body.epistemic_status ?? "inferred",
    };

    const { data, error } = await supabase
      .from("management_objects")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || insertPayload }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  let workspaceId: string;
  try {
    workspaceId = validateWorkspaceScope(params?.workspace);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    const body = await request.json();
    const objectId = body.id;

    if (!objectId) {
      return NextResponse.json(
        { error: "Management object ID required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(request);

    // Fetch existing object to avoid wiping original metadata
    const { data: existing, error: fetchErr } = await supabase
      .from("management_objects")
      .select("*")
      .eq("id", objectId)
      .eq("workspace_id", workspaceId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json(
        { error: "Management object not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status && /^(pending|confirmed|rejected)$/.test(body.status)) {
      updateData.status = body.status;
    }

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.confidence !== undefined) {
      updateData.confidence = body.confidence;
    }

    if (body.deadline !== undefined) {
      updateData.deadline = body.deadline;
    }

    if (body.assigned_to !== undefined) {
      updateData.assigned_to = body.assigned_to;
    }

    // Review audit trail metadata
    if (body.reviewed_by !== undefined) {
      updateData.reviewed_by = body.reviewed_by;
    }

    if (body.review_notes !== undefined) {
      updateData.review_notes = body.review_notes;
    }

    if (body.status === "confirmed" || body.epistemic_status === "validated_human") {
      updateData.epistemic_status = "validated_human";
      updateData.reviewed_at = body.reviewed_at || new Date().toISOString();
    } else if (body.status === "rejected" || body.epistemic_status === "rejected") {
      updateData.epistemic_status = "rejected";
      updateData.reviewed_at = body.reviewed_at || new Date().toISOString();
    } else if (body.epistemic_status !== undefined) {
      updateData.epistemic_status = body.epistemic_status;
    }

    // Preserve original metadata without wiping
    const existingMeta =
      existing.metadata && typeof existing.metadata === "object"
        ? existing.metadata
        : {};
    if (body.metadata !== undefined) {
      updateData.metadata = {
        ...existingMeta,
        ...body.metadata,
        original_metadata: existingMeta.original_metadata || existingMeta,
      };
    }

    const { data, error } = await supabase
      .from("management_objects")
      .update(updateData)
      .eq("id", objectId)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || { ...existing, ...updateData } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  let workspaceId: string;
  try {
    workspaceId = validateWorkspaceScope(params?.workspace);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Management object ID required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(request);
    const { error } = await supabase
      .from("management_objects")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}