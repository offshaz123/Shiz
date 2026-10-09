import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { PostImage } from "@/components/PostImage";
import { fmtPostDate, publishedPosts, readingMinutes } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Number Plate Blog: Guides, Styles & UK Rules",
  description:
    "Guides to 3D gel and 4D number plates, UK number plate law, show plates, EV green flash plates and more from PlatedUp.",
  alternates: { canonical: "/blog" },
};

// New posts go live on their date, so check for them every hour.
export const revalidate = 3600;

export default function BlogPage() {
  const posts = publishedPosts();
  const [first, ...rest] = posts;
  return (
    <>
      <PageHero eyebrow="The PlatedUp blog" title="Plate Talk">
        Guides, styles and the rules of the road, in plain English.
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {first && (
          <Link href={`/blog/${first.slug}`} className="group grid items-center gap-6 rounded-3xl border border-line bg-white p-4 shadow-xl shadow-black/5 sm:p-6 lg:grid-cols-2">
            <PostImage post={first} priority sizes="(min-width: 1024px) 560px, 100vw" />
            <div>
              <p className="eyebrow">
                {first.category} · {fmtPostDate(first.date)}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold group-hover:underline sm:text-4xl">{first.title}</h2>
              <p className="mt-3 text-muted">{first.description}</p>
              <p className="mt-4 text-sm font-semibold">Read the guide · {readingMinutes(first)} min →</p>
            </div>
          </Link>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col rounded-3xl border border-line bg-white p-4 transition hover:shadow-xl hover:shadow-black/5">
              <PostImage post={p} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
              <p className="eyebrow mt-4">
                {p.category} · {fmtPostDate(p.date)}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight group-hover:underline">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
