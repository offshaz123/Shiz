import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
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

  if (!name || (!phone && !email)) {
    return NextResponse.json(
      { error: "Please provide your name and a phone number or email address." },
      { status: 400 }
    );
  }

  try {
    await query(
      `INSERT INTO enquiries (name, phone, email, service_category, message, channel, status)
       VALUES (?, ?, ?, ?, ?, 'web_form', 'new')`,
      [name, phone, email, serviceCategory, message]
    );
  } catch (error) {
    console.error("Failed to save enquiry:", error);
    return NextResponse.json(
      { error: "Something went wrong saving your enquiry. Please try again or message us on WhatsApp." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
