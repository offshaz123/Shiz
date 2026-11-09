import { FaqJsonLd } from "@/components/StructuredData";
import type { Faq } from "@/content/niches";

/**
 * Visible questions and answers, plus the FAQPage markup for the same text.
 *
 * The two are generated from one array on purpose. Marking up answers that a
 * visitor cannot see on the page is against Google's structured data rules and
 * is the fastest way to lose rich results altogether, so there is no way to
 * add one here without the other.
 */
export function FaqSection({
  items,
  title = "Questions we get asked",
  intro,
}: {
  items: Faq[];
  title?: string;
  intro?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <FaqJsonLd items={items} />
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {intro && <p className="mt-3 max-w-2xl text-muted">{intro}</p>}
        <dl className="mt-10 flex flex-col gap-5">
          {items.map((item) => (
            <div key={item.question} className="rounded-2xl border border-border bg-surface p-6">
              <dt className="font-semibold text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
