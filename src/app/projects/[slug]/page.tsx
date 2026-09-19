import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/content/projects";
import { LeadForm } from "@/components/LeadForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";
import { ogImage } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.metaDescription,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      images: [ogImage], title: `${project.name} | ${siteConfig.name}`, description: project.metaDescription },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Projects", url: "/projects" },
          { name: project.name, url: `/projects/${project.slug}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[440px] w-[760px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <Link href="/projects" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink hover:underline">
            ← All projects
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {project.name}
          </h1>
          <p className="mt-4 text-muted">
            {project.type} · {project.sector}
          </p>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60"
            >
              Visit the live site →
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        {project.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.image} alt={`${project.name} website`} className="w-full rounded-2xl border border-border" />
        )}

        <h2 className="mt-14 text-2xl font-bold tracking-tight text-foreground">The brief</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">{project.brief}</p>

        <h2 className="mt-12 text-2xl font-bold tracking-tight text-foreground">What we did</h2>
        <ul className="mt-5 space-y-3">
          {project.work.map((item) => (
            <li key={item} className="flex gap-3 text-muted">
              <span className="mt-1 text-brand-pink" aria-hidden="true">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {project.results && project.results.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-bold tracking-tight text-foreground">Results</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {project.results.map((result) => (
                <div key={result.label} className="rounded-2xl border border-border bg-surface p-6">
                  <p className="brand-gradient-text text-3xl font-bold">{result.value}</p>
                  <p className="mt-1.5 text-sm text-muted">{result.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-xl px-5 py-20 sm:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Want something similar?
            </h2>
            <p className="mt-4 text-muted">
              Tell us about your business and we&apos;ll come back with what we&apos;d do.
            </p>
          </div>
          <div className="mt-10">
            <LeadForm compact source={`Project page: ${project.name}`} />
          </div>
        </div>
      </section>
    </div>
  );
}
