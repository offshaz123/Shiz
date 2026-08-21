"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

type PlateType = "both" | "front" | "rear";
type Border = "none" | "black";
type Badge = "none" | "uk";

// Placeholder pricing — swap these for your real prices whenever you're ready.
const BASE_PRICE: Record<PlateType, number> = { both: 39.99, front: 24.99, rear: 24.99 };
const BORDER_PRICE: Record<Border, number> = { none: 0, black: 5 };
const BADGE_PRICE: Record<Badge, number> = { none: 0, uk: 5 };

function formatPrice(n: number) {
  return `£${n.toFixed(2)}`;
}

function UkBadge() {
  return (
    <div className="flex h-full w-7 shrink-0 flex-col items-center justify-center bg-[#003399] text-[7px] font-bold leading-none text-white">
      <span className="text-[9px]">★</span>
      <span className="mt-0.5">UK</span>
    </div>
  );
}

function PlatePreview({
  reg,
  rear,
  border,
  badge,
}: {
  reg: string;
  rear: boolean;
  border: Border;
  badge: Badge;
}) {
  return (
    <div className="text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{rear ? "Rear Plate" : "Front Plate"}</p>
      <div
        className={`mx-auto flex h-16 w-full max-w-xs overflow-hidden rounded-md ${
          rear ? "bg-[#f2c94c]" : "bg-white"
        } ${border === "black" ? "border-4 border-black" : "border border-black/20"}`}
      >
        {badge === "uk" && <UkBadge />}
        <div className="flex flex-1 items-center justify-center px-2">
          <span className="font-mono text-2xl font-bold tracking-[0.15em] text-black sm:text-3xl">
            {reg || "AB12 CDE"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PlateDesigner() {
  const router = useRouter();
  const [reg, setReg] = useState("");
  const [plateType, setPlateType] = useState<PlateType>("both");
  const [border, setBorder] = useState<Border>("none");
  const [badge, setBadge] = useState<Badge>("none");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = useMemo(
    () => BASE_PRICE[plateType] + BORDER_PRICE[border] + BADGE_PRICE[badge],
    [plateType, border, badge]
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if ((formData.get("_honey") as string)?.length) {
      router.push("/thank-you");
      return;
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const notes = formData.get("notes") as string;

    const plateTypeLabel = plateType === "both" ? "Front & Rear" : plateType === "front" ? "Front Only" : "Rear Only";
    const message = [
      `Number plate order request`,
      `Registration: ${reg || "(not entered)"}`,
      `Plate(s): ${plateTypeLabel}`,
      `Border: ${border === "black" ? "Black" : "None"}`,
      `Badge: ${badge === "uk" ? "UK" : "None"}`,
      `Estimated price: ${formatPrice(price)}`,
      `Delivery address: ${address || "(not provided — collecting in-shop)"}`,
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, serviceCategory: "Number Plates", message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Submission failed");
      form.reset();
      router.push("/thank-you");
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error && err.message !== "Submission failed"
          ? err.message
          : `Something went wrong sending your order. Please try again, or message us on WhatsApp at ${siteConfig.phoneDisplay}.`
      );
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
        <div className="mt-6 space-y-6">
          {plateType !== "rear" && <PlatePreview reg={reg.toUpperCase()} rear={false} border={border} badge={badge} />}
          {plateType !== "front" && <PlatePreview reg={reg.toUpperCase()} rear border={border} badge={badge} />}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-background p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-foreground">Order Details</h3>
        <p className="mt-1 text-sm text-muted">Fill in your details and customise your plate.</p>

        <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

        <div className="mt-6 grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">Vehicle registration</span>
            <input
              value={reg}
              onChange={(e) => setReg(e.target.value)}
              placeholder="AB12 CDE"
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm uppercase tracking-widest text-foreground placeholder:text-muted placeholder:tracking-normal placeholder:normal-case focus:border-brand-pink focus:outline-none"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-foreground">Plate type</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(["both", "front", "rear"] as PlateType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPlateType(t)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    plateType === t
                      ? "border-brand-pink bg-brand-pink/10 text-brand-pink"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {t === "both" ? "Both Plates" : t === "front" ? "Front Only" : "Rear Only"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-foreground">Border</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(["none", "black"] as Border[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBorder(b)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold capitalize transition-colors ${
                      border === b ? "border-brand-pink bg-brand-pink/10 text-brand-pink" : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Badge</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(["none", "uk"] as Badge[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase transition-colors ${
                      badge === b ? "border-brand-pink bg-brand-pink/10 text-brand-pink" : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {b === "none" ? "None" : "UK"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="brand-gradient-bg rounded-xl px-4 py-3 text-center text-lg font-bold text-white">
            {formatPrice(price)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-foreground">Full name</span>
              <input
                name="name"
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-foreground">Phone number</span>
              <input
                name="phone"
                type="tel"
                required
                placeholder="07000 000000"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">Email address</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">Delivery address (optional — leave blank to collect in-shop)</span>
            <textarea
              name="address"
              rows={2}
              placeholder="Enter your full address..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-foreground">Notes (optional)</span>
            <textarea
              name="notes"
              rows={2}
              placeholder="Any special requests..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="brand-gradient-bg mt-1 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? "Sending..." : `Request This Plate — ${formatPrice(price)}`}
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <p className="text-xs text-muted">
            This sends your order request to us — payment is taken in-shop or over the phone once we confirm your plate is
            DVLA-compliant. By submitting, you agree to be contacted by {siteConfig.name} about your order.
          </p>
        </div>
      </form>
    </div>
  );
}
