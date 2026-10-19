import { isDbConfigured, query } from "./db";
import { isMailConfigured, verifyMail } from "./mail";
import { checkMetaAds, isMetaAdsConfigured } from "./meta-ads";
import { checkPacklink, isPacklinkConfigured } from "./packlink";
import { isStripeConfigured, stripeGet } from "./stripe";

// The admin status bar: is everything the shop relies on connected and
// working? Each check is a light, read-only request. Results are kept for a
// few minutes so the admin pages stay fast.

export type Check = { name: string; state: "ok" | "warn" | "fail"; detail: string };

const TTL = 5 * 60 * 1000;
let cached: { at: number; checks: Check[] } | null = null;

const errText = (err: unknown) => (err instanceof Error ? err.message : String(err)).slice(0, 200);

// Runs one check, giving up after a few seconds so a slow service can't hang the page.
async function run(name: string, fn: () => Promise<Check | string>): Promise<Check> {
  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("No answer after 8 seconds")), 8000)),
    ]);
    return typeof result === "string" ? { name, state: "ok", detail: result } : result;
  } catch (err) {
    return { name, state: "fail", detail: errText(err) };
  }
}

async function checkAll(): Promise<Check[]> {
  return Promise.all([
    run("Database", async () => {
      if (!isDbConfigured()) return { name: "Database", state: "fail", detail: "Not set up (DB_HOST etc. in Hostinger)." };
      await query("SELECT 1");
      return "Connected";
    }),
    run("Payments (Stripe)", async () => {
      if (!isStripeConfigured()) return { name: "Payments (Stripe)", state: "fail", detail: "STRIPE_SECRET_KEY is missing in Hostinger." };
      if (!process.env.STRIPE_WEBHOOK_SECRET)
        return { name: "Payments (Stripe)", state: "warn", detail: "STRIPE_WEBHOOK_SECRET is missing, so payments may not be marked paid straight away." };
      await stripeGet("balance");
      return "Connected";
    }),
    run("Email", async () => {
      if (!isMailConfigured()) return { name: "Email", state: "fail", detail: "SMTP settings are missing in Hostinger, so no emails go out." };
      await verifyMail();
      const failed = isDbConfigured()
        ? Number((await query<{ n: number }>("SELECT COUNT(*) AS n FROM email_log WHERE status = 'failed' AND created_at > NOW() - INTERVAL 1 DAY"))[0]?.n ?? 0)
        : 0;
      if (failed) return { name: "Email", state: "warn", detail: `Working, but ${failed} email${failed > 1 ? "s" : ""} failed in the last day (often a mistyped customer address). See the order pages.` };
      return "Working";
    }),
    run("Packlink", async () => {
      if (!isPacklinkConfigured()) return { name: "Packlink", state: "warn", detail: "PACKLINK_API_KEY is missing, so orders aren't sent to Packlink." };
      await checkPacklink();
      const failed = isDbConfigured()
        ? Number((await query<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE packlink_error IS NOT NULL AND packlink_ref IS NULL AND paid_at > NOW() - INTERVAL 3 DAY"))[0]?.n ?? 0)
        : 0;
      if (failed) return { name: "Packlink", state: "warn", detail: `Connected, but ${failed} recent order${failed > 1 ? "s" : ""} didn't reach Packlink. Open the order and press "Send to Packlink".` };
      return "Connected";
    }),
    run("Meta ads", async () => {
      if (!isMetaAdsConfigured()) return { name: "Meta ads", state: "warn", detail: "META_ADS_TOKEN is missing, so ad spend isn't shown." };
      await checkMetaAds();
      return "Connected";
    }),
    run("Order notifications", async () => {
      if (!isDbConfigured()) return "Not available without the database";
      const n = Number((await query<{ n: number }>("SELECT COUNT(*) AS n FROM push_subscriptions"))[0]?.n ?? 0);
      return n
        ? `On for ${n} device${n > 1 ? "s" : ""}`
        : { name: "Order notifications", state: "warn", detail: "No phone gets new order notifications yet. Turn them on in Notifications." };
    }),
    run("Meta Pixel (sales tracking)", async () =>
      process.env.META_CAPI_TOKEN
        ? "Set up"
        : { name: "Meta Pixel (sales tracking)", state: "warn", detail: "META_CAPI_TOKEN is missing, so some sales won't show in Meta." },
    ),
  ]);
}

export async function healthChecks(force = false) {
  if (force || !cached || Date.now() - cached.at >= TTL) cached = { at: Date.now(), checks: await checkAll() };
  return { ...cached, minsAgo: Math.max(0, Math.round((Date.now() - cached.at) / 60000)) };
}
