import webpush from "web-push";
import { execute, query } from "./db";
import { money } from "./plates";
import type { Order } from "./orders";
import { site } from "./site";

// Phone notifications for the shop (Admin → Notifications). The keys that
// identify the website to Apple and Google are made once and kept in the
// database, so there's nothing to set up in Hostinger.

let keys: { publicKey: string; privateKey: string } | null = null;

async function vapid() {
  if (keys) return keys;
  const rows = await query<{ value: string }>("SELECT value FROM app_settings WHERE name = 'vapid'");
  if (rows[0]) keys = JSON.parse(rows[0].value);
  else {
    const made = webpush.generateVAPIDKeys();
    await execute("INSERT IGNORE INTO app_settings (name, value) VALUES ('vapid', ?)", [JSON.stringify(made)]);
    // Another request may have saved its keys first; use whichever is stored.
    const saved = await query<{ value: string }>("SELECT value FROM app_settings WHERE name = 'vapid'");
    keys = JSON.parse(saved[0].value);
  }
  return keys!;
}

export async function pushPublicKey() {
  return (await vapid()).publicKey;
}

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function savePushSubscription(sub: PushSub, label: string) {
  await execute(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, label) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth), label = VALUES(label)`,
    [sub.endpoint, sub.keys.p256dh, sub.keys.auth, label.slice(0, 100)],
  );
}

export async function removePushSubscription(id: number) {
  await execute("DELETE FROM push_subscriptions WHERE id = ?", [id]);
}

export async function listPushSubscriptions() {
  return query<{ id: number; label: string; created_at: Date }>("SELECT id, label, created_at FROM push_subscriptions ORDER BY id");
}

// Sends to every phone that turned notifications on. Phones that have
// switched them off since are removed. Returns how many it reached.
export async function notifyShop(message: { title: string; body: string; url: string; tag?: string }) {
  const subs = await query<{ id: number; endpoint: string; p256dh: string; auth: string }>("SELECT id, endpoint, p256dh, auth FROM push_subscriptions");
  if (!subs.length) return 0;
  const { publicKey, privateKey } = await vapid();
  const payload = JSON.stringify(message);
  let reached = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
          vapidDetails: { subject: `mailto:${site.email}`, publicKey, privateKey },
          TTL: 24 * 60 * 60,
          urgency: "high",
          timeout: 10_000,
        });
        reached++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await removePushSubscription(s.id);
        else console.error("Phone notification failed", status, err instanceof Error ? err.message : err);
      }
    }),
  );
  return reached;
}

// "💷 New order £44.98" when an order is paid.
export async function notifyNewOrder(order: Order) {
  const plates = order.items.map((i) => `${i.reg}`).join(", ");
  await notifyShop({
    title: `💷 New order ${money(order.amount_paid ?? order.total)}`,
    body: `${order.customer_name} · ${plates}${order.docs_status === "outstanding" ? " · documents to come" : ""}`,
    url: `/admin/orders/${order.ref}`,
    tag: order.ref,
  });
}
