import { isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

// Opens an uploaded V5C / ID document. Admin only.
export async function GET(_req: Request, ctx: RouteContext<"/api/admin/documents/[id]">) {
  if (!(await isAdmin())) return new Response("Not allowed", { status: 401 });
  const { id } = await ctx.params;
  const rows = await query<{ filename: string; mime: string; data: Buffer }>(
    "SELECT filename, mime, data FROM documents WHERE id = ?",
    [Number(id) || 0],
  );
  const doc = rows[0];
  if (!doc) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename="${doc.filename.replace(/[^\w.\-]+/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
