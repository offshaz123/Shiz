import { hashPassword, isAdminEmail, isValidEmail, startUserSession } from "@/lib/auth";
import { execute, isDbConfigured, query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    console.error("Login/signup failed", err);
    // The short error code (e.g. ER_ACCESS_DENIED_ERROR) helps the shop fix settings; it reveals nothing private.
    const code = (err as { code?: string })?.code ?? "UNKNOWN";
    return Response.json(
      { error: `We couldn't connect to our database (${code}). Please try again shortly or message us on WhatsApp.` },
      { status: 500 },
    );
  }
}

async function handle(req: Request) {
  if (!isDbConfigured()) return Response.json({ error: "Accounts aren't available yet." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const password = String(body.password ?? "");
  if (!name) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidEmail(email)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Your password needs at least 8 characters." }, { status: 400 });
  if (password.length > 200) return Response.json({ error: "That password is too long." }, { status: 400 });
  if (isAdminEmail(email)) return Response.json({ error: "That email can't be used. Please log in instead." }, { status: 400 });

  const existing = await query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) return Response.json({ error: "There's already an account with that email. Please log in." }, { status: 409 });

  const res = await execute("INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)", [
    email,
    await hashPassword(password),
    name,
    phone,
  ]);
  await startUserSession(res.insertId);
  return Response.json({ ok: true, redirect: "/account" });
}
