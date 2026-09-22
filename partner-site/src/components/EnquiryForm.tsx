"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/brand";
import { sectors } from "@/content/sectors";

const businessTypes = [
  ...sectors.map((sector) => sector.longName),
  "Money service business (holds an SPI or API licence)",
  "Other",
];

const volumes = [
  "Under £100,000 / month",
  "£100,000 – £500,000 / month",
  "£500,000 – £1m / month",
  "£1m – £5m / month",
  "Over £5m / month",
  "Not sure yet",
];

const payoutCurrencies = ["USD", "AED", "HKD", "EUR", "CNY", "Sterling only", "Something else"];

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

export function EnquiryForm({
  source,
  submitLabel = "Send enquiry",
}: {
  /** Tags which page the enquiry came from, so the email says where it landed. */
  source?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Bots fill hidden fields. Send them to the thank-you page and nowhere else.
    if ((formData.get("_honey") as string)?.length) {
      router.push("/thank-you");
      return;
    }

    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (key !== "_honey") payload[key] = String(value);
    });

    setSubmitting(true);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Submission failed");
      form.reset();
      router.push("/thank-you");
    } catch {
      setSubmitting(false);
      setError(
        `We couldn't send that just now. Please try again, or call us on ${brand.phoneDisplay}.`
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {source && <input type="hidden" name="source" value={source} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Your name *
          </label>
          <input id="name" name="name" required autoComplete="name" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="business">
            Company name *
          </label>
          <input
            id="business"
            name="business"
            required
            autoComplete="organization"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">
            Phone *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="businessType">
          What does the business do?
        </label>
        <select id="businessType" name="businessType" defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Choose one
          </option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="volume">
            Money in, per month
          </label>
          <select id="volume" name="volume" defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Choose one
            </option>
            {volumes.map((volume) => (
              <option key={volume} value={volume}>
                {volume}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="currency">
            Currency you pay suppliers in
          </label>
          <select id="currency" name="currency" defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Choose one
            </option>
            {payoutCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="currentProvider">
          Who do you bank with now, and what are they charging you to convert?
        </label>
        <input
          id="currentProvider"
          name="currentProvider"
          placeholder="It is the fastest way for us to price against it"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="message">
          Anything else we should know
        </label>
        <textarea id="message" name="message" rows={4} className={fieldClass} />
      </div>

      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {error && (
        <p className="rounded-lg border border-border bg-surface-2 px-3.5 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : submitLabel}
      </button>

      <p className="text-xs leading-relaxed text-muted">
        We use your details to answer your enquiry and nothing else — see our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          privacy policy
        </a>
        . Sending this is an enquiry, not an application, and no account is guaranteed.
      </p>
    </form>
  );
}
