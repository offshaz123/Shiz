import test from "node:test";
import assert from "node:assert/strict";
import { workDay } from "../src/lib/work-day.ts";

const sitting = (startedAt: string, endedAt: string | null, open = false) => ({
  startedAt,
  endedAt,
  lastSeenAt: endedAt ?? startedAt,
  endedReason: endedAt ? "left" : "",
  open,
});

const did = (at: string, action = "logged-call") => ({ at, action, subject: "A Business", detail: "" });

test("a quiet day shows the whole stretch as quiet", () => {
  const day = workDay(
    "2026-11-24",
    [sitting("2026-11-24 09:00:00", "2026-11-24 12:00:00")],
    [],
  );
  assert.equal(day.from, "09:00");
  assert.equal(day.to, "12:00");
  assert.equal(day.span, 180);
  assert.equal(day.actions, 0);
  assert.equal(day.quiet.length, 1);
  assert.equal(day.quiet[0].minutes, 180);
});

test("short gaps between calls are not reported", () => {
  const day = workDay(
    "2026-11-24",
    [sitting("2026-11-24 09:00:00", "2026-11-24 09:30:00")],
    [did("2026-11-24 09:05:00"), did("2026-11-24 09:12:00"), did("2026-11-24 09:29:00")],
  );
  assert.equal(day.actions, 3);
  assert.deepEqual(day.quiet, []);
});

test("an hour with nothing in it is reported with both ends", () => {
  const day = workDay(
    "2026-11-24",
    [sitting("2026-11-24 09:00:00", "2026-11-24 12:00:00")],
    [did("2026-11-24 09:05:00"), did("2026-11-24 10:30:00"), did("2026-11-24 11:58:00")],
  );
  assert.equal(day.quiet.length, 2);
  assert.equal(day.quiet[0].from, "10:30");
  assert.equal(day.quiet[0].to, "11:58");
  assert.equal(day.quiet[0].minutes, 88);
  assert.equal(day.quiet[1].minutes, 85);
});

test("another day's work is left out", () => {
  const day = workDay(
    "2026-11-24",
    [sitting("2026-11-24 09:00:00", "2026-11-24 10:00:00"), sitting("2026-11-23 09:00:00", "2026-11-23 17:00:00")],
    [did("2026-11-23 14:00:00"), did("2026-11-24 09:30:00")],
  );
  assert.equal(day.actions, 1);
  assert.equal(day.from, "09:00");
  assert.equal(day.to, "10:00");
});

test("a sitting still open says so rather than inventing an end", () => {
  const day = workDay(
    "2026-11-24",
    [sitting("2026-11-24 09:00:00", null, true)],
    [did("2026-11-24 09:10:00")],
  );
  assert.equal(day.line.at(-1)?.kind, "still-in");
});

test("two sittings in a day are both on the line", () => {
  const day = workDay(
    "2026-11-24",
    [
      sitting("2026-11-24 09:00:00", "2026-11-24 10:00:00"),
      sitting("2026-11-24 14:00:00", "2026-11-24 15:00:00"),
    ],
    [did("2026-11-24 09:05:00"), did("2026-11-24 14:05:00")],
  );
  assert.equal(day.line.filter((s) => s.kind === "signed-in").length, 2);
  assert.equal(day.span, 360);
});
