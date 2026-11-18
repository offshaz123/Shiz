"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InvoiceSender } from "@/lib/invoices";

/**
 * The client's own details, as they appear on everything they send out.
 *
 * Saved when they click away from a box rather than behind a Save button.
 * There are five boxes here and somebody filling them in on a phone between
 * jobs should not lose the lot because they closed the tab on the last one.
 *
 * The logo is not here. It is set from our side, because it is the one
 * field where a broken address shows up on their customer's invoice rather
 * than on their own screen, and a line saying who to ask is more use to
 * them than a box they can get wrong.
 */

const FIELD =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-pink";

export function BusinessDetails({ sender }: { sender: InvoiceSender }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(field: string, value: string, was: string) {
    if (value === was) return;
    setError("");
    try {
      const res = await fetch("/api/portal/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSaved(true);
      router.refresh();
    } catch {
      setError("That did not save. Try again in a moment.");
    }
  }

  const boxes: {
    field: keyof InvoiceSender;
    label: string;
    note?: string;
    rows?: number;
    placeholder?: string;
  }[] = [
    {
      field: "address",
      label: "Your business address",
      rows: 3,
      placeholder: "Unit 4, Barton Works\nStockport Road\nManchester M12 4WD",
    },
    { field: "phone", label: "Phone number on your invoices", placeholder: "0161 123 4567" },
    { field: "email", label: "Email on your invoices", placeholder: "you@yourbusiness.co.uk" },
    {
      field: "vatNumber",
      label: "VAT number",
      note: "Leave blank if you are not VAT registered. Nothing about VAT appears on your invoices without it.",
      placeholder: "GB123456789",
    },
    {
      field: "paymentDetails",
      label: "How your customers pay you",
      rows: 4,
      note: "Printed at the bottom of every invoice. Whatever you would normally write — bank details, a payment link, or that you take card on the day.",
      placeholder: "Bank transfer\nSort code 00-00-00\nAccount 12345678\nReference: the invoice number",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {(error || saved) && (
        <p
          className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
            error
              ? "border-red-500/40 text-red-500"
              : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {error || "Saved."}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          {sender.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sender.logoUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl object-contain"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-lg font-bold text-muted">
              {sender.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-sm font-bold text-foreground">{sender.name}</p>
            <p className="text-[11px] leading-relaxed text-muted">
              {sender.logoUrl
                ? "Your logo, as it appears on your invoices."
                : "No logo yet — send us the file and we will put it on."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {boxes.map((box) => {
            const was = sender[box.field] as string;
            return (
              <label key={box.field} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">{box.label}</span>
                {box.rows ? (
                  <textarea
                    defaultValue={was}
                    rows={box.rows}
                    placeholder={box.placeholder}
                    onBlur={(e) => save(box.field, e.target.value, was)}
                    className={`${FIELD} leading-relaxed`}
                  />
                ) : (
                  <input
                    defaultValue={was}
                    placeholder={box.placeholder}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    onBlur={(e) => save(box.field, e.target.value, was)}
                    className={FIELD}
                  />
                )}
                {box.note && (
                  <span className="text-[11px] leading-relaxed text-muted">{box.note}</span>
                )}
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
