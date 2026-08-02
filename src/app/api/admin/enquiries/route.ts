import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { query } from "@/lib/db";

const VALID_CHANNELS = ["web_form", "phone_call", "whatsapp", "walk_in", "chat_bot"];

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : null;
  const email = typeof body.email === "string" ? body.email.trim() : null;
  const serviceCategory = typeof body.serviceCategory === "string" ? body.serviceCategory.trim() : null;
  const message = typeof body.message === "string" ? body.message.trim() : null;
  const channel = typeof body.channel === "string" && VALID_CHANNELS.includes(body.channel) ? body.channel : "phone_call";

  if (!name) {
    return NextResponse.json({ error: "A name is required." }, { status: 400 });
  }

  await query(
    `INSERT INTO enquiries (name, phone, email, service_category, message, channel, status)
     VALUES (?, ?, ?, ?, ?, ?, 'new')`,
    [name, phone, email, serviceCategory, message, channel]
  );

  return NextResponse.json({ ok: true });
}
