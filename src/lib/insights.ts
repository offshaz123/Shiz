import { query } from "./db";
import { type AdSpend, adSpend } from "./ad-spend";
import { SOURCES, type SourceId, isSource } from "./sources";
import { type Order, listOpenOrders, listOrdersCreatedBetween, listPaidOrdersBetween } from "./orders";
import { costHistory, costsOn, orderCost } from "./costs";
import { orderMoney } from "./order-money";
import { badges, sizeOf, styles } from "./plates";
import type { OrderMoney } from "./order-money";

// How the shop is doing over a period, compared with the period before, and
// what to do about it. Read live from the orders, Stripe, Packlink and the ad
// payments typed in on Admin → Money.
// Used by the admin Insights page and the Monday email.

const DAY = 24 * 60 * 60 * 1000;
const PAID = ["paid", "in_production", "dispatched"];
const gbp = (p: number) => `£${(p / 100).toFixed(2)}`;

// Visits and sales from one place customers came from. Ad spend only for the
// two paid ones (TikTok ads and Google Ads).
export type SourceRow = { id: SourceId | "unknown"; name: string; visits: number; orders: number; revenue: number; spend: number | null; costPerSale: number | null };

export type Advice = { level: "good" | "warn" | "tip"; title: string; text: string };

export type PeriodTotals = {
  orders: number;
  revenue: number;
  keep: number;
  adSpend: number | null;
  costPerSale: number | null;
  profit: number | null;
};

export type Insights = {
  from: Date;
  to: Date;
  days: number;
  now: PeriodTotals;
  before: PeriodTotals;
  avgOrder: number | null;
  ads: AdSpend | null;
  adsError: string | null;
  sources: SourceRow[];
  sellers: { styles: [string, number][]; hexShare: number; premiumShare: number; fixingShare: number; flagShare: number; plates: number };
  abandoned: { ref: string; name: string; phone: string; email: string; total: number; when: Date }[];
  docsWaiting: Order[];
  noLabel: Order[];
  askReview: { ref: string; name: string; phone: string; email: string; dispatched: Date }[];
  approvedReviews: number;
  // Reminder emails (with the 24-hour free delivery offer) sent in the period,
  // and who opened them, clicked through, and paid.
  reminders: { ref: string; name: string; phone: string; total: number; sent: Date; opened: boolean; clicked: boolean; paid: boolean }[];
  deliveryLoss: number | null;
  advice: Advice[];
};

async function totals(from: Date, to: Date, ads: AdSpend | null): Promise<PeriodTotals & { money: OrderMoney[] }> {
  const money = await orderMoney(from, to);
  const real = money.filter((o) => PAID.includes(o.status));
  const revenue = real.reduce((n, o) => n + o.paid, 0);
  // What the plates cost to make (Admin → Costs) comes off what's kept.
  const costs = await costHistory();
  const materials = (await listPaidOrdersBetween(from, to))
    .filter((o) => PAID.includes(o.status))
    .reduce((n, o) => n + orderCost(o.items, costsOn(costs, o.paid_at ?? o.created_at)), 0);
  const keep = money.reduce((n, o) => n + o.keep, 0) - materials;
  const spend = ads ? ads.spend : null;
  return {
    orders: real.length,
    revenue,
    keep,
    adSpend: spend,
    costPerSale: spend && real.length ? Math.round(spend / real.length) : null,
    profit: spend !== null ? keep - spend : null,
    money,
  };
}

async function safeAds(from: Date, to: Date) {
  try {
    return { ads: await adSpend(from, to), error: null };
  } catch (err) {
    return { ads: null, error: err instanceof Error ? err.message : "Couldn't load the ad payments" };
  }
}

// Where paid orders and visits came from. Orders from people who didn't
// accept cookies can't be traced, so they show as "Not known".
async function bySource(from: Date, to: Date, paid: Order[], ads: AdSpend | null): Promise<SourceRow[]> {
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  const visits = new Map(
    (await query<{ source: string; n: number }>("SELECT source, SUM(count) AS n FROM visits WHERE day >= ? AND day < ? GROUP BY source", [ymd(from), ymd(to)])).map(
      (r) => [r.source, Number(r.n)],
    ),
  );
  const spendFor: Partial<Record<SourceId, number>> = ads ? { tiktok_ads: ads.byPlatform.tiktok, google_ads: ads.byPlatform.google } : {};
  const rows: SourceRow[] = [...(Object.keys(SOURCES) as SourceId[]), "unknown" as const].map((id) => {
    const orders = paid.filter((o) => (id === "unknown" ? !isSource(o.source) : o.source === id));
    const spend = spendFor[id as SourceId] ?? null;
    return {
      id,
      name: id === "unknown" ? "Not known (cookies not accepted)" : SOURCES[id],
      visits: id === "unknown" ? 0 : (visits.get(id) ?? 0),
      orders: orders.length,
      revenue: orders.reduce((n, o) => n + (o.amount_paid ?? o.total), 0),
      spend,
      costPerSale: spend && orders.length ? Math.round(spend / orders.length) : null,
    };
  });
  return rows.filter((r) => r.visits || r.orders || r.spend).sort((a, b) => b.orders - a.orders || b.visits - a.visits);
}

export async function getInsights(days: number, end = new Date()): Promise<Insights> {
  // Whole days, ending today (UK date).
  const to = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) + DAY);
  const from = new Date(to.getTime() - days * DAY);
  const prevFrom = new Date(from.getTime() - days * DAY);

  const [adsNow, adsBefore] = await Promise.all([safeAds(from, to), safeAds(prevFrom, from)]);
  const [nowAll, beforeAll, started, open] = await Promise.all([
    totals(from, to, adsNow.ads),
    totals(prevFrom, from, adsBefore.ads),
    listOrdersCreatedBetween(from, to),
    listOpenOrders(),
  ]);
  const { money: nowMoney, ...now } = nowAll;
  const before: PeriodTotals = { orders: beforeAll.orders, revenue: beforeAll.revenue, keep: beforeAll.keep, adSpend: beforeAll.adSpend, costPerSale: beforeAll.costPerSale, profit: beforeAll.profit };
  const paid = started.filter((o) => PAID.includes(o.status));
  const sources = await bySource(from, to, paid, adsNow.ads);

  // What sells.
  const styleCount = new Map<string, number>();
  let plates = 0;
  let hex = 0;
  let premium = 0;
  let fixing = 0;
  let flag = 0;
  for (const o of paid)
    for (const i of o.items) {
      plates += i.qty;
      const name = `${styles.find((s) => s.id === i.style)?.name ?? i.style}${sizeOf(i).hex ? ` (${sizeOf(i).short})` : ""}`;
      styleCount.set(name, (styleCount.get(name) ?? 0) + i.qty);
      if (sizeOf(i).hex) hex += i.qty;
      if (i.material === "premium") premium += i.qty;
      if (i.fixing !== "none") fixing += i.qty;
      if (i.badge !== "none" && badges.some((b) => b.id === i.badge)) flag += i.qty;
    }
  const share = (n: number) => (plates ? n / plates : 0);

  // Checkouts that weren't finished, unless the same person paid for another order since.
  const paidEmails = new Set(
    (await query<{ email: string }>("SELECT DISTINCT LOWER(email) AS email FROM orders WHERE status IN ('paid','in_production','dispatched') AND created_at >= ?", [from])).map((r) => r.email),
  );
  const abandoned = started
    .filter((o) => (o.status === "expired" || (o.status === "pending" && Date.now() - new Date(o.created_at).getTime() > 2 * 60 * 60 * 1000)) && !paidEmails.has(o.email.toLowerCase()))
    .map((o) => ({ ref: o.ref, name: o.customer_name, phone: o.phone, email: o.email, total: o.total, when: o.created_at }));

  const docsWaiting = open.filter((o) => o.docs_status === "outstanding");
  const noLabel = open.filter((o) => o.docs_status !== "outstanding" && !o.tracking_number && o.paid_at && Date.now() - new Date(o.paid_at).getTime() > DAY);

  // Dispatched 3 to 21 days ago, from customers who haven't left a review.
  const askReview = await query<{ ref: string; name: string; phone: string; email: string; dispatched: Date }>(
    `SELECT o.ref, o.customer_name AS name, o.phone, o.email, d.dispatched
     FROM orders o
     JOIN (SELECT order_id, MAX(created_at) AS dispatched FROM order_events WHERE event = 'dispatched' GROUP BY order_id) d ON d.order_id = o.id
     WHERE o.status = 'dispatched'
       AND d.dispatched BETWEEN DATE_SUB(NOW(), INTERVAL 21 DAY) AND DATE_SUB(NOW(), INTERVAL 3 DAY)
       AND LOWER(o.email) NOT IN (SELECT LOWER(email) FROM reviews)
     ORDER BY d.dispatched DESC LIMIT 20`,
  );
  const reminders = (
    await query<{ ref: string; name: string; phone: string; status: string; total: number; sent: Date; opened_at: Date | null; clicked: number }>(
      `SELECT o.ref, o.customer_name AS name, o.phone, o.status, COALESCE(o.amount_paid, o.total) AS total, e.created_at AS sent, e.opened_at,
         EXISTS (SELECT 1 FROM order_events v WHERE v.order_id = o.id AND v.event = 'resumed') AS clicked
       FROM email_log e JOIN orders o ON o.id = e.order_id
       WHERE e.kind = 'reminder' AND e.status = 'sent' AND e.created_at >= ? AND e.created_at < ?
       ORDER BY e.created_at DESC`,
      [from, to],
    )
  ).map((r) => ({ ref: r.ref, name: r.name, phone: r.phone, total: Number(r.total), sent: r.sent, opened: Boolean(r.opened_at), clicked: Boolean(Number(r.clicked)), paid: PAID.includes(r.status) }));
  const approvedReviews = (await query<{ n: number }>("SELECT COUNT(*) AS n FROM reviews WHERE status = 'approved'"))[0]?.n ?? 0;

  // Delivery: what customers paid for it against what Packlink charged.
  const labelled = nowMoney.filter((o) => o.delivery !== null && PAID.includes(o.status));
  const charged = labelled.reduce((n, o) => n + (paid.find((p) => p.ref === o.ref)?.delivery_price ?? 0), 0);
  const deliveryLoss = labelled.length ? labelled.reduce((n, o) => n + (o.delivery ?? 0), 0) - charged : null;

  const avgOrder = now.orders ? Math.round(now.revenue / now.orders) : null;
  const sellers = {
    styles: [...styleCount.entries()].sort((a, b) => b[1] - a[1]),
    hexShare: share(hex),
    premiumShare: share(premium),
    fixingShare: share(fixing),
    flagShare: share(flag),
    plates,
  };

  const insights: Insights = {
    from,
    to,
    days,
    now,
    before,
    avgOrder,
    ads: adsNow.ads,
    adsError: adsNow.error,
    sources,
    sellers,
    abandoned,
    docsWaiting,
    noLabel,
    askReview,
    approvedReviews: Number(approvedReviews),
    reminders,
    deliveryLoss,
    advice: [],
  };
  insights.advice = advise(insights);
  return insights;
}

// Plain-English advice from the figures, most important first.
function advise(x: Insights): Advice[] {
  const out: Advice[] = [];
  const { now, before, ads } = x;
  const period = x.days === 7 ? "this week" : `in the last ${x.days} days`;

  // Things to do today come first.
  if (x.docsWaiting.length)
    out.push({ level: "warn", title: `${x.docsWaiting.length} paid order${x.docsWaiting.length > 1 ? "s are" : " is"} waiting for documents`, text: "You can't make road-legal plates without their V5C and ID. WhatsApp them a reminder (links below)." });
  if (x.noLabel.length)
    out.push({ level: "warn", title: `${x.noLabel.length} paid order${x.noLabel.length > 1 ? "s haven't" : " hasn't"} been dispatched after a day`, text: "Make them, buy the label in Packlink and mark them dispatched, so customers get their tracking." });
  if (x.abandoned.length)
    out.push({ level: "tip", title: `${x.abandoned.length} people started checkout but didn't pay (${gbp(x.abandoned.reduce((n, a) => n + a.total, 0))})`, text: "They already got one reminder email. A friendly WhatsApp (\"any questions about your plates?\") often wins a few back." });

  const won = x.reminders.filter((r) => r.paid);
  if (won.length)
    out.push({ level: "good", title: `The reminder email won back ${won.length} order${won.length > 1 ? "s" : ""} (${gbp(won.reduce((n, r) => n + r.total, 0))})`, text: "People who left checkout came back through the free delivery link and paid." });

  // Sales.
  if (now.orders === 0) out.push({ level: "warn", title: `No paid orders ${period}`, text: "Check the ads are running and the site works on your phone. Post a couple of TikTok videos of your plates for free reach." });
  else if (before.orders > 0) {
    const change = Math.round(((now.revenue - before.revenue) / Math.max(before.revenue, 1)) * 100);
    out.push(
      change >= 0
        ? { level: "good", title: `Sales up ${change}% on the period before`, text: `${now.orders} orders worth ${gbp(now.revenue)}, against ${before.orders} worth ${gbp(before.revenue)}.` }
        : { level: "warn", title: `Sales down ${-change}% on the period before`, text: `${now.orders} orders worth ${gbp(now.revenue)}, against ${before.orders} worth ${gbp(before.revenue)}. Look at where customers came from below.` },
    );
  }

  // Ads.
  if (ads && now.costPerSale !== null) {
    if (now.costPerSale > 2500)
      out.push({ level: "warn", title: `Ads cost ${gbp(now.costPerSale)} per sale`, text: "That's too much for £40–£60 orders. Pause the weakest videos or ads, try a new one (hex plates are a fresh hook) or narrow the audience. Aim for under £15." });
    else if (now.costPerSale <= 1500) out.push({ level: "good", title: `Ads cost ${gbp(now.costPerSale)} per sale`, text: "That's healthy. If it stays like this for a week, try raising the daily budget by about 20%." });
    else out.push({ level: "tip", title: `Ads cost ${gbp(now.costPerSale)} per sale`, text: "Okay but not great. Aim for under £15 by keeping the best ad and replacing the weakest." });
  } else if (ads && ads.spend > 2000 && now.orders === 0)
    out.push({ level: "warn", title: `${gbp(ads.spend)} spent on ads with no sales`, text: "Something's off. Check the ads send people to platedup.co.uk and test buying on your phone." });
  else if (ads && ads.spend === 0)
    out.push({ level: "tip", title: "No ad payments typed in for these dates", text: "Add your TikTok and Google payments on Admin → Money, so cost per sale and profit are right." });
  // TikTok against Google: put the money where sales cost least.
  const paidAds = x.sources.filter((r) => r.spend && r.spend >= 2000);
  for (const r of paidAds)
    if (r.orders === 0)
      out.push({ level: "warn", title: `${gbp(r.spend ?? 0)} on ${r.name} with no traced sales`, text: "Give new ads 3–4 days to learn. If it's still nothing after a week, pause the weakest videos or ads and try new ones." });
  const priced = paidAds.filter((r) => r.costPerSale !== null).sort((a, b) => (a.costPerSale ?? 0) - (b.costPerSale ?? 0));
  const [best, worst] = [priced[0], priced[priced.length - 1]];
  if (priced.length >= 2 && (worst.costPerSale ?? 0) > (best.costPerSale ?? 0) * 1.5)
    out.push({ level: "tip", title: `${best.name} sells cheaper than ${worst.name}`, text: `A sale costs ${gbp(best.costPerSale ?? 0)} from ${best.name} and ${gbp(worst.costPerSale ?? 0)} from ${worst.name}. Move some of the daily budget to ${best.name}.` });
  const unknown = x.sources.find((r) => r.id === "unknown");
  if (unknown && now.orders >= 4 && unknown.orders / now.orders > 0.5)
    out.push({ level: "tip", title: "Most orders can't be traced to TikTok or Google", text: "Those customers didn't accept cookies, so we can't tell where they came from. The cost per sale shown is a lower limit: ads probably did better than it looks." });

  // Order value and what sells.
  if (x.avgOrder !== null && x.avgOrder < 5000)
    out.push({ level: "tip", title: `Average order is ${gbp(x.avgOrder)}`, text: "Raise it with the extras: premium acrylic, fixings and hex plates. Show a 4D or gel plate first in your ads; they're the higher-priced styles." });
  if (x.sellers.styles[0]) out.push({ level: "tip", title: `Best seller: ${x.sellers.styles[0][0]}`, text: "Use it as the main picture in your next ad and on social media." });
  if (x.sellers.plates >= 4 && x.sellers.fixingShare < 0.3)
    out.push({ level: "tip", title: `Only ${Math.round(x.sellers.fixingShare * 100)}% of plates come with fixings`, text: "The basket already offers them. Mentioning \"fit them the day they arrive\" in posts helps too." });
  if (x.deliveryLoss !== null && x.deliveryLoss > 0)
    out.push({ level: "tip", title: `Delivery cost you ${gbp(x.deliveryLoss)} more than customers paid`, text: "Pick the cheapest courier in Packlink, or put more orders in the free delivery range." });

  // Reviews.
  if (x.askReview.length)
    out.push({ level: "tip", title: `Ask ${x.askReview.length} customer${x.askReview.length > 1 ? "s" : ""} for a review`, text: "Their plates arrived a few days ago. Reviews make every ad and post work better (WhatsApp links below)." });
  else if (x.approvedReviews < 5) out.push({ level: "tip", title: `You have ${x.approvedReviews} review${x.approvedReviews === 1 ? "" : "s"} on the site`, text: "Aim for 10. Ask every happy customer, and approve them in Admin → Reviews." });

  const order = { warn: 0, tip: 1, good: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

