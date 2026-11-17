import { checkAdminLogin, failDelay, isAdminEmail, startAdminSession, startUserSession, verifyPassword } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { clientIp, rateLimited } from "@/lib/places";
import { notifyShop } from "@/lib/push";

// The admin password gets a much stricter limit than customers' logins: 5
// wrong tries from one connection locks it out of the admin for 15 minutes,
// and the shop's phones are told someone is guessing.
const ADMIN_TRIES = 5;
const ADMIN_LOCK = 15 * 60_000;
const adminFails = new Map<string, { n: number; until: number }>();

function adminLocked(ip: string) {
  const f = adminFails.get(ip);
  return Boolean(f && f.n >= ADMIN_TRIES && f.until > Date.now());
}

function adminFailed(ip: string) {
  const now = Date.now();
  const f = adminFails.get(ip);
  const next = f && f.until > now ? { n: f.n + 1, until: now + ADMIN_LOCK } : { n: 1, until: now + ADMIN_LOCK };
  if (adminFails.size > 5000) adminFails.clear();
  adminFails.set(ip, next);
  if (next.n === ADMIN_TRIES)
    notifyShop({
      title: "⚠️ Admin login blocked",
      body: `${ADMIN_TRIES} wrong admin passwords in a row. That connection is locked out for 15 minutes. If it wasn't you, change ADMIN_PASSWORD in Hostinger.`,
      url: "/admin",
      tag: "admin-login",
    }).catch(() => {});
}

export async function POST(req: Request) {
  // Slows down anyone guessing passwords (including the admin one).
  if (rateLimited(`login:${clientIp(req)}`, 10)) return Response.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
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
    const ip = clientIp(req);
    if (adminLocked(ip)) {
      await failDelay();
      return Response.json({ error: "Too many wrong passwords. Please wait 15 minutes and try again." }, { status: 429 });
    }
    if (!checkAdminLogin(email, password)) {
      adminFailed(ip);
      return wrong();
    }
    adminFails.delete(ip);
    await startAdminSession();
    return Response.json({ ok: true, redirect: "/admin" });
  }

  const rows = await query<{ id: number; password_hash: string }>("SELECT id, password_hash FROM users WHERE email = ?", [email]);
  if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) return wrong();
  await startUserSession(rows[0].id);
  return Response.json({ ok: true, redirect: "/account" });
}
