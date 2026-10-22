import { execute, isDbConfigured } from "./db";
import { type Insights, getInsights } from "./insights";
import { isMailConfigured, sendToShop } from "./mail";
import { site } from "./site";

// The Monday morning email to the shop: last week's figures and what to do,
// from the same live numbers as Admin → Insights.

const gbp = (p: number | null) => (p === null ? "-" : `${p < 0 ? "−" : ""}£${(Math.abs(p) / 100).toFixed(2)}`);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function change(now: number | null, before: number | null, lowerIsBetter = false) {
  if (now === null || before === null || before === 0) return "";
  const c = Math.round(((now - before) / Math.abs(before)) * 100);
  if (c === 0) return "same as the week before";
  const good = lowerIsBetter ? c < 0 : c > 0;
  return `${c > 0 ? "▲" : "▼"} ${Math.abs(c)}% vs the week before${good ? "" : " (watch this)"}`;
}

export function weeklyReportEmail(x: Insights) {
  const { now, before } = x;
  const figures: [string, string, string][] = [
    ["Paid orders", String(now.orders), change(now.orders, before.orders)],
    ["Sales", gbp(now.revenue), change(now.revenue, before.revenue)],
    ["Average order", gbp(x.avgOrder), ""],
    ["Ad spend", gbp(now.adSpend), x.ads ? `TikTok ${gbp(x.ads.byPlatform.tiktok)} · Google ${gbp(x.ads.byPlatform.google)}` : (x.adsError ?? "")],
    ...x.sources
      .filter((r) => r.id === "tiktok_ads" || r.id === "google_ads")
      .map((r): [string, string, string] => [`${r.name} sales`, String(r.orders), `${r.visits} visits${r.costPerSale === null ? "" : ` · ${gbp(r.costPerSale)} per sale`}`]),
    ["Ad cost per sale", gbp(now.costPerSale), change(now.costPerSale, before.costPerSale, true)],
    ["Profit after everything", gbp(now.profit), "after Stripe, refunds, Packlink, ads and materials"],
    [
      "Reminder emails",
      `${x.reminders.filter((r) => r.paid).length} of ${x.reminders.length} paid`,
      `${x.reminders.filter((r) => r.clicked).length} came back · ${gbp(x.reminders.filter((r) => r.paid).reduce((n, r) => n + r.total, 0))} won back`,
    ],
  ];
  const todo = x.advice.slice(0, 6);
  const range = `${x.from.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })} – ${new Date(x.to.getTime() - 1).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })}`;
  const link = `${site.url}/admin/insights`;
  const subject = `PlatedUp weekly: ${now.orders} order${now.orders === 1 ? "" : "s"}, ${gbp(now.revenue)} sales, ${
    now.profit === null ? `${gbp(now.keep)} kept` : `${gbp(now.profit)} profit`
  }`;

  const text = [
    `PlatedUp: your week (${range})`,
    "",
    ...figures.map(([k, v, n]) => `${k}: ${v}${n ? ` (${n})` : ""}`),
    "",
    "What to do:",
    ...todo.map((a, i) => `${i + 1}. ${a.title}. ${a.text}`),
    "",
    `Follow-ups: ${x.abandoned.length} unfinished checkouts, ${x.docsWaiting.length} waiting for documents, ${x.askReview.length} to ask for a review.`,
    "",
    `Full details and WhatsApp buttons: ${link}`,
  ].join("\n");

  const colour = { warn: "#b42318", tip: "#8a6812", good: "#1f7a3d" };
  const html = `<!doctype html><html><body style="margin:0;background:#f7f3ea;font-family:Arial,sans-serif;color:#14110b;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#14110b;color:#fff;border-radius:14px 14px 0 0;padding:20px 24px;">
      <div style="font-size:13px;letter-spacing:2px;color:#d9b54a;font-weight:bold;">PLATEDUP WEEKLY</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px;">Your week, ${esc(range)}</div>
    </div>
    <div style="background:#fff;border:1px solid #e6dcc6;border-top:0;border-radius:0 0 14px 14px;padding:20px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${figures
          .map(
            ([k, v, n]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e8d6;font-size:14px;color:#5f5647;">${esc(k)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d6;text-align:right;"><div style="font-size:18px;font-weight:bold;">${esc(v)}</div><div style="font-size:12px;color:#5f5647;">${esc(n)}</div></td></tr>`,
          )
          .join("")}
      </table>
      <h2 style="font-size:18px;margin:24px 0 8px;">What to do this week</h2>
      ${todo.length ? todo.map((a) => `<div style="border-left:4px solid ${colour[a.level]};padding:6px 12px;margin:8px 0;"><div style="font-weight:bold;font-size:14px;">${esc(a.title)}</div><div style="font-size:13px;color:#5f5647;margin-top:2px;">${esc(a.text)}</div></div>`).join("") : `<p style="font-size:14px;color:#5f5647;">Nothing needs your attention. Keep it up!</p>`}
      <p style="font-size:13px;color:#5f5647;margin-top:16px;">Follow-ups: <b>${x.abandoned.length}</b> unfinished checkouts · <b>${x.docsWaiting.length}</b> waiting for documents · <b>${x.askReview.length}</b> to ask for a review.</p>
      <p style="margin:20px 0 4px;"><a href="${link}" style="display:inline-block;background:#b8901f;color:#14110b;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:999px;">Open Insights (with WhatsApp buttons)</a></p>
    </div>
  </div></body></html>`;
  return { subject, text, html };
}

export async function sendWeeklyReport() {
  const x = await getInsights(7);
  await sendToShop(weeklyReportEmail(x));
}

// UK date and time parts.
function ukNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return { weekday: parts.weekday, hour: Number(parts.hour), date: `${parts.year}-${parts.month}-${parts.day}` };
}

// Sends the report once each Monday from 8am UK time. Safe to call often:
// the week is recorded first, so a restart or second copy never sends twice.
export async function maybeSendWeeklyReport() {
  if (!isDbConfigured() || !isMailConfigured()) return;
  const { weekday, hour, date } = ukNow();
  if (weekday !== "Mon" || hour < 8) return;
  const res = await execute("INSERT IGNORE INTO weekly_reports (week) VALUES (?)", [date]);
  if (res.affectedRows !== 1) return;
  try {
    await sendWeeklyReport();
  } catch (err) {
    // Let the next check try again.
    await execute("DELETE FROM weekly_reports WHERE week = ?", [date]).catch(() => {});
    throw err;
  }
}
