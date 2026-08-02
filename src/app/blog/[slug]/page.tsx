import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/content/blog";
import { siteConfig } from "@/lib/site-config";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` },
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  const breadcrumbItems = [
    { name: "Home", url: siteConfig.url },
    { name: "Blog", url: `${siteConfig.url}/blog` },
    { name: post.title, url: `${siteConfig.url}/blog/${post.slug}` },
  ];

  return (
    <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <Link href="/blog" className="text-sm font-medium text-brand-pink hover:underline">
        ← Back to Blog
      </Link>

      <p className="mt-6 text-sm text-muted">
        {new Date(post.publishedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{post.description}</p>

      <div className="mt-10 space-y-8">
        {post.sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            )}
            <div className="mt-3 space-y-4">
              {section.paragraphs.map((paragraph, j) => (
                <p key={j} className="leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2">
                  {section.bullets.map((bullet, k) => (
                    <li key={k} className="flex items-start gap-2.5 text-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mt-1 h-4 w-4 shrink-0 text-brand-pink"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Ready to grow your business with Meta &amp; Instagram ads?
        </h2>
        <Link
          href="/contact"
          className="brand-gradient-bg mt-6 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
        >
          Get My Free Strategy Call
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
    </article>
  );
}
