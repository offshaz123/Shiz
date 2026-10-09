import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/PostBody";
import { PostImage } from "@/components/PostImage";
import { RegForm } from "@/components/RegForm";
import { fmtPostDate, getPost, publishedPosts, readingMinutes } from "@/lib/blog";
import { site } from "@/lib/site";

// Posts go live on their date without a redeploy.
export const revalidate = 3600;

export function generateStaticParams() {
  return publishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      ...(post.image && { images: [post.image] }),
    },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();
  const more = publishedPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);

  // Tells Google this is an article and who published it.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    ...(post.image && { image: `${site.url}${post.image}` }),
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="text-sm text-muted">
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>{" "}
        › {post.category}
      </nav>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted">
        {fmtPostDate(post.date)} · {readingMinutes(post)} min read
      </p>
      <div className="mt-8">
        <PostImage post={post} priority sizes="(min-width: 768px) 720px, 100vw" />
      </div>
      <div className="mt-8">
        <PostBody body={post.body} />
      </div>

      <div className="mt-12 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="font-display text-2xl font-bold">Design your plates in seconds</p>
        <p className="mb-4 mt-1 text-muted">Type your registration or show plate text to see a live preview.</p>
        <RegForm buttonLabel="Build Now" />
      </div>

      {more.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold">Keep reading</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {more.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-2xl border border-line bg-white p-4 hover:shadow-lg hover:shadow-black/5">
                <p className="eyebrow">{p.category}</p>
                <p className="mt-1 font-semibold leading-snug group-hover:underline">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
