import { clientIp, details, isPlacesConfigured, rateLimited } from "@/lib/places";

export async function GET(req: Request) {
  if (!isPlacesConfigured()) return Response.json({ error: "Address lookup is off" }, { status: 404 });
  if (rateLimited(clientIp(req))) return Response.json({ error: "Too many requests" }, { status: 429 });
  const q = new URL(req.url).searchParams;
  const id = (q.get("id") ?? "").slice(0, 300);
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  try {
    return Response.json({ address: await details(id, (q.get("session") ?? "").slice(0, 64)) });
  } catch (err) {
    console.error("Address details failed", err);
    return Response.json({ error: "Lookup failed" }, { status: 502 });
  }
}
