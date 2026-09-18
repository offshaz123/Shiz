import Link from "next/link";
import { publishedResult } from "@/content/case-studies";
import { ReviewBadge } from "./ReviewBadge";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="brand-gradient-bg pointer-events-none absolute -left-40 -top-56 h-[640px] w-[820px] rounded-full opacity-[0.18] blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-20">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-pink">
            A UK marketing agency built for enquiries, not impressions
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]">
            More customers.{" "}
            <span className="brand-gradient-text">Fewer missed enquiries.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted lg:mx-0">
            We run the Meta, Instagram and Google campaigns that bring people in, build the
            websites they land on, handle your SEO, and put every enquiry into one place so
            nothing sits unread.
          </p>

          <div className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/free-audit"
              className="brand-gradient-bg inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M4 20h4L19 9l-4-4L4 16v4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              Get Your Free Marketing Audit
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M7 4h3l1.6 4-2 1.4a12 12 0 0 0 5 5l1.4-2 4 1.6v3a1.6 1.6 0 0 1-1.8 1.6A16.5 16.5 0 0 1 5.4 5.8 1.6 1.6 0 0 1 7 4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              Book a Call
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted">
            Free and no obligation. We&apos;ll tell you what&apos;s stopping your enquiries before
            you spend anything.
          </p>

          <ReviewBadge />
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            aria-hidden
            className="brand-gradient-bg absolute inset-0 rounded-[2.5rem] opacity-90"
          />
          <div
            aria-hidden
            className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          />

          <div className="relative rounded-[2.5rem] p-6 sm:p-8">
            <div className="rounded-3xl border border-white/20 bg-[#0b0a0f]/85 p-7 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                  Real client result
                </span>
              </div>

              <p className="mt-4 text-lg font-semibold leading-snug text-white">
                {publishedResult.client}
              </p>
              <p className="text-sm text-white/55">
                {publishedResult.sector} · {publishedResult.period}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
                {publishedResult.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs leading-tight text-white/55">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/case-studies"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
              >
                See how we did it <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Projects badge, sitting over the corner like a sticker */}
          <div className="absolute -bottom-5 -left-3 rounded-2xl bg-[#0b0a0f] px-5 py-3.5 shadow-xl shadow-black/30 ring-1 ring-white/10 sm:-left-5">
            <p className="text-2xl font-bold leading-none text-white">200+</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/55">
              Projects delivered
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
