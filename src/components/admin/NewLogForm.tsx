"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { serviceCategories } from "@/content/services";

const CHANNELS = [
  { value: "phone_call", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp message" },
  { value: "walk_in", label: "Walk-in" },
];

export function NewLogForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      serviceCategory: formData.get("serviceCategory"),
      message: formData.get("message"),
      channel: formData.get("channel"),
    };

    const res = await fetch("/api/admin/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setOpen(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white"
      >
        + Log a call or message
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Customer name</span>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand-pink focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Phone number</span>
          <input
            name="phone"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand-pink focus:outline-none"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Channel</span>
          <select
            name="channel"
            defaultValue="phone_call"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand-pink focus:outline-none"
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Service</span>
          <select
            name="serviceCategory"
            defaultValue=""
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand-pink focus:outline-none"
          >
            <option value="">Not specified</option>
            {serviceCategories.map((c) => (
              <option key={c.slug} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 grid gap-1.5">
        <span className="text-sm font-medium text-foreground">Notes</span>
        <textarea
          name="message"
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand-pink focus:outline-none"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
