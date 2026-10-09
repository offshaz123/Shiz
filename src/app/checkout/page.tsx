"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { AddressFields } from "@/components/AddressFields";
import { type DeliveryId, delivery, describe, money, unitPrice } from "@/lib/plates";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5 sm:p-7">
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold">
        <span className="gold-bg flex h-9 w-9 items-center justify-center rounded-full text-lg">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required = true,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </span>
      <input className="field" name={name} type={type} autoComplete={autoComplete} required={required} />
    </label>
  );
}

const GUEST_KEY = "platedup-guest-checkout";

type Account = { name: string; email: string; phone: string; address1: string; address2: string; town: string; postcode: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, ready, subtotal } = useCart();
  const [deliveryId, setDeliveryId] = useState<DeliveryId>("standard");
  const [later, setLater] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [savedAddress, setSavedAddress] = useState<{ address1: string; address2: string; town: string; postcode: string }>();
  // undefined = still checking, null = not logged in.
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [guest, setGuest] = useState(false);

  // Who's checking out? Logged-in customers skip straight to the form.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- remember "continue as guest" for this visit
      setGuest(sessionStorage.getItem(GUEST_KEY) === "1");
    } catch {}
    fetch("/api/account")
      .then((r) => r.json())
      .then(({ user }) => setAccount(user ?? null))
      .catch(() => setAccount(null));
  }, []);

  const showForm = account !== undefined && (account !== null || guest);

  // Fill in saved details once the form is on screen.
  useEffect(() => {
    const form = formRef.current;
    if (!account || !form) return;
    for (const key of ["name", "email", "phone"] as const) {
      const input = form.elements.namedItem(key) as HTMLInputElement | null;
      if (input && !input.value && account[key]) input.value = account[key];
    }
    setSavedAddress({ address1: account.address1, address2: account.address2, town: account.town, postcode: account.postcode });
  }, [account, showForm]);

  if (!ready) return <div className="min-h-[50vh]" />;
  if (items.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold uppercase">Your basket is empty</h1>
        <Link href="/design" className="btn btn-gold mt-8">
          Design Your Plate
        </Link>
      </div>
    );

  if (account === undefined) return <div className="min-h-[50vh]" />;

  // Not logged in: offer log in, sign up, or guest checkout.
  if (!showForm)
    return (
      <div className="bg-surface px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-center font-display text-4xl font-bold uppercase">Checkout</h1>
          <p className="mt-2 text-center text-muted">How would you like to continue?</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-white p-6">
              <h2 className="font-display text-2xl font-bold">Have an account?</h2>
              <p className="mt-1 text-sm text-muted">
                Log in or create one to track your order, see all your orders in one place and check out faster next time.
              </p>
              <div className="mt-5 grid gap-3">
                <Link href="/login?next=/checkout" className="btn btn-gold rounded-lg">
                  Log in
                </Link>
                <Link href="/signup?next=/checkout" className="btn btn-white rounded-lg">
                  Create an account
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-white p-6">
              <h2 className="font-display text-2xl font-bold">Checkout as a guest</h2>
              <p className="mt-1 text-sm text-muted">
                No account needed. You&apos;ll still get your order confirmation and receipt by email, but you won&apos;t be able
                to see the order in an account.
              </p>
              <button
                type="button"
                className="btn btn-dark mt-5 w-full rounded-lg"
                onClick={() => {
                  setGuest(true);
                  try {
                    sessionStorage.setItem(GUEST_KEY, "1");
                  } catch {}
                }}
              >
                Continue as guest
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const deliveryPrice = delivery.find((d) => d.id === deliveryId)!.price;
  const total = subtotal + deliveryPrice;
  // Only road-legal plates need documents; show plates don't.
  const needsDocs = items.some((i) => i.type !== "show");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    form.set("items", JSON.stringify(items));
    form.set("delivery", deliveryId);
    try {
      const res = await fetch("/api/order", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      router.push(`/order-confirmed?ref=${encodeURIComponent(data.ref)}${needsDocs && later ? "&docs=later" : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl font-bold uppercase">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        {account ? (
          <>
            Checking out as <strong className="text-ink">{account.name}</strong> ({account.email})
          </>
        ) : (
          <>
            Checking out as a guest ·{" "}
            <Link href="/login?next=/checkout" className="font-semibold text-gold underline">
              Log in instead
            </Link>
          </>
        )}
      </p>
      <form ref={formRef} onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          <Section n={1} title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" autoComplete="name" className="sm:col-span-2" />
              <Field label="Email" name="email" type="email" autoComplete="email" />
              <Field label="Mobile number" name="phone" type="tel" autoComplete="tel" />
            </div>
          </Section>

          <Section n={2} title="Delivery address">
            <AddressFields initial={savedAddress} />
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-semibold">Delivery option</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {delivery.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="option"
                    aria-pressed={deliveryId === d.id}
                    onClick={() => setDeliveryId(d.id)}
                  >
                    <span className="flex justify-between font-semibold">
                      {d.name}
                      <span>{d.price ? money(d.price) : "FREE"}</span>
                    </span>
                    <span className="block text-sm text-muted">{d.note}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </Section>

          <Section n={3} title={needsDocs ? "Upload your documents" : "Confirm your order"}>
            {needsDocs ? (
            <>
            <p className="text-muted">
              By law we must see these before we make your road-legal plates. A clear photo from
              your phone is perfect.
            </p>
            {!later && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block rounded-2xl border-2 border-dashed border-line bg-surface p-4">
                  <span className="block font-semibold">Proof you own the reg</span>
                  <span className="mb-3 block text-sm text-muted">V5C logbook, new keeper slip, V750 or V778</span>
                  <input name="entitlement" type="file" accept="image/*,application/pdf" required className="block w-full text-sm" />
                </label>
                <label className="block rounded-2xl border-2 border-dashed border-line bg-surface p-4">
                  <span className="block font-semibold">ID in your name</span>
                  <span className="mb-3 block text-sm text-muted">Driving licence, passport, or utility bill</span>
                  <input name="identity" type="file" accept="image/*,application/pdf" required className="block w-full text-sm" />
                </label>
              </div>
            )}
            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="docsLater"
                className="h-5 w-5 accent-[#8a6812]"
                checked={later}
                onChange={(e) => setLater(e.target.checked)}
              />
              <span>I&apos;ll upload them later (we can&apos;t make your plates until we have them)</span>
            </label>
            </>
            ) : (
              <p className="rounded-xl border border-[#f1c9a5] bg-[#fff5ec] p-3 text-sm text-[#8a4a12]">
                Your basket only has show plates, so no documents are needed. Show plates are for
                display and off-road use only and are not road legal.
              </p>
            )}
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" name="entitled" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#8a6812]" />
              <span>
                {needsDocs
                  ? "I confirm I am entitled to display these registration numbers"
                  : "I understand show plates are not road legal and won't use them on the road"}
                . I&apos;ve checked my plate details are correct and understand personalised plates can&apos;t be refunded if
                entered wrong. I agree to the{" "}
                <Link href="/terms-conditions" className="underline" target="_blank">
                  terms &amp; conditions
                </Link>
                .
              </span>
            </label>
          </Section>
        </div>

        {/* Summary */}
        <aside className="rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-bold">Order summary</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="block font-semibold">
                    <span className="whitespace-pre">{i.reg}</span> {i.qty > 1 && `× ${i.qty}`}
                  </span>
                  <span className="block text-xs text-muted">{describe(i)}</span>
                </span>
                <span className="font-semibold">{money(unitPrice(i) * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-line pt-3">
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{deliveryPrice ? money(deliveryPrice) : "FREE"}</dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="font-display text-xl font-bold">Total</dt>
              <dd className="font-display text-2xl font-bold">{money(total)}</dd>
            </div>
          </dl>
          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-gold mt-5 w-full" disabled={sending}>
            {sending ? "Placing order…" : `Pay ${money(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Secure checkout. Your documents are only used to verify your order.</p>
        </aside>
      </form>
    </div>
  );
}
