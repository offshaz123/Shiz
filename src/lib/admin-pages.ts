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
  | "company"
  | "scan"
  | "health"
  | "staff";

export type AdminPage = {
  key: PageKey;
  href: string;
  label: string;
  hint: string;
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
  },
  {
    key: "leads",
    href: "/admin/leads",
    label: "Leads",
    hint: "People who came to us",
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

export function labelFor(key: PageKey): string {
  return ADMIN_PAGES.find((p) => p.key === key)?.label ?? key;
}
