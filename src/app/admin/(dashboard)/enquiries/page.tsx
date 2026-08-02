import type { Metadata } from "next";
import Link from "next/link";
import { listEnquiries } from "@/lib/queries";
import { EnquiryRow } from "@/components/admin/EnquiryRow";
import { NewLogForm } from "@/components/admin/NewLogForm";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

const STATUSES = ["new", "contacted", "booked", "completed", "cancelled"];
const CHANNELS = ["web_form", "phone_call", "whatsapp", "walk_in", "chat_bot"];

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; channel?: string }>;
}) {
  const params = await searchParams;
  const enquiries = await listEnquiries({ status: params.status, channel: params.channel });

  function filterHref(key: "status" | "channel", value: string) {
    const next = new URLSearchParams();
    if (key === "status" && value) next.set("status", value);
    else if (params.status) next.set("status", params.status);
    if (key === "channel" && value) next.set("channel", value);
    else if (params.channel) next.set("channel", params.channel);
    const qs = next.toString();
    return qs ? `/admin/enquiries?${qs}` : "/admin/enquiries";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">Every enquiry, call and message in one place.</p>
        </div>
        <NewLogForm />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={filterHref("status", "")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            !params.status ? "border-brand-pink text-foreground" : "border-border text-muted"
          }`}
        >
          All statuses
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={filterHref("status", s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              params.status === s ? "border-brand-pink text-foreground" : "border-border text-muted"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
        <span className="mx-1 text-border">|</span>
        <Link
          href={filterHref("channel", "")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            !params.channel ? "border-brand-pink text-foreground" : "border-border text-muted"
          }`}
        >
          All channels
        </Link>
        {CHANNELS.map((c) => (
          <Link
            key={c}
            href={filterHref("channel", c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              params.channel === c ? "border-brand-pink text-foreground" : "border-border text-muted"
            }`}
          >
            {c.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} />
            ))}
          </tbody>
        </table>
        {enquiries.length === 0 && <p className="p-6 text-sm text-muted">No enquiries match these filters.</p>}
      </div>
    </div>
  );
}
