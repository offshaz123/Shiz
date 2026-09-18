import Link from "next/link";
import { services } from "@/content/services";

export function ServicesGrid({ heading = true }: { heading?: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      {heading && (
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
            What we do
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Marketing services{" "}
            <span className="brand-gradient-text">built to bring customers in</span>
          </h2>
          <p className="mt-5 text-muted">
            Explore each one to see who it&apos;s for, what&apos;s included and what it changes.
          </p>
        </div>
      )}

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-pink/45"
          >
            <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-pink">
              {service.name}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{service.teaser}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>

            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-pink">
              Learn more <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
