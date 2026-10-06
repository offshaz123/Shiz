import type { Metadata } from "next";
import { Suspense } from "react";
import { ScanRunner } from "@/components/ScanRunner";

export const metadata: Metadata = {
  title: "Website Scan",
  description: "Your instant website check from Shaz Marketing Group.",
  // A per-visitor results page. Nothing here is useful in search results and
  // every scan would be a separate URL, so keep it out of the index.
  robots: { index: false, follow: false },
};

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
      <Suspense
        fallback={
          <p className="text-sm text-muted">Starting your scan…</p>
        }
      >
        <ScanRunner />
      </Suspense>
    </div>
  );
}
