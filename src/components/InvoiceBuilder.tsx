"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pounds, totals, type Discount } from "@/lib/invoice-maths";
import { PAID_METHODS, PAID_METHOD_WORD, type PaidMethod } from "@/lib/invoice-kinds";
import { formatAddress } from "@/lib/business-profile";

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
 *
 * It ends with the question that decides what the document is. Most of
 * these businesses are paid as the job finishes, standing next to the
 * customer, so the usual answer is "paid now" and the usual document is a
 * receipt. The other answer is there for the commercial job that genuinely
 * is on terms, and the default is the common case rather than the tidy one.
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
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  // Separate boxes for the same reason their own address has them: typed
  // into one box, every invoice lays the address out differently and the
  // postcode comes out however it was typed.
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [issuedOn, setIssuedOn] = useState(today());
  const [dueOn, setDueOn] = useState(inFourteenDays());
  const [vatRate, setVatRate] = useState("0");
  const [discountKind, setDiscountKind] = useState<Discount["kind"]>("none");
  const [discountValue, setDiscountValue] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY }]);
  const [paidNow, setPaidNow] = useState(true);
  const [paidMethod, setPaidMethod] = useState<PaidMethod>("card");

  const lines = rows.map((row) => ({
    id: 0,
    description: row.description,
    quantity: Number(row.quantity) || 0,
    unitPence: Math.round((Number(row.unitPrice) || 0) * 100),
  }));
  const sums = totals(
    lines.filter((line) => line.description.trim() !== ""),
    Number(vatRate) || 0,
    {
      kind: discountKind,
      percent: Number(discountValue) || 0,
      pence: Math.round((Number(discountValue) || 0) * 100),
    },
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
          customerCompany,
          customerEmail,
          customerAddress: formatAddress({ line1, line2, city, postcode, country: "" }),
          issuedOn,
          dueOn,
          vatRate: Number(vatRate) || 0,
          discountKind,
          discountPercent: Number(discountValue) || 0,
          discountAmount: Number(discountValue) || 0,
          notes,
          paidNow,
          paidMethod,
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
            <span className="text-xs font-medium text-muted">Company (if it is a business)</span>
            <input
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              placeholder="Whitfield Joinery Ltd"
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
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

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-muted">Street address</span>
            <input
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="14 Oakfield Road"
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-muted">Second line (if they have one)</span>
            <input
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="Didsbury"
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Town or city</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Manchester"
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Postcode</span>
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder="M20 3PQ"
              className={FIELD}
            />
            <span className="text-[11px] text-muted">Capitals and spaces sort themselves out.</span>
          </label>
        </div>
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
            <div className="flex items-center justify-between gap-3 py-1">
              <dt className="flex min-w-0 items-center gap-1.5 text-muted">
                <select
                  value={discountKind}
                  onChange={(e) => setDiscountKind(e.target.value as Discount["kind"])}
                  aria-label="Kind of discount"
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                >
                  <option value="none">No discount</option>
                  <option value="percent">Discount %</option>
                  <option value="fixed">Discount £</option>
                </select>
                {discountKind !== "none" && (
                  <input
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    inputMode="decimal"
                    aria-label={discountKind === "percent" ? "Discount percentage" : "Amount off"}
                    placeholder={discountKind === "percent" ? "10" : "25.00"}
                    className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                  />
                )}
              </dt>
              <dd className="tabular-nums text-foreground">
                {sums.discountPence > 0 ? `−${pounds(sums.discountPence)}` : "—"}
              </dd>
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
        <p className="mt-1 text-right text-[11px] leading-relaxed text-muted">
          Leave VAT at 0 if you are not registered. A discount comes off before VAT, which is
          the way round HMRC expects.
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

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Has it been paid?</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          Most jobs are paid as they finish. Say so and this becomes a receipt rather than a
          bill — it will never show up as money you are owed.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { value: true, label: "Paid already" },
            { value: false, label: "To be paid later" },
          ].map((choice) => (
            <button
              key={String(choice.value)}
              type="button"
              onClick={() => setPaidNow(choice.value)}
              aria-pressed={paidNow === choice.value}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                paidNow === choice.value
                  ? "border-transparent bg-foreground text-background"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </div>

        {paidNow && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Paid by</span>
            {PAID_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaidMethod(method)}
                aria-pressed={paidMethod === method}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  paidMethod === method
                    ? "border-emerald-500/60 text-emerald-600 dark:text-emerald-400"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {PAID_METHOD_WORD[method]}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="brand-gradient-bg rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : paidNow ? "Save this receipt" : "Save this invoice"}
        </button>
        <p className="text-xs text-muted">
          {paidNow
            ? "Nothing is emailed until you press send on the next screen."
            : "It saves as a draft. Nothing goes to your customer until you send it."}
        </p>
      </div>
    </div>
  );
}
