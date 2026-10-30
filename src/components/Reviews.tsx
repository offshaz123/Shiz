import Link from "next/link";
import { getApprovedReviews, summarise, type Review } from "@/lib/reviews";

/**
 * The reviews section, near the bottom of the homepage.
 *
 * Renders nothing at all when there are no approved reviews. An empty space
 * is the honest state before anyone has reviewed you, and it is better than
 * a section full of placeholders that somebody forgets to replace.
 */

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          aria-hidden
          className={`h-4 w-4 ${n <= rating ? "text-amber-400" : "text-border"}`}
          fill="currentColor"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Card({ review }: { review: Review }) {
  return (
    <figure className="flex flex-col rounded-2xl border border-border bg-background p-6">
      <Stars rating={review.rating} />
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted">
        {review.body}
      </blockquote>
      <figcaption className="mt-5 text-sm">
        <span className="font-semibold text-foreground">{review.name}</span>
        {review.business && <span className="text-muted"> · {review.business}</span>}
      </figcaption>
    </figure>
  );
}

export async function Reviews() {
  const reviews = await getApprovedReviews(6);
  const summary = summarise(reviews);
  if (!summary) return null;

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Reviews
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What our clients say
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted">
            <Stars rating={Math.round(summary.average)} />
            <span>
              <strong className="text-foreground">{summary.average.toFixed(1)}</strong> from{" "}
              {summary.count} review{summary.count === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} review={review} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Worked with us?{" "}
          <Link href="/leave-a-review" className="underline hover:text-foreground">
            Leave a review
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
