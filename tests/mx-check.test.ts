import { test } from "node:test";
import assert from "node:assert/strict";
import { domainAcceptsMail, domainOf } from "../src/lib/mx-check.ts";

/**
 * The guard that decides whether an address is worth sending to.
 *
 * Tested against the eight real addresses from the first automatic send,
 * where two bounced for having no mail server and six were delivered. That
 * set is the reason this file exists: the first implementation answered
 * "no mail server" for all eight, which would have stripped the address off
 * every prospect and emptied the email list without raising an error.
 *
 * These hit the network, which is unusual in this suite and deliberate: the
 * failure being guarded against was precisely a resolver that does not work
 * in the environment it runs in, and only a real lookup can catch that.
 */

test("an address is split from its domain, and nonsense is rejected", () => {
  assert.equal(domainOf("info@example.co.uk"), "example.co.uk");
  assert.equal(domainOf("INFO@Example.CO.UK"), "example.co.uk");
  assert.equal(domainOf("not-an-address"), "");
  assert.equal(domainOf("someone@localhost"), "", "a domain with no dot cannot receive mail");
});

test("domains that really bounced are rejected", async () => {
  // Both published an address on their own website; neither has an MX record.
  assert.equal(await domainAcceptsMail("info@refinedrides.com"), false);
  assert.equal(await domainAcceptsMail("info@ogcarworld.co.uk"), false);
});

test("domains that really delivered are kept", async () => {
  for (const address of [
    "info@tracgroup.co.uk",
    "mrcarzltd@hotmail.com",
    "sales@iautoworks.co.uk",
    "info@tenmods.com",
    "info@narcoworks.com",
    "sales@thamespc.co.uk",
  ]) {
    assert.equal(await domainAcceptsMail(address), true, `${address} should have been kept`);
  }
});

test("a domain that does not exist at all is rejected", async () => {
  assert.equal(
    await domainAcceptsMail("info@this-domain-should-not-exist-9f3a2b.co.uk"),
    false,
  );
});
