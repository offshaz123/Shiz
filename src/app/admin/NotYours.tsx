import Link from "next/link";
import { labelFor, type PageKey } from "@/lib/admin-pages";

/**
 * What a member of staff sees if they open a page they have not been given.
 *
 * Says plainly that the page exists and that they do not have it, rather
 * than pretending there is nothing there. A page that denies its own
 * existence invites somebody to go looking for the trick, and this is a
 * colleague, not an intruder.
 *
 * Nothing from the page itself is loaded to render this — the guard runs
 * before any data is fetched, so there is nothing here to leak.
 */
export function NotYours({ page }: { page: PageKey }) {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {labelFor(page)} is not on your account
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        This page is switched off for you. If you need it for something you are working on,
        ask Walid and he can turn it on.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-block rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:border-brand-pink"
      >
        Back
      </Link>
    </main>
  );
}
