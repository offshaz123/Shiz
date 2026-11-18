"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pounds, totals } from "@/lib/invoice-maths";

/**
 * Writing an invoice.
 *
 * The running total sits under the lines and changes as they type, because
 * the question somebody is actually asking while filling this in is "what
 * does this come to", and making them save to find out is making them guess.
 *
 * Prices are typed in pounds, as anybody would type them, and turned into
 * pence once on the way out. Nothing in here keeps a price as a float for
 * longer than it takes to read it.
 *
 * Everything is kept as the string that was typed rather than as a number,
 * so a half-typed "1." does not become 1 under the cursor and a cleared box
 * does not fill itself back in with a zero.
 */

type Row = { description: string; quantity: string; unitPrice: string };

const EMPTY: Row = { description: "", quantity: "1", unitPrice: "" };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** A fortnight out: the usual terms, and changeable. */
function inFourteenDays(): string {
  return new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
}

const FIELD =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-pink";

export function InvoiceBuilder() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [issuedOn, setIssuedOn] = useState(today());
  const [dueOn, setDueOn] = useState(inFourteenDays());
  const [vatRate, setVatRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY }]);

  const lines = rows.map((row) => ({
    id: 0,
    description: row.description,
    quantity: Number(row.quantity) || 0,
    unitPence: Math.round((Number(row.unitPrice) || 0) * 100),
  }));
  const sums = totals(
    lines.filter((line) => line.description.trim() !== ""),
    Number(vatRate) || 0,
  );

  function setRow(index: number, changes: Partial<Row>) {
    setRows(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/portal/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerAddress,
          issuedOn,
          dueOn,
          vatRate: Number(vatRate) || 0,
          notes,
          lines: rows.map((row) => ({
            description: row.description,
            quantity: Number(row.quantity) || 0,
            unitPrice: Number(row.unitPrice) || 0,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? String(res.status));
      router.push(`/portal/invoices/${data.id}`);
    } catch (err) {
      setError(
        String(err).includes("needs_a_customer_and_a_line")
          ? "It needs a customer name and at least one line with something written on it."
          : "That did not save. Try again in a moment.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p className="rounded-xl border border-red-500/40 px-4 py-2.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Who it is for</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Customer name</span>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Mrs J Whitfield"
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Their email</span>
            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              type="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="jwhitfield@example.co.uk"
              className={FIELD}
            />
            <span className="text-[11px] text-muted">Needed to email it to them.</span>
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Their address</span>
          <textarea
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            rows={3}
            placeholder={"14 Oakfield Road\nManchester\nM20 3PQ"}
            className={`${FIELD} leading-relaxed`}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">What they are being charged for</h2>

        <div className="mt-4 flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <label className="flex min-w-0 flex-[2_1_14rem] flex-col gap-1.5">
                <span className="text-[11px] text-muted">Description</span>
                <input
                  value={row.description}
                  onChange={(e) => setRow(i, { description: e.target.value })}
                  placeholder="Full body wrap, gloss black"
                  className={FIELD}
                />
              </label>
              <label className="flex w-20 flex-col gap-1.5">
                <span className="text-[11px] text-muted">Qty</span>
                <input
                  value={row.quantity}
                  onChange={(e) => setRow(i, { quantity: e.target.value })}
                  inputMode="decimal"
                  className={FIELD}
                />
              </label>
              <label className="flex w-28 flex-col gap-1.5">
                <span className="text-[11px] text-muted">Price each £</span>
                <input
                  value={row.unitPrice}
                  onChange={(e) => setRow(i, { unitPrice: e.target.value })}
                  inputMode="decimal"
                  placeholder="950.00"
                  className={FIELD}
                />
              </label>
              <span className="w-24 shrink-0 pb-2.5 text-right text-sm font-semibold tabular-nums text-foreground">
                {pounds(Math.round((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0) * 100))}
              </span>
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, at) => at !== i))}
                disabled={rows.length === 1}
                aria-label={`Remove line ${i + 1}`}
                className="pb-2.5 text-sm text-muted hover:text-foreground disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setRows([...rows, { ...EMPTY }])}
          className="mt-3 text-xs font-semibold text-brand-pink hover:underline"
        >
          + Add another line
        </button>

        <div className="mt-5 flex justify-end border-t border-border pt-4">
          <dl className="w-full max-w-xs text-sm">
            <div className="flex justify-between py-1">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums text-foreground">{pounds(sums.subtotalPence)}</dd>
            </div>
            <div className="flex items-center justify-between py-1">
              <dt className="flex items-center gap-2 text-muted">
                VAT
                <input
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  inputMode="decimal"
                  aria-label="VAT rate as a percentage"
                  className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                />
                %
              </dt>
              <dd className="tabular-nums text-foreground">{pounds(sums.vatPence)}</dd>
            </div>
            <div className="mt-1 flex justify-between border-t border-border py-2 text-base font-bold">
              <dt className="text-foreground">Total</dt>
              <dd className="tabular-nums text-foreground">{pounds(sums.totalPence)}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-1 text-right text-[11px] text-muted">
          Leave VAT at 0 if you are not registered.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Dates and anything else</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Date of the invoice</span>
            <input
              type="date"
              value={issuedOn}
              onChange={(e) => setIssuedOn(e.target.value)}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Payment due by</span>
            <input
              type="date"
              value={dueOn}
              onChange={(e) => setDueOn(e.target.value)}
              className={FIELD}
            />
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Note at the bottom</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Thanks for your business. Any questions, give me a ring."
            className={`${FIELD} leading-relaxed`}
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="brand-gradient-bg rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save this invoice"}
        </button>
        <p className="text-xs text-muted">
          It saves as a draft. Nothing goes to your customer until you send it.
        </p>
      </div>
    </div>
  );
}
