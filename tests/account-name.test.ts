import { test } from "node:test";
import assert from "node:assert/strict";
import {
  looksLikeEmail,
  normaliseAccountName,
  squashAccountName,
} from "../src/lib/account-name.ts";

/**
 * What somebody types into the account box, and what we stored.
 *
 * Worth testing because it is on the login path and its failure is the
 * cruel one: a client typing the right thing, being told it is wrong, and
 * having no way to find out which of the two of us is at fault. Walid hit
 * exactly that — one spelling worked and another did not — and neither of
 * us could see why from the outside.
 */

test("the same name typed any way folds to the one we store", () => {
  for (const typed of ["plated-up", "Plated Up", "PLATED UP", " plated_up ", "Plated-Up"]) {
    assert.equal(normaliseAccountName(typed), "plated-up", typed);
  }
});

test("a name with the hyphen left out still finds the stored one", () => {
  assert.equal(squashAccountName("platedup"), squashAccountName("plated-up"));
  assert.equal(squashAccountName("PlatedUp"), squashAccountName("plated-up"));
});

test("punctuation goes the same way on both sides", () => {
  // createClient runs a business name through this to make the account
  // name, and the login box runs what was typed through the same one. The
  // property that matters is only that they agree.
  assert.equal(normaliseAccountName("Smith & Sons"), "smith-sons");
  assert.equal(normaliseAccountName("O'Brien's Garage"), "o-brien-s-garage");
  assert.equal(normaliseAccountName("--odd--"), "odd");
});

test("two different businesses do not collide", () => {
  assert.notEqual(normaliseAccountName("Plated Up"), normaliseAccountName("Plated Up Two"));
});

test("an email is told apart from an account name", () => {
  assert.equal(looksLikeEmail("hello@platedup.co.uk"), true);
  assert.equal(looksLikeEmail("plated-up"), false);
  assert.equal(looksLikeEmail("@platedup"), false);
});

test("nothing typed is never a valid name", () => {
  assert.equal(normaliseAccountName("   "), "");
  assert.equal(normaliseAccountName("---"), "");
});
