import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides on window tinting, ceramic vs. standard film, and keeping your car in top condition — from the Exclusive Tints & Repairs team.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Blog</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Tinting &amp; car care guides
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        Practical guides on window tint, choosing the right film, and looking after your car.
      </p>

      <div className="mt-14 space-y-6">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-brand/40"
          >
            <p className="text-xs text-muted">
              {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{post.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
