import { test } from "node:test";
import assert from "node:assert/strict";
import { pounds, totals } from "../src/lib/invoice-maths.ts";

/**
 * The sums on a document that asks somebody for money.
 *
 * Worth testing because it is the one place a rounding error is read by a
 * stranger and taken as carelessness, and because the same arithmetic runs
 * in three places — the builder in the browser, the page on the server and
 * the email — so a drift between them would show as an invoice whose total
 * does not match the invoice the customer was sent.
 */

const line = (quantity: number, unitPence: number) => ({
  id: 0,
  description: "x",
  quantity,
  unitPence,
});

test("the total is the lines added up, as they are printed", () => {
  // 3 x £19.99 is £59.97, not £59.96 or £59.9700000001.
  const sums = totals([line(3, 1999)], 0);
  assert.equal(sums.subtotalPence, 5997);
  assert.equal(sums.totalPence, 5997);
});

test("each line rounds before anything is added", () => {
  // Three lines that each come to a third of a penny must not quietly
  // add up to a penny that appears on no line.
  const sums = totals([line(0.5, 1), line(0.5, 1), line(0.5, 1)], 0);
  assert.equal(sums.subtotalPence, 3);
});

test("VAT is worked out on the subtotal and rounded once", () => {
  const sums = totals([line(1, 10000)], 20);
  assert.equal(sums.vatPence, 2000);
  assert.equal(sums.totalPence, 12000);
});

test("no VAT registration means nothing is added", () => {
  const sums = totals([line(2, 45050)], 0);
  assert.equal(sums.vatPence, 0);
  assert.equal(sums.totalPence, 90100);
});

test("an empty invoice is zero rather than a crash", () => {
  assert.deepEqual(totals([], 20), {
    subtotalPence: 0,
    discountPence: 0,
    afterDiscountPence: 0,
    vatPence: 0,
    totalPence: 0,
  });
});

test("pence always print, and thousands are grouped", () => {
  assert.equal(pounds(0), "£0.00");
  assert.equal(pounds(5), "£0.05");
  assert.equal(pounds(325000), "£3,250.00");
});

test("a percentage discount comes off before VAT", () => {
  // £100 less 10% is £90; VAT at 20% is £18; £108 due. Taking the
  // discount off after VAT would charge tax on money nobody paid.
  const sums = totals([line(1, 10000)], 20, { kind: "percent", percent: 10, pence: 0 });
  assert.equal(sums.discountPence, 1000);
  assert.equal(sums.vatPence, 1800);
  assert.equal(sums.totalPence, 10800);
});

test("a fixed discount comes off the same way", () => {
  const sums = totals([line(1, 10000)], 0, { kind: "fixed", percent: 0, pence: 2500 });
  assert.equal(sums.discountPence, 2500);
  assert.equal(sums.totalPence, 7500);
});

test("a discount bigger than the bill leaves nothing owed, not money back", () => {
  const sums = totals([line(1, 5000)], 20, { kind: "fixed", percent: 0, pence: 999999 });
  assert.equal(sums.discountPence, 5000);
  assert.equal(sums.totalPence, 0);
});

test("a percentage over a hundred is a typo, not a refund", () => {
  const sums = totals([line(1, 5000)], 0, { kind: "percent", percent: 150, pence: 0 });
  assert.equal(sums.totalPence, 0);
});

test("no discount changes nothing", () => {
  const sums = totals([line(2, 2500)], 20);
  assert.equal(sums.discountPence, 0);
  assert.equal(sums.totalPence, 6000);
});
