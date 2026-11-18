"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClientLead } from "@/lib/clients";

/**
 * The enquiries as a board: a column per stage, a card per person.
 *
 * The point of it is seeing the shape of the business without reading
 * anything. Twelve cards stacked under Quoted and two under Won is a
 * problem you notice from across the room and have to count out of a list.
 *
 * Deliberately no drag and drop, on phones or anywhere. Dragging a card
 * between columns on a screen that fits one and a half of them means
 * hauling it off the edge while the page scrolls underneath, which is
 * miserable on exactly the device these people use. It is also the worst
 * possible interaction for anybody using a keyboard or a screen reader.
 * The arrows move a card one stage either way, they are real buttons, and
 * they work identically on a phone and a laptop. One interaction, done
 * properly, rather than a good one and a fallback.
 *
 * On a phone the columns scroll sideways and snap, with the next one
 * showing at the edge so it is obvious there is more. On anything wider
 * all five fit at once.
 */

const STAGES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "customer", label: "Won" },
  { value: "lost", label: "Lost" },
] as const;

const SOURCE_LABEL: Record<string, string> = {
  google: "Google Ads",
  "google-ads": "Google Ads",
  meta: "Facebook & Instagram",
  facebook: "Facebook & Instagram",
  instagram: "Instagram",
  organic: "Found you on Google",
  maps: "Google Maps",
  website: "Website",
  referral: "Referral",
  phone: "Phone",
};

/** Quoted and gone quiet for this long is the thing worth chasing. */
const STALE_DAYS = 5;

function daysSince(value: string): number {
  const at = new Date(value.replace(" ", "T"));
  if (Number.isNaN(at.getTime())) return 0;
  return Math.floor((Date.now() - at.getTime()) / 86_400_000);
}

function money(amount: number): string {
  // Whole pounds on a card. Pennies on a pipeline figure is noise, and the
  // column headers have to stay readable at phone width.
  return `£${Math.round(amount).toLocaleString("en-GB")}`;
}

function ago(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
}

export function LeadBoard({ leads, readOnly = false }: { leads: ClientLead[]; readOnly?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function move(lead: ClientLead, direction: -1 | 1) {
    const at = STAGES.findIndex((s) => s.value === lead.status);
    const next = STAGES[at + direction];
    if (!next) return;

    setBusy(lead.id);
    setError("");
    try {
      const res = await fetch("/api/portal/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status: next.value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setError("That did not save. Try again in a moment.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      {/* Sideways on a phone with snap, all five at once on anything
          wider. The negative margin lets the columns run to the edge of
          the screen so the next one is visibly cut off rather than
          looking like the board simply ends. */}
      <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        <div className="flex snap-x snap-mandatory gap-3 sm:grid sm:grid-cols-5 sm:snap-none">
          {STAGES.map((stage, stageIndex) => {
            const cards = leads.filter((l) => l.status === stage.value);
            const total = cards.reduce((sum, l) => sum + (l.value ?? 0), 0);

            return (
              <section
                key={stage.value}
                className="w-[78vw] shrink-0 snap-center sm:w-auto sm:shrink"
              >
                <div className="flex items-baseline gap-2 rounded-t-xl border border-border bg-surface px-3 py-2">
                  <h3 className="text-xs font-bold text-foreground">{stage.label}</h3>
                  <span className="text-xs tabular-nums text-muted">{cards.length}</span>
                  {total > 0 && (
                    <span
                      className={`ml-auto text-xs font-semibold tabular-nums ${
                        stage.value === "customer"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : stage.value === "lost"
                            ? "text-muted"
                            : "text-foreground"
                      }`}
                    >
                      {money(total)}
                    </span>
                  )}
                </div>

                <div className="flex min-h-[4rem] flex-col gap-2 rounded-b-xl border border-t-0 border-border bg-background p-2">
                  {cards.length === 0 && (
                    <p className="px-1 py-2 text-[11px] text-muted">Nothing here.</p>
                  )}

                  {cards.map((lead) => {
                    const waiting = daysSince(lead.createdAt);
                    // The one thing a board is actually for: a quote that
                    // has gone quiet. Flagged rather than left to be
                    // noticed.
                    const chase = stage.value === "quoted" && waiting >= STALE_DAYS;

                    return (
                      <article
                        key={lead.id}
                        className={`rounded-lg border bg-surface p-2.5 ${
                          chase ? "border-amber-500/60" : "border-border"
                        }`}
                      >
                        <p className="truncate text-sm font-semibold text-foreground">
                          {lead.name || "No name given"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {SOURCE_LABEL[lead.source] ?? lead.source} · {ago(waiting)}
                        </p>

                        {lead.value !== null && (
                          <p className="mt-1 text-sm font-bold tabular-nums text-foreground">
                            {money(lead.value)}
                          </p>
                        )}

                        {chase && (
                          <p className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            Quoted {ago(waiting)}. Worth a chase.
                          </p>
                        )}

                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="mt-1.5 block text-xs font-medium text-brand-pink"
                          >
                            {lead.phone}
                          </a>
                        )}

                        {!readOnly && (
                          <div className="mt-2 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              aria-label={`Move ${lead.name || "this enquiry"} back to ${
                                STAGES[stageIndex - 1]?.label ?? ""
                              }`}
                              disabled={busy === lead.id || stageIndex === 0}
                              onClick={() => move(lead, -1)}
                              className="rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-muted disabled:opacity-25"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              aria-label={`Move ${lead.name || "this enquiry"} on to ${
                                STAGES[stageIndex + 1]?.label ?? ""
                              }`}
                              disabled={busy === lead.id || stageIndex === STAGES.length - 1}
                              onClick={() => move(lead, 1)}
                              className="rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-foreground disabled:opacity-25"
                            >
                              →
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted sm:hidden">
        Swipe sideways to see the other stages.
      </p>
    </div>
  );
}
