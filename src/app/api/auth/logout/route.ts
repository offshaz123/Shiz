import { endAdminSession, endUserSession } from "@/lib/auth";

export async function POST() {
  await endUserSession();
  await endAdminSession();
  return Response.json({ ok: true });
}
