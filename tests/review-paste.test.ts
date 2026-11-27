import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePastedReviews, readRating } from "../src/lib/review-paste.ts";

/**
 * Reading a block of real reviews.
 *
 * These are real customers and the words are theirs, so the one thing
 * this must never do is guess. A line it cannot read comes back as a
 * problem with its line number; it is never dropped silently and never
 * filled in with something plausible.
 */

test("a plain pipe-separated block reads", () => {
  const { reviews, problems } = parsePastedReviews(
    `Dave Smith | 5 | They rebuilt our site in a week and the phone started going.
Jo Patel | 4 | Good work, a bit slow to get started.`,
  );
  assert.equal(problems.length, 0);
  assert.deepEqual(reviews, [
    { name: "Dave Smith", business: null, rating: 5, body: "They rebuilt our site in a week and the phone started going." },
    { name: "Jo Patel", business: null, rating: 4, body: "Good work, a bit slow to get started." },
  ]);
});

test("a business name in brackets or after a comma is picked up", () => {
  const { reviews } = parsePastedReviews(
    `Dave Smith (Smith Plumbing) | 5 | Spot on.
Jo Patel, Patel Tiling | 4 | Happy with it.`,
  );
  assert.deepEqual(
    reviews.map((r) => [r.name, r.business]),
    [
      ["Dave Smith", "Smith Plumbing"],
      ["Jo Patel", "Patel Tiling"],
    ],
  );
});

test("tabs and runs of spaces work, because that is what a spreadsheet pastes", () => {
  const tabbed = parsePastedReviews("Dave Smith\t5\tVery good indeed.");
  assert.equal(tabbed.reviews.length, 1);
  assert.equal(tabbed.reviews[0].body, "Very good indeed.");

  const spaced = parsePastedReviews("Dave Smith    5    Very good indeed.");
  assert.equal(spaced.reviews.length, 1);
  assert.equal(spaced.reviews[0].rating, 5);
});

test("stars are a rating, written any of the ways people write them", () => {
  assert.equal(readRating("★★★★★"), 5);
  assert.equal(readRating("★★★☆☆"), 3);
  assert.equal(readRating("*****"), 5);
  assert.equal(readRating("5"), 5);
  assert.equal(readRating("5/5"), 5);
  assert.equal(readRating("4 stars"), 4);
  assert.equal(readRating("4.5"), 5);
});

test("a rating that is not a rating is refused, not rounded into one", () => {
  assert.equal(readRating(""), 0);
  assert.equal(readRating("great"), 0);
  assert.equal(readRating("9"), 0);
  assert.equal(readRating("0"), 0);
});

/**
 * The important half. A line that cannot be read is handed back, with
 * its number, so it can be fixed — rather than dropped, which would
 * lose a real customer's words without anybody noticing.
 */
test("a line missing its rating comes back as a problem, with its line number", () => {
  const { reviews, problems } = parsePastedReviews(
    `Dave Smith | 5 | Spot on.
Jo Patel | brilliant | Happy with it.
Sam Lee | 4 | Did what they said.`,
  );
  assert.equal(reviews.length, 2);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].line, 2);
  assert.match(problems[0].why, /not a rating/);
});

test("a line with too few parts is a problem, not a half-built review", () => {
  const { reviews, problems } = parsePastedReviews("Dave Smith | 5");
  assert.equal(reviews.length, 0);
  assert.equal(problems[0].line, 1);
  assert.match(problems[0].why, /three parts/);
});

test("an empty review body is refused", () => {
  const { reviews, problems } = parsePastedReviews("Dave Smith | 5 |   ");
  assert.equal(reviews.length, 0);
  assert.equal(problems.length, 1);
});

test("blank lines are skipped rather than reported", () => {
  const { reviews, problems } = parsePastedReviews(
    `Dave Smith | 5 | Spot on.

Jo Patel | 4 | Good.
`,
  );
  assert.equal(reviews.length, 2);
  assert.equal(problems.length, 0);
});

test("a pipe inside somebody's sentence does not cut the review in half", () => {
  const { reviews } = parsePastedReviews("Dave Smith | 5 | Fast | tidy | would use again");
  assert.equal(reviews[0].body, "Fast | tidy | would use again");
});

test("names and businesses are cut to what the database columns hold", () => {
  const long = "A".repeat(300);
  const { reviews } = parsePastedReviews(`${long} (${long}) | 5 | Good.`);
  assert.ok(reviews[0].name.length <= 120);
  assert.ok((reviews[0].business ?? "").length <= 160);
});

test("nothing in, nothing out — and no complaint about it", () => {
  const { reviews, problems } = parsePastedReviews("   \n\n  ");
  assert.equal(reviews.length, 0);
  assert.equal(problems.length, 0);
});
