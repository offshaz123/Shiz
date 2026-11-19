import { test } from "node:test";
import assert from "node:assert/strict";
import { TRADES, asTrade, ideasFor } from "../src/lib/marketing-ideas.ts";

/**
 * The ideas a client is shown.
 *
 * Worth testing for two reasons, and neither is the wording. One: this
 * is an agency giving advice, so a page where half the suggestions are
 * "pay us" is a brochure, and that is a line worth being unable to cross
 * by accident. Two: not one of these may carry a claimed result, because
 * the first client who asks where a percentage came from stops believing
 * the rest of the site.
 */

const DAY = new Date("2026-11-19T12:00:00");

test("a business is shown its own trade before the general ones", () => {
  const ideas = ideasFor("automotive", DAY);
  assert.equal(ideas[0].trade, "automotive");
});

test("a business with no trade set still gets a full page", () => {
  const ideas = ideasFor("general", DAY);
  assert.equal(ideas.length, 5);
  assert.ok(ideas.every((idea) => idea.trade === "general"));
});

test("every trade gets a full page of ideas", () => {
  for (const trade of TRADES) {
    assert.equal(ideasFor(trade, DAY).length, 5, trade);
  }
});

test("only ever one of them is asking them to pay us", () => {
  for (const trade of TRADES) {
    const paid = ideasFor(trade, DAY).filter((idea) => idea.cost === "ask-us");
    assert.equal(paid.length, 1, trade);
  }
});

test("the paid one is never first and never last", () => {
  for (const trade of TRADES) {
    const ideas = ideasFor(trade, DAY);
    const at = ideas.findIndex((idea) => idea.cost === "ask-us");
    assert.ok(at > 0 && at < ideas.length - 1, `${trade}: at ${at}`);
  }
});

test("no idea claims a result, because nobody measured one", () => {
  for (const trade of TRADES) {
    for (const idea of ideasFor(trade, DAY)) {
      const text = `${idea.title} ${idea.body}`;
      assert.doesNotMatch(text, /\d+\s?%/, idea.id);
      assert.doesNotMatch(text, /\b\d+x\b/i, idea.id);
      assert.doesNotMatch(text, /guarantee/i, idea.id);
    }
  }
});

test("the same day gives the same page twice", () => {
  const first = ideasFor("home-trades", DAY).map((i) => i.id);
  const again = ideasFor("home-trades", new Date("2026-11-19T21:30:00")).map((i) => i.id);
  assert.deepEqual(first, again);
});

test("a different day moves it on", () => {
  const today = ideasFor("general", DAY).map((i) => i.id);
  const tomorrow = ideasFor("general", new Date("2026-11-20T12:00:00")).map((i) => i.id);
  assert.notDeepEqual(today, tomorrow);
});

test("nothing is shown twice on the same page", () => {
  for (const trade of TRADES) {
    const ids = ideasFor(trade, DAY).map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length, trade);
  }
});

test("an unknown trade falls back rather than failing", () => {
  assert.equal(asTrade("fishmonger"), "general");
  assert.equal(asTrade(""), "general");
  assert.equal(asTrade("automotive"), "automotive");
});

test("no idea asserts a comparison it cannot back", () => {
  // "beats any advert", "the most watched thing", "more than". Advice is
  // allowed to reason; it is not allowed to rank things nobody measured.
  const banned = /\b(beats|most watched|best performing|more than any|outperform)\b/i;
  for (const trade of TRADES) {
    for (const idea of ideasFor(trade, DAY)) {
      assert.doesNotMatch(`${idea.title} ${idea.body}`, banned, idea.id);
    }
  }
});
