import type { ClientLead, ClientSummary, MonthPoint } from "./clients";
import type { Booking } from "./bookings";
import type { Invoice } from "./invoices";

/**
 * What a client's page shows before they have any figures of their own.
 *
 * A brand new client logs in the day they sign and sees nothing, which
 * makes the thing they are paying for look broken on the one day they are
 * most interested in it. Walid's call, and he is right: show the shape of
 * it, so they know what is coming.
 *
 * The whole risk of doing that is a client mistaking these for their own
 * numbers, screenshotting them, or quoting them back. So this is never
 * shown quietly. The page it appears on carries a band across the top
 * before any figure is readable, every number is visibly in example mode,
 * and there is a line at the bottom saying when the real ones arrive. The
 * moment a single genuine enquiry exists, none of this is used again.
 *
 * The figures are deliberately ordinary. Nothing here is a real client's
 * data and nothing is flattering enough to set an expectation: a modest
 * month that looks like a modest month.
 */

const SAMPLE_MONTH = (() => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
})();

export const sampleSummary: ClientSummary = {
  month: SAMPLE_MONTH,
  leads: 24,
  bySource: [
    { source: "google", leads: 14 },
    { source: "meta", leads: 6 },
    { source: "maps", leads: 3 },
    { source: "website", leads: 1 },
  ],
  customers: 5,
  spend: 480,
  costPerLead: 20,
  medianHoursToReply: 2,
  answered: 21,
  wonValue: 3250,
  openValue: 1870,
  funnel: [
    { stage: "enquired", label: "Enquiries", reached: 24, fromPrevious: null },
    { stage: "answered", label: "Answered", reached: 21, fromPrevious: 87.5 },
    { stage: "quoted", label: "Quoted", reached: 11, fromPrevious: 52.4 },
    { stage: "customer", label: "Won", reached: 5, fromPrevious: 45.5 },
  ],
  returnOnSpend: 6.8,
};

export const sampleTrend: MonthPoint[] = (() => {
  const counts = [9, 13, 16, 15, 21, 24];
  const customers = [1, 2, 3, 3, 4, 5];
  const spend = [300, 360, 420, 420, 480, 480];
  const now = new Date();

  return counts.map((leads, i) => {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1));
    return {
      month: `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}-01`,
      leads,
      customers: customers[i],
      spend: spend[i],
    };
  });
})();

/**
 * Example enquiries.
 *
 * Names and numbers are obviously not real on purpose: 07700 900xxx is the
 * range Ofcom reserves for drama and examples, so it can never reach a
 * person, and nobody can ring one of these by mistake.
 */
export const sampleLeads: ClientLead[] = [
  {
    id: -1,
    name: "Example enquiry",
    email: "example@example.com",
    phone: "07700 900123",
    message: "This is what an enquiry looks like when it arrives. Yours will show here instead.",
    source: "google",
    status: "customer",
    value: 850,
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    firstRepliedAt: new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    hoursToReply: 1,
  },
  {
    id: -2,
    name: "Example enquiry",
    email: "",
    phone: "07700 900456",
    message: "Somebody who rang rather than filled anything in.",
    source: "maps",
    status: "new",
    value: null,
    createdAt: new Date(Date.now() - 30 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    firstRepliedAt: null,
    hoursToReply: null,
  },
  {
    id: -3,
    name: "Example enquiry",
    email: "example@example.com",
    phone: "",
    message: "An enquiry from a Facebook or Instagram ad.",
    source: "meta",
    status: "quoted",
    value: 420,
    createdAt: new Date(Date.now() - 52 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    firstRepliedAt: new Date(Date.now() - 50 * 3600_000).toISOString().slice(0, 19).replace("T", " "),
    hoursToReply: 2,
  },
];

/**
 * The same idea for the money-on-the-table page.
 *
 * It needs quotes, bookings and invoices as well as enquiries, because
 * every column on it is built from a different one of those. Shown under
 * the same band and withdrawn the moment anything real exists.
 *
 * Dated relative to today so the page always reads sensibly — a quote
 * that ran out last week stays a quote that ran out last week, rather
 * than one that expired in 2026 because that is when this was written.
 */
const day = (shift: number): string =>
  new Date(Date.now() + shift * 86_400_000).toISOString().slice(0, 10);

const stamp = (shift: number): string =>
  new Date(Date.now() + shift * 86_400_000).toISOString().slice(0, 19).replace("T", " ");

/** What the example business says a job is worth. */
export const SAMPLE_LEAD_VALUE = 450;

/**
 * Enough settled work for the example to show a win rate.
 *
 * The forecast refuses to guess off fewer than eight decided enquiries,
 * which is right — but it meant the example had a dash where its most
 * interesting figure should be. These exist only to be counted: six won
 * and three lost, so the rate is two in three and visibly not a round
 * number somebody would suspect of being made up.
 */
const settled: ClientLead[] = [
  ...Array.from({ length: 6 }, (_, i) => ({
    id: -100 - i,
    name: "Example enquiry",
    email: "",
    phone: "",
    message: "",
    source: "google",
    status: "customer",
    value: SAMPLE_LEAD_VALUE,
    createdAt: stamp(-30 - i),
    firstRepliedAt: stamp(-30 - i),
    hoursToReply: 1,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: -200 - i,
    name: "Example enquiry",
    email: "",
    phone: "",
    message: "",
    source: "meta",
    status: "lost",
    value: SAMPLE_LEAD_VALUE,
    createdAt: stamp(-40 - i),
    firstRepliedAt: stamp(-40 - i),
    hoursToReply: 3,
  })),
];

/**
 * The example enquiries plus the settled ones behind them.
 *
 * The dashboard keeps using the short list: a page of nine identical
 * example rows reads as a bug. This longer one is only for the pages
 * that need a history to count from.
 */
export const sampleLeadsWithHistory: ClientLead[] = [...sampleLeads, ...settled];

export const sampleQuotes: Invoice[] = [
  {
    id: -1, kind: "quote", number: 12, customerName: "D Hartley", customerCompany: "",
    customerEmail: "d.hartley@example.co.uk", customerAddress: "",
    issuedOn: day(-4), dueOn: "", vatRate: 0,
    discount: { kind: "none", percent: 0, pence: 0 }, notes: "",
    status: "sent", sentAt: stamp(-4), paidAt: "", paidMethod: null,
    validUntil: day(10), acceptedAt: "", becameInvoiceId: null,
    lines: [{ id: -1, description: "Front and rear bumper respray", quantity: 1, unitPence: 68000 }],
    depositPence: 0, depositMethod: null, depositAt: "",
    subtotalPence: 68000, discountPence: 0, afterDiscountPence: 68000,
    vatPence: 0, totalPence: 68000, balancePence: 68000,
  },
  {
    id: -2, kind: "quote", number: 11, customerName: "Kaur Joinery", customerCompany: "",
    customerEmail: "office@example.co.uk", customerAddress: "",
    issuedOn: day(-21), dueOn: "", vatRate: 0,
    discount: { kind: "none", percent: 0, pence: 0 }, notes: "",
    status: "sent", sentAt: stamp(-21), paidAt: "", paidMethod: null,
    validUntil: day(-3), acceptedAt: "", becameInvoiceId: null,
    lines: [{ id: -2, description: "Two vans, full signwriting", quantity: 2, unitPence: 54000 }],
    depositPence: 0, depositMethod: null, depositAt: "",
    subtotalPence: 108000, discountPence: 0, afterDiscountPence: 108000,
    vatPence: 0, totalPence: 108000, balancePence: 108000,
  },
];

export const sampleInvoices: Invoice[] = [
  {
    id: -3, kind: "invoice", number: 8, customerName: "R Okonkwo", customerCompany: "",
    customerEmail: "", customerAddress: "", issuedOn: day(-6), dueOn: "", vatRate: 0,
    discount: { kind: "none", percent: 0, pence: 0 }, notes: "",
    status: "paid", sentAt: "", paidAt: stamp(-6), paidMethod: "card",
    validUntil: "", acceptedAt: "", becameInvoiceId: null,
    lines: [{ id: -3, description: "Alloy refurb, set of four", quantity: 1, unitPence: 32000 }],
    depositPence: 0, depositMethod: null, depositAt: "",
    subtotalPence: 32000, discountPence: 0, afterDiscountPence: 32000,
    vatPence: 0, totalPence: 32000, balancePence: 32000,
  },
];

export const sampleBookings: Booking[] = [
  {
    id: -1, leadId: null, customerName: "M Sandhu", phone: "", email: "",
    job: "Ceramic coating", notes: "", bookedOn: day(-5), startsAt: "09:00",
    durationMinutes: 240, price: 380, status: "done",
  },
  {
    id: -2, leadId: null, customerName: "T Byrne", phone: "", email: "",
    job: "Headlight restoration", notes: "", bookedOn: day(2), startsAt: "14:00",
    durationMinutes: 90, price: 95, status: "booked",
  },
];
