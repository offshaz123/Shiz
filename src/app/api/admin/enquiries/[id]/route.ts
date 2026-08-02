import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { query } from "@/lib/db";

const VALID_STATUSES = ["new", "contacted", "booked", "completed", "cancelled"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const enquiryId = Number(id);
  if (!Number.isInteger(enquiryId)) {
    return NextResponse.json({ error: "Invalid enquiry id." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: string[] = [];
  const params: (string | number)[] = [];

  if (typeof body.status === "string") {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.push("status = ?");
    params.push(body.status);
  }

  if (typeof body.notes === "string") {
    updates.push("notes = ?");
    params.push(body.notes);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  params.push(enquiryId);
  await query(`UPDATE enquiries SET ${updates.join(", ")} WHERE id = ?`, params);

  return NextResponse.json({ ok: true });
}
