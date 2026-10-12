import { isDbConfigured } from "@/lib/db";
import { type Review, listApprovedReviews, reviewSummary } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";
import { Stars } from "./Stars";

async function load(): Promise<{ reviews: Review[]; count: number; average: number }> {
  if (!isDbConfigured()) return { reviews: [], count: 0, average: 0 };
  try {
    const [reviews, summary] = await Promise.all([listApprovedReviews(6), reviewSummary()]);
    return { reviews, ...summary };
  } catch (err) {
    console.error("Loading reviews failed", err);
    return { reviews: [], count: 0, average: 0 };
  }
}

// Approved customer reviews and the "Write a review" form (homepage).
export async function ReviewsSection() {
  const { reviews, count, average } = await load();
  return (
    <section id="reviews" className="bg-surface py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">Reviews</span>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">What Our Customers Say</h2>
          {count > 0 ? (
            <p className="mt-3 flex items-center justify-center gap-2 text-muted">
              <Stars rating={average} className="h-5 w-5" />
              <span>
                <strong className="text-ink">{average.toFixed(1)}</strong> from {count} {count === 1 ? "review" : "reviews"}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-muted">Bought plates from us? We&apos;d love to hear what you think.</p>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
                <Stars rating={r.rating} />
                <blockquote className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed">{r.body}</blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  {Boolean(r.verified) && (
                    <span className="rounded-full bg-[#e7f6ec] px-2 py-0.5 text-xs font-bold text-[#1f7a3d]">✓ Verified buyer</span>
                  )}
                  <span className="text-xs text-muted">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "Europe/London" })}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="mt-8">
          <ReviewForm />
        </div>
      </div>
    </section>
  );
}
