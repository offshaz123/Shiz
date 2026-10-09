import { checkAdminLogin, failDelay, isAdminEmail, startAdminSession, startUserSession, verifyPassword } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

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
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const wrong = async () => {
    await failDelay();
    return Response.json({ error: "That email and password don't match." }, { status: 401 });
  };

  // The shop owner's email logs into the admin portal.
  if (isAdminEmail(email)) {
    if (!checkAdminLogin(email, password)) return wrong();
    await startAdminSession();
    return Response.json({ ok: true, redirect: "/admin" });
  }

  const rows = await query<{ id: number; password_hash: string }>("SELECT id, password_hash FROM users WHERE email = ?", [email]);
  if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) return wrong();
  await startUserSession(rows[0].id);
  return Response.json({ ok: true, redirect: "/account" });
}
