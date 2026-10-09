import type { Metadata } from "next";
import Link from "next/link";
import { ClearBasket } from "@/components/ClearBasket";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderConfirmed(props: PageProps<"/order-confirmed">) {
  const { ref, docs } = await props.searchParams;
  const orderRef = typeof ref === "string" ? ref.replace(/[^A-Z0-9-]/gi, "").slice(0, 20) : "";
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <ClearBasket />
      <span className="gold-bg mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold uppercase sm:text-5xl">Thank you!</h1>
      {orderRef && (
        <p className="mt-3 text-lg">
          Your order number is <strong className="gold-text text-xl">{orderRef}</strong>
        </p>
      )}
      <p className="mt-4 text-muted">
        We&apos;ve got your order and will be in touch by email. Orders placed before{" "}
        {site.dispatchCutoff} on a working day are made and dispatched the same day.
      </p>
      {docs === "later" && (
        <div className="mt-8 rounded-3xl border border-line bg-surface p-6">
          <p className="font-display text-2xl font-bold">One more step</p>
          <p className="mt-2 text-muted">
            We can&apos;t make your plates until we&apos;ve seen your documents.
          </p>
          <Link href={`/upload-documents?ref=${orderRef}`} className="btn btn-gold mt-5">
            Upload Documents
          </Link>
        </div>
      )}
      <Link href="/" className="mt-10 inline-block font-semibold underline underline-offset-4">
        Back to home
      </Link>
    </div>
  );
}
