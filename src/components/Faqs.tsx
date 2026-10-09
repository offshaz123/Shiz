import { faqs } from "@/lib/content";

export function Faqs({ limit }: { limit?: number }) {
  const list = limit ? faqs.slice(0, limit) : faqs;
  return (
    <div className="space-y-3">
      {list.map((f) => (
        <details key={f.q} className="group rounded-2xl border border-line bg-white p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-bold">
            {f.q}
            <span className="text-2xl text-gold transition-transform group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
