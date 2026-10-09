import { getCurrentUser, hashPassword, isAdminEmail, isValidEmail, verifyPassword } from "@/lib/auth";
import { execute, query } from "@/lib/db";

// The logged-in customer's details (used to fill in checkout).
export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in again." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const s = (k: string, max: number) => String(b[k] ?? "").trim().slice(0, max);
  const name = s("name", 200);
  const email = s("email", 190).toLowerCase();
  if (!name) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidEmail(email) || isAdminEmail(email)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (email !== user.email) {
    const taken = await query("SELECT id FROM users WHERE email = ? AND id <> ?", [email, user.id]);
    if (taken.length) return Response.json({ error: "Another account already uses that email." }, { status: 409 });
  }

  await execute(
    "UPDATE users SET name = ?, email = ?, phone = ?, address1 = ?, address2 = ?, town = ?, postcode = ? WHERE id = ?",
    [name, email, s("phone", 40), s("address1", 200), s("address2", 200), s("town", 100), s("postcode", 12).toUpperCase(), user.id],
  );

  // Optional password change.
  const newPassword = String(b.newPassword ?? "");
  if (newPassword) {
    if (newPassword.length < 8) return Response.json({ error: "Your new password needs at least 8 characters." }, { status: 400 });
    const rows = await query<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [user.id]);
    if (!(await verifyPassword(String(b.currentPassword ?? ""), rows[0].password_hash)))
      return Response.json({ error: "Your current password isn't right." }, { status: 400 });
    await execute("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(newPassword), user.id]);
  }
  return Response.json({ ok: true });
}
