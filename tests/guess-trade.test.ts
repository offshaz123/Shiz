import { test } from "node:test";
import assert from "node:assert/strict";
import { guessTrade } from "../src/lib/guess-trade.ts";

/**
 * Reading a business's own website to work out what it does.
 *
 * Worth testing because a wrong guess is worse than no guess: it hands
 * somebody a page of confident advice about a trade that is not theirs,
 * which reads as the system not knowing who they are.
 */

test("a plate dealer is recognised, not filed as a garage", () => {
  const guess = guessTrade(`
    PlatedUp — private plates and personalised registrations.
    Browse our cherished registrations. We handle the DVLA retention and
    the reg transfer for you. Show plates and road legal 4D plates made
    to order.
  `);
  assert.equal(guess.trade, "number-plates");
});

test("a garage is a garage", () => {
  const guess = guessTrade(`
    Barton Works garage. MOT, servicing and repairs, alloy refurb and
    ceramic coating. Book your car in today.
  `);
  assert.equal(guess.trade, "automotive");
});

test("the strong words carry it even when the weak ones point elsewhere", () => {
  // "car", "van" and "vehicle" all appear, but this is a plate seller.
  const guess = guessTrade(`
    Put a private plate on your car or van. Personalised number plate
    for any vehicle. Reg transfer handled. DVLA retention included.
  `);
  assert.equal(guess.trade, "number-plates");
});

test("a plumber is not mistaken for anything else", () => {
  const guess = guessTrade(`
    Gas Safe registered plumber. Boiler install, bathroom fitting and
    emergency callouts across Manchester.
  `);
  assert.equal(guess.trade, "home-trades");
});

test("a restaurant is recognised from how it sells, not from the word food", () => {
  const guess = guessTrade("Book a table. Our menu changes weekly. Set menu and bottomless brunch.");
  assert.equal(guess.trade, "hospitality");
});

test("a page that gives nothing away stays general", () => {
  const guess = guessTrade("Welcome to our website. We are a family run business. Contact us.");
  assert.equal(guess.trade, "general");
});

test("an empty page is not a guess", () => {
  assert.equal(guessTrade("").trade, "general");
  assert.equal(guessTrade("    ").trade, "general");
});

test("two trades neck and neck is no answer rather than a coin toss", () => {
  // A gym with a cafe in it. Both are real; picking one would be wrong.
  const guess = guessTrade("Personal training and class timetable. Book a table in our cafe, see our menu.");
  assert.equal(guess.trade, "general");
});

test("it says which words decided it", () => {
  const guess = guessTrade("MOT, car detailing and window tinting in Manchester.");
  assert.equal(guess.trade, "automotive");
  assert.ok(guess.because.length > 0);
  assert.ok(guess.because.every((word) => word.length > 0));
});

test("a word repeated on every page does not win by itself", () => {
  // "car" in a nav bar on twenty pages scores once, not twenty times.
  const navEverywhere = "car ".repeat(50);
  assert.equal(guessTrade(navEverywhere).trade, "general");
});
