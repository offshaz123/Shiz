import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentClient } from "@/lib/client-auth";
import { getInvoice, getSender } from "@/lib/invoices";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { PrintOnLoad } from "@/components/PrintOnLoad";
import { LoginForm } from "../../../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

/**
 * The document on its own, for printing and for saving as a PDF.
 *
 * A page of its own rather than a stylesheet that hides everything else,
 * because an element hidden for print still takes up the space it would
 * have taken: the invoice came out as the first of three pages with the
 * side column printed behind it. Here there is genuinely nothing else on
 * the page, so what the browser prints is what is on it.
 *
 * It opens the print dialog by itself and leaves one link back, which is
 * also the only thing on screen that does not print.
 */
export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isInteger(invoiceId) || invoiceId <= 0) notFound();

  const [invoice, sender] = await Promise.all([
    getInvoice(client.id, invoiceId),
    getSender(client.id),
  ]);
  if (!invoice || !sender || invoice.kind !== "invoice") notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="print-hide border-b border-[#e5e7eb] px-5 py-3">
        <Link
          href={`/portal/invoices/${invoice.id}`}
          className="text-xs font-semibold text-[#4b5563] hover:underline"
        >
          ‹ Back to the invoice
        </Link>
        <span className="ml-3 text-xs text-[#6b7280]">
          Choose “Save as PDF” as the destination.
        </span>
      </div>

      <InvoiceDocument invoice={invoice} sender={sender} />
      <PrintOnLoad />
    </div>
  );
}
