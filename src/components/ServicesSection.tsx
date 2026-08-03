import Link from "next/link";
import { serviceCategories } from "@/content/services";

export function ServicesSection({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {serviceCategories.map((category) => (
        <div
          key={category.slug}
          className="flex flex-col rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-brand-pink/40"
        >
          <span className="brand-gradient-bg h-1.5 w-10 rounded-full" />
          <h3 className="mt-5 text-xl font-semibold text-foreground">{category.navTitle}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {detailed ? category.description : category.shortDescription}
          </p>
          <Link
            href={`/services/${category.slug}`}
            className="mt-5 inline-flex text-sm font-semibold text-brand-pink hover:underline"
          >
            {detailed ? "Full details →" : "Learn more →"}
          </Link>
        </div>
      ))}
    </div>
  );
}
