import { clientIp, isPlacesConfigured, rateLimited, suggest } from "@/lib/places";

export async function GET(req: Request) {
  if (!isPlacesConfigured()) return Response.json({ enabled: false, suggestions: [] });
  if (rateLimited(clientIp(req))) return Response.json({ enabled: true, suggestions: [] }, { status: 429 });
  const q = new URL(req.url).searchParams;
  const input = (q.get("q") ?? "").trim().slice(0, 120);
  const session = (q.get("session") ?? "").slice(0, 64);
  if (input.length < 3) return Response.json({ enabled: true, suggestions: [] });
  try {
    return Response.json({ enabled: true, suggestions: await suggest(input, session) });
  } catch (err) {
    console.error("Address suggestions failed", err);
    return Response.json({ enabled: true, suggestions: [] });
  }
}
