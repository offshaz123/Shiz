"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { serviceCategories } from "@/content/services";

export function LeadForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if ((formData.get("_honey") as string)?.length) {
      router.push("/thank-you");
      return;
    }

    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      serviceCategory: formData.get("serviceCategory"),
      message: formData.get("message"),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          : `Something went wrong sending your details. Please try again, or reach us directly on WhatsApp at ${siteConfig.phoneDisplay}.`
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="John Smith" required />
        <Field label="Phone number" name="phone" type="tel" placeholder="07XXX XXXXXX" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email (optional)" name="email" type="email" placeholder="you@example.com" />
        <SelectField label="Which service?" name="serviceCategory" options={serviceCategories.map((c) => c.title)} />
      </div>

      {!compact && (
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Tell us more (optional)</span>
          <textarea
            name="message"
            rows={4}
            placeholder="Your vehicle, what you're after, and any dates that suit you"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="brand-gradient-bg mt-1 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send Enquiry"}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-muted">
        By submitting, you agree to be contacted by {siteConfig.name} about your enquiry. See our{" "}
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
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand-pink focus:outline-none"
      >
        <option value="">Not sure yet</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
