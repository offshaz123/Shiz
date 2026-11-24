/**
 * Every page behind the admin login, and who is allowed to open it.
 *
 * Its own module with no imports, because three different things need the
 * same list and must not disagree about it: the navigation bar draws it in
 * the browser, each page checks it on the server, and the staff screen
 * draws a switch for each one. A list that lives in the nav component means
 * a page can be hidden from the bar and still open if you know the address,
 * which is not permission, it is decoration.
 *
 * The owner is Walid, logging in with ADMIN_PASSWORD. Everybody else is a
 * staff row with its own password and its own set of these keys.
 */

export type PageKey =
  | "overview"
  | "today"
  | "leads"
  | "clients"
  | "prospects"
  | "emails"
  | "company"
  | "scan"
  | "office"
  | "health"
  | "staff";

/** A part of a page worth jumping straight to. */
export type PageSection = {
  /** The id on the heading in that page. */
  id: string;
  label: string;
};

export type AdminPage = {
  key: PageKey;
  href: string;
  label: string;
  hint: string;
  /**
   * What is on that page, for the hover menu.
   *
   * Walid's point: the reviews are at the bottom of the enquiries page and
   * nothing anywhere says so, so the only way to find them is to have been
   * told. A page with more than one thing on it should say what those
   * things are before you open it.
   */
  sections?: PageSection[];
  /**
   * False for pages the owner alone ever sees, whatever the switches say.
   * Only the staff screen is like this: a member of staff who could grant
   * themselves the clients page has no permissions at all.
   */
  canGrant: boolean;
  /** Whether a new member of staff gets it before anybody sets anything. */
  onByDefault: boolean;
  /** What a member of staff sees if they try the address anyway. */
  why?: string;
};

export const ADMIN_PAGES: AdminPage[] = [
  {
    key: "overview",
    href: "/admin",
    label: "Overview",
    hint: "What the system has done on its own",
    sections: [
      { id: "scheduler", label: "Is the scheduler running" },
      { id: "pipeline", label: "Both countries, side by side" },
      { id: "sent", label: "What has been emailed" },
    ],
    canGrant: true,
    onByDefault: true,
  },
  {
    key: "today",
    href: "/admin/today",
    label: "Today",
    hint: "What to do now",
    canGrant: true,
    onByDefault: true,
    sections: [
      { id: "diary", label: "The diary" },
    ],
  },
  {
    key: "leads",
    href: "/admin/leads",
    label: "Enquiries",
    // "Leads" meant nothing to anybody who had not had it explained.
    // These are people who came to us and asked for something, which is
    // what the word enquiry already says.
    hint: "People who asked us for a free website audit, and your reviews",
    sections: [
      { id: "enquiries", label: "Who has asked for an audit" },
      { id: "reviews", label: "Reviews waiting for approval" },
      { id: "traffic", label: "Most viewed pages" },
    ],
    canGrant: true,
    onByDefault: true,
  },
  {
    key: "clients",
    href: "/admin/clients",
    label: "Clients",
    hint: "Who pays us, their logins and their ad spend",
    canGrant: true,
    // Off to begin with. It carries other businesses' logins, their spend
    // and their customers' details, and it is the one page Walid named.
    onByDefault: false,
  },
  {
    key: "prospects",
    href: "/admin/prospects",
    label: "Who to call",
    hint: "Every business found, and what has been sent to each",
    sections: [
      { id: "find", label: "Find more businesses" },
      { id: "list", label: "The call list" },
    ],
    canGrant: true,
    onByDefault: true,
  },
  {
    key: "emails",
    href: "/admin/emails",
    label: "Emails",
    hint: "Everything sent and everything that came back, both countries",
    sections: [
      { id: "counts", label: "How many have gone out" },
      { id: "inbox", label: "Replies, sent, bounced" },
    ],
    canGrant: true,
    onByDefault: true,
  },
  {
    key: "company",
    href: "/admin/company",
    label: "Company check",
    hint: "The official register",
    canGrant: true,
    onByDefault: true,
  },
  {
    key: "scan",
    href: "/admin/scan",
    label: "Scan a site",
    hint: "Audit any website — safe to show a customer",
    canGrant: true,
    onByDefault: true,
  },
  {
    key: "office",
    href: "/admin/office",
    label: "Office",
    hint: "The jobs that run on their own, as a room you can look at",
    canGrant: true,
    onByDefault: false,
  },
  {
    key: "health",
    href: "/admin/health",
    label: "System check",
    hint: "Is anything broken",
    canGrant: true,
    onByDefault: false,
  },
  {
    key: "staff",
    href: "/admin/staff",
    label: "Team",
    hint: "Who can sign in, what they can see, and what they have done",
    sections: [
      { id: "people", label: "Who can sign in" },
      { id: "add", label: "Add somebody" },
      { id: "sittings", label: "Signed in and signed out" },
      { id: "log", label: "Everything that has happened" },
    ],
    canGrant: false,
    onByDefault: false,
  },
];

/** The keys a brand new member of staff starts with. */
export function defaultPages(): PageKey[] {
  return ADMIN_PAGES.filter((p) => p.canGrant && p.onByDefault).map((p) => p.key);
}

/** The keys that can be switched on and off at all. */
export function grantablePages(): AdminPage[] {
  return ADMIN_PAGES.filter((p) => p.canGrant);
}

/**
 * Which page an address belongs to.
 *
 * Longest match first, so /admin/clients/4/invoices resolves to clients
 * rather than to the overview, which every path starts with.
 */
export function pageFor(pathname: string): AdminPage | null {
  const matches = ADMIN_PAGES.filter((page) =>
    page.href === "/admin" ? pathname === "/admin" : pathname.startsWith(page.href),
  );
  return matches.sort((a, b) => b.href.length - a.href.length)[0] ?? null;
}

/** How many new things each page has, for the badges. Declared here, with
 *  the page list, so the navigation can be typed without importing the
 *  module that counts them — that one opens a database connection. */
export type NewCounts = Partial<Record<PageKey, number>>;

export function labelFor(key: PageKey): string {
  return ADMIN_PAGES.find((p) => p.key === key)?.label ?? key;
}
