import { clientIp, rateLimited, townForPostcode } from "@/lib/places";

export async function GET(req: Request) {
  if (rateLimited(clientIp(req), 120)) return Response.json({ result: null }, { status: 429 });
  const pc = (new URL(req.url).searchParams.get("pc") ?? "").replace(/[^A-Za-z0-9 ]/g, "").trim().slice(0, 10);
  if (pc.length < 5) return Response.json({ result: null });
  try {
    return Response.json({ result: await townForPostcode(pc) });
  } catch {
    return Response.json({ result: null });
  }
}
