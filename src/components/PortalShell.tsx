"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clientLogout } from "@/app/portal/actions";

/**
 * The client's window onto their own system.
 *
 * A column of labelled links down the left on a wide screen, a bar across
 * the top on a phone. The labels are words rather than icons: this is opened
 * a few times a month by somebody who runs a garage, and an icon they have
 * to learn is a worse door than a word they can read.
 *
 * The side column carries their name and their logo at the top, because the
 * first thing a client should recognise on a screen they are paying for is
 * themselves. On a phone the same two things sit in the bar, and the links
 * go underneath it rather than into a menu, since there are only two of them
 * and a menu for two links is a door in front of a door.
 */

const PAGES = [
  {
    href: "/portal",
    label: "Results",
    note: "Enquiries and what they cost",
    icon: (
      <path d="M3 3v18h18M7 15l3.5-4 3 3L21 7" />
    ),
  },
  {
    href: "/portal/calendar",
    label: "Diary",
    note: "Jobs booked in",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </>
    ),
  },
  {
    href: "/portal/quotes",
    label: "Quotes",
    note: "Price a job up",
    icon: (
      <>
        <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z" />
        <path d="M9 9h6M9 13h3" />
      </>
    ),
  },
  {
    href: "/portal/invoices",
    label: "Invoices",
    note: "Bill your customers",
    icon: (
      <>
        <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
  },
  {
    href: "/portal/business",
    label: "Business details",
    note: "What goes on your invoices",
    icon: (
      <>
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M10 21v-6h4v6" />
      </>
    ),
  },
];

function Mark({ name, logo, size }: { name: string; logo: string; size: string }) {
  if (logo) {
    // A plain img rather than next/image: the address was typed into a box
    // in the admin page, and the optimiser would need every client's own
    // domain allow-listed before it would load any of them.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="" className={`${size} shrink-0 rounded-xl object-contain`} />;
  }
  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-surface text-base font-bold text-muted`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function PortalShell({
  name,
  logo,
  children,
}: {
  name: string;
  logo: string;
  children: React.ReactNode;
}) {
  const current = usePathname();

  return (
    <div className="lg:flex lg:min-h-screen">
      {/* Down the side from lg up. Sticky, so the way out of a long page of
          enquiries does not depend on scrolling back to the top of it. */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-surface lg:px-4 lg:py-6">
        <div className="flex items-center gap-3 px-2">
          <Mark name={name} logo={logo} size="h-11 w-11" />
          <span className="min-w-0">
            {/* Wraps to a second line rather than truncating. A client's own
                name, cut off on the one screen that is supposed to be
                theirs, is the first thing they would notice. */}
            <span className="block text-sm font-bold leading-snug text-foreground">{name}</span>
            <span className="mt-0.5 block text-[11px] text-muted">Your dashboard</span>
          </span>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {PAGES.map((page) => {
            const here = current === page.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                aria-current={here ? "page" : undefined}
                className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${
                  here
                    ? "bg-background text-foreground"
                    : "text-muted hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${
                    here ? "text-brand-pink" : ""
                  }`}
                >
                  {page.icon}
                </svg>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{page.label}</span>
                  <span className="block text-[11px] leading-snug text-muted">{page.note}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <form action={clientLogout} className="mt-auto px-1">
          <button
            type="submit"
            className="w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </aside>

      {/* The same two links across the top below lg. */}
      <header className="border-b border-border bg-surface lg:hidden">
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Mark name={name} logo={logo} size="h-9 w-9" />
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{name}</span>
          <form action={clientLogout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold text-muted"
            >
              Sign out
            </button>
          </form>
        </div>
        {/* Scrolls sideways rather than wrapping to two rows: four pills
            stacked would be as much of the screen as the nav it replaced. */}
        <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PAGES.map((page) => {
            const here = current === page.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                aria-current={here ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  here ? "bg-brand-pink text-white" : "border border-border text-muted"
                }`}
              >
                {page.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
