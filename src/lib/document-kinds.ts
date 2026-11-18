/**
 * Whether a document is asking for a price or for money.
 *
 * Its own module with no imports, because the builder and the buttons run
 * in the browser while the queries import the database driver, and the
 * words below are needed in both.
 *
 * A quote and an invoice are the same document with a different word on
 * it: same lines, same totals, same template, same email. What differs is
 * the word, when it runs out, and what happens when the customer says yes.
 */

export type DocKind = "invoice" | "quote";

export const DOC_KINDS: readonly DocKind[] = ["invoice", "quote"];

export function asDocKind(value: string): DocKind {
  return value === "quote" ? "quote" : "invoice";
}

/** The words that change between the two, in one place. */
export const DOC_WORDS: Record<
  DocKind,
  {
    one: string;
    many: string;
    heading: string;
    /** What the big word at the top of the document says. */
    stamp: string;
    newOne: string;
    path: string;
  }
> = {
  invoice: {
    one: "invoice",
    many: "invoices",
    heading: "Invoices",
    stamp: "INVOICE",
    newOne: "New invoice",
    path: "/portal/invoices",
  },
  quote: {
    one: "quote",
    many: "quotes",
    heading: "Quotes",
    stamp: "QUOTE",
    newOne: "New quote",
    path: "/portal/quotes",
  },
};

/**
 * Where a quote has got to.
 *
 * Deliberately not the same list as an invoice's. A quote is never paid,
 * and an invoice is never declined, and one list covering both would mean
 * every screen checking which half applied.
 */
export type QuoteState = "draft" | "sent" | "accepted" | "declined" | "expired";

/**
 * Whether a sent quote has run out.
 *
 * Worked out rather than stored, like an overdue invoice: a date passing
 * is not an event anything fires on, so a stored flag would be wrong from
 * the moment it was written until something came along to fix it.
 */
export function hasExpired(validUntil: string, status: string, now = new Date()): boolean {
  if (status !== "sent" || !validUntil) return false;
  const at = new Date(`${validUntil}T23:59:59`);
  return !Number.isNaN(at.getTime()) && at.getTime() < now.getTime();
}

/** What a quote's row should say, given its status and its date. */
export function quoteState(status: string, validUntil: string, now = new Date()): QuoteState {
  if (status === "paid" || status === "accepted") return "accepted";
  if (status === "cancelled") return "declined";
  if (hasExpired(validUntil, status, now)) return "expired";
  return status === "sent" ? "sent" : "draft";
}

export const QUOTE_WORD: Record<QuoteState, string> = {
  draft: "Not sent",
  sent: "Waiting on them",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Ran out",
};
