import { test } from "node:test";
import assert from "node:assert/strict";
import { chances, tips } from "../src/lib/opportunities.ts";
import type { ClientLead, ClientSummary } from "../src/lib/clients.ts";
import type { Booking } from "../src/lib/bookings.ts";
import type { Invoice } from "../src/lib/invoices.ts";

/**
 * What is sitting on the table, and the advice built from it.
 *
 * Worth testing because this is the one screen that tells a business
 * owner what to go and do, and the moment it prices something wrongly or
 * tells them to chase a job they have already been paid for, they stop
 * believing the rest of the site too.
 */

const NOW = new Date("2026-11-19T12:00:00").getTime();
const ago = (days: number) => new Date(NOW - days * 86_400_000).toISOString();

const lead = (over: Partial<ClientLead>): ClientLead => ({
  id: 1, name: "A Customer", email: "", phone: "", message: "", source: "website",
  status: "new", value: null, createdAt: ago(1), firstRepliedAt: null,
  hoursToReply: null, ...over,
});

const booking = (over: Partial<Booking>): Booking => ({
  id: 1, leadId: null, customerName: "A Customer", phone: "", email: "", job: "",
  notes: "", bookedOn: "2026-11-10", startsAt: "", durationMinutes: null,
  price: null, status: "booked", ...over,
});

const invoice = (over: Partial<Invoice>): Invoice => ({
  id: 1, kind: "invoice", number: 1, customerName: "A Customer", customerCompany: "",
  customerEmail: "", customerAddress: "", issuedOn: "2026-11-10", dueOn: "",
  vatRate: 0, discount: { kind: "none", percent: 0, pence: 0 }, notes: "",
  status: "paid", sentAt: "", paidAt: "", paidMethod: null, validUntil: "",
  acceptedAt: "", becameInvoiceId: null, lines: [],
  subtotalPence: 0, discountPence: 0, afterDiscountPence: 0, vatPence: 0,
  totalPence: 0, ...over,
});

const summary: ClientSummary = {
  month: "2026-11-01", leads: 24, bySource: [], customers: 5, spend: 480,
  costPerLead: 20, medianHoursToReply: 3, answered: 21, wonValue: 2500,
  returnOnSpend: 5.2, openValue: 0,
  funnel: [{ stage: "quoted", label: "Quoted", reached: 11, fromPrevious: 52 }],
};

const column = (cols: ReturnType<typeof chances>, key: string) =>
  cols.find((c) => c.key === key)!;

test("an unanswered enquiry is priced at what a job is worth", () => {
  const cols = chances([lead({ id: 7, createdAt: ago(3) })], [], [], [], 500, NOW);
  const waiting = column(cols, "unanswered");
  assert.equal(waiting.chances.length, 1);
  assert.equal(waiting.chances[0].days, 3);
  assert.equal(waiting.totalPence, 50000);
});

test("a lead's own value beats the default", () => {
  const cols = chances([lead({ value: 1200 })], [], [], [], 500, NOW);
  assert.equal(column(cols, "unanswered").totalPence, 120000);
});

test("with no job value set nothing is invented", () => {
  const cols = chances([lead({})], [], [], [], null, NOW);
  assert.equal(column(cols, "unanswered").totalPence, 0);
});

test("an answered enquiry is not still waiting", () => {
  const cols = chances([lead({ firstRepliedAt: ago(1) })], [], [], [], 500, NOW);
  assert.equal(column(cols, "unanswered").chances.length, 0);
});

test("a lost enquiry is not chased", () => {
  const cols = chances([lead({ status: "lost" })], [], [], [], 500, NOW);
  assert.equal(column(cols, "unanswered").chances.length, 0);
});

test("quoted a week ago with nothing since has gone quiet", () => {
  const fresh = lead({ id: 1, status: "quoted", createdAt: ago(2) });
  const stale = lead({ id: 2, status: "quoted", createdAt: ago(9) });
  const cols = chances([fresh, stale], [], [], [], 500, NOW);
  const cold = column(cols, "gone-cold");
  assert.equal(cold.chances.length, 1);
  assert.equal(cold.chances[0].id, "cold-2");
});

test("a quote past its date is separated from one still live", () => {
  const live = invoice({ id: 1, kind: "quote", number: 1, status: "sent", validUntil: "2026-12-03", totalPence: 50000 });
  const lapsed = invoice({ id: 2, kind: "quote", number: 2, status: "sent", validUntil: "2026-11-01", totalPence: 30000 });
  const cols = chances([], [live, lapsed], [], [], null, NOW);
  assert.equal(column(cols, "quote-waiting").totalPence, 50000);
  assert.equal(column(cols, "quote-expired").totalPence, 30000);
});

test("a job already invoiced is never shown as unbilled", () => {
  const done = booking({ customerName: "Mrs J Whitfield", status: "done", price: 400 });
  const billed = invoice({ customerName: "  mrs j whitfield " });
  const cols = chances([], [], [done], [billed], null, NOW);
  assert.equal(column(cols, "not-invoiced").chances.length, 0);
});

test("a finished job with nothing billed is priced at what was agreed", () => {
  const done = booking({ customerName: "Mr Shah", status: "done", price: 400 });
  const cols = chances([], [], [done], [], 500, NOW);
  const owed = column(cols, "not-invoiced");
  assert.equal(owed.chances.length, 1);
  assert.equal(owed.totalPence, 40000);
});

test("a job still booked in is not chased for money", () => {
  const cols = chances([], [], [booking({ status: "booked" })], [], 500, NOW);
  assert.equal(column(cols, "not-invoiced").chances.length, 0);
});

const settings = {
  autoReplyOn: true, reviewRequestsOn: true, hasReviewLink: true,
  hasLogo: true, hasAddress: true, quotesEverSent: 3, defaultLeadValue: 500,
};

test("the advice names the figure it came from", () => {
  const cols = chances([lead({ createdAt: ago(6) })], [], [], [], 500, NOW);
  const advice = tips(summary, cols, settings);
  const waiting = advice.find((t) => t.id === "unanswered")!;
  assert.match(waiting.body, /£500/);
  assert.match(waiting.body, /6 days/);
});

test("nothing is said about money when no job value is set", () => {
  const cols = chances([lead({})], [], [], [], null, NOW);
  const waiting = tips(summary, cols, { ...settings, defaultLeadValue: null })
    .find((t) => t.id === "unanswered")!;
  assert.doesNotMatch(waiting.body, /£\d/);
});

test("spending more is only suggested when the sum actually works", () => {
  // £480 for 24 enquiries, 5 customers: about £96 to win a £500 job.
  const good = tips(summary, chances([], [], [], [], null, NOW), settings);
  assert.ok(good.some((t) => t.id === "spend-more"));

  // The same spend winning one customer is £480 for a £400 job.
  const bad = tips(
    { ...summary, customers: 1 },
    chances([], [], [], [], null, NOW),
    { ...settings, defaultLeadValue: 400 },
  );
  assert.ok(!bad.some((t) => t.id === "spend-more"));
});

test("no advice costs money unless it is the advertising one", () => {
  const all = tips(summary, chances([lead({})], [], [], [], 500, NOW), {
    ...settings, autoReplyOn: false, reviewRequestsOn: false, hasLogo: false,
  });
  for (const tip of all) {
    if (tip.cost === "money") assert.equal(tip.id, "spend-more");
  }
});

test("a business with nothing wrong is not nagged", () => {
  const advice = tips(summary, chances([], [], [], [], null, NOW), settings);
  assert.ok(advice.every((t) => t.id === "spend-more"));
});

test("the list is never long enough to be ignored", () => {
  const many = Array.from({ length: 20 }, (_, i) => lead({ id: i + 1, createdAt: ago(i + 1) }));
  const advice = tips(summary, chances(many, [], [], [], 500, NOW), {
    ...settings, autoReplyOn: false, reviewRequestsOn: false,
    hasLogo: false, hasAddress: false, quotesEverSent: 0,
  });
  assert.ok(advice.length <= 5);
});
