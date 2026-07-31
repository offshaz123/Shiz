"use client";

import { useState, type FormEvent } from "react";
import { siteConfig } from "@/lib/site-config";

const industries = [
  "Automotive",
  "Home & Trade Services",
  "Retail & E-commerce",
  "Health, Beauty & Wellness",
  "Real Estate & Property",
  "Restaurants & Hospitality",
  "Professional Services",
  "Other",
];

const budgets = [
  "Under £1,000/mo",
  "£1,000 - £3,000/mo",
  "£3,000 - £10,000/mo",
  "£10,000+/mo",
  "Not sure yet",
];

type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    if ((data.get("_honey") as string)?.length) {
      setStatus("success");
      return;
    }

    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${siteConfig.email}`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        }
      );

      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="brand-gradient-bg flex h-12 w-12 items-center justify-center rounded-full">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Thanks — you&apos;re in!</h3>
        <p className="max-w-sm text-sm text-muted">
          We&apos;ve received your details. A member of the Shaz Marketing Group team will
          reach out within one business day. Need us sooner? Message us on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="_subject" value="New lead from shazmarketinggroup.com" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="John Smith" required />
        <Field label="Business name" name="business" placeholder="Your business" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" placeholder="you@business.com" required />
        <Field label="Phone number" name="phone" type="tel" placeholder="07XXX XXXXXX" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Business category" name="industry" options={industries} />
        <SelectField label="Monthly ad budget" name="budget" options={budgets} />
      </div>

      {!compact && (
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Tell us about your business (optional)
          </span>
          <textarea
            name="message"
            rows={4}
            placeholder="What are you hoping to achieve with Meta & Instagram ads?"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="brand-gradient-bg mt-1 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Get My Free Strategy Call"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-500">
          Something went wrong sending your details. Please try again, or reach us directly on
          WhatsApp at {siteConfig.phoneDisplay}.
        </p>
      )}

      <p className="text-xs text-muted">
        By submitting, you agree to be contacted by Shaz Marketing Group about our services. See
        our{" "}
        <a href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        name={name}
        defaultValue=""
        required
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand-pink focus:outline-none"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
