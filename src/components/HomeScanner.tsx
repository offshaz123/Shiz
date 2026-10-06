import { SiteScanner } from "./SiteScanner";

export function HomeScanner() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Free instant check
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Check your website and see where you stand
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted">
            Put your address in below. We&apos;ll check whether anything is being tracked, how
            Google reads your pages, and how easy you are to contact. Takes a few seconds and we
            don&apos;t ask for your email to show you the results.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-background p-6 sm:p-8">
          <SiteScanner />
        </div>
      </div>
    </section>
  );
}
