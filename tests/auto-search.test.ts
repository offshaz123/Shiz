import { test } from "node:test";
import assert from "node:assert/strict";
import { ANCHOR_DAY, dayIndex, industryForDay, searchesForDay } from "../src/lib/auto-search.ts";

/**
 * The rotation that decides what gets found.
 *
 * Worth testing because it runs unattended for weeks and a mistake is
 * expensive in a quiet way: a rotation that sticks on one town spends the
 * Places allowance re-finding businesses already on the list, and one that
 * sticks on one industry never reaches the other seven. Neither looks like
 * a failure from the admin page, which would just show a list that stopped
 * growing.
 */

test("the first industry of the cycle is automotive, as instructed", () => {
  // Anchored to a date rather than to the epoch, so this is the real
  // first live day and not an arbitrary one.
  assert.equal(industryForDay(ANCHOR_DAY), "automotive");
  assert.equal(industryForDay(ANCHOR_DAY + 8), "automotive");
  assert.equal(industryForDay(ANCHOR_DAY + 16), "automotive");
});

test("consecutive days are different industries", () => {
  const week = [0, 1, 2, 3, 4, 5, 6, 7].map((d) => industryForDay(ANCHOR_DAY + d));
  assert.equal(new Set(week).size, 8, "a full pass should touch eight industries");
});

test("every search on a given day sits inside one industry", () => {
  for (const day of [0, 1, 5, 40, 123].map((d) => ANCHOR_DAY + d)) {
    const searches = searchesForDay(day);
    assert.ok(searches.length > 0, `day ${day} produced no searches`);
    const industries = new Set(searches.map((s) => s.industry));
    assert.equal(industries.size, 1, `day ${day} mixed industries`);
    assert.equal([...industries][0], industryForDay(day));
  }
});

test("a day does not search the same trade and town twice", () => {
  const searches = searchesForDay(ANCHOR_DAY);
  assert.equal(new Set(searches.map((s) => s.query)).size, searches.length);
});

test("the next pass through an industry looks somewhere new", () => {
  // Day 0 and day 8 are both automotive. They must not be the same searches,
  // or the rotation re-finds the same businesses forever.
  const first = searchesForDay(ANCHOR_DAY).map((s) => s.query);
  const second = searchesForDay(ANCHOR_DAY + 8).map((s) => s.query);
  assert.notDeepEqual(first, second);
});

test("queries are shaped the way the search form builds them", () => {
  for (const s of searchesForDay(ANCHOR_DAY + 3)) {
    assert.match(s.query, / in /, `"${s.query}" is not "<trade> in <town>"`);
    assert.ok(s.town.length > 0);
    assert.ok(s.query.endsWith(s.town), `"${s.query}" should end with its town`);
  }
});

test("asking for more searches than exist does not loop forever", () => {
  const huge = searchesForDay(ANCHOR_DAY, 100_000);
  assert.ok(huge.length > 0 && huge.length <= 100_000);
});

test("the day index advances by one per day", () => {
  const a = dayIndex(new Date("2026-11-17T09:00:00Z"));
  const b = dayIndex(new Date("2026-11-18T09:00:00Z"));
  assert.equal(b - a, 1);
});

test("an offset moves the slice, so a second run today finds new ground", () => {
  const first = searchesForDay(ANCHOR_DAY, 6, 0).map((s) => s.query);
  const second = searchesForDay(ANCHOR_DAY, 6, 6).map((s) => s.query);
  assert.equal(new Set([...first, ...second]).size, 12, "the two slices overlapped");
});

test("an offset past the end of the list wraps rather than returning nothing", () => {
  const out = searchesForDay(ANCHOR_DAY, 5, 10_000);
  assert.equal(out.length, 5);
});
