import type { ClientLead, ClientSummary } from "./clients";
import type { Booking } from "./bookings";
import type { Invoice } from "./invoices";
import { quoteState } from "./document-kinds";

/**
 * Money sitting on the table, and what to do about it.
 *
 * A pure function over data the page has already fetched, so it can be
 * tested without a database and so every figure on the screen can be
 * traced back to the row it came from.
 *
 * Two rules it keeps to, because the whole thing is worthless the first
 * time somebody catches it making something up:
 *
 *  - Every number shown is counted from their own rows. Nothing is a
 *    borrowed industry statistic, an estimate, or a benchmark.
 *  - Where a figure would need something we do not hold, it is left out
 *    rather than guessed. Missed calls are the obvious one: nothing here
 *    tracks calls, so nothing here claims to.
 *
 * What is priced is priced at what the business itself said a job is
 * worth, or at what the document actually says. Never at an average of
 * anything.
 */

export type ChanceKind =
  | "unanswered"
  | "quote-waiting"
  | "quote-expired"
  | "gone-cold"
  | "not-invoiced";

export type Chance = {
  id: string;
  kind: ChanceKind;
  who: string;
  /** One line of context: what it is, not what to do about it. */
  what: string;
  /** Pence, or 0 when nothing has put a price on it yet. */
  valuePence: number;
  /** How long it has been sitting. */
  days: number;
  href: string | null;
};

export type Column = {
  key: ChanceKind;
  title: string;
  note: string;
  chances: Chance[];
  totalPence: number;
};

export type Tip = {
  id: string;
  /** Whether doing it costs them anything. */
  cost: "free" | "money";
  title: string;
  /** Names the figure it came from, every time. */
  body: string;
  action?: { label: string; href: string };
  /** Pence at stake, used only to decide what to show first. */
  weight: number;
};

const DAY = 86_400_000;

/** Days since a stored timestamp, or null if there is not one. */
function daysSince(value: string | null, now: number): number | null {
  if (!value) return null;
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return null;
  return Math.max(0, Math.floor((now - at.getTime()) / DAY));
}

/** A lead's own value, or what the client said a job is worth. */
function leadPence(lead: ClientLead, fallbackPounds: number | null): number {
  if (lead.value !== null) return Math.round(lead.value * 100);
  return fallbackPounds === null ? 0 : Math.round(fallbackPounds * 100);
}

/** Quoted and left alone this long counts as having gone quiet. */
const COLD_AFTER_DAYS = 7;

export function chances(
  leads: ClientLead[],
  quotes: Invoice[],
  bookings: Booking[],
  invoices: Invoice[],
  defaultLeadValue: number | null,
  now = Date.now(),
): Column[] {
  const unanswered: Chance[] = leads
    .filter((lead) => lead.firstRepliedAt === null && lead.status !== "lost")
    .map((lead) => ({
      id: `lead-${lead.id}`,
      kind: "unanswered" as const,
      who: lead.name || "Someone",
      what: lead.message ? lead.message.slice(0, 80) : "No message left",
      valuePence: leadPence(lead, defaultLeadValue),
      days: daysSince(lead.createdAt, now) ?? 0,
      href: "/portal",
    }))
    .sort((a, b) => b.days - a.days);

  const cold: Chance[] = leads
    .filter((lead) => lead.status === "quoted")
    .map((lead) => ({ lead, days: daysSince(lead.createdAt, now) ?? 0 }))
    .filter(({ days }) => days >= COLD_AFTER_DAYS)
    .map(({ lead, days }) => ({
      id: `cold-${lead.id}`,
      kind: "gone-cold" as const,
      who: lead.name || "Someone",
      what: `Quoted and nothing since`,
      valuePence: leadPence(lead, defaultLeadValue),
      days,
      href: "/portal",
    }))
    .sort((a, b) => b.days - a.days);

  const waiting: Chance[] = [];
  const expired: Chance[] = [];
  for (const quote of quotes) {
    const state = quoteState(quote.status, quote.validUntil, new Date(now));
    const row: Chance = {
      id: `quote-${quote.id}`,
      kind: state === "expired" ? "quote-expired" : "quote-waiting",
      who: quote.customerName,
      what: `Quote ${String(quote.number).padStart(4, "0")}`,
      valuePence: quote.totalPence,
      days: daysSince(quote.sentAt || null, now) ?? 0,
      href: `/portal/quotes/${quote.id}`,
    };
    if (state === "sent") waiting.push(row);
    else if (state === "expired") expired.push(row);
  }

  // A job finished with nothing billed for it. Matched on the customer's
  // name, which is all these two tables share — so it is deliberately
  // forgiving, and a job that was invoiced under a slightly different
  // spelling simply does not appear rather than appearing wrongly.
  const billed = new Set(
    invoices.map((invoice) => invoice.customerName.trim().toLowerCase()),
  );
  const notInvoiced: Chance[] = bookings
    .filter((booking) => booking.status === "done")
    .filter((booking) => !billed.has(booking.customerName.trim().toLowerCase()))
    .map((booking) => ({
      id: `booking-${booking.id}`,
      kind: "not-invoiced" as const,
      who: booking.customerName,
      what: booking.job || "Job marked done",
      valuePence:
        booking.price !== null
          ? Math.round(booking.price * 100)
          : defaultLeadValue === null
            ? 0
            : Math.round(defaultLeadValue * 100),
      days: daysSince(`${booking.bookedOn}T12:00:00`, now) ?? 0,
      href: "/portal/calendar",
    }))
    .sort((a, b) => b.days - a.days);

  const columns: Column[] = [
    {
      key: "unanswered",
      title: "Nobody has replied",
      note: "They got in touch and are still waiting.",
      chances: unanswered,
      totalPence: 0,
    },
    {
      key: "quote-waiting",
      title: "Quote sent, no answer",
      note: "Priced up and sitting with them.",
      chances: waiting.sort((a, b) => b.days - a.days),
      totalPence: 0,
    },
    {
      key: "gone-cold",
      title: "Gone quiet",
      note: `Quoted over ${COLD_AFTER_DAYS} days ago and nothing since.`,
      chances: cold,
      totalPence: 0,
    },
    {
      key: "quote-expired",
      title: "Price ran out",
      note: "Still worth a call — you can always quote again.",
      chances: expired.sort((a, b) => b.days - a.days),
      totalPence: 0,
    },
    {
      key: "not-invoiced",
      title: "Done, not billed",
      note: "Work finished with nothing sent for it.",
      chances: notInvoiced,
      totalPence: 0,
    },
  ];

  for (const column of columns) {
    column.totalPence = column.chances.reduce((sum, c) => sum + c.valuePence, 0);
  }
  return columns;
}

/**
 * What to do next, worked out from their own figures.
 *
 * Every tip names the number behind it. A tip that says "reply faster"
 * is advice anybody could give; a tip that says "four enquiries have been
 * waiting six days and they are worth £2,000" is a reason to put the
 * phone down and go and do it.
 *
 * Ranked by what is at stake rather than by what is easiest to say, and
 * cut short, because a list of eleven things to do is a list nobody
 * starts.
 */
export function tips(
  summary: ClientSummary,
  columns: Column[],
  options: {
    autoReplyOn: boolean;
    reviewRequestsOn: boolean;
    hasReviewLink: boolean;
    hasLogo: boolean;
    hasAddress: boolean;
    quotesEverSent: number;
    defaultLeadValue: number | null;
  },
): Tip[] {
  const out: Tip[] = [];
  const by = (key: ChanceKind) => columns.find((c) => c.key === key);

  const waiting = by("unanswered");
  if (waiting && waiting.chances.length > 0) {
    const oldest = waiting.chances[0].days;
    out.push({
      id: "unanswered",
      cost: "free",
      title: `${waiting.chances.length} ${
        waiting.chances.length === 1 ? "person is" : "people are"
      } still waiting on you`,
      body:
        waiting.totalPence > 0
          ? `Worth about £${Math.round(waiting.totalPence / 100).toLocaleString("en-GB")} between them, going by what you said a job is worth. The oldest has been waiting ${oldest} ${oldest === 1 ? "day" : "days"}.`
          : `The oldest has been waiting ${oldest} ${oldest === 1 ? "day" : "days"}. Put a job value in Business details and this will tell you what they are worth.`,
      action: { label: "Open your enquiries", href: "/portal" },
      weight: waiting.totalPence + 1,
    });
  }

  const notBilled = by("not-invoiced");
  if (notBilled && notBilled.chances.length > 0) {
    out.push({
      id: "not-invoiced",
      cost: "free",
      title: "Work you have done and not billed for",
      body: `${notBilled.chances.length} ${
        notBilled.chances.length === 1 ? "job is" : "jobs are"
      } marked done in your diary with no invoice against them${
        notBilled.totalPence > 0
          ? `, worth about £${Math.round(notBilled.totalPence / 100).toLocaleString("en-GB")}`
          : ""
      }.`,
      action: { label: "Write an invoice", href: "/portal/invoices/new" },
      weight: notBilled.totalPence + 2,
    });
  }

  const cold = by("gone-cold");
  const expired = by("quote-expired");
  const chaseable = (cold?.totalPence ?? 0) + (expired?.totalPence ?? 0);
  const chaseCount = (cold?.chances.length ?? 0) + (expired?.chances.length ?? 0);
  if (chaseCount > 0) {
    out.push({
      id: "chase",
      cost: "free",
      title: "Quotes nobody has come back on",
      body: `${chaseCount} ${chaseCount === 1 ? "person was" : "people were"} given a price and went quiet${
        chaseable > 0
          ? `, worth £${Math.round(chaseable / 100).toLocaleString("en-GB")} between them`
          : ""
      }. One phone call each is the cheapest work you will do this week.`,
      weight: chaseable,
    });
  }

  if (!options.autoReplyOn) {
    out.push({
      id: "auto-reply",
      cost: "free",
      title: "Turn the instant reply on",
      body:
        summary.medianHoursToReply !== null
          ? `Your enquiries currently wait about ${summary.medianHoursToReply} ${
              summary.medianHoursToReply === 1 ? "hour" : "hours"
            } for an answer. The instant reply goes out in seconds, in your name, so nobody is sat wondering whether it arrived.`
          : "An answer goes out within seconds of an enquiry arriving, in your name, so nobody is sat wondering whether it arrived.",
      action: { label: "Ask us to switch it on", href: "/portal/business" },
      weight: 900,
    });
  }

  if (!options.reviewRequestsOn || !options.hasReviewLink) {
    out.push({
      id: "reviews",
      cost: "free",
      title: "Ask every finished job for a review",
      body: options.hasReviewLink
        ? "Your review link is saved but the automatic ask is switched off, so nothing is going out when you mark a job done."
        : "Mark a job done and the customer can be asked for a review the next day, automatically. It needs your Google review link, which is not saved yet.",
      action: { label: "Business details", href: "/portal/business" },
      weight: 800,
    });
  }

  // Only once they are actually quoting, so it is not shown to somebody
  // on their first week.
  const everQuoted = summary.funnel.find((step) => step.stage === "quoted")?.reached ?? 0;
  if (options.quotesEverSent === 0 && everQuoted > 0) {
    out.push({
      id: "write-quotes",
      cost: "free",
      title: "Put your prices in writing",
      body: `You have marked ${everQuoted} ${
        everQuoted === 1 ? "enquiry" : "enquiries"
      } as quoted, but none of them went out as a written quote. A price with your logo on it, sat in their email, is what stops the argument about what was agreed.`,
      action: { label: "Write a quote", href: "/portal/quotes/new" },
      weight: 700,
    });
  }

  if (!options.hasLogo || !options.hasAddress) {
    out.push({
      id: "profile",
      cost: "free",
      title: "Finish your business details",
      body: `Your ${!options.hasLogo && !options.hasAddress ? "logo and address are" : !options.hasLogo ? "logo is" : "address is"} missing, so everything you send out goes without ${!options.hasLogo && !options.hasAddress ? "them" : "it"}. It takes two minutes and it is the first thing a customer sees.`,
      action: { label: "Fill it in", href: "/portal/business" },
      weight: 100,
    });
  }

  // The only tip that costs money, and only when the arithmetic behind it
  // is actually there. Said as a sum they can check rather than a promise.
  if (
    summary.costPerLead !== null &&
    summary.leads > 0 &&
    summary.customers > 0 &&
    options.defaultLeadValue !== null
  ) {
    const perCustomer = (summary.costPerLead * summary.leads) / summary.customers;
    const worth = options.defaultLeadValue;
    if (perCustomer < worth) {
      out.push({
        id: "spend-more",
        cost: "money",
        title: "The advertising is paying for itself",
        body: `This month ${summary.leads} ${
          summary.leads === 1 ? "enquiry" : "enquiries"
        } cost you £${summary.spend.toLocaleString("en-GB")} and ${summary.customers} of them became customers — about £${Math.round(perCustomer).toLocaleString("en-GB")} to win one, against the £${worth.toLocaleString("en-GB")} you said a job is worth. On those numbers more budget buys more jobs. Worth a conversation before you change anything.`,
        weight: 600,
      });
    }
  }

  return out.sort((a, b) => b.weight - a.weight).slice(0, 5);
}

export type Forecast = {
  /** Everything still in play, at what it is priced at. */
  openPence: number;
  /**
   * What that is likely to come to, going by how often they actually win.
   * Null when there is not enough decided work to say, because a win rate
   * off two jobs is not a win rate.
   */
  likelyPence: number | null;
  /** Percent, or null for the same reason. */
  winRate: number | null;
  /** How many decided enquiries the rate is counted from. */
  decided: number;
  wonThisMonthPence: number;
};

/** Below this, a win rate is an anecdote rather than a figure. */
const ENOUGH_TO_JUDGE = 8;

/**
 * What is open, and what it is likely to come to.
 *
 * The rate is counted only from enquiries that actually reached a
 * decision — won or lost. Counting the ones still sitting there as
 * losses would make a busy month look like a terrible one, and counting
 * them as wins would be a sales pitch rather than a forecast.
 *
 * It is a multiplication they can check, not a model. If they win two in
 * five and have £10,000 open, it says £4,000, and says where both halves
 * came from.
 */
export function forecast(
  summary: ClientSummary,
  columns: Column[],
  leads: ClientLead[],
): Forecast {
  const openPence = columns
    .filter((column) => column.key !== "not-invoiced")
    .reduce((sum, column) => sum + column.totalPence, 0);

  const won = leads.filter((lead) => lead.status === "customer").length;
  const lost = leads.filter((lead) => lead.status === "lost").length;
  const decided = won + lost;

  const enough = decided >= ENOUGH_TO_JUDGE;
  const winRate = enough ? Math.round((won / decided) * 100) : null;

  return {
    openPence,
    likelyPence: winRate === null ? null : Math.round((openPence * winRate) / 100),
    winRate,
    decided,
    wonThisMonthPence: Math.round(summary.wonValue * 100),
  };
}

export type Gap = {
  id: string;
  label: string;
  count: number;
  /** Why it matters, in terms of what it does to the figures above. */
  why: string;
  href: string;
};

/**
 * Things missing that make the figures above worse than they could be.
 *
 * Not a nag list. Each one is here because it is actively dragging a
 * number on this page down — an enquiry with no value counts as nothing
 * towards what is on the table, and a quote with no date can never show
 * as having run out, so it sits in the wrong column forever.
 */
export function gaps(
  leads: ClientLead[],
  bookings: Booking[],
  quotes: Invoice[],
  defaultLeadValue: number | null,
  now = Date.now(),
): Gap[] {
  const out: Gap[] = [];

  // Only when there is no fallback: with a job value set, nothing is
  // counting as zero and there is nothing to fix.
  if (defaultLeadValue === null) {
    const unpriced = leads.filter(
      (lead) => lead.value === null && lead.status !== "lost",
    ).length;
    if (unpriced > 0) {
      out.push({
        id: "lead-values",
        label: `${unpriced} ${unpriced === 1 ? "enquiry has" : "enquiries have"} no value on them`,
        count: unpriced,
        why: "They count as nothing towards what is on the table. Set what a job is typically worth and every one of them gets priced at once.",
        href: "/portal/business",
      });
    }
  }

  const unpricedJobs = bookings.filter(
    (booking) => booking.status === "done" && booking.price === null,
  ).length;
  if (unpricedJobs > 0) {
    out.push({
      id: "job-prices",
      label: `${unpricedJobs} finished ${unpricedJobs === 1 ? "job has" : "jobs have"} no price`,
      count: unpricedJobs,
      why: "Put the price on a job when you book it and the figures here stop being a guess.",
      href: "/portal/calendar",
    });
  }

  const noDate = quotes.filter(
    (quote) => quote.status === "sent" && !quote.validUntil,
  ).length;
  if (noDate > 0) {
    out.push({
      id: "quote-dates",
      label: `${noDate} sent ${noDate === 1 ? "quote has" : "quotes have"} no date on them`,
      count: noDate,
      why: "A quote with no date never runs out, so it sits in “waiting” forever instead of telling you to chase it.",
      href: "/portal/quotes",
    });
  }

  void now;
  return out;
}
