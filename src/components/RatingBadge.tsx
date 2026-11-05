import Link from "next/link";
import { isDbConfigured } from "@/lib/db";
import { reviewSummary } from "@/lib/reviews";
import { Stars } from "./Stars";

// "★★★★★ 5.0 · Trusted by our customers · 4 reviews", from the real approved
// reviews (Admin → Reviews). Shows nothing until there's at least one.
export async function RatingBadge({ dark = false, fallback = null }: { dark?: boolean; fallback?: React.ReactNode }) {
  let summary = { count: 0, average: 0 };
  if (isDbConfigured()) {
    try {
      summary = await reviewSummary();
    } catch (err) {
      console.error("Loading the review score failed", err);
    }
  }
  if (summary.count === 0) return <>{fallback}</>;
  return (
    <Link
      href="/#reviews"
      className={`inline-flex items-center justify-center gap-x-2 gap-y-0.5 rounded-full px-4 py-1.5 text-sm font-semibold ${
        dark ? "border border-white/30 bg-white/10 text-white" : "border border-line bg-white"
      }`}
    >
      <Stars rating={summary.average} className="h-4 w-4" />
      <span>{summary.average.toFixed(1)}</span>
      <span className={dark ? "text-white/80" : "text-muted"}>
        <span className="hidden sm:inline">· Trusted by our customers </span>· {summary.count} {summary.count === 1 ? "review" : "reviews"}
      </span>
    </Link>
  );
}
