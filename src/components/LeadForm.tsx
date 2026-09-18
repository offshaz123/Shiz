"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { trackLeadEvent } from "@/components/MetaPixel";

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

/** 5MB before base64. Larger attachments get bounced by most mail servers. */
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      // Strip the "data:<mime>;base64," prefix — the API wants the payload only.
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

export function LeadForm({
  compact = false,
  source,
  askWebsite = false,
  allowAttachment = false,
  submitLabel = "Get My Free Strategy Call",
}: {
  compact?: boolean;
  /** Tags which page the enquiry came from, so we can tell audit requests apart. */
  source?: string;
  askWebsite?: boolean;
  /** Adds an optional file field. Kept small so it survives SMTP. */
  allowAttachment?: boolean;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if ((formData.get("_honey") as string)?.length) {
      router.push("/thank-you");
      return;
    }

    const eventId = crypto.randomUUID();
    const payload: Record<string, string> = { eventId };
    formData.forEach((value, key) => {
      if (key !== "_honey") payload[key] = String(value);
    });

    const fileInput = form.elements.namedItem("attachment") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (file) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setError("That file is over 5MB. Please attach a smaller one, or send it over on WhatsApp.");
        return;
      }
      try {
        payload.attachmentName = file.name;
        payload.attachmentType = file.type || "application/octet-stream";
        payload.attachmentData = await readAsBase64(file);
      } catch {
        setError("We couldn't read that file. Please try another, or send it on WhatsApp.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error("Submission failed");
      trackLeadEvent(eventId);
      form.reset();
      setFileName(null);
      router.push("/thank-you");
    } catch {
      setSubmitting(false);
      setError(
        `Something went wrong sending your details. Please try again, or reach us directly on WhatsApp at ${siteConfig.phoneDisplay}.`
      );
    }
  }

  return (
    <form name="lead-inquiry" onSubmit={handleSubmit} className="grid gap-4">
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      {source && <input type="hidden" name="source" value={source} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="John Smith" required />
        <Field label="Business name" name="business" placeholder="Your business" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" placeholder="you@business.com" required />
        <Field label="Phone number" name="phone" type="tel" placeholder="07XXX XXXXXX" required />
      </div>

      {askWebsite && (
        <Field
          label="Your website"
          name="website"
          type="url"
          placeholder="https://yourbusiness.co.uk"
          required
        />
      )}

      {allowAttachment && (
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Attach something (optional)
          </span>
          <span className="rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center">
            <input
              type="file"
              name="attachment"
              accept={ACCEPTED_TYPES}
              onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-brand-pink/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-pink hover:file:bg-brand-pink/25"
            />
            <span className="mt-2 block text-xs text-muted">
              {fileName ?? "PDF, DOC, DOCX, PNG or JPG · up to 5MB"}
            </span>
          </span>
        </label>
      )}

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
        disabled={submitting}
        className="brand-gradient-bg mt-1 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? "Sending..." : submitLabel}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

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
