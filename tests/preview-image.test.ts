import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchable, signedByUs, throughUs } from "../src/lib/preview-image.ts";

/**
 * Serving their photographs through us.
 *
 * Needed because a good many hosts serve images only to pages on their
 * own domain and answer everybody else with 403. The rebuilt page then
 * shows a row of empty frames and looks like we built something broken.
 *
 * The risk this carries is the reason most of these tests exist. An
 * image proxy that anybody can aim is an open relay: it gets found, it
 * gets used to read things our server can reach and the internet
 * cannot, and the bandwidth is billed to us. Every address is signed,
 * and the address itself is checked before any request leaves the
 * machine.
 */

process.env.CRON_SECRET ||= "a-long-enough-secret-for-testing";

test("an ordinary web address is one we will fetch", () => {
  assert.equal(fetchable("https://example.com/photo.jpg"), true);
  assert.equal(fetchable("http://example.com/photo.jpg"), true);
});

test("anything that is not http is refused", () => {
  assert.equal(fetchable("file:///etc/passwd"), false);
  assert.equal(fetchable("ftp://example.com/x.jpg"), false);
  assert.equal(fetchable("data:image/png;base64,AAAA"), false);
  assert.equal(fetchable("javascript:alert(1)"), false);
  assert.equal(fetchable("not a url"), false);
});

/**
 * The expensive mistake: our own server being used to read something
 * only our own server can reach — a database admin page, a metadata
 * service holding cloud credentials.
 */
test("our own network is not somewhere this will look", () => {
  for (const host of [
    "http://localhost/x.jpg",
    "http://127.0.0.1/x.jpg",
    "http://10.0.0.5/x.jpg",
    "http://192.168.1.1/x.jpg",
    "http://172.16.0.1/x.jpg",
    "http://172.31.255.255/x.jpg",
    "http://169.254.169.254/latest/meta-data/",
    "http://0.0.0.0/x.jpg",
    "http://[::1]/x.jpg",
    "http://db.internal/x.jpg",
  ]) {
    assert.equal(fetchable(host), false, `${host} should be refused`);
  }
});

test("a public address that merely starts with the same digits is still fetched", () => {
  // 172.32 is public; only 172.16 to 172.31 are private.
  assert.equal(fetchable("http://172.32.0.1/x.jpg"), true);
  assert.equal(fetchable("http://109.0.0.1/x.jpg"), true);
});

test("an address we made carries a signature that checks out", () => {
  const url = "https://example.com/photo.jpg";
  const made = throughUs(url);
  const params = new URL(made).searchParams;
  assert.equal(params.get("u"), url);
  assert.equal(signedByUs(url, params.get("s") ?? ""), true);
});

test("an address nobody signed is refused", () => {
  assert.equal(signedByUs("https://example.com/photo.jpg", ""), false);
  assert.equal(signedByUs("https://example.com/photo.jpg", "0".repeat(32)), false);
});

/**
 * The attack this stops: taking a link off a page we sent, swapping the
 * address for one of ours, and leaving the signature alone.
 */
test("changing the address after signing invalidates it", () => {
  const made = throughUs("https://example.com/photo.jpg");
  const signature = new URL(made).searchParams.get("s") ?? "";
  assert.equal(signedByUs("http://169.254.169.254/latest/meta-data/", signature), false);
  assert.equal(signedByUs("https://example.com/other.jpg", signature), false);
});

test("two different pictures do not share a signature", () => {
  const a = new URL(throughUs("https://example.com/a.jpg")).searchParams.get("s");
  const b = new URL(throughUs("https://example.com/b.jpg")).searchParams.get("s");
  assert.notEqual(a, b);
});

test("an address we would not fetch is left pointing at their own server", () => {
  // No signature is minted for it, so it cannot be used to reach our
  // network through the proxy either.
  assert.equal(throughUs("data:image/png;base64,AAAA"), "data:image/png;base64,AAAA");
  assert.equal(throughUs("http://127.0.0.1/x.jpg"), "http://127.0.0.1/x.jpg");
});

test("the encoded address survives being put in a query string", () => {
  const awkward = "https://example.com/img/a photo (1).jpg?w=800&h=600";
  const made = throughUs(awkward);
  assert.equal(new URL(made).searchParams.get("u"), awkward);
});
