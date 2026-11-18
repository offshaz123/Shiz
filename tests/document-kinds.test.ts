import { test } from "node:test";
import assert from "node:assert/strict";
import { hasExpired, quoteState } from "../src/lib/document-kinds.ts";

/**
 * Whether a quote is still good.
 *
 * Worth testing because the answer changes on its own as a date passes,
 * which is exactly the kind of thing that is right the day it is written
 * and wrong a fortnight later.
 */

const NOW = new Date("2026-11-19T12:00:00");

test("a quote sent and still in date has not run out", () => {
  assert.equal(hasExpired("2026-12-03", "sent", NOW), false);
});

test("a quote is good until the end of the day it runs out", () => {
  assert.equal(hasExpired("2026-11-19", "sent", NOW), false);
  assert.equal(hasExpired("2026-11-18", "sent", NOW), true);
});

test("a quote with no date on it never runs out", () => {
  assert.equal(hasExpired("", "sent", NOW), false);
});

test("a draft cannot run out, because nobody has seen it", () => {
  assert.equal(hasExpired("2026-01-01", "draft", NOW), false);
});

test("accepted beats expired: a yes already given does not lapse", () => {
  assert.equal(quoteState("accepted", "2026-01-01", NOW), "accepted");
  assert.equal(quoteState("paid", "2026-01-01", NOW), "accepted");
});

test("a sent quote past its date reads as having run out", () => {
  assert.equal(quoteState("sent", "2026-11-01", NOW), "expired");
  assert.equal(quoteState("sent", "2026-12-01", NOW), "sent");
});

test("a cancelled quote reads as declined", () => {
  assert.equal(quoteState("cancelled", "2026-12-01", NOW), "declined");
});

test("anything unsent is a draft", () => {
  assert.equal(quoteState("draft", "", NOW), "draft");
});
