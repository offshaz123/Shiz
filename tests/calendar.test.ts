import { test } from "node:test";
import assert from "node:assert/strict";
import {
  byDay,
  callsLeftWords,
  dayLabel,
  dueNow,
  leftToday,
  monthName,
  monthOf,
  onDay,
  shiftMonth,
  weeksOf,
  type DiaryItem,
} from "../src/lib/calendar.ts";
import type { Whose } from "../src/lib/team-calendar.ts";

/**
 * The month grid and the counting behind the diary.
 *
 * Worth testing because every bug in this kind of code is a bug that
 * puts a promise on the wrong day, and a diary that is a day out is
 * worse than no diary: somebody rings on Wednesday a man who asked for
 * Tuesday, and the only evidence is his tone of voice.
 */

const item = (over: Partial<DiaryItem>): DiaryItem => ({
  id: "c1",
  kind: "call-back",
  day: "2026-11-25",
  time: "09:30",
  title: "Barton Tyres",
  detail: "",
  who: "Ali",
  staffId: 2,
  href: "/admin/prospects/1",
  ...over,
});

test("a month is whole weeks, Monday first, and always starts on a Monday", () => {
  for (const month of ["2026-01", "2026-02", "2026-11", "2027-02", "2024-02"]) {
    const weeks = weeksOf(month);
    for (const week of weeks) assert.equal(week.length, 7);
    const first = new Date(`${weeks[0][0]}T12:00:00Z`);
    assert.equal(first.getUTCDay(), 1, `${month} should start on a Monday`);
  }
});

test("the month's own days are all there, exactly once", () => {
  const days = weeksOf("2026-11").flat().filter((d) => d.startsWith("2026-11"));
  assert.equal(days.length, 30);
  assert.equal(new Set(days).size, 30);
  assert.equal(days[0], "2026-11-01");
  assert.equal(days[29], "2026-11-30");
});

test("February in a leap year has its twenty-ninth", () => {
  const days = weeksOf("2024-02").flat().filter((d) => d.startsWith("2024-02"));
  assert.equal(days.length, 29);
  assert.ok(days.includes("2024-02-29"));
});

test("stepping over a year end goes to the right month", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-11", 0), "2026-11");
  assert.equal(shiftMonth("2026-03", -4), "2025-11");
});

test("months read as a person would say them", () => {
  assert.equal(monthName("2026-11"), "November 2026");
  assert.equal(monthOf("2026-11-25"), "2026-11");
});

test("a day's entries come out in time order, with the untimed ones last", () => {
  const all = [
    item({ id: "a", time: "14:00" }),
    item({ id: "b", time: "" , kind: "invoice", title: "Acme" }),
    item({ id: "c", time: "09:30" }),
  ];
  assert.deepEqual(onDay(all, "2026-11-25").map((i) => i.id), ["c", "a", "b"]);
});

test("entries from other days are left out", () => {
  const all = [item({ id: "a" }), item({ id: "b", day: "2026-11-26" })];
  assert.deepEqual(onDay(all, "2026-11-25").map((i) => i.id), ["a"]);
  const grouped = byDay(all);
  assert.equal(grouped.get("2026-11-25")?.length, 1);
  assert.equal(grouped.get("2026-11-26")?.length, 1);
});

test("due now means the time has come, not that the day has", () => {
  const all = [item({ id: "morning", time: "09:30" }), item({ id: "later", time: "16:00" })];
  assert.deepEqual(dueNow(all, "2026-11-25 10:00").map((i) => i.id), ["morning"]);
});

test("something missed yesterday is still due today", () => {
  const all = [item({ id: "missed", day: "2026-11-24", time: "09:30" })];
  assert.deepEqual(dueNow(all, "2026-11-25 10:00").map((i) => i.id), ["missed"]);
});

test("nothing from tomorrow is ever due", () => {
  const all = [item({ id: "tomorrow", day: "2026-11-26", time: "08:00" })];
  assert.deepEqual(dueNow(all, "2026-11-25 23:58"), []);
});

test("the oldest thing owed is at the top", () => {
  const all = [
    item({ id: "today", day: "2026-11-25", time: "09:00" }),
    item({ id: "tuesday", day: "2026-11-24", time: "16:00" }),
  ];
  assert.deepEqual(dueNow(all, "2026-11-25 10:00").map((i) => i.id), ["tuesday", "today"]);
});

test("what is left today counts forward, not back", () => {
  const all = [
    item({ id: "done", time: "09:30" }),
    item({ id: "next", time: "14:00" }),
    item({ id: "last", time: "16:30" }),
    item({ id: "tomorrow", day: "2026-11-26", time: "09:00" }),
  ];
  const left = leftToday(all, "2026-11-25 10:00");
  assert.deepEqual(left.map((i) => i.id), ["next", "last"]);
  assert.equal(callsLeftWords(left.length), "2 calls left today");
});

test("an untimed thing today counts until the day is out", () => {
  const all = [item({ id: "invoice", kind: "invoice", time: "" })];
  assert.equal(leftToday(all, "2026-11-25 10:00").length, 1);
  assert.equal(leftToday(all, "2026-11-25 23:59").length, 0);
});

test("the count reads as a sentence, including when there is nothing", () => {
  assert.equal(callsLeftWords(0), "Nothing else booked today");
  assert.equal(callsLeftWords(1), "1 call left today");
  assert.equal(callsLeftWords(5), "5 calls left today");
});

test("days are named the way somebody would say them out loud", () => {
  assert.equal(dayLabel("2026-11-25", "2026-11-25"), "Today");
  assert.equal(dayLabel("2026-11-26", "2026-11-25"), "Tomorrow");
  assert.equal(dayLabel("2026-11-24", "2026-11-25"), "Yesterday");
  assert.equal(dayLabel("2026-11-27", "2026-11-25"), "Fri 27 Nov");
});

/**
 * Whose diary it is.
 *
 * This has been the same bug twice. Both the call write-up prompt and
 * the reminder band keyed "whose" on a nullable staff id where null
 * meant everybody, and the owner's id is null, so asking for the
 * owner's own work asked for the whole team's. Walid was stopped on
 * every page and told to ring a business Ali had promised to ring.
 *
 * teamDiary needs a database, so what is pinned here is the shape that
 * made it impossible: everybody and one person are now two different
 * things rather than one value with a special case.
 */
test("everybody and one person cannot be confused for each other", () => {
  const everybody: Whose = { everybody: true };
  const theOwner: Whose = { staffId: null };
  const ali: Whose = { staffId: 2 };

  assert.ok("everybody" in everybody);
  // The owner's own diary. The old shape could not say this at all:
  // null was the owner and null was also the whole team.
  assert.ok(!("everybody" in theOwner));
  assert.equal(theOwner.staffId, null);
  assert.ok(!("everybody" in ali));
  assert.equal(ali.staffId, 2);
});

test("the owner's own diary is not the same request as the team's", () => {
  const mine: Whose = { staffId: null };
  const all: Whose = { everybody: true };
  assert.notDeepEqual(mine, all);
});
