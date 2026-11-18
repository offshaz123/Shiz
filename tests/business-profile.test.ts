import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatAddress,
  formatBankDetails,
  tidyAccountNumber,
  tidyEmail,
  tidySortCode,
  tidyPostcode,
  tidyVatNumber,
  tidyWebsite,
} from "../src/lib/business-profile.ts";

/**
 * Making a casually typed business profile print properly.
 *
 * Worth testing because the output is a document a stranger reads and
 * judges the business by, and because the person typing it gets no second
 * look: they fill it in once and every invoice afterwards carries it.
 */

test("a postcode comes out right however it was typed", () => {
  for (const typed of ["m12 4wd", "M124WD", " m124wd ", "M12  4WD"]) {
    assert.equal(tidyPostcode(typed), "M12 4WD", typed);
  }
  assert.equal(tidyPostcode("dn551pt"), "DN55 1PT");
  assert.equal(tidyPostcode("ec1a 1bb"), "EC1A 1BB");
});

test("something that is not a UK postcode is left as it is, not mangled", () => {
  assert.equal(tidyPostcode("75008"), "75008");
  assert.equal(tidyPostcode(""), "");
});

test("a VAT number gets its GB and loses its spaces", () => {
  assert.equal(tidyVatNumber("123 456 789"), "GB123456789");
  assert.equal(tidyVatNumber("gb123456789"), "GB123456789");
  assert.equal(tidyVatNumber("123456789012"), "GB123456789012");
  assert.equal(tidyVatNumber(""), "");
});

test("another country's VAT number keeps its own prefix", () => {
  assert.equal(tidyVatNumber("IE1234567X"), "IE1234567X");
});

test("a website prints without the parts meant for a browser", () => {
  for (const typed of [
    "https://www.autowrap.co.uk/",
    "http://autowrap.co.uk",
    "WWW.AutoWrap.co.uk",
    "autowrap.co.uk",
  ]) {
    assert.equal(tidyWebsite(typed), "autowrap.co.uk", typed);
  }
});

test("an email is lower-cased and trimmed", () => {
  assert.equal(tidyEmail("  Hello@AutoWrap.CO.UK "), "hello@autowrap.co.uk");
});

test("an address has no blank lines in the middle of it", () => {
  assert.equal(
    formatAddress({
      line1: "Unit 4, Barton Works",
      line2: "",
      city: "Manchester",
      postcode: "m12 4wd",
      country: "",
    }),
    "Unit 4, Barton Works\nManchester\nM12 4WD",
  );
});

test("an empty address is empty rather than a stack of blank lines", () => {
  assert.equal(
    formatAddress({ line1: "", line2: "", city: "", postcode: "", country: "" }),
    "",
  );
});

test("a sort code comes out as it is written on a card", () => {
  for (const typed of ["123456", "12 34 56", "12-34-56", " 123456 "]) {
    assert.equal(tidySortCode(typed), "12-34-56", typed);
  }
});

test("something that is not six digits is not forced into a sort code", () => {
  assert.equal(tidySortCode("1234"), "1234");
  assert.equal(tidySortCode(""), "");
});

test("an account number loses its spaces and keeps its digits", () => {
  assert.equal(tidyAccountNumber("1234 5678"), "12345678");
  assert.equal(tidyAccountNumber("12345678"), "12345678");
});

test("how-to-pay is labelled so it can be typed into a banking app", () => {
  assert.equal(
    formatBankDetails({
      accountName: "Plated Up Ltd",
      sortCode: "123456",
      accountNumber: "1234 5678",
      note: "",
    }),
    "Account name: Plated Up Ltd\nSort code: 12-34-56\nAccount number: 12345678",
  );
});

test("a business that only takes card gets its sentence and no empty lines", () => {
  assert.equal(
    formatBankDetails({
      accountName: "",
      sortCode: "",
      accountNumber: "",
      note: "Card taken on the day.",
    }),
    "Card taken on the day.",
  );
});

test("nothing filled in is nothing printed", () => {
  assert.equal(
    formatBankDetails({ accountName: "", sortCode: "", accountNumber: "", note: "" }),
    "",
  );
});
