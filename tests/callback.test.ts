import test from "node:test";
import assert from "node:assert/strict";
import { callbackProblem, callbackValue } from "../src/lib/callback.ts";

const now = new Date("2026-11-24T12:00:00");

test("only the call-back outcome needs one", () => {
  assert.equal(callbackProblem("spoke", { date: "", time: "" }, now), null);
  assert.equal(callbackProblem("no-answer", { date: "", time: "" }, now), null);
});

test("a call-back with no day is refused", () => {
  assert.match(callbackProblem("call-back", { date: "", time: "" }, now) ?? "", /day/i);
});

test("a day with no time is refused", () => {
  assert.match(
    callbackProblem("call-back", { date: "2026-11-25", time: "" }, now) ?? "",
    /time/i,
  );
});

test("a callback in the past is refused", () => {
  assert.match(
    callbackProblem("call-back", { date: "2026-11-23", time: "09:30" }, now) ?? "",
    /past/i,
  );
});

test("later today is fine", () => {
  assert.equal(callbackProblem("call-back", { date: "2026-11-24", time: "16:00" }, now), null);
});

test("a real callback is accepted and stored with its time", () => {
  assert.equal(callbackProblem("call-back", { date: "2026-11-25", time: "09:30" }, now), null);
  assert.equal(callbackValue({ date: "2026-11-25", time: "09:30" }), "2026-11-25 09:30:00");
});

test("a day with no time stored anyway lands at nine", () => {
  assert.equal(callbackValue({ date: "2026-11-25", time: "" }), "2026-11-25 09:00:00");
});
