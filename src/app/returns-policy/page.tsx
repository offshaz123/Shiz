import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns Policy",
  description: "Our returns policy for made-to-order number plates, including damaged or incorrect plates.",
  alternates: { canonical: "/returns-policy" },
};

export default function ReturnsPage() {
  return (
    <>
      <PageHero eyebrow="Policies" title="Returns Policy" />
      <div className="prose-plate mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2>Made to order</h2>
        <p>
          Number plates are personalised with your registration and made to order, so the usual
          14-day right to cancel does not apply once we have started making them. Please check your
          registration and options carefully before ordering: we can&apos;t refund or replace plates
          made exactly as ordered if the registration, text or options were entered wrong.
        </p>
        <h2>Damaged or incorrect plates</h2>
        <p>
          If your plates arrive damaged, or we made a mistake, tell us within 14 days of delivery
          with a photo and we&apos;ll make and send replacements free of charge.
        </p>
        <h2>Cancelling an order</h2>
        <p>
          If you need to change or cancel, contact us as soon as possible. If we haven&apos;t
          started making your plates, we&apos;ll give you a full refund.
        </p>
        <h2>How to ask for a refund</h2>
        <p>
          Fill in our <Link href="/refund-request">refund request form</Link> with your order number and
          what happened (add photos if your plates are damaged or wrong). We&apos;ll look into it and reply by
          email, usually within 1 working day. You can also message us on WhatsApp or email {site.email}.
        </p>
      </div>
    </>
  );
}
