import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { QuoteSidebar } from "@/components/QuoteSidebar";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Get a free, no-obligation quote for window tinting, dechroming, brakes or servicing — fill in the form or message us directly on WhatsApp.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Get a Quote", url: `${siteConfig.url}/quote` },
        ]}
      />
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Get a Quote
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {service ? service : "Tell us what you need"}
        </h1>
        <p className="mt-4 text-muted">
          Fill in your details below and we&apos;ll come back with a price — or message us directly
          on WhatsApp for an instant reply.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <QuoteSidebar />
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <LeadForm defaultService={service} />
        </div>
      </div>
    </div>
  );
}
