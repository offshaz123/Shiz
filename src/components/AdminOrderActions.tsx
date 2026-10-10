"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/orders";

const actions: { status: OrderStatus; label: string }[] = [
  { status: "in_production", label: "Mark in production" },
  { status: "dispatched", label: "Mark dispatched" },
  { status: "paid", label: "Mark paid" },
  { status: "cancelled", label: "Cancel order" },
];

// Orders paid by card on the website, which Stripe can refund.
const REFUNDABLE: OrderStatus[] = ["paid", "in_production", "dispatched"];

export function AdminOrderActions({
  orderRef,
  status,
  amountPaid,
  canRefund,
}: {
  orderRef: string;
  status: OrderStatus;
  // In pence.
  amountPaid: number | null;
  // True when the order went through Stripe checkout.
  canRefund: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [password, setPassword] = useState("");
  const refundable = canRefund && REFUNDABLE.includes(status);
  const amount = amountPaid !== null ? `£${(amountPaid / 100).toFixed(2)}` : "the payment";

  async function post(body: object, key: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return false;
    setBusy(key);
    setMsg(null);
    const res = await fetch(`/api/admin/orders/${orderRef}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy("");
    setMsg({ text: res.ok ? (json.message ?? "Done") : (json.error ?? "Something went wrong"), ok: res.ok });
    router.refresh();
    return res.ok;
  }

  // A refunded order is finished: only its email can be sent again.
  const statusButtons = status === "refunded" ? [] : actions.filter((a) => a.status !== status);

  return (
    <div className="space-y-3">
      {refundable && !refunding && (
        <button
          type="button"
          disabled={!!busy}
          onClick={() => {
            setRefunding(true);
            setMsg(null);
          }}
          className="w-full rounded-lg bg-[#b42318] px-4 py-3 text-sm font-bold text-white hover:bg-[#912018] disabled:opacity-50 sm:w-auto"
        >
          Cancel &amp; refund {amount}
        </button>
      )}

      {refunding && (
        <form
          className="rounded-xl border-2 border-[#d92d20] bg-[#fdecec] p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await post({ action: "refund", password }, "refund");
            setPassword("");
            if (ok) setRefunding(false);
          }}
        >
          <p className="font-bold text-[#b42318]">Refund {amount} and cancel this order?</p>
          <p className="mt-1 text-sm text-[#7a271a]">
            The money goes straight back to the customer&apos;s card through Stripe, and they&apos;ll get a cancellation email.
            This can&apos;t be undone.
          </p>
          <label htmlFor="refund-password" className="mt-3 block text-sm font-semibold text-[#7a271a]">
            Enter your admin password to confirm
          </label>
          <input
            id="refund-password"
            type="password"
            className="field mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            autoFocus
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!!busy || !password}
              className="rounded-lg bg-[#b42318] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy === "refund" ? "Refunding…" : `Refund ${amount} now`}
            </button>
            <button
              type="button"
              onClick={() => {
                setRefunding(false);
                setPassword("");
              }}
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Don&apos;t refund
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {statusButtons.map((a) => (
          <button
            key={a.status}
            type="button"
            disabled={!!busy}
            onClick={() =>
              post(
                { status: a.status },
                a.status,
                a.status === "cancelled"
                  ? refundable
                    ? "Cancel WITHOUT refunding? The customer keeps being charged. To give their money back, use \"Cancel & refund\" instead."
                    : "Cancel this order? The customer will get a cancellation email asking them to contact you."
                  : a.status === "dispatched"
                    ? "Mark as dispatched? The customer will get a \"your order is on its way\" email."
                    : undefined,
              )
            }
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
              a.status === "cancelled" ? "border border-[#f1b4a5] bg-white text-[#b42318]" : "bg-ink text-white"
            }`}
          >
            {busy === a.status ? "Saving…" : a.status === "cancelled" && refundable ? "Cancel without refund" : a.label}
          </button>
        ))}
        {(status === "pending" || status === "unpaid" || status === "expired") && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => post({ action: "check-payment" }, "check-payment")}
            className="gold-bg rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {busy === "check-payment" ? "Checking…" : "Check payment with Stripe"}
          </button>
        )}
        <button
          type="button"
          disabled={!!busy}
          onClick={() => post({ action: "resend" }, "resend", "Send the order emails again (to you and the customer)?")}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {busy === "resend" ? "Sending…" : "Resend emails"}
        </button>
        {(status === "dispatched" || status === "cancelled" || status === "refunded") && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() =>
              post({ action: "resend-status" }, "resend-status", `Send the ${status === "dispatched" ? "dispatch" : "cancellation"} email to the customer again?`)
            }
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {busy === "resend-status" ? "Sending…" : status === "dispatched" ? "Resend dispatch email" : "Resend cancellation email"}
          </button>
        )}
      </div>
      {msg && (
        <p role="status" className={`text-sm font-semibold ${msg.ok ? "" : "text-[#b42318]"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
