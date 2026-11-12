import { ScanPreview } from "./ScanPreview";
import { SiteScanner } from "./SiteScanner";

export function HomeScanner() {
  return (
    <section id="scanner" className="scroll-mt-24 border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Free instant check
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Check your website and see where you stand
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted">
            Put your address in below. We&apos;ll check whether anything is being tracked, how
            Google reads your pages, and how easy you are to contact. It&apos;s free &mdash; we
            just ask where to send the report.
          </p>
        </div>

        {/* Two columns from the medium breakpoint up. This section used to be
            a heading and one input alone in a very large empty space, which
            made the strongest thing on the site look the least finished. */}
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-background p-6 sm:p-8">
            <SiteScanner />
          </div>
          <ScanPreview />
        </div>
      </div>
    </section>
  );
}
