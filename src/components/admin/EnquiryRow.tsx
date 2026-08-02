"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Enquiry } from "@/lib/queries";

const CHANNEL_LABELS: Record<string, string> = {
  web_form: "Website form",
  phone_call: "Phone call",
  whatsapp: "WhatsApp",
  walk_in: "Walk-in",
  chat_bot: "AI chat",
};

const STATUSES = ["new", "contacted", "booked", "completed", "cancelled"];

export function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState(enquiry.status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: string) {
    setStatus(next as Enquiry["status"]);
    setSaving(true);
    await fetch(`/api/admin/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
        {new Date(enquiry.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{enquiry.name}</p>
        <p className="text-xs text-muted">{enquiry.phone || enquiry.email || "No contact details"}</p>
      </td>
      <td className="px-4 py-3 text-sm text-muted">{CHANNEL_LABELS[enquiry.channel] ?? enquiry.channel}</td>
      <td className="px-4 py-3 text-sm text-muted">{enquiry.service_category || "—"}</td>
      <td className="max-w-xs px-4 py-3 text-sm text-muted">{enquiry.message || "—"}</td>
      <td className="px-4 py-3">
        <select
          value={status}
          disabled={saving}
          onChange={(e) => updateStatus(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-brand-pink focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
