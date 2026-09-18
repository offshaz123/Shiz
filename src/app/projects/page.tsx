import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, hasProjects } from "@/content/projects";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

const description =
  "Websites, campaigns and systems we've built for UK businesses.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects" },
  openGraph: { title: "Projects | Shaz Marketing Group", description },
};

export default function ProjectsPage() {
  // Nothing to show yet — better a 404 than an empty page in the index.
  if (!hasProjects) notFound();

  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Projects", url: "/projects" }]} />

      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[440px] w-[780px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Work we&apos;ve <span className="brand-gradient-text">delivered</span>
          </h1>
          <p className="mt-6 text-lg text-muted">
            Websites, campaigns and systems built for UK businesses.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-brand-pink/45"
            >
              {project.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.image} alt="" className="aspect-[16/10] w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col p-7">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
                  {project.type}
                </span>
                <h2 className="mt-2.5 text-lg font-semibold text-foreground group-hover:text-brand-pink">
                  {project.name}
                </h2>
                <p className="mt-2 text-sm text-muted">{project.sector}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{project.teaser}</p>
                <span className="mt-6 text-sm font-semibold text-brand-pink">View project →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
