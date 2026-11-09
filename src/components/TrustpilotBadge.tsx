import {
  siteConfig,
  trustpilotReviewUrl,
  trustpilotProfileUrl,
  hasTrustpilot,
  hasTrustpilotReviews,
} from "@/lib/site-config";

/**
 * Trustpilot's green, and their star-in-a-box arrangement, so the badge reads
 * as Trustpilot at a glance. The star is drawn rather than lifted from their
 * logo file: the word "Trustpilot" is what tells someone where the link goes,
 * and shipping a copy of a trademark we were not given is not worth it. The
 * official assets live in the Trustpilot business dashboard under Showcase.
 */
const GREEN = "#00b67a";
const GREY = "#dcdce6";

function StarBoxes({ filled = 5, size = "h-6 w-6" }: { filled?: number; size?: string }) {
  return (
    <span className="flex gap-[3px]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`flex ${size} items-center justify-center rounded-[3px]`}
          style={{ backgroundColor: n <= filled ? GREEN : GREY }}
        >
          <svg viewBox="0 0 24 24" className="h-[70%] w-[70%]">
            <path
              d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5Z"
              fill="#ffffff"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}

/**
 * The homepage trust strip. Two states, decided by the config rather than by
 * us, and the link turns itself on with the reviews.
 *
 * With none yet it is not a link: a badge that sends someone to an empty
 * profile is worse than one that sits still. It says "Collecting reviews"
 * rather than carrying a score, because five green stars with no number and
 * no way to check reads as a rating, and there is nothing behind it yet.
 *
 * Once `reviewCount` is set from the real profile it becomes what it is meant
 * to be: the actual score, linked to the page that proves it.
 */
export function TrustpilotCard() {
  if (!hasTrustpilot) return null;

  const { reviewCount, trustScore } = siteConfig.trustpilot;
  const earned = hasTrustpilotReviews;

  const inner = (
    <>
      <StarBoxes filled={earned ? Math.round(trustScore) : 5} />
      <span className="text-left leading-tight">
        <span className="block text-sm font-semibold text-foreground">Trustpilot</span>
        <span className="block text-xs text-muted">
          {earned
            ? `${trustScore.toFixed(1)} from ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
            : "Collecting reviews"}
        </span>
      </span>
    </>
  );

  const className = "flex items-center gap-4 rounded-2xl border border-border bg-background px-5 py-3.5";

  if (!earned) return <div className={className}>{inner}</div>;

  return (
    <a
      href={trustpilotProfileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} transition-colors hover:border-[#00b67a]`}
    >
      {inner}
    </a>
  );
}

/** The bigger version, for the page that exists to ask for a review. */
export function TrustpilotBadge({ className = "" }: { className?: string }) {
  if (!hasTrustpilot) return null;

  return (
    <a
      href={trustpilotReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-4 rounded-2xl border border-border bg-background px-6 py-4 transition-colors hover:border-[#00b67a] ${className}`}
    >
      <StarBoxes size="h-7 w-7" />
      <span className="text-left leading-tight">
        <span className="block text-base font-semibold text-foreground">Review us on Trustpilot</span>
        <span className="block text-xs text-muted">Takes a minute. No account needed first.</span>
      </span>
    </a>
  );
}

/** Footer-sized, to sit with the other small links rather than shout. */
export function TrustpilotLink({ className = "" }: { className?: string }) {
  if (!hasTrustpilot) return null;

  return (
    <a
      href={trustpilotReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 hover:text-foreground ${className}`}
    >
      <StarBoxes size="h-3.5 w-3.5" />
      <span className="font-semibold text-foreground">Review us on Trustpilot</span>
    </a>
  );
}
