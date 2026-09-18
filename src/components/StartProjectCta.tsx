import Link from "next/link";
import { whatsappHref } from "@/lib/site-config";

export function StartProjectCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-[#0b0a0f] px-8 py-14 sm:px-14">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -right-24 -top-24 h-[380px] w-[520px] rounded-full opacity-25 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start your project?
            </h2>
            <p className="mt-4 text-lg text-white/65">
              Tell us about your business and we&apos;ll come back with what we&apos;d actually
              run for you, and what it would cost. No charge, no obligation.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <Link
              href="/contact"
              className="brand-gradient-bg inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]"
            >
              Start Your Project <span aria-hidden="true">→</span>
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-colors hover:border-white/45"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
