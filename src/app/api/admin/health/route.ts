import { isAdmin } from "@/lib/auth";
import { healthChecks } from "@/lib/health";

// "Check again" on the admin status bar.
export async function POST() {
  if (!(await isAdmin())) return Response.json({ error: "Not allowed" }, { status: 401 });
  return Response.json(await healthChecks(true));
}
