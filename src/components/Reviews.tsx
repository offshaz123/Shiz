"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { customerReviews, siteConfig } from "@/lib/site-config";

const { averageRating, count, profileUrl } = siteConfig.reviews;

// Average is shown to one decimal, but a clean 5 reads better than "5.0".
const ratingLabel = Number.isInteger(averageRating)
  ? String(averageRating)
  : averageRating.toFixed(1);

/**
 * A single star. `fill` is 0–1 so a 4.7 average can show a partial star rather
 * than rounding up, which would overstate the rating.
 */
function Star({ fill, className = "" }: { fill: number; className?: string }) {
  const id = `star-${Math.round(fill * 100)}`;
  const clamped = Math.max(0, Math.min(1, fill));

  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${clamped * 100}%`} stopColor="currentColor" />
          <stop offset={`${clamped * 100}%`} stopColor="transparent" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44 6.19 20.5l1.11-6.47L2.6 9.45l6.5-.95L12 2.6z"
        fill={`url(#${id})`}
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#d4af37]">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} fill={rating - i} className={className} />
      ))}
    </span>
  );
}

/** The Google "G" — used so the badge reads as a third-party rating, not our own claim. */
function GoogleG({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.56-5.15 3.56-8.8z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3a7.2 7.2 0 0 1-10.72-3.77H1.34v3.09A11.99 11.99 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.34 14.32a7.19 7.19 0 0 1 0-4.63V6.6H1.34a12 12 0 0 0 0 10.8l4-3.08z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.3 0 3.25 2.7 1.34 6.6l4 3.09A7.2 7.2 0 0 1 12 4.77z" />
    </svg>
  );
}

/**
 * Compact rating badge for the top of a page. Links to the public Google
 * profile so the claim is one click from being verified.
 */
export function ReviewBadge({ className = "" }: { className?: string }) {
  if (count <= 0) return null;

  const inner = (
    <>
      <GoogleG className="h-4 w-4 shrink-0" />
      <Stars rating={averageRating} />
      <span className="text-xs font-semibold text-foreground">{ratingLabel}</span>
      <span className="text-xs text-muted">
        from {count} Google review{count === 1 ? "" : "s"}
      </span>
    </>
  );

  const classes = `inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 ${className}`;

  if (!profileUrl) {
    return <div className={classes}>{inner}</div>;
  }

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${classes} transition-colors hover:border-brand/60`}
    >
      {inner}
    </a>
  );
}

/**
 * The larger "rated 5 on Google" strip. Used near the top of the home page and
 * the /london landing page, where it carries more weight than the pill.
 */
export function ReviewHeadline({ className = "" }: { className?: string }) {
  if (count <= 0) return null;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Stars rating={averageRating} className="h-6 w-6" />
      <p className="text-sm text-muted">
        <span className="font-semibold text-foreground">Rated {ratingLabel} out of 5</span> from{" "}
        {count} review{count === 1 ? "" : "s"} on
        <GoogleG className="ml-1.5 inline h-4 w-4 align-[-2px]" />
        <span className="ml-1 font-semibold text-foreground">Google</span>
      </p>
      {profileUrl ? (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Read our reviews on Google →
        </a>
      ) : null}
    </div>
  );
}

const AUTOPLAY_MS = 7000;

/**
 * Slideshow of individual reviews. Renders nothing when no real reviews have
 * been added to the config, rather than showing placeholder testimonials.
 */
export function ReviewSlideshow({
  heading = "What our customers say",
  className = "",
}: {
  heading?: string;
  className?: string;
}) {
  const reviews = customerReviews;
  const total = reviews.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total]
  );

  useEffect(() => {
    if (paused || total < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, total]);

  // Respect a reduced-motion preference by holding on the first review.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setPaused(true);
  }, []);

  if (total === 0) return null;

  const current = reviews[index];

  return (
    <section className={`border-t border-border bg-surface ${className}`}>
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Reviews
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
          <ReviewHeadline className="mt-6" />
        </div>

        <div
          className="mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            ref={liveRef}
            aria-live="polite"
            className="relative min-h-[300px] rounded-3xl border border-border bg-background p-8 sm:min-h-[280px] sm:p-10"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-8 w-8 text-brand/60">
              <path
                fill="currentColor"
                d="M9.2 6.4C6.3 7.9 4.6 10.4 4.6 13.6c0 2.5 1.5 4 3.6 4 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.1-3-3.1-.3 0-.7 0-1 .2.4-1.4 1.6-2.7 3.3-3.6l-1.6-1.5Zm8.5 0c-2.9 1.5-4.6 4-4.6 7.2 0 2.5 1.5 4 3.6 4 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.1-3-3.1-.3 0-.7 0-1 .2.4-1.4 1.6-2.7 3.3-3.6l-1.6-1.5Z"
              />
            </svg>

            <Stars rating={current.rating} className="mt-4 h-5 w-5" />

            <blockquote className="mt-5 text-lg leading-relaxed text-foreground">
              {current.text}
            </blockquote>

            <figcaption className="mt-6 flex items-center gap-2 text-sm text-muted">
              <span className="font-semibold text-foreground">{current.author}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <GoogleG className="h-3.5 w-3.5" />
                Google review
              </span>
            </figcaption>
          </div>

          {total > 1 ? (
            <div className="mt-7 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous review"
                className="rounded-full border border-border p-2.5 text-muted transition-colors hover:border-brand/60 hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {reviews.map((review, i) => (
                  <button
                    key={`${review.author}-${i}`}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show review ${i + 1} of ${total}`}
                    aria-current={i === index}
                    className={
                      i === index
                        ? "h-2 w-6 rounded-full brand-gradient-bg"
                        : "h-2 w-2 rounded-full bg-border transition-colors hover:bg-muted"
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next review"
                className="rounded-full border border-border p-2.5 text-muted transition-colors hover:border-brand/60 hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
