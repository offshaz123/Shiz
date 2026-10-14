import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RefundForm } from "@/components/RefundForm";

export const metadata: Metadata = {
  title: "Request a Refund",
  description: "Ask for a refund on your PlatedUp number plate order. We'll look into it and reply by email.",
  alternates: { canonical: "/refund-request" },
};

export default async function RefundRequestPage(props: PageProps<"/refund-request">) {
  const { ref } = await props.searchParams;
  return (
    <>
      <PageHero eyebrow="Order help" title="Request a Refund">
        Tell us what happened and we&apos;ll look into it. We usually reply within 1 working day.
      </PageHero>
      <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <RefundForm initialRef={typeof ref === "string" ? ref.replace(/[^A-Z0-9-]/gi, "").slice(0, 20) : ""} />
        </div>
      </div>
    </>
  );
}
