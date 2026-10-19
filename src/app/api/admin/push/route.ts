import { isAdmin } from "@/lib/auth";
import { notifyShop, pushPublicKey, removePushSubscription, savePushSubscription } from "@/lib/push";

// Admin → Notifications: the key a phone needs to sign up.
export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  return Response.json({ publicKey: await pushPublicKey() });
}

// Turn notifications on for a phone, remove one, or send a test.
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.action === "remove") {
    await removePushSubscription(Number(body.id) || 0);
    return Response.json({ message: "Removed" });
  }
  if (body.action === "test") {
    const reached = await notifyShop({ title: "✅ PlatedUp notifications are on", body: "You'll get a message like this for every new order.", url: "/admin" });
    return reached
      ? Response.json({ message: `Test sent to ${reached} device${reached > 1 ? "s" : ""}` })
      : Response.json({ error: "No devices reached. Turn notifications on first." }, { status: 400 });
  }
  const sub = body.subscription;
  if (!sub || typeof sub.endpoint !== "string" || !/^https:\/\//.test(sub.endpoint) || typeof sub.keys?.p256dh !== "string" || typeof sub.keys?.auth !== "string")
    return Response.json({ error: "That phone's details weren't sent properly. Try again." }, { status: 400 });
  await savePushSubscription(
    { endpoint: sub.endpoint.slice(0, 600), keys: { p256dh: sub.keys.p256dh.slice(0, 200), auth: sub.keys.auth.slice(0, 100) } },
    typeof body.label === "string" ? body.label : "",
  );
  return Response.json({ message: "Notifications are on for this device" });
}
