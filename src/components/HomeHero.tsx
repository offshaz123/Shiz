import Image from "next/image";
import Link from "next/link";
import { ReviewBadge } from "./ReviewBadge";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroResultCard } from "./HeroResultCard";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackdrop />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-12 lg:pt-12">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-pink">
            A UK leading marketing agency, built for enquiries not impressions
          </span>

          <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-[3.05rem]">
            More customers.{" "}
            <span className="brand-gradient-text">Fewer missed enquiries.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted lg:mx-0">
            We run the Meta, Instagram and Google campaigns that bring people in, build the
            websites they land on, handle your SEO, and put every enquiry into one place so
            nothing sits unread.
          </p>

          <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/#scanner"
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

          <p className="mt-4 text-sm text-muted">
            Free and no obligation. We&apos;ll tell you what&apos;s stopping your enquiries before
            you spend anything.
          </p>

          <ReviewBadge />
        </div>

        {/* Visual — the result card presented like a board. The photo is cut
            out and cropped to end just below her fingertips, and the top
            padding here is a few pixels under the image's height, so the
            board's edge lands exactly where she's pointing. The two values are
            a matched pair: change one without the other and she points at a
            gap. */}
        <div className="relative mx-auto w-full max-w-lg pt-[128px] sm:pt-[210px] lg:max-w-none">
          <Image
            src="/images/results-presenter.webp"
            alt=""
            aria-hidden
            width={846}
            height={365}
            priority
            className="pointer-events-none absolute left-1/2 top-0 z-0 h-[132px] w-auto -translate-x-1/2 select-none sm:h-[215px]"
          />

          {/* The board itself */}
          <div className="relative">
            <div
              aria-hidden
              className="brand-gradient-bg absolute inset-0 rounded-[2.5rem] opacity-90"
            />
            <div
              aria-hidden
              className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/15 blur-2xl"
            />

            <div className="relative rounded-[2.5rem] p-5 sm:p-6">
            <HeroResultCard />
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
      </div>
    </section>
  );
}
