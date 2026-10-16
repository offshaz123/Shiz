import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CameBack } from "@/components/CameBack";
import { CarPreview } from "@/components/CarPreview";
import { KlarnaNote } from "@/components/Klarna";
import { PlatePreview } from "@/components/PlatePreview";
import { isDbConfigured } from "@/lib/db";
import { type Order, claimFreeDelivery, getOrder, resumeTokenMatches } from "@/lib/orders";
import { delivery, describe, money, unitPrice } from "@/lib/plates";
import { site, whatsappHref } from "@/lib/site";

export const metadata: Metadata = { title: "Complete your order", robots: { index: false } };

type Loaded = { order: Order; offer: "claimed" | "ended" | "none" } | null;

async function load(ref: string, token: string): Promise<Loaded> {
  if (!ref || !token || !isDbConfigured()) return null;
  try {
    const order = await getOrder(ref);
    if (!order || !(await resumeTokenMatches(ref, token))) return null;
    // Only an unpaid order can still have the offer applied.
    if (order.status !== "pending" && order.status !== "expired") return { order, offer: "none" };
    return await claimFreeDelivery(order);
  } catch (err) {
    console.error(`Loading order ${ref} to complete failed`, err);
    return null;
  }
}

// Where the reminder email's button lands: their saved plates, the free
// delivery they've claimed, and a Pay button that goes on to Stripe.
export default async function CompleteOrder(props: PageProps<"/complete-order">) {
  const sp = await props.searchParams;
  const ref = (typeof sp.ref === "string" ? sp.ref : "").replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
  const token = (typeof sp.t === "string" ? sp.t : "").slice(0, 64);
  const loaded = await load(ref, token);

  if (!loaded || loaded.order.items.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold uppercase">This link has expired</h1>
        <p className="mt-3 text-muted">We couldn&apos;t find that order. You can design your plates again in under a minute.</p>
        <Link href="/design" className="btn btn-gold mt-8">
          Design Your Plate
        </Link>
      </div>
    );

  const { order, offer } = loaded;
  if (["paid", "in_production", "dispatched"].includes(order.status)) redirect(`/track?ref=${order.ref}`);
  if (order.status !== "pending" && order.status !== "expired")
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold uppercase">This order is closed</h1>
        <p className="mt-3 text-muted">Order {order.ref} can&apos;t be paid for any more. Design your plates again, or message us and we&apos;ll help.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/design" className="btn btn-gold">
            Design Your Plate
          </Link>
          <a href={whatsappHref} className="btn btn-white">
            WhatsApp us
          </a>
        </div>
      </div>
    );

  // What delivery would normally cost, to show it crossed out.
  const usual = delivery.find((d) => d.name === order.delivery_name)?.price ?? 0;
  const subtotal = order.items.reduce((n, i) => n + unitPrice(i) * i.qty, 0);
  const first = order.customer_name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <CameBack orderRef={order.ref} token={token} />
      {offer === "claimed" ? (
        <div className="gold-bg rounded-3xl p-6 text-center">
          <p className="font-display text-3xl font-bold uppercase sm:text-4xl">🎉 Free delivery claimed!</p>
          <p className="mt-2 font-semibold">
            {first ? `${first}, your` : "Your"} {usual ? `${money(usual)} ` : ""}delivery is on us. Your plates are saved below, ready to pay.
          </p>
        </div>
      ) : offer === "ended" ? (
        <div className="rounded-3xl border border-[#e8d89a] bg-[#fdf8e7] p-6 text-center">
          <p className="font-display text-2xl font-bold uppercase">The free delivery offer has ended</p>
          <p className="mt-1 text-muted">It was for 24 hours from our email, but your plates are still saved below.</p>
        </div>
      ) : (
        <h1 className="font-display text-3xl font-bold uppercase sm:text-4xl">Complete your order</h1>
      )}

      <section className="mt-6">
        <CarPreview config={order.items[0]} />
        <p className="mt-3 text-sm text-muted">Here&apos;s how your plate will look on the front of a car.</p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li key={item.id} className="grid gap-5 rounded-3xl border border-line bg-white p-5 sm:grid-cols-[220px_1fr]">
              <div className="rounded-2xl bg-surface p-3">
                <PlatePreview config={item} side={item.which === "front" ? "front" : "rear"} className="mx-auto max-h-28 w-full" />
              </div>
              <div className="flex flex-col justify-between gap-3">
                <div>
                  <p className="whitespace-pre font-display text-2xl font-bold">{item.reg}</p>
                  <p className="text-sm text-muted">{describe(item)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Quantity: {item.qty}</span>
                  <span className="font-display text-2xl font-bold">{money(unitPrice(item) * item.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-3xl border border-line bg-surface p-6">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted">Plates</dt>
              <dd className="font-semibold">{money(subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Discount{order.discount_code ? ` (${order.discount_code})` : ""}</dt>
                <dd className="font-semibold">−{money(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">{order.delivery_name}</dt>
              <dd className="font-semibold">
                {order.delivery_price ? (
                  money(order.delivery_price)
                ) : (
                  <>
                    {offer === "claimed" && usual > 0 && <s className="mr-1.5 font-normal text-muted">{money(usual)}</s>}
                    <span className="text-[#1f7a3d]">FREE</span>
                  </>
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3">
              <dt className="font-bold">Total</dt>
              <dd className="font-display text-3xl font-bold">{money(order.total)}</dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-muted">
            <span className="font-semibold text-ink">Delivering to:</span> {order.customer_name}, {order.address1}
            {order.address2 ? `, ${order.address2}` : ""}, {order.town}, {order.postcode}
          </p>

          <form action="/api/order/resume" method="post" className="mt-5">
            <input type="hidden" name="ref" value={order.ref} />
            <input type="hidden" name="t" value={token} />
            <button type="submit" className="btn btn-gold w-full">
              Pay securely {money(order.total)}
            </button>
          </form>
          <KlarnaNote amount={order.total} className="mt-4" />
          <p className="mt-4 text-center text-xs text-muted">
            Secure payment by Stripe. Orders before {site.dispatchCutoff} on a working day are dispatched the same day.
          </p>
          <p className="mt-3 text-center text-sm">
            Want to change something?{" "}
            <a href={whatsappHref} className="font-semibold underline">
              WhatsApp us
            </a>{" "}
            or{" "}
            <Link href="/design" className="font-semibold underline">
              design again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
