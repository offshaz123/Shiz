"use client";

import Link from "next/link";
import { useState } from "react";
import { whatsappHref } from "@/lib/site";

type Result = {
  ref: string;
  status: string;
  placed: string;
  paid: string | null;
  inProduction: string | null;
  dispatched: string | null;
  delivery: string;
  docsOutstanding: boolean;
  items: { reg: string; qty: number; description: string }[];
  tracking: { carrier: string; number: string; url: string } | null;
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }) : "";

// The customer's order progress, looked up by order number and email.
export function TrackOrder({ initialRef }: { initialRef: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    setBusy(false);
    if (res?.ok) setResult(json);
    else setError(json?.error ?? "Something went wrong. Please try again.");
  }

  if (result) {
    const ended = result.status === "cancelled" || result.status === "refunded";
    const waiting = result.status === "pending" || result.status === "unpaid" || result.status === "expired";
    const steps = [
      { title: "Order placed", done: true, when: fmt(result.placed) },
      { title: "Payment received", done: Boolean(result.paid), when: fmt(result.paid) },
      { title: "Being made", done: Boolean(result.inProduction) || result.status === "dispatched", when: fmt(result.inProduction) },
      { title: "Dispatched", done: result.status === "dispatched", when: fmt(result.dispatched) },
    ];
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-line bg-white p-6">
          <p className="text-sm text-muted">Order</p>
          <p className="font-display text-3xl font-bold">{result.ref}</p>
          {ended ? (
            <p className="mt-4 rounded-xl bg-[#fdecec] p-4 font-semibold text-[#b42318]">
              This order has been {result.status === "refunded" ? "cancelled and refunded" : "cancelled"}. Please message us if you have any
              questions.
            </p>
          ) : (
            <ol className="mt-5 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      s.done ? "bg-[#1f7a3d] text-white" : "border-2 border-line text-muted"
                    }`}
                    aria-hidden
                  >
                    {s.done ? "✓" : i + 1}
                  </span>
                  <span>
                    <span className={`block font-semibold ${s.done ? "" : "text-muted"}`}>{s.title}</span>
                    {s.done && s.when && <span className="block text-sm text-muted">{s.when}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {waiting && !ended && (
            <p className="mt-4 text-sm text-muted">We haven&apos;t received payment for this order yet. Message us and we&apos;ll help.</p>
          )}
          {result.docsOutstanding && !ended && result.status !== "dispatched" && (
            <div className="mt-5 rounded-xl border-2 border-[#d92d20] bg-[#fdecec] p-4">
              <p className="font-bold text-[#b42318]">We still need your documents</p>
              <p className="mt-1 text-sm text-[#7a271a]">We can&apos;t make road-legal plates until we&apos;ve seen your V5C and photo ID.</p>
              <Link href={`/upload-documents?ref=${result.ref}`} className="btn mt-3 bg-[#d92d20] text-white hover:bg-[#b42318]">
                Upload documents
              </Link>
            </div>
          )}
          {result.tracking && (
            <div className="mt-5 rounded-xl border border-[#9fd3ae] bg-[#f1faf3] p-4">
              <p className="font-bold">Track your parcel</p>
              <p className="mt-1 text-sm text-muted">
                {result.tracking.carrier} tracking number: <strong className="font-mono text-ink">{result.tracking.number}</strong>
              </p>
              <a href={result.tracking.url} target="_blank" rel="noopener noreferrer" className="btn mt-3 bg-[#1f7a3d] text-white">
                Track with {result.tracking.carrier}
              </a>
            </div>
          )}
        </div>
        <div className="rounded-3xl border border-line bg-white p-6">
          <p className="font-semibold">Your plates</p>
          <ul className="mt-2 space-y-1 text-sm">
            {result.items.map((i, n) => (
              <li key={n}>
                <strong>{i.reg}</strong>
                {i.qty > 1 && ` × ${i.qty}`} · <span className="text-muted">{i.description}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">Delivery: {result.delivery}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={whatsappHref} className="btn btn-gold">
            Questions? WhatsApp us
          </a>
          <button type="button" className="btn btn-white" onClick={() => setResult(null)}>
            Check another order
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={lookUp} className="space-y-4 rounded-3xl border border-line bg-white p-6">
      <label className="block">
        <span className="text-sm font-semibold">Order number</span>
        <input name="ref" className="field mt-1 uppercase" defaultValue={initialRef} placeholder="e.g. PU-AB12C" maxLength={20} required />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Email you ordered with</span>
        <input name="email" type="email" className="field mt-1" autoComplete="email" maxLength={190} required />
      </label>
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#b42318]">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-gold w-full" disabled={busy}>
        {busy ? "Checking…" : "Track my order"}
      </button>
      <p className="text-center text-xs text-muted">Your order number is in your confirmation email.</p>
    </form>
  );
}
