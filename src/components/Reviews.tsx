import Link from "next/link";
import { getApprovedReviews, summarise, type Review } from "@/lib/reviews";

/**
 * The reviews section, at the very bottom of the homepage above the footer.
 *
 * Renders nothing at all when there are no approved reviews. An empty space
 * is the honest state before anyone has reviewed you, and it is better than
 * a section full of placeholders that somebody forgets to replace.
 *
 * Note that the "leave a review" link inside here is not the only way in.
 * It cannot be, because this whole section is hidden until somebody has
 * already left one — the first reviewer would have nowhere to click. The
 * footer carries the link on every page for exactly that reason.
 *
 * Up to five, they sit in a grid. Past that a grid either runs down the page
 * forever or quietly stops showing the newer ones, so they scroll instead —
 * slowly, and pausing when the pointer is over them so a card can actually be
 * read. The animation is pure CSS and turns itself off for anyone who has
 * asked for reduced motion, who gets a row they can swipe instead.
 */

/** Above this many, the grid becomes a scrolling row. */
const MARQUEE_FROM = 6;

/** Seconds per card. Slow enough to read one as it passes. */
const SECONDS_PER_CARD = 9;

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
  // More than the grid showed, since the marquee has room for them.
  const reviews = await getApprovedReviews(14);
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

        {reviews.length < MARQUEE_FROM ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Marquee reviews={reviews} />
        )}

        <p className="mt-12 text-center text-sm text-muted">
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

/**
 * The scrolling row.
 *
 * The list is rendered twice. The second copy is hidden from screen readers
 * and from the keyboard — it exists only so that when the first copy has
 * scrolled off the left there is already an identical one in its place, which
 * is what makes the loop seamless. Reading the same six reviews twice would
 * be nobody's idea of an improvement.
 */
function Marquee({ reviews }: { reviews: Review[] }) {
  const group = (
    <div className="review-marquee-group">
      {reviews.map((review) => (
        <div key={review.id} className="w-[20rem] shrink-0 sm:w-[22rem]">
          <Card review={review} />
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="review-marquee mt-12 -mx-5 px-5 sm:-mx-8 sm:px-8"
      style={{ ["--marquee-duration" as string]: `${reviews.length * SECONDS_PER_CARD}s` }}
    >
      <div className="review-marquee-track">
        {group}
        <div aria-hidden inert>
          {group}
        </div>
      </div>
    </div>
  );
}
