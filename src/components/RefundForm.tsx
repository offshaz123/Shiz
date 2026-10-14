"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";
import { refundReasons } from "@/lib/refunds";

// Asks for a refund. The request is emailed to the shop, then the customer
// can also send it on WhatsApp for a quicker reply.
export function RefundForm({ initialRef }: { initialRef: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [sent, setSent] = useState({ ref: "", reason: "" });

  if (state === "done") {
    const text = `Hi PlatedUp, I've just sent a refund request for order ${sent.ref} (${sent.reason}).`;
    return (
      <div role="status" className="rounded-3xl border border-line bg-surface p-8 text-center">
        <p className="font-display text-3xl font-bold">Request sent</p>
        <p className="mt-2 text-muted">
          We&apos;ve received your refund request for <strong className="text-ink">{sent.ref}</strong> and emailed you a copy. We&apos;ll
          look into it and reply by email, usually within 1 working day.
        </p>
        <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`} className="btn mt-6 bg-[#128c4a] text-white hover:bg-[#0f7a40]">
          Also send it on WhatsApp
        </a>
        <p className="mt-3 text-xs text-muted">Optional, for a quicker reply during {site.hours}.</p>
      </div>
    );
  }

  return (
    <form
      method="post"
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setState("sending");
        setError("");
        try {
          const res = await fetch("/api/refund", { method: "POST", body: form });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
          setSent({ ref: data.ref, reason: String(form.get("reason")) });
          setState("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
          setState("idle");
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Order number</span>
          <input className="field uppercase" name="ref" defaultValue={initialRef} placeholder="e.g. PU-AB12C" maxLength={20} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Email you ordered with</span>
          <input className="field" name="email" type="email" autoComplete="email" maxLength={190} required />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold">Your name</span>
          <input className="field" name="name" autoComplete="name" maxLength={120} required />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold">Reason</span>
          <select className="field" name="reason" required defaultValue="">
            <option value="" disabled>
              Choose a reason
            </option>
            {refundReasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold">What happened?</span>
          <textarea className="field min-h-32" name="message" maxLength={5000} required />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-semibold">
            Photos <span className="font-normal text-muted">(if your plates are damaged or wrong, up to 3)</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <input
                key={n}
                type="file"
                name={`photo${n}`}
                accept="image/*,application/pdf"
                aria-label={`Photo ${n}`}
                className="block w-full rounded-lg border border-line bg-white p-2 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:font-semibold"
              />
            ))}
          </div>
        </fieldset>
      </div>
      <p className="text-xs text-muted">
        Plates are made to order, so we can&apos;t refund plates made exactly as ordered. See our{" "}
        <Link href="/returns-policy" className="underline">
          returns policy
        </Link>
        .
      </p>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-gold w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send refund request"}
      </button>
    </form>
  );
}
