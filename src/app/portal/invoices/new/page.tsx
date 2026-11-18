import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/client-auth";
import { getSender } from "@/lib/invoices";
import { InvoiceBuilder } from "@/components/InvoiceBuilder";
import { LoginForm } from "../../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New invoice",
  robots: { index: false, follow: false },
};

export default async function NewInvoicePage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const sender = await getSender(client.id);
  // Checked before they start rather than after they have typed it all out.
  // An invoice with no address and no way to pay is not one they can send,
  // and finding that out at the end is finding it out too late.
  const missing = !sender?.address || !sender?.paymentDetails;

  return (
    <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 lg:py-10">
      <Link href="/portal/invoices" className="text-xs font-semibold text-muted hover:text-foreground">
        ‹ All invoices
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        New invoice
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        Your details and your logo go on it automatically.
      </p>

      {missing && (
        <p className="mt-5 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed text-foreground">
          Your{" "}
          {!sender?.address && !sender?.paymentDetails
            ? "address and payment details are"
            : !sender?.address
              ? "address is"
              : "payment details are"}{" "}
          not filled in yet, so they will be missing from this invoice.{" "}
          <Link href="/portal/business" className="font-semibold underline">
            Add them first
          </Link>
          .
        </p>
      )}

      <div className="mt-6">
        <InvoiceBuilder />
      </div>
    </div>
  );
}
