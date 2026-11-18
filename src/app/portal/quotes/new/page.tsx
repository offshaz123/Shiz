import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/client-auth";
import { getSender } from "@/lib/invoices";
import { InvoiceBuilder } from "@/components/InvoiceBuilder";
import { LoginForm } from "../../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New quote",
  robots: { index: false, follow: false },
};

export default async function NewQuotePage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const sender = await getSender(client.id);
  // A quote needs nothing about payment on it, so the only thing worth
  // warning about is an address. Nagging for bank details on a document
  // that does not ask for money would be noise.
  const noAddress = !sender?.address;

  return (
    <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 lg:py-10">
      <Link href="/portal/quotes" className="text-xs font-semibold text-muted hover:text-foreground">
        ‹ All quotes
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        New quote
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        Your details and your logo go on it automatically. When they say yes, it becomes an
        invoice in one tap.
      </p>

      {noAddress && (
        <p className="mt-5 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed text-foreground">
          Your address is not filled in yet, so it will be missing from this quote.{" "}
          <Link href="/portal/business" className="font-semibold underline">
            Add it first
          </Link>
          .
        </p>
      )}

      <div className="mt-6">
        <InvoiceBuilder kind="quote" />
      </div>
    </div>
  );
}
