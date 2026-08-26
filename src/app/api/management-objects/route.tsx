/* ZT-009 — API Route: Management Objects (Next.js App Router)
 * Ponytail: English identifiers only, RLS by workspace, build-first Supabase
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as
    | "task"
    | "decision"
    | "opportunity"
    | "commitment"
    | "alert" | null;
  const status = searchParams.get("status") as "pending" | "confirmed" | "rejected" | null;
  const assignedTo = searchParams.get("assignedTo") || null;

  const { data, error } = await supabase
    .from("management_objects")
    .select(`
      *,
      workspaces!inner(name, plan),
      origin_messages!inner(body, from, timestamp)
    `)
    .eq("workspace_id", params.workspace)
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

    const { data: existing } = await supabase
      .from("management_objects")
      .select("id")
      .eq("workspace_id", params.workspace)
      .eq("origin_message_id", body.origin_message_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An object already exists for this message in this workspace." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase.from("management_objects").insert({
      workspace_id: params.workspace,
      object_type: body.object_type,
      title: body.title,
      origin_message_id: body.origin_message_id,
      status: "pending",
      confidence: body.confidence ?? 0.5,
      deadline: body.deadline ?? null,
      metadata: body.metadata ?? {},
      assigned_to: body.assigned_to ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  try {
    const body = await request.json();
    const objectId = body.id;

    if (!objectId) {
      return NextResponse.json(
        { error: "Management object ID required" },
        { status: 400 }
      );
    }

    const updateData: any = { updated_at: new Date().toISOString() };

    if (body.status && /^(pending|confirmed|rejected)$/.test(body.status)) {
      updateData.status = body.status;
    }

    if (body.confidence !== undefined) {
      updateData.confidence = body.confidence;
    }

    if (body.deadline !== undefined) {
      updateData.deadline = body.deadline;
    }

    if (body.metadata !== undefined) {
      updateData.metadata = body.metadata;
    }

    if (body.assigned_to !== undefined) {
      updateData.assigned_to = body.assigned_to;
    }

    const { data, error } = await supabase
      .from("management_objects")
      .update(updateData)
      .eq("id", objectId)
      .eq("workspace_id", params.workspace)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspace: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Management object ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("management_objects")
      .delete()
      .eq("id", id)
      .eq("workspace_id", params.workspace);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}