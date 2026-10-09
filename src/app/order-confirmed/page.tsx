import type { Metadata } from "next";
import Link from "next/link";
import { ClearBasket } from "@/components/ClearBasket";
import { site, whatsappHref } from "@/lib/site";
import { isDbConfigured } from "@/lib/db";
import { getCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { type Order, getOrder, markPaid } from "@/lib/orders";
import { money } from "@/lib/plates";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

async function loadOrder(ref: string, sessionId: string): Promise<Order | null> {
  if (!isDbConfigured() || !ref) return null;
  try {
    // Check the payment with Stripe directly, in case its webhook hasn't arrived yet.
    if (sessionId && isStripeConfigured()) {
      const session = await getCheckoutSession(sessionId);
      if (session.ref === ref) await markPaid(session);
    }
    return await getOrder(ref);
  } catch (err) {
    console.error("Loading order failed", err);
    return null;
  }
}

export default async function OrderConfirmed(props: PageProps<"/order-confirmed">) {
  const { ref, docs, session_id } = await props.searchParams;
  const orderRef = typeof ref === "string" ? ref.replace(/[^A-Z0-9-]/gi, "").slice(0, 20) : "";
  const sessionId = typeof session_id === "string" ? session_id.slice(0, 255) : "";
  const order = await loadOrder(orderRef, sessionId);
  const paid = order ? ["paid", "in_production", "dispatched"].includes(order.status) : false;
  const docsOutstanding = order ? order.docs_status === "outstanding" : docs === "later";

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <ClearBasket />
      <span className="gold-bg mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold uppercase sm:text-5xl">Thank you!</h1>
      {orderRef && (
        <p className="mt-3 text-lg">
          Your order number is <strong className="gold-text text-xl">{orderRef}</strong>
        </p>
      )}
      {order && (
        <p
          className={`mx-auto mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold ${
            paid ? "bg-[#e7f6ec] text-[#1f7a3d]" : "bg-[#fff5ec] text-[#8a4a12]"
          }`}
        >
          {paid
            ? `✓ Payment received${order.amount_paid ? `: ${money(order.amount_paid)}` : ""}`
            : order.status === "pending"
              ? "Confirming your payment… you'll get an email as soon as it's through"
              : "Order received: we'll send you a payment link"}
        </p>
      )}
      <p className="mt-4 text-muted">
        {paid
          ? `We've emailed your receipt to ${order!.email}. `
          : "We'll be in touch by email. "}
        Orders placed before {site.dispatchCutoff} on a working day are made and dispatched the same day.
      </p>
      {docsOutstanding && (
        <div className="mt-8 rounded-3xl border-2 border-[#d92d20] bg-[#fdecec] p-6 text-left">
          <p className="font-display text-2xl font-bold text-[#b42318]">⚠️ Action needed: upload your documents</p>
          <p className="mt-2 text-[#7a271a]">
            By law we must see proof you own the registration (V5C) and photo ID before we can make road-legal plates.{" "}
            <strong>Until we receive them, your order can&apos;t go ahead and will be delayed.</strong>
          </p>
          <Link href={`/upload-documents?ref=${orderRef}`} className="btn mt-5 bg-[#d92d20] text-white hover:bg-[#b42318]">
            Upload my documents now
          </Link>
        </div>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/account" className="btn btn-white">
          View my orders
        </Link>
        <a href={whatsappHref} className="btn btn-white">
          Questions? WhatsApp us
        </a>
      </div>
    </div>
  );
}
