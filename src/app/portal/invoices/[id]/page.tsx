import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentClient } from "@/lib/client-auth";
import { getInvoice, getSender } from "@/lib/invoices";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { InvoiceActions } from "@/components/InvoiceActions";
import { LoginForm } from "../../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

/**
 * One invoice, as their customer will see it.
 *
 * What is on screen is the document, not a preview of it: the same component
 * renders here, prints, and is rebuilt line for line in the email. There is
 * no separate "preview" that can disagree with what went out.
 */

const STATUS_WORD: Record<string, string> = {
  draft: "Not sent yet",
  sent: "Sent",
  paid: "Paid",
  cancelled: "Cancelled",
};

function when(stamp: string): string {
  if (!stamp) return "";
  const at = new Date(stamp);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isInteger(invoiceId) || invoiceId <= 0) notFound();

  const [invoice, sender] = await Promise.all([
    getInvoice(client.id, invoiceId),
    getSender(client.id),
  ]);
  if (!invoice || !sender) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 lg:py-10">
      <div className="print-hide">
        <Link
          href="/portal/invoices"
          className="text-xs font-semibold text-muted hover:text-foreground"
        >
          ‹ All invoices
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Invoice {String(invoice.number).padStart(4, "0")}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {STATUS_WORD[invoice.status]}
              {invoice.status === "sent" && invoice.sentAt && ` to ${invoice.customerEmail} on ${when(invoice.sentAt)}`}
              {invoice.status === "paid" && invoice.paidAt && ` — marked paid ${when(invoice.paidAt)}`}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <InvoiceActions
            id={invoice.id}
            status={invoice.status}
            hasEmail={invoice.customerEmail !== ""}
          />
        </div>
      </div>

      <div className="print-sheet mt-7 overflow-hidden rounded-2xl border border-border">
        <InvoiceDocument invoice={invoice} sender={sender} />
      </div>
    </div>
  );
}
