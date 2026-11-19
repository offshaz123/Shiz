import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCustomers, customerKey } from "../src/lib/customers.ts";
import type { ClientLead } from "../src/lib/clients.ts";
import type { Booking } from "../src/lib/bookings.ts";
import type { Invoice } from "../src/lib/invoices.ts";

/**
 * Everything filed under one person's name.
 *
 * Worth testing because the failure that matters is a silent one: two
 * people merged into a single record, or money counted that nobody has
 * actually handed over. Both read as perfectly ordinary pages.
 */

const lead = (over: Partial<ClientLead>): ClientLead => ({
  id: 1, name: "Mrs J Whitfield", email: "", phone: "", message: "", source: "website",
  status: "new", value: null, createdAt: "2026-11-10 09:00:00", firstRepliedAt: null,
  hoursToReply: null, ...over,
});

const booking = (over: Partial<Booking>): Booking => ({
  id: 1, leadId: null, customerName: "Mrs J Whitfield", phone: "", email: "", job: "",
  notes: "", bookedOn: "2026-11-12", startsAt: "", durationMinutes: null, price: null,
  status: "booked", ...over,
});

const invoice = (over: Partial<Invoice>): Invoice => ({
  id: 1, kind: "invoice", number: 1, customerName: "Mrs J Whitfield", customerCompany: "",
  customerEmail: "", customerAddress: "", issuedOn: "2026-11-14", dueOn: "", vatRate: 0,
  discount: { kind: "none", percent: 0, pence: 0 }, notes: "", status: "paid",
  sentAt: "", paidAt: "", paidMethod: null, validUntil: "", acceptedAt: "",
  becameInvoiceId: null, depositPence: 0, depositMethod: null, depositAt: "", lines: [],
  subtotalPence: 0, discountPence: 0, afterDiscountPence: 0, vatPence: 0,
  totalPence: 50000, balancePence: 50000, ...over,
});

test("the same name spelled casually is one person", () => {
  for (const typed of ["Mrs J Whitfield", "mrs j whitfield", "  Mrs  J  Whitfield "]) {
    assert.equal(customerKey(typed), "mrs-j-whitfield", typed);
  }
});

test("two different people are never merged", () => {
  assert.notEqual(customerKey("J Whitfield"), customerKey("Mrs J Whitfield"));
  assert.notEqual(customerKey("Tom Shah"), customerKey("Tim Shah"));
});

test("everything with one name on it lands on one record", () => {
  const [customer] = buildCustomers(
    [lead({})],
    [booking({})],
    [invoice({ id: 9, kind: "quote", number: 3, totalPence: 80000 })],
    [invoice({})],
  );
  assert.equal(customer.name, "Mrs J Whitfield");
  assert.equal(customer.events.length, 4);
  assert.deepEqual(
    customer.events.map((e) => e.kind).sort(),
    ["booking", "enquiry", "invoice", "quote"],
  );
});

test("only money actually received is counted as spent", () => {
  const paid = invoice({ id: 1, status: "paid", totalPence: 50000, balancePence: 50000 });
  const sentWithDeposit = invoice({
    id: 2, number: 2, status: "sent", totalPence: 90000,
    depositPence: 20000, balancePence: 70000,
  });
  const [customer] = buildCustomers([], [], [], [paid, sentWithDeposit]);
  assert.equal(customer.spentPence, 70000);
  assert.equal(customer.owedPence, 70000);
});

test("a quote is never counted as money", () => {
  const [customer] = buildCustomers(
    [], [], [invoice({ kind: "quote", totalPence: 500000 })], [],
  );
  assert.equal(customer.spentPence, 0);
  assert.equal(customer.owedPence, 0);
});

test("a cancelled invoice owes nothing and paid nothing", () => {
  const [customer] = buildCustomers(
    [], [], [], [invoice({ status: "cancelled", totalPence: 90000, balancePence: 90000 })],
  );
  assert.equal(customer.spentPence, 0);
  assert.equal(customer.owedPence, 0);
});

test("only finished jobs count as jobs done", () => {
  const [customer] = buildCustomers(
    [],
    [booking({ id: 1, status: "done" }), booking({ id: 2, status: "booked" }),
     booking({ id: 3, status: "cancelled" })],
    [], [],
  );
  assert.equal(customer.jobs, 1);
});

test("contact details are gathered from wherever they appear", () => {
  const [customer] = buildCustomers(
    [lead({ email: "j@example.co.uk" })],
    [booking({ phone: "07700 900123" })],
    [], [],
  );
  assert.deepEqual(customer.emails, ["j@example.co.uk"]);
  assert.deepEqual(customer.phones, ["07700 900123"]);
});

test("the same email written two ways is not listed twice", () => {
  const [customer] = buildCustomers(
    [lead({ id: 1, email: "J@Example.co.uk" }), lead({ id: 2, email: "j@example.co.uk" })],
    [], [], [],
  );
  assert.equal(customer.emails.length, 1);
});

test("the newest thing is first, and people are ordered by it", () => {
  const old = lead({ id: 1, name: "A Early", createdAt: "2026-01-01 09:00:00" });
  const recent = lead({ id: 2, name: "B Later", createdAt: "2026-11-18 09:00:00" });
  const people = buildCustomers([old, recent], [], [], []);
  assert.deepEqual(people.map((p) => p.name), ["B Later", "A Early"]);
  assert.equal(people[0].lastOn, "2026-11-18");
});

test("somebody with no name at all does not become a blank record", () => {
  assert.equal(buildCustomers([lead({ name: "" })], [], [], []).length, 0);
  assert.equal(buildCustomers([], [], [], [invoice({ customerName: "   " })]).length, 0);
});
