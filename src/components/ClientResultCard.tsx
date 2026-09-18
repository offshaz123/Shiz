import Link from "next/link";
import type { ClientResult } from "@/content/case-studies";

function hostname(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ClientResultCard({ result }: { result: ClientResult }) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h3 className="text-2xl font-bold text-foreground">{result.client}</h3>
        <span className="text-sm text-muted">{result.sector}</span>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">
          {result.period}
        </span>
      </div>

      {result.website && (
        <a
          href={result.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink hover:underline"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {hostname(result.website)} <span aria-hidden="true">↗</span>
        </a>
      )}

      <p className="mt-5 max-w-3xl leading-relaxed text-muted">{result.summary}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {result.services.map((service) => (
          <span
            key={service}
            className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted"
          >
            {service}
          </span>
        ))}
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {result.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-background p-6">
            <p className="brand-gradient-text text-4xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <h4 className="mt-9 text-sm font-semibold uppercase tracking-[0.16em] text-brand-pink">
        What we do for them
      </h4>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {result.work.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="leading-relaxed text-muted">{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/free-audit"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink hover:underline"
      >
        Want numbers like these for your business? <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
