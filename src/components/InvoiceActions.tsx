"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAID_METHODS, PAID_METHOD_WORD, type PaidMethod } from "@/lib/invoice-kinds";
import type { InvoiceStatus } from "@/lib/invoice-kinds-status";

/**
 * The buttons above an invoice: send it, mark it paid, save it as a PDF.
 *
 * Saving as a PDF is the browser's own print dialog, which every desktop
 * browser and iOS Safari offer "Save as PDF" from. What comes out is this
 * exact document rather than a second rendering of it built against a PDF
 * library, which would drift from what is on screen the first time either
 * changed. The button says what it does, because a print dialog appearing
 * when you asked for a PDF is a surprise worth heading off.
 *
 * Hidden when printing, along with everything else that is not the invoice.
 */
export function InvoiceActions({
  id,
  status,
  hasEmail,
}: {
  id: number;
  status: InvoiceStatus;
  hasEmail: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [asking, setAsking] = useState(false);

  async function act(body: Record<string, unknown>, failure: string, done: string) {
    setBusy(true);
    setError("");
    setSent("");
    try {
      const res = await fetch("/api/portal/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? String(res.status));
      setSent(done);
      router.refresh();
    } catch (err) {
      setError(
        String(err).includes("no_customer_email")
          ? "There is no email address on this invoice to send it to."
          : String(err).includes("no_mail_set_up")
            ? "Email is not set up on this account. Give us a ring and we will sort it."
            : failure,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="print-hide">
      <div className="flex flex-wrap gap-2">
        {status !== "cancelled" && (
          <button
            type="button"
            disabled={busy || !hasEmail}
            onClick={() =>
              act({ action: "send" }, "It did not send. Try again in a moment.", "Sent.")
            }
            className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : status === "paid" ? "Email the receipt" : "Email it to them"}
          </button>
        )}

        {status !== "paid" && status !== "cancelled" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setAsking(!asking)}
            aria-expanded={asking}
            className="rounded-full border border-emerald-500/50 px-5 py-2.5 text-sm font-semibold text-emerald-600 disabled:opacity-50 dark:text-emerald-400"
          >
            Mark as paid
          </button>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          Save as PDF
        </button>

        {status !== "cancelled" && status !== "paid" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act({ status: "cancelled" }, "Not changed.", "Cancelled.")}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:text-foreground disabled:opacity-50"
          >
            Cancel it
          </button>
        )}
      </div>

      {/* Asked at the moment it is marked paid rather than left blank,
          because "how did they pay" is a question somebody can answer now
          and cannot answer at all in three weeks. */}
      {asking && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border px-4 py-3">
          <span className="text-xs text-muted">Paid by</span>
          {PAID_METHODS.map((method: PaidMethod) => (
            <button
              key={method}
              type="button"
              disabled={busy}
              onClick={() =>
                act(
                  { status: "paid", paidMethod: method },
                  "Not changed.",
                  `Marked as paid by ${PAID_METHOD_WORD[method]}.`,
                ).then(() => setAsking(false))
              }
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold capitalize text-foreground disabled:opacity-50"
            >
              {PAID_METHOD_WORD[method]}
            </button>
          ))}
        </div>
      )}

      {status !== "paid" && !hasEmail && (
        <p className="mt-2.5 text-xs text-muted">
          No email address on this one, so it cannot be emailed. Save it as a PDF and send it
          however you like.
        </p>
      )}

      {(error || sent) && (
        <p
          className={`mt-3 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            error
              ? "border-red-500/40 text-red-500"
              : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {error || sent}
        </p>
      )}

      <p className="mt-3 text-[11px] text-muted">
        “Save as PDF” opens your browser’s print box — choose PDF as the destination.
      </p>
    </div>
  );
}
