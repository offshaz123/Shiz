import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { type Advice, getInsights } from "@/lib/insights";
import { site } from "@/lib/site";
import { SendReportButton } from "@/components/SendReportButton";

export const metadata = { title: "Insights" };

const gbp = (p: number | null) => (p === null ? "-" : `${p < 0 ? "−" : ""}£${(Math.abs(p) / 100).toFixed(2)}`);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const day = (d: Date) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
const wa = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "44")}?text=${encodeURIComponent(text)}`;
const first = (name: string) => name.trim().split(/\s+/)[0] ?? "";

function Change({ now, before, lowerIsBetter = false }: { now: number | null; before: number | null; lowerIsBetter?: boolean }) {
  if (now === null || before === null || before === 0) return null;
  const change = Math.round(((now - before) / Math.abs(before)) * 100);
  if (change === 0) return <span className="text-muted">same as before</span>;
  const good = lowerIsBetter ? change < 0 : change > 0;
  return (
    <span className={good ? "font-semibold text-[#1f7a3d]" : "font-semibold text-[#b42318]"}>
      {change > 0 ? "▲" : "▼"} {Math.abs(change)}% vs before
    </span>
  );
}

function Card({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

const tone: Record<Advice["level"], string> = {
  warn: "border-[#f1b8b2] bg-[#fdecec]",
  tip: "border-[#e8d89a] bg-[#fdf8e7]",
  good: "border-[#9fd3ae] bg-[#f1faf3]",
};
const icon: Record<Advice["level"], string> = { warn: "⚠️", tip: "💡", good: "✅" };

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function InsightsPage(props: PageProps<"/admin/insights">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const days = sp.days === "30" ? 30 : 7;
  let x: Awaited<ReturnType<typeof getInsights>>;
  try {
    x = await getInsights(days);
  } catch (err) {
    console.error("Loading insights failed", err);
    return (
      <AdminShell active="insights">
        <p className="rounded-2xl border border-line bg-white p-6 font-semibold text-[#b42318]">
          Couldn&apos;t load the figures just now ({err instanceof Error ? err.message : "unknown error"}). Try again in a minute.
        </p>
      </AdminShell>
    );
  }
  const { now, before, ads } = x;
  const funnel = ads
    ? [
        ["Clicked an ad", ads.linkClicks],
        ["Opened the website", ads.landingViews],
        ["Added to basket", ads.addToCart],
        ["Started checkout", ads.checkouts],
        ["Paid", ads.purchases],
      ]
    : [];

  return (
    <AdminShell active="insights">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {day(x.from)} – {day(new Date(x.to.getTime() - 1))}, compared with the {days} days before. Live from your orders, Stripe, Packlink and Meta. A summary is emailed to you every Monday at 8am.
        </p>
        <div className="flex flex-wrap gap-2">
          <SendReportButton />
          {[7, 30].map((d) => (
            <Link
              key={d}
              href={`/admin/insights?days=${d}`}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${d === days ? "gold-bg" : "border border-line bg-white"}`}
            >
              Last {d} days
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="Paid orders" value={String(now.orders)}>
          <Change now={now.orders} before={before.orders} />
        </Card>
        <Card label="Sales" value={gbp(now.revenue)}>
          <Change now={now.revenue} before={before.revenue} />
        </Card>
        <Card label="Average order" value={gbp(x.avgOrder)}>
          <span className="text-muted">Aim for £55+</span>
        </Card>
        <Card label="Ad cost per sale" value={gbp(now.costPerSale)}>
          {now.costPerSale === null ? <span className="text-muted">{x.adsError ?? "No sales yet"}</span> : <Change now={now.costPerSale} before={before.costPerSale} lowerIsBetter />}
        </Card>
        <Card label="Profit after ads" value={gbp(now.profit)}>
          <span className="text-muted">After Stripe, refunds, Packlink and ads</span>
        </Card>
      </div>

      <Section title="What to do" note="Worked out from your live figures. Most important first.">
        {x.advice.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">Nothing needs your attention right now.</p>
        ) : (
          <ul className="space-y-3">
            {x.advice.map((a, i) => (
              <li key={i} className={`rounded-2xl border p-4 ${tone[a.level]}`}>
                <p className="font-bold">
                  {icon[a.level]} {a.title}
                </p>
                <p className="mt-1 text-sm">{a.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {ads && (
        <Section title="From ad to sale" note="What happened after people clicked your Meta ads (as the Meta Pixel saw it).">
          <div className="grid gap-3 sm:grid-cols-5">
            {funnel.map(([label, n], i) => {
              const prev = i > 0 ? Number(funnel[i - 1][1]) : 0;
              return (
                <div key={String(label)} className="rounded-2xl border border-line bg-white p-4 text-center">
                  <p className="font-display text-3xl font-bold">{n}</p>
                  <p className="text-sm font-semibold">{label}</p>
                  {i > 0 && prev > 0 && <p className="text-xs text-muted">{pct(Number(n) / prev)} of the step before</p>}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {x.perAd.length > 0 && (
        <Section title="Each ad" note="Biggest spend first. Keep the ads with sales; replace the ones that only spend.">
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Ad</th>
                  <th className="p-3 text-right">Spent</th>
                  <th className="p-3 text-right">Clicks</th>
                  <th className="p-3 text-right">Click rate</th>
                  <th className="p-3 text-right">Baskets</th>
                  <th className="p-3 text-right">Checkouts</th>
                  <th className="p-3 text-right">Sales</th>
                  <th className="p-3 text-right">Cost per sale</th>
                </tr>
              </thead>
              <tbody>
                {x.perAd.map((a) => (
                  <tr key={a.name} className="border-t border-line">
                    <td className="p-3 font-semibold">{a.name}</td>
                    <td className="p-3 text-right">{gbp(a.spend)}</td>
                    <td className="p-3 text-right">{a.linkClicks}</td>
                    <td className={`p-3 text-right ${a.ctr < 1 ? "text-[#b42318]" : ""}`}>{a.ctr.toFixed(2)}%</td>
                    <td className="p-3 text-right">{a.addToCart}</td>
                    <td className="p-3 text-right">{a.checkouts}</td>
                    <td className="p-3 text-right font-bold">{a.purchases}</td>
                    <td className="p-3 text-right">{a.purchases ? gbp(Math.round(a.spend / a.purchases)) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">A click rate under 1% (in red) usually means the picture or headline isn&apos;t grabbing people.</p>
        </Section>
      )}

      <Section title="What sells" note={`${x.sellers.plates} plate order line${x.sellers.plates === 1 ? "" : "s"} paid in this period.`}>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">Styles</p>
            {x.sellers.styles.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No sales yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {x.sellers.styles.map(([name, n]) => (
                  <li key={name}>
                    <div className="flex justify-between">
                      <span>{name}</span>
                      <span className="font-semibold">{n}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-surface-2">
                      <div className="gold-bg h-2 rounded-full" style={{ width: `${(n / x.sellers.styles[0][1]) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card label="Hex plates" value={pct(x.sellers.hexShare)}>
              <span className="text-muted">of plates sold</span>
            </Card>
            <Card label="Premium acrylic" value={pct(x.sellers.premiumShare)}>
              <span className="text-muted">chose the upgrade</span>
            </Card>
            <Card label="With fixings" value={pct(x.sellers.fixingShare)}>
              <span className="text-muted">added pads or screws</span>
            </Card>
            <Card label="With a flag or strip" value={pct(x.sellers.flagShare)}>
              <span className="text-muted">added a badge</span>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        title="Reminder emails"
        note="One hour after someone leaves checkout, they get an email offering free delivery if they finish within 24 hours."
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Card label="Sent" value={String(x.reminders.length)}>
            <span className="text-muted">people reminded</span>
          </Card>
          <Card label="Opened" value={String(x.reminders.filter((r) => r.opened).length)}>
            <span className="text-muted">read the email</span>
          </Card>
          <Card label="Came back" value={String(x.reminders.filter((r) => r.clicked).length)}>
            <span className="text-muted">pressed the link</span>
          </Card>
          <Card label="Paid" value={String(x.reminders.filter((r) => r.paid).length)}>
            <span className="font-semibold text-[#1f7a3d]">{gbp(x.reminders.filter((r) => r.paid).reduce((n, r) => n + r.total, 0))} won back</span>
          </Card>
        </div>
        {x.reminders.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Emailed</th>
                  <th className="p-3">What happened</th>
                  <th className="p-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {x.reminders.map((r) => (
                  <tr key={r.ref}>
                    <td className="p-3 font-semibold">{r.name}</td>
                    <td className="p-3">
                      <Link href={`/admin/orders/${r.ref}`} className="text-gold underline">
                        {r.ref}
                      </Link>
                    </td>
                    <td className="p-3">{day(r.sent)}</td>
                    <td className="p-3">
                      {r.paid ? (
                        <span className="font-semibold text-[#1f7a3d]">{r.clicked ? "✓ Came back through the link and paid" : "✓ Paid after the reminder"}</span>
                      ) : r.clicked ? (
                        "Pressed the link, didn't pay"
                      ) : r.opened ? (
                        "Opened, didn't press the link"
                      ) : (
                        <span className="text-muted">Not opened yet</span>
                      )}
                    </td>
                    <td className="p-3 text-right">{gbp(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Follow up today" note="One tap opens WhatsApp with a message ready to send.">
        <div className="grid gap-3 lg:grid-cols-3">
          <FollowUp
            title="Didn't finish paying"
            empty="Nobody right now."
            rows={x.abandoned.map((a) => ({
              key: a.ref,
              label: `${a.name} · ${gbp(a.total)}`,
              sub: `${a.ref} · ${day(a.when)}`,
              href: wa(a.phone, `Hi ${first(a.name)}, it's PlatedUp. We saw you were designing your plates (${a.ref}). Any questions I can help with? You can finish your order here: ${site.url}/design`),
            }))}
          />
          <FollowUp
            title="Waiting for documents"
            empty="No orders waiting."
            rows={x.docsWaiting.map((o) => ({
              key: o.ref,
              label: `${o.customer_name} · ${o.ref}`,
              sub: `Paid ${o.paid_at ? day(o.paid_at) : ""}`,
              href: wa(o.phone, `Hi ${first(o.customer_name)}, it's PlatedUp about your order ${o.ref}. We just need a photo of your V5C and ID to make your plates: ${site.url}/upload-documents?ref=${o.ref}`),
            }))}
          />
          <FollowUp
            title="Ask for a review"
            empty="No one to ask right now."
            rows={x.askReview.map((r) => ({
              key: r.ref,
              label: r.name,
              sub: `${r.ref} · dispatched ${day(r.dispatched)}`,
              href: wa(r.phone, `Hi ${first(r.name)}, it's PlatedUp. Hope you're happy with your new plates! Would you mind leaving us a quick review? It really helps a small business: ${site.url}/#reviews`),
            }))}
          />
        </div>
        {x.noLabel.length > 0 && (
          <p className="mt-3 text-sm">
            Not dispatched after a day:{" "}
            {x.noLabel.map((o, i) => (
              <span key={o.ref}>
                {i > 0 && ", "}
                <Link href={`/admin/orders/${o.ref}`} className="font-semibold text-gold underline">
                  {o.ref}
                </Link>
              </span>
            ))}
          </p>
        )}
      </Section>
    </AdminShell>
  );
}

function FollowUp({ title, empty, rows }: { title: string; empty: string; rows: { key: string; label: string; sub: string; href: string }[] }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="font-semibold">
        {title} {rows.length > 0 && <span className="text-muted">({rows.length})</span>}
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm">
                <span className="block font-semibold">{r.label}</span>
                <span className="text-xs text-muted">{r.sub}</span>
              </span>
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg bg-[#128c4a] px-3 py-1.5 text-xs font-bold text-white">
                WhatsApp
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
