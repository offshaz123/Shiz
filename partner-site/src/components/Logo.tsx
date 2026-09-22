import Link from "next/link";
import { brand } from "@/lib/brand";

/**
 * Wordmark plus a mark built from two crossing arrows — money in one
 * direction, currency back the other. Swap the mark for the real logo once
 * it exists; the sizing here is what the header and footer expect.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label={`${brand.name} home`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-on-ink transition-transform group-hover:-translate-y-0.5">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M4 9h13m0 0-3.5-3.5M17 9l-3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 15H7m0 0 3.5-3.5M7 15l3.5 3.5"
            stroke="var(--accent)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight">{brand.name}</span>
    </Link>
  );
}
