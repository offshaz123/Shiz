import { siteConfig } from "@/lib/site-config";

const points = [
  "London-based team, working with businesses across the UK",
  "Meta & Instagram ads, lead management and follow-up under one roof",
  "Straightforward monthly plans with no long-term contract",
];

export function LondonOfficeSection() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              Our Office
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Based in{" "}
              <span className="brand-gradient-text">One Canada Square</span>, Canary Wharf
            </h2>
            <p className="mt-4 text-muted">
              We work with businesses right across the UK — from automotive and finance to
              hospitality and trade services — and everything from your campaigns to your
              enquiries is handled by one team.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-muted">
                  <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-background p-8">
            <div className="flex items-start gap-4">
              <span className="brand-gradient-bg flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
                  <path
                    d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-pink">
                  {siteConfig.name}
                </p>
                <address className="mt-2 text-lg not-italic font-semibold leading-relaxed text-foreground">
                  {siteConfig.address.line1}
                  <br />
                  {siteConfig.address.line2}
                  <br />
                  {siteConfig.address.city} {siteConfig.address.postcode}
                </address>
              </div>
            </div>

            <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                <span className="block text-xs uppercase tracking-wide text-brand-pink">Email</span>
                <span className="mt-1 block break-all">{siteConfig.email}</span>
              </a>
              <a
                href={`tel:${siteConfig.phoneE164}`}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                <span className="block text-xs uppercase tracking-wide text-brand-pink">Phone</span>
                <span className="mt-1 block">{siteConfig.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
