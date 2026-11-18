"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClientLead } from "@/lib/clients";

/**
 * The enquiry list, with the two things a client has to be able to record.
 *
 * It was read-only, which quietly broke half the dashboard above it: how
 * many became customers and how long people waited can only come from the
 * person who did the answering, so with no way to record them both figures
 * would have read zero forever. A number that is always zero teaches you to
 * ignore the panel it sits in.
 *
 * Two taps, not a form. "Answered" stops the reply clock, and the status
 * buttons move them along — and because moving somebody along always means
 * you spoke to them, those stop the clock too rather than making it two
 * presses for one action.
 */

const SOURCE_LABEL: Record<string, string> = {
  google: "Google Ads",
  "google-ads": "Google Ads",
  meta: "Facebook & Instagram",
  facebook: "Facebook & Instagram",
  instagram: "Instagram",
  organic: "Found you on Google",
  maps: "Google Maps listing",
  website: "Your website",
  referral: "Referral",
  phone: "Phone",
};

const NEXT_STATUS: { value: string; label: string }[] = [
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "customer", label: "Won" },
  { value: "lost", label: "Lost" },
];

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  customer: "Customer",
  lost: "Lost",
};

function when(value: string): string {
  const at = new Date(value.replace(" ", "T"));
  if (Number.isNaN(at.getTime())) return value;
  return at.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function waited(hours: number): string {
  if (hours < 1) return "under an hour";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function LeadList({ leads, readOnly = false }: { leads: ClientLead[]; readOnly?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function update(id: number, body: Record<string, unknown>) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/portal/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setError("That did not save. Try again in a moment.");
    } finally {
      setBusy(null);
    }
  }

  if (leads.length === 0) {
    return (
      <p className="px-5 py-6 text-sm text-muted">
        Nothing yet. Enquiries appear here the moment they come in.
      </p>
    );
  }

  return (
    <>
      {error && (
        <p className="px-5 pt-3 text-xs font-medium text-red-500">{error}</p>
      )}
      <ul className="divide-y divide-border">
        {leads.map((lead) => (
          <li key={lead.id} className="px-5 py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm font-semibold text-foreground">
                {lead.name || "No name given"}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                {SOURCE_LABEL[lead.source] ?? lead.source}
              </span>
              <span className="text-[11px] text-muted">
                {STATUS_LABEL[lead.status] ?? lead.status}
              </span>
              <span className="ml-auto text-xs tabular-nums text-muted">
                {when(lead.createdAt)}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="font-medium text-foreground hover:underline">
                  {lead.phone}
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="break-all text-muted hover:text-foreground">
                  {lead.email}
                </a>
              )}
              {lead.hoursToReply === null ? (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  not answered yet
                </span>
              ) : (
                <span className="text-muted">answered in {waited(lead.hoursToReply)}</span>
              )}
            </div>

            {lead.message && (
              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted">
                {lead.message}
              </p>
            )}

            {!readOnly && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {lead.hoursToReply === null && (
                  <button
                    type="button"
                    disabled={busy === lead.id}
                    onClick={() => update(lead.id, { answered: true })}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground disabled:opacity-40"
                  >
                    I answered this
                  </button>
                )}
                {NEXT_STATUS.filter((s) => s.value !== lead.status).map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    disabled={busy === lead.id}
                    onClick={() => update(lead.id, { status: status.value })}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold disabled:opacity-40 ${
                      status.value === "customer"
                        ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
