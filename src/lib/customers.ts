import type { ClientLead } from "./clients";
import type { Booking } from "./bookings";
import type { Invoice } from "./invoices";

/**
 * One person, with everything that has ever happened with them.
 *
 * There is no customers table and deliberately so. A business that fills
 * in a customer record before it is allowed to book a job is a business
 * that stops using the diary, and every one of these four tables already
 * carries the name of the person it is about. So this gathers rather than
 * stores: it is a view over what is already there, and nothing has to be
 * kept in step with anything else.
 *
 * The filing is by name, tidied. That is a real limitation and the page
 * says so rather than hiding it: "J Whitfield" and "Mrs Whitfield" are
 * two people as far as this is concerned. The alternative — matching on
 * email or phone as well — sounds better and is worse, because it merges
 * a husband and wife who share an address into one person and there is no
 * way to pull them apart again afterwards.
 *
 * Money counted is money actually received: a paid invoice in full, and
 * the deposit off one that has not been settled. Never what was quoted,
 * and never what is owed.
 */

export type CustomerEvent = {
  kind: "enquiry" | "booking" | "quote" | "invoice";
  /** YYYY-MM-DD, or "" when the row has no date worth showing. */
  on: string;
  what: string;
  /** Pence. Zero when the event has no money attached. */
  valuePence: number;
  status: string;
  href: string | null;
};

export type Customer = {
  /** Stable, URL-safe, and derived from the name alone. */
  key: string;
  name: string;
  emails: string[];
  phones: string[];
  /** Money actually received from them, in pence. */
  spentPence: number;
  /** What is still owed, in pence. */
  owedPence: number;
  jobs: number;
  /** The most recent date anything happened, or "". */
  lastOn: string;
  events: CustomerEvent[];
};

/**
 * The name, folded down to something two spellings of it agree on.
 *
 * Case, punctuation and runs of spaces go. Nothing else does: dropping
 * "Mrs" or initials would merge people who are not the same person, and
 * a wrong merge is unrecoverable in a way a missed one is not.
 */
export function customerKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function day(value: string): string {
  if (!value) return "";
  const at = new Date(value.includes("T") || value.includes(" ") ? value : `${value}T12:00:00`);
  if (Number.isNaN(at.getTime())) return "";
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(
    at.getDate(),
  ).padStart(2, "0")}`;
}

function add(into: string[], value: string) {
  const tidy = value.trim();
  if (tidy && !into.some((had) => had.toLowerCase() === tidy.toLowerCase())) into.push(tidy);
}

export function buildCustomers(
  leads: ClientLead[],
  bookings: Booking[],
  quotes: Invoice[],
  invoices: Invoice[],
): Customer[] {
  const found = new Map<string, Customer>();

  const of = (name: string): Customer | null => {
    const key = customerKey(name);
    if (!key) return null;
    let customer = found.get(key);
    if (!customer) {
      customer = {
        key,
        name: name.trim(),
        emails: [],
        phones: [],
        spentPence: 0,
        owedPence: 0,
        jobs: 0,
        lastOn: "",
        events: [],
      };
      found.set(key, customer);
    }
    return customer;
  };

  for (const lead of leads) {
    const customer = of(lead.name);
    if (!customer) continue;
    add(customer.emails, lead.email);
    add(customer.phones, lead.phone);
    customer.events.push({
      kind: "enquiry",
      on: day(lead.createdAt),
      what: lead.message || "Got in touch",
      valuePence: lead.value === null ? 0 : Math.round(lead.value * 100),
      status: lead.status,
      href: "/portal",
    });
  }

  for (const booking of bookings) {
    const customer = of(booking.customerName);
    if (!customer) continue;
    add(customer.emails, booking.email);
    add(customer.phones, booking.phone);
    if (booking.status === "done") customer.jobs += 1;
    customer.events.push({
      kind: "booking",
      on: day(booking.bookedOn),
      what: booking.job || "Booked in",
      valuePence: booking.price === null ? 0 : Math.round(booking.price * 100),
      status: booking.status,
      href: "/portal/calendar",
    });
  }

  for (const quote of quotes) {
    const customer = of(quote.customerName);
    if (!customer) continue;
    add(customer.emails, quote.customerEmail);
    customer.events.push({
      kind: "quote",
      on: day(quote.issuedOn),
      what: `Quote ${String(quote.number).padStart(4, "0")}`,
      valuePence: quote.totalPence,
      status: quote.status,
      href: `/portal/quotes/${quote.id}`,
    });
  }

  for (const invoice of invoices) {
    const customer = of(invoice.customerName);
    if (!customer) continue;
    add(customer.emails, invoice.customerEmail);

    // Received, not billed. A sent invoice is a hope; its deposit is money.
    if (invoice.status === "paid") {
      customer.spentPence += invoice.totalPence;
    } else if (invoice.status !== "cancelled") {
      customer.spentPence += invoice.depositPence;
      customer.owedPence += invoice.balancePence;
    }

    customer.events.push({
      kind: "invoice",
      on: day(invoice.issuedOn),
      what: `Invoice ${String(invoice.number).padStart(4, "0")}`,
      valuePence: invoice.totalPence,
      status: invoice.status,
      href: `/portal/invoices/${invoice.id}`,
    });
  }

  const out = [...found.values()];
  for (const customer of out) {
    // Newest first, and anything undated at the bottom rather than at the
    // top where an empty string would otherwise sort it.
    customer.events.sort((a, b) => (b.on || "").localeCompare(a.on || ""));
    customer.lastOn = customer.events.find((event) => event.on)?.on ?? "";
  }

  return out.sort((a, b) => (b.lastOn || "").localeCompare(a.lastOn || ""));
}

/** Everything about one person, or null if nothing is filed under that name. */
export function findCustomer(customers: Customer[], key: string): Customer | null {
  return customers.find((customer) => customer.key === key) ?? null;
}
