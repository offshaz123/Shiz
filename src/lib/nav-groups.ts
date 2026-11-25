/**
 * How the side column is grouped, and what each group looks like.
 *
 * Fourteen links in one undivided column is a list you read top to
 * bottom every time, because nothing tells you where the thing you want
 * is likely to be. Four or five headings turn it into a place you
 * navigate by shape: the day at the top, the work under it, the setup
 * at the bottom.
 *
 * The colours are the point of them being headings at all. A heading in
 * the same grey as everything under it is a line of text; a heading with
 * its own colour, carried through to the page that is open, tells you
 * where you are from the corner of your eye.
 *
 * Kept here rather than in either navigation component because the admin
 * and the client portal use the same language, and two copies of it
 * would be the same language for about a week.
 */

export type NavTone = "pink" | "amber" | "emerald" | "sky" | "violet";

/**
 * Whole class strings, never built up from pieces.
 *
 * Tailwind reads the source for class names it can see written down. A
 * name put together at runtime — `text-${tone}-400` — is not written
 * down anywhere, so the style is never generated and the colour simply
 * does not appear.
 */
export const TONE: Record<
  NavTone,
  {
    /** The dot beside a group heading. */
    dot: string;
    /** The heading's own words. Coloured, because a heading in the same
     *  grey as the things under it is just another line of text. */
    label: string;
    /** The hairline that runs off to the right of it. */
    rule: string;
    /** The row for the page you are on. */
    active: string;
    /** An icon on a page you are not on. */
    icon: string;
  }
> = {
  pink: {
    label: "text-pink-600 dark:text-pink-400",
    dot: "bg-pink-500 shadow-[0_0_8px_rgb(236_72_153)]",
    rule: "bg-gradient-to-r from-pink-500/40 to-transparent",
    active:
      "border-l-2 border-pink-500 bg-gradient-to-r from-pink-500/20 via-pink-500/5 to-transparent text-foreground",
    icon: "text-pink-600 dark:text-pink-400",
  },
  amber: {
    label: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500 shadow-[0_0_8px_rgb(245_158_11)]",
    rule: "bg-gradient-to-r from-amber-500/40 to-transparent",
    active:
      "border-l-2 border-amber-500 bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent text-foreground",
    icon: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    label: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgb(16_185_129)]",
    rule: "bg-gradient-to-r from-emerald-500/40 to-transparent",
    active:
      "border-l-2 border-emerald-500 bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent text-foreground",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  sky: {
    label: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500 shadow-[0_0_8px_rgb(14_165_233)]",
    rule: "bg-gradient-to-r from-sky-500/40 to-transparent",
    active:
      "border-l-2 border-sky-500 bg-gradient-to-r from-sky-500/20 via-sky-500/5 to-transparent text-foreground",
    icon: "text-sky-600 dark:text-sky-400",
  },
  violet: {
    label: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500 shadow-[0_0_8px_rgb(139_92_246)]",
    rule: "bg-gradient-to-r from-violet-500/40 to-transparent",
    active:
      "border-l-2 border-violet-500 bg-gradient-to-r from-violet-500/20 via-violet-500/5 to-transparent text-foreground",
    icon: "text-violet-600 dark:text-violet-400",
  },
};

/* ------------------------------------------------------------- admin */

export type AdminGroupKey = "day" | "winning" | "customers" | "tools" | "setup";

export type NavGroup<K extends string> = {
  key: K;
  label: string;
  tone: NavTone;
};

/** In the order somebody works through a day. */
export const ADMIN_GROUPS: NavGroup<AdminGroupKey>[] = [
  { key: "day", label: "Today", tone: "pink" },
  { key: "winning", label: "Winning work", tone: "amber" },
  { key: "customers", label: "Who we work for", tone: "emerald" },
  { key: "tools", label: "Tools", tone: "sky" },
  { key: "setup", label: "Setup", tone: "violet" },
];

/* ------------------------------------------------------------ portal */

export type PortalGroupKey = "results" | "customers" | "paid" | "setup";

export const PORTAL_GROUPS: NavGroup<PortalGroupKey>[] = [
  { key: "results", label: "How it is going", tone: "pink" },
  { key: "customers", label: "Your customers", tone: "emerald" },
  { key: "paid", label: "Getting paid", tone: "amber" },
  { key: "setup", label: "Your setup", tone: "violet" },
];
