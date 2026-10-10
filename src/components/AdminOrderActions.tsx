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

export function AdminOrderActions({ orderRef, status }: { orderRef: string; status: OrderStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  async function post(body: object, key: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(key);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${orderRef}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy("");
    setMsg(res.ok ? json.message ?? "Done" : json.error ?? "Something went wrong");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions
          .filter((a) => a.status !== status)
          .map((a) => (
            <button
              key={a.status}
              type="button"
              disabled={!!busy}
              onClick={() =>
                post(
                  { status: a.status },
                  a.status,
                  a.status === "cancelled"
                    ? "Cancel this order? The customer will get a cancellation email asking them to contact you. (Refund it in Stripe separately.)"
                    : a.status === "dispatched"
                      ? "Mark as dispatched? The customer will get a \"your order is on its way\" email."
                      : undefined,
                )
              }
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                a.status === "cancelled" ? "border border-[#f1b4a5] bg-white text-[#b42318]" : "bg-ink text-white"
              }`}
            >
              {busy === a.status ? "Saving…" : a.label}
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
        {(status === "dispatched" || status === "cancelled") && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => post({ action: "resend-status" }, "resend-status", `Send the ${status === "dispatched" ? "dispatch" : "cancellation"} email to the customer again?`)}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {busy === "resend-status" ? "Sending…" : status === "dispatched" ? "Resend dispatch email" : "Resend cancellation email"}
          </button>
        )}
      </div>
      {msg && (
        <p role="status" className="text-sm font-semibold">
          {msg}
        </p>
      )}
    </div>
  );
}
