import type { BadgeId, PlateType, StyleId } from "./plates";
import { posts } from "./blog-posts";

export type Post = {
  slug: string;
  title: string;
  // Shown in Google results and on the blog list (about 150 characters).
  description: string;
  // The day it goes live (UK time), YYYY-MM-DD. Posts with a future date stay
  // hidden until then, so a month of posts can be written in one go.
  date: string;
  category: "Guides" | "The Law" | "Styles" | "Electric Cars" | "Local" | "Behind the Scenes";
  // A photo in /public/blog, e.g. "/blog/what-are-4d-number-plates.jpg".
  // Until one is added, a plate picture is drawn instead.
  image?: string;
  imageAlt?: string;
  // What the drawn plate says, and how it looks, when there's no photo.
  plate: { text: string; style?: StyleId; badge?: BadgeId; type?: PlateType };
  // Simple formatting: blank lines between paragraphs, "## " for headings,
  // "- " for bullet points, **bold** and [link text](/page).
  body: string;
};

function todayInUk() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}

export function publishedPosts(): Post[] {
  const today = todayInUk();
  return posts.filter((p) => p.date <= today).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return publishedPosts().find((p) => p.slug === slug) ?? null;
}

export function readingMinutes(p: Post) {
  return Math.max(2, Math.round(p.body.split(/\s+/).length / 220));
}

export function fmtPostDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
