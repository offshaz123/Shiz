import type { Metadata } from "next";
import { ReviewForm } from "@/components/ReviewForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Leave a Review",
  description: `Worked with ${siteConfig.shortName}? Tell us how it went.`,
  alternates: { canonical: "/leave-a-review" },
};

export default function LeaveAReviewPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
        Reviews
      </span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Tell us how it went
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        Good or bad. If something went wrong we would rather hear it from you than not hear it at
        all, and we will come back to you either way.
      </p>

      <div className="mt-10">
        <ReviewForm />
      </div>
    </div>
  );
}
