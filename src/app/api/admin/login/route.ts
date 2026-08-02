import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  let valid = false;
  try {
    valid = await verifyAdminPassword(password);
  } catch (error) {
    console.error("Admin login misconfigured:", error);
    return NextResponse.json(
      { error: "Admin login isn't configured yet. Set ADMIN_PASSWORD_HASH and SESSION_SECRET." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
