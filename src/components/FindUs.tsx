import Image from "next/image";
import { siteConfig, mapsSearchHref } from "@/lib/site-config";

const { address, directions } = siteConfig;

/**
 * Finding-us panel. The registered address is a house and the workshop sits
 * behind it, so anyone typing the street address into a sat nav arrives at the
 * wrong door. The primary action is therefore a Google Maps search by business
 * name — that resolves to the pin set on the workshop — and the street address
 * is deliberately shown second, as reference rather than as something to type.
 */
export function FindUs() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Finding Us
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Where we are
          </h2>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-background p-7 sm:p-9">
          {/* The warning comes before the address on purpose. */}
          <div className="flex gap-3.5 rounded-2xl border border-brand/30 bg-brand/5 p-4 sm:p-5">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand">
              <path d="M12 9v4.5M12 17h.01M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3.1L13.7 3.9a2 2 0 0 0-3.4 0Z"
                stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Search our name, not the street address.</span>{" "}
              {directions.note}
            </p>
          </div>

          <a
            href={mapsSearchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-gradient-bg mt-6 flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-4 text-base font-bold shadow-lg shadow-black/10 transition-transform hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            Open in Google Maps
          </a>

          <p className="mt-4 text-center text-sm text-muted">
            Takes you to <span className="font-medium text-foreground">{siteConfig.name}</span> —
            the pin on the workshop, not the house.
          </p>

          {directions.steps.length > 0 ? (
            <ol className="mt-8 space-y-3 border-t border-border pt-7">
              {directions.steps.map((step, i) => (
                <li key={step} className="flex gap-3.5 text-sm leading-relaxed text-muted">
                  <span className="brand-gradient-bg flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {directions.entrancePhoto ? (
            <figure className="mt-8 overflow-hidden rounded-2xl border border-border">
              <div className="relative aspect-[16/9]">
                <Image
                  src={directions.entrancePhoto}
                  alt={`The entrance to ${siteConfig.name} on ${address.line1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover"
                />
              </div>
              <figcaption className="bg-surface px-5 py-3 text-sm text-muted">
                Look for this — the entrance to the workshop.
              </figcaption>
            </figure>
          ) : null}

          <div className="mt-8 border-t border-border pt-7 text-sm text-muted">
            <p className="font-semibold text-foreground">Address for reference</p>
            <p className="mt-1.5">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city} {address.postcode}
            </p>
            <p className="mt-3">
              {siteConfig.hours[0].day} · {siteConfig.hours[0].time}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
