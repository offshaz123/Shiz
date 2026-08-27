import Link from "next/link";

export function ServiceCard({
  name,
  tagline,
  description,
  features,
  fromPrice,
  badge,
  quoteHref,
}: {
  name: string;
  tagline: string;
  description: string;
  features: string[];
  fromPrice: string;
  badge?: string;
  quoteHref: string;
}) {
  return (
    <div className="flex flex-col rounded-3xl border border-border bg-surface p-7 transition-colors hover:border-brand/40 sm:p-8">
      {badge && (
        <span className="brand-gradient-bg mb-4 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
      <h3 className="text-xl font-bold text-foreground">{name}</h3>
      <p className="mt-1 text-sm font-medium text-brand">{tagline}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">{description}</p>

      <ul className="mt-5 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-muted">
            <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-6">
        <div>
          <p className="text-xs text-muted">From</p>
          <p className="text-lg font-bold text-foreground">{fromPrice}</p>
        </div>
        <Link
          href={quoteHref}
          className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition-transform hover:scale-[1.03]"
        >
          Get a Quote →
        </Link>
      </div>
    </div>
  );
}
