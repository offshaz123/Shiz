import { test } from "node:test";
import assert from "node:assert/strict";
import { spreadByIndustry } from "../src/lib/today.ts";

/**
 * How the day's cold calls are chosen.
 *
 * Worth testing because the input is heavily clustered by accident: one
 * search drops thirty businesses of the same trade into the list at once,
 * so taking the top fifteen by priority gives fifteen car detailers. This
 * is the only thing standing between that and a morning worth having, and
 * getting it wrong is invisible — the list still looks full.
 */

const rows = (spec: [string, number][]) =>
  spec.flatMap(([industry, n]) =>
    Array.from({ length: n }, (_, i) => ({ id: Number(`${spec.findIndex(s => s[0] === industry)}${i}`.padStart(2, "9")), industry })),
  );

test("one trade with plenty still fills the list", () => {
  const out = spreadByIndustry(rows([["automotive", 40]]), 15);
  assert.equal(out.length, 15);
});

test("trades are taken in turn rather than one trade at a time", () => {
  const input = [
    { id: 1, industry: "automotive" },
    { id: 2, industry: "automotive" },
    { id: 3, industry: "automotive" },
    { id: 4, industry: "hospitality" },
    { id: 5, industry: "gyms" },
  ];
  // First pass takes one of each before coming back for the second automotive.
  assert.deepEqual(spreadByIndustry(input, 5), [1, 4, 5, 2, 3]);
});

test("priority order is kept inside a trade", () => {
  const input = [
    { id: 10, industry: "a" },
    { id: 11, industry: "a" },
    { id: 20, industry: "b" },
  ];
  const out = spreadByIndustry(input, 3);
  assert.ok(out.indexOf(10) < out.indexOf(11));
});

test("it stops when the prospects run out instead of looping forever", () => {
  const out = spreadByIndustry([{ id: 1, industry: "a" }], 15);
  assert.deepEqual(out, [1]);
});

test("an empty list gives an empty day, not a hang", () => {
  assert.deepEqual(spreadByIndustry([], 15), []);
});

test("rows with no industry recorded are still rung", () => {
  const input = [
    { id: 1, industry: null },
    { id: 2, industry: "automotive" },
  ];
  assert.equal(spreadByIndustry(input, 5).length, 2);
});

test("never returns more than asked for", () => {
  const input = Array.from({ length: 50 }, (_, i) => ({ id: i, industry: `t${i % 7}` }));
  assert.equal(spreadByIndustry(input, 15).length, 15);
});
