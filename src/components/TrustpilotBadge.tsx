import { trustpilotReviewUrl, hasTrustpilot } from "@/lib/site-config";

/**
 * Trustpilot's own green, so the badge is recognisable at a glance. The mark
 * here is a plain star rather than a copy of their logo: the name is what
 * tells someone where the link goes, and reproducing a trademark we were not
 * given the file for is not worth the risk. The official asset is in the
 * Trustpilot business dashboard under Showcase if we ever want it exact.
 */
const GREEN = "#00b67a";

function Star({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} aria-hidden="true">
      <path
        d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5Z"
        fill={GREEN}
      />
    </svg>
  );
}

/**
 * Links to Trustpilot's review form, not to the profile. Someone clicking a
 * "leave a review" badge wants to write one, and sending them to the profile
 * first costs a click and shows them the score before they have given theirs.
 */
export function TrustpilotBadge({ className = "" }: { className?: string }) {
  if (!hasTrustpilot) return null;

  return (
    <a
      href={trustpilotReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[#00b67a] ${className}`}
    >
      <Star />
      Review us on Trustpilot
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
      <Star className="h-4 w-4" />
      <span className="font-semibold text-foreground">Review us on Trustpilot</span>
    </a>
  );
}
