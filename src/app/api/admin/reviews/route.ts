import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { deleteReview, setReviewStatus } from "@/lib/reviews";

// Approve, hide or delete a customer review (admin only).
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id)) return Response.json({ error: "Unknown review." }, { status: 400 });
  if (b.action === "approve") await setReviewStatus(id, "approved");
  else if (b.action === "hide") await setReviewStatus(id, "hidden");
  else if (b.action === "delete") await deleteReview(id);
  else return Response.json({ error: "Unknown action." }, { status: 400 });
  // Show the change on the homepage straight away.
  revalidatePath("/");
  return Response.json({ ok: true });
}
