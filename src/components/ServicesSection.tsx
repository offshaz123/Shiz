import Link from "next/link";
import { serviceCategories } from "@/content/services";

const ICONS: Record<string, React.ReactNode> = {
  "window-tinting-wrapping": (
    <path
      d="M4 8h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm0 0 2.5-4h11L20 8M9 8v11m6-11v11"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "car-servicing": (
    <path
      d="M14.7 6.3a4 4 0 0 1-5 5L4 17l3 3 5.7-5.7a4 4 0 0 1 5-5L21 6l-3-3-3.3 3.3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "number-plates": (
    <path
      d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm4 1.5h2m3 0h5m-10 5h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "alloy-refurbishment": (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 4v5.4M12 14.6V20M4 12h5.4M14.6 12H20M6.3 6.3l3.8 3.8M13.9 13.9l3.8 3.8M17.7 6.3l-3.8 3.8M10.1 13.9l-3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  ),
};

export function ServicesSection({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {serviceCategories.map((category) => (
        <div
          key={category.slug}
          id={category.slug}
          className="scroll-mt-24 rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-brand-pink/40"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient-bg text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              {ICONS[category.slug]}
            </svg>
          </span>
          <h3 className="mt-5 text-xl font-semibold text-foreground">{category.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {detailed ? category.description : category.shortDescription}
          </p>
          <ul className="mt-5 space-y-2.5">
            {category.items.map((item) => (
              <li key={item.name} className="flex items-start gap-2.5 text-sm text-muted">
                <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  <span className="font-medium text-foreground">{item.name}</span>
                  {detailed && <span> — {item.description}</span>}
                </span>
              </li>
            ))}
          </ul>
          {!detailed && (
            <Link href={`/services#${category.slug}`} className="mt-5 inline-flex text-sm font-semibold text-brand-pink hover:underline">
              Learn more →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
