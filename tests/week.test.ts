import { test } from "node:test";
import assert from "node:assert/strict";
import { DAY_MS, isoDay, minutesOf, weekLabel, weekStart } from "../src/lib/week.ts";

/**
 * Which seven days a week is.
 *
 * Worth testing because it is wrong for exactly one week in seven if the
 * Monday arithmetic is off by one, and because the day a job is filed
 * under has to be the day where the person stands rather than the day UTC
 * is having.
 */

test("every day of a week gives back the same Monday", () => {
  const mondays = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    mondays.add(isoDay(weekStart(new Date(2026, 10, 16 + i, 13, 45))));
  }
  assert.deepEqual([...mondays], ["2026-11-16"]);
});

test("a Sunday belongs to the week that started six days earlier", () => {
  assert.equal(isoDay(weekStart(new Date(2026, 10, 22))), "2026-11-16");
});

test("a Monday is its own week start", () => {
  assert.equal(isoDay(weekStart(new Date(2026, 10, 16))), "2026-11-16");
});

test("a day keeps its local date rather than drifting to UTC", () => {
  // Late evening is where a UTC conversion would roll the date forward.
  assert.equal(isoDay(new Date(2026, 0, 5, 23, 30)), "2026-01-05");
  assert.equal(isoDay(new Date(2026, 0, 5, 0, 15)), "2026-01-05");
});

test("a week that crosses a month says both months", () => {
  const label = weekLabel(weekStart(new Date(2026, 10, 30)));
  assert.match(label, /Nov/);
  assert.match(label, /Dec/);
});

test("a week inside one month says it once", () => {
  assert.equal(weekLabel(new Date(2026, 10, 16)), "16 – 22 Nov 2026");
});

test("seven days is what a week spans", () => {
  const start = weekStart(new Date(2026, 10, 18));
  const end = new Date(start.getTime() + 6 * DAY_MS);
  assert.equal(isoDay(end), "2026-11-22");
});

test("a time becomes minutes, and a blank one becomes nothing", () => {
  assert.equal(minutesOf("09:00"), 540);
  assert.equal(minutesOf("14:30"), 870);
  assert.equal(minutesOf("00:00"), 0);
  assert.equal(minutesOf(""), null);
  assert.equal(minutesOf("not a time"), null);
  assert.equal(minutesOf("99:99"), null);
});
