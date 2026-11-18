import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentClient } from "@/lib/client-auth";
import { getInvoice, getSender } from "@/lib/invoices";
import { QUOTE_WORD, quoteState } from "@/lib/document-kinds";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { InvoiceActions } from "@/components/InvoiceActions";
import { LoginForm } from "../../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quote",
  robots: { index: false, follow: false },
};

/**
 * One quote, as the customer will see it.
 *
 * The same component renders this, prints it and is rebuilt line for line
 * in the email, so there is no preview that can disagree with what went.
 */

function when(stamp: string): string {
  if (!stamp) return "";
  const at = new Date(stamp);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const { id } = await params;
  const quoteId = Number(id);
  if (!Number.isInteger(quoteId) || quoteId <= 0) notFound();

  const [quote, sender] = await Promise.all([
    getInvoice(client.id, quoteId),
    getSender(client.id),
  ]);
  // Reached by its invoice id, it is not a quote, so it is not this page.
  if (!quote || !sender || quote.kind !== "quote") notFound();

  const state = quoteState(quote.status, quote.validUntil);

  return (
    <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 lg:py-10">
      <div className="print-hide">
        <Link href="/portal/quotes" className="text-xs font-semibold text-muted hover:text-foreground">
          ‹ All quotes
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Quote {String(quote.number).padStart(4, "0")}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {QUOTE_WORD[state]}
            {state === "sent" && quote.sentAt && ` — sent to ${quote.customerEmail} on ${when(quote.sentAt)}`}
            {state === "accepted" && quote.acceptedAt && ` on ${when(quote.acceptedAt)}`}
          </p>
        </div>

        <div className="mt-5">
          <InvoiceActions
            id={quote.id}
            status={quote.status}
            hasEmail={quote.customerEmail !== ""}
            kind="quote"
            validUntil={quote.validUntil}
            becameInvoiceId={quote.becameInvoiceId}
          />
        </div>
      </div>

      <div className="print-sheet mt-7 overflow-hidden rounded-2xl border border-border">
        <InvoiceDocument invoice={quote} sender={sender} />
      </div>
    </div>
  );
}
