import type { Metadata } from "next";
import { ReviewForm } from "@/components/ReviewForm";
import { TrustpilotBadge } from "@/components/TrustpilotBadge";
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

      {/* Trustpilot first, and said plainly: a review there is public and
          verifiable by anyone, where one left below is a testimonial we
          publish ourselves. The second is still worth having, but it is not
          the same thing and should not be dressed up as it. */}
      <div className="mt-10 rounded-3xl border border-border bg-surface p-7">
        <h2 className="text-lg font-semibold text-foreground">Review us on Trustpilot</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This is the one that counts for other people. It is public, it sits on Trustpilot rather
          than on our own site, and anyone can go and read it without taking our word for
          anything. Takes a minute and you do not need an account first.
        </p>
        <TrustpilotBadge className="mt-5" />
      </div>

      <div className="mt-10">
        <p className="text-sm text-muted">
          Or leave it here, and we will put it on the site once we have read it.
        </p>
        <div className="mt-5">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
