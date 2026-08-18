import { siteConfig, hasPublishedReviews } from "@/lib/site-config";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5Z"
        fill={filled ? "#fbbc04" : "none"}
        stroke="#fbbc04"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Renders nothing until real reviews exist in site-config. See the note there:
 * this must reflect an actual public review profile, not an aspiration.
 */
export function ReviewBadge() {
  if (!hasPublishedReviews) return null;

  const { averageRating, count, profileUrl } = siteConfig.reviews;
  const rounded = Math.round(averageRating);

  const inner = (
    <>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} filled={n <= rounded} />
        ))}
      </span>
      <span className="text-xs font-medium text-muted">
        {averageRating.toFixed(1)} from {count} review{count === 1 ? "" : "s"}
      </span>
    </>
  );

  const className =
    "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2";

  return (
    <div className="mt-8 flex justify-center">
      {profileUrl ? (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${className} transition-colors hover:border-brand-pink/60`}
        >
          {inner}
        </a>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </div>
  );
}
