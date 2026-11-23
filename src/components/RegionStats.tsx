import Link from "next/link";
import { REGIONS, REGION_INFO, callableNow, callingWindow, type Region } from "@/lib/regions";
import type { RegionStats as Row } from "@/lib/admin-data";

/**
 * Both markets on the overview, with a switch between them.
 *
 * The switch has a "Both" on it, which is the one Walid will actually use
 * most: the question behind this page is usually "how are we doing", and
 * the answer to that is the pair of them side by side. Picking one country
 * is for when the answer to the first question was "one of them badly".
 *
 * Every number here is a count of rows. Nothing is a rate, a projection or
 * a score, because the sample is small enough that a percentage would move
 * ten points on one phone call and read as a trend.
 */

const EMPTY: Omit<Row, "region"> = {
  found: 0,
  withWebsite: 0,
  noWebsite: 0,
  scanned: 0,
  withEmail: 0,
  deadEmails: 0,
  emailed: 0,
  called: 0,
  replied: 0,
  interested: 0,
  customers: 0,
  foundThisWeek: 0,
};

function add(a: Omit<Row, "region">, b: Omit<Row, "region">): Omit<Row, "region"> {
  return {
    found: a.found + b.found,
    withWebsite: a.withWebsite + b.withWebsite,
    noWebsite: a.noWebsite + b.noWebsite,
    scanned: a.scanned + b.scanned,
    withEmail: a.withEmail + b.withEmail,
    deadEmails: a.deadEmails + b.deadEmails,
    emailed: a.emailed + b.emailed,
    called: a.called + b.called,
    replied: a.replied + b.replied,
    interested: a.interested + b.interested,
    customers: a.customers + b.customers,
    foundThisWeek: a.foundThisWeek + b.foundThisWeek,
  };
}

export function RegionStats({
  rows,
  regions,
  picked,
}: {
  rows: Row[];
  regions: Region[];
  /** Undefined means both. Comes from the address rather than from state
   *  here, so the rest of the page is fetched for the same country —
   *  otherwise these eight tiles change and everything below them does
   *  not, which is exactly how this read wrong the first time. */
  picked?: Region;
}) {
  const pick: Region | "both" = picked ?? (regions.length > 1 ? "both" : regions[0]);

  const forRegion = (key: Region): Omit<Row, "region"> =>
    rows.find((r) => r.region === key) ?? EMPTY;

  const shown = regions.filter((r) => pick === "both" || r === pick);
  const totals = shown.map(forRegion).reduce(add, EMPTY);

  const tiles: { label: string; value: number; note: string }[] = [
    { label: "Businesses found", value: totals.found, note: `${totals.foundThisWeek} in the last 7 days` },
    { label: "No website", value: totals.noWebsite, note: "The easiest call to open" },
    { label: "Websites scanned", value: totals.scanned, note: `of ${totals.withWebsite} with a site` },
    { label: "Usable addresses", value: totals.withEmail, note: `${totals.deadEmails} proved dead` },
    { label: "In the email sequence", value: totals.emailed, note: "First email has gone" },
    { label: "Rung at least once", value: totals.called, note: "Somebody picked up the phone" },
    { label: "Wrote back", value: totals.replied, note: "Sequence stopped, answer them" },
    { label: "Interested", value: totals.interested, note: `${totals.customers} became customers` },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        {regions.length > 1 && (
          <Link
            href="/admin"
            className={`rounded-lg border px-3.5 py-2 text-sm font-bold ${
              pick === "both"
                ? "border-brand-pink bg-brand-pink/10 text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            Both
          </Link>
        )}
        {regions.map((key) => (
          <Link
            key={key}
            href={`/admin?region=${key}`}
            className={`rounded-lg border px-3.5 py-2 text-sm font-bold ${
              pick === key
                ? "border-brand-pink bg-brand-pink/10 text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {REGION_INFO[key].label}
            <span className="ml-2 text-[11px] font-semibold text-muted">
              {forRegion(key).found}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-2xl font-bold tabular-nums text-foreground">{tile.value}</p>
            <p className="mt-1 text-xs font-semibold text-foreground">{tile.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{tile.note}</p>
          </div>
        ))}
      </div>

      {/* The one thing about running two countries that costs somebody a
          wasted evening if nobody says it. */}
      <p className="mt-3 text-[11px] text-muted">
        {REGIONS.filter((r) => regions.includes(r))
          .map(
            (r) =>
              `${REGION_INFO[r].name}: ${callingWindow(r, 5)} Pakistan time${
                callableNow(r) ? " (open now)" : ""
              }`,
          )
          .join(" · ")}
      </p>
    </section>
  );
}
