import { test } from "node:test";
import assert from "node:assert/strict";
import { newPerRun } from "../src/lib/outreach-warm-up.ts";

/**
 * The warm-up ramp on automated first emails.
 *
 * Worth testing because it is the only thing standing between "the first
 * email sends itself" and a day where the site writes to everybody at once
 * from the same domain that sends the client work. A mistake here is not
 * visible from the admin page and is not reversible once the mail has gone.
 */

test("a domain with no sending history starts at the bottom of the ramp", () => {
  assert.equal(newPerRun(0), 8);
});

test("the ramp does not open up until enough have been sent", () => {
  assert.equal(newPerRun(39), 8);
  assert.equal(newPerRun(40), 20);
  assert.equal(newPerRun(199), 20);
  assert.equal(newPerRun(200), 40);
});

/**
 * The tier that matters now is twenty, because twenty is a batch.
 *
 * The ramp used to sit at twelve between forty and a hundred and twenty
 * first emails, which made the real ceiling twelve a run — less than the
 * batch size the whole schedule is built around, so the batches could
 * never actually fill. A domain that has sent forty is not cold.
 */
test("a domain past its cold start can send a whole batch", () => {
  assert.equal(newPerRun(40), 20);
});

test("the ramp has a ceiling and never climbs past it", () => {
  assert.equal(newPerRun(1_000), 40);
  assert.equal(newPerRun(1_000_000), 40);
});

/**
 * A negative count should never happen, but if a count ever came back odd
 * the safe reading is "no history", not "unlimited".
 */
test("a nonsense count falls back to the slowest tier", () => {
  assert.equal(newPerRun(-5), 8);
});
