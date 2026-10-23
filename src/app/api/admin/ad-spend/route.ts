import { isAdmin } from "@/lib/auth";
import { addAdPayment, deleteAdPayment, isAdPlatform } from "@/lib/ad-spend";

// Admin → Money: add a payment for ads (from the TikTok or Google bill).
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const day = String(body.day ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) return Response.json({ error: "Pick the date you paid." }, { status: 400 });
  // Google and Meta come in by themselves, so typing them in would count them twice.
  if (!isAdPlatform(body.platform) || body.platform === "google" || body.platform === "meta")
    return Response.json({ error: "Pick TikTok or Other ads." }, { status: 400 });
  const pounds = Number(String(body.amount ?? "").replace(/[£,\s]/g, ""));
  if (!Number.isFinite(pounds) || pounds <= 0 || pounds > 100000) return Response.json({ error: "Type the amount in pounds, like 120." }, { status: 400 });
  await addAdPayment({ day, platform: body.platform, amount: Math.round(pounds * 100), note: String(body.note ?? "").trim().slice(0, 200) });
  return Response.json({ message: "Added" });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "That payment wasn't found." }, { status: 400 });
  await deleteAdPayment(id);
  return Response.json({ message: "Removed" });
}
