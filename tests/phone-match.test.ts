import { test } from "node:test";
import assert from "node:assert/strict";
import { findByPhone, phoneKey, samePhone } from "../src/lib/phone-match.ts";

/**
 * The hinge the whole call integration turns on. When the phone system
 * says a call ended, the only thing tying it to a business is the number
 * that was dialled, and the two are never written the same way.
 */

test("the same UK number written every way people write it", () => {
  const forms = [
    "020 8595 9751",
    "0208 595 9751",
    "+44 20 8595 9751",
    "+442085959751",
    "442085959751",
    "(020) 8595-9751",
    "tel:+44-20-8595-9751",
  ];
  for (const form of forms) {
    assert.ok(samePhone(form, "020 8595 9751"), `${form} should match`);
  }
});

test("a US number with and without its country code", () => {
  assert.ok(samePhone("+1 281 555 0142", "(281) 555-0142"));
  assert.ok(samePhone("12815550142", "281 555 0142"));
});

test("two different businesses never match", () => {
  assert.ok(!samePhone("020 8595 9751", "020 8595 9752"));
  assert.ok(!samePhone("0161 123 4567", "020 8595 9751"));
  // Different area, same last digits after the code — the nine-digit
  // window is what stops these two being treated as one shop.
  assert.ok(!samePhone("0161 496 0000", "0208 496 0000"));
});

test("anything too short to be sure about is not a match", () => {
  // A wrong match files a call against a business that was never rung,
  // which is a lie in the record. A gap is better than a lie.
  assert.ok(!samePhone("12345", "12345"));
  assert.ok(!samePhone("", ""));
  assert.ok(!samePhone("999", "999"));
  assert.equal(phoneKey("0800 1111"), "");
});

test("one match is used and an ambiguous one is not", () => {
  const rows = [
    { id: 1, phone: "020 8595 9751" },
    { id: 2, phone: "0161 123 4567" },
  ];
  assert.equal(findByPhone(rows, "+442085959751")?.id, 1);
  assert.equal(findByPhone(rows, "+441619999999"), null);

  // Two businesses on one number is real — an office answering for both.
  // Picking one at random would file the call against a business nobody
  // rang, so neither is picked.
  const shared = [
    { id: 1, phone: "020 8595 9751" },
    { id: 2, phone: "+44 20 8595 9751" },
  ];
  assert.equal(findByPhone(shared, "02085959751"), null);
});
