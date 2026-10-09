"use client";

import Link from "next/link";
import { PlatePreview } from "@/components/PlatePreview";
import { useCart } from "@/lib/cart";
import { describe, money, unitPrice } from "@/lib/plates";

export default function BasketPage() {
  const { items, ready, subtotal, setQty, remove } = useCart();

  if (!ready) return <div className="min-h-[50vh]" />;

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold uppercase">Your basket is empty</h1>
        <p className="mt-3 text-muted">Design your plates in under a minute.</p>
        <Link href="/design" className="btn btn-gold mt-8">
          Design Your Plate
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl font-bold uppercase">Your basket</h1>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="grid gap-5 rounded-3xl border border-line bg-white p-5 sm:grid-cols-[220px_1fr]">
            <div className="rounded-2xl bg-surface p-3">
              <PlatePreview config={item} side={item.which === "front" ? "front" : "rear"} className="mx-auto max-h-28 w-full" />
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="whitespace-pre font-display text-2xl font-bold">{item.reg}</p>
                <p className="text-sm text-muted">{describe(item)}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    className="h-11 w-11 text-xl"
                    onClick={() => setQty(item.id, item.qty - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold" aria-live="polite">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    className="h-11 w-11 text-xl"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" className="text-sm text-muted underline" onClick={() => remove(item.id)}>
                    Remove
                  </button>
                  <p className="font-display text-2xl font-bold">{money(unitPrice(item) * item.qty)}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-3xl border border-line bg-surface p-6 sm:ml-auto sm:max-w-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="font-display text-2xl font-bold">{money(subtotal)}</span>
        </div>
        <p className="mt-1 text-sm text-muted">Free tracked delivery. Next day available at checkout.</p>
        <Link href="/checkout" className="btn btn-gold mt-5 w-full">
          Checkout
        </Link>
        <Link href="/design" className="mt-3 block text-center text-sm font-semibold underline underline-offset-4">
          Add another plate
        </Link>
      </div>
    </div>
  );
}
