import { test } from "node:test";
import assert from "node:assert/strict";
import { composeBatch } from "../src/lib/run-prospect-sequence.ts";
import { canBuildPreview, worthAPreview } from "../src/lib/preview-worth-it.ts";
import type { Prospect } from "../src/lib/prospect-types.ts";

/**
 * How many of a day's emails carry a rebuilt page.
 *
 * Walid's rule: at least seven in twenty, and more where the sites
 * deserve it. The reason is that the two emails are not variations of
 * each other. "I rebuilt your homepage, here it is" is a thing to look
 * at; "three things on your site are losing you enquiries" is a stranger
 * with opinions. A day where the list happened to sort badly used to be
 * a day entirely of the second kind.
 */

let next = 1;
const make = (over: Partial<Prospect> = {}): Prospect =>
  ({
    id: next++,
    name: "A business",
    website: "https://example.com",
    phone: "",
    email: "a@example.com",
    address: "",
    category: "",
    town: "",
    region: "uk",
    reviews: 30,
    rating: 4.5,
    siteScore: 30,
    findings: ["No tappable phone number"],
    scannedAt: "2026-11-01 10:00:00",
    status: "new",
    notes: "",
    ...over,
  }) as Prospect;

/** Good enough to be worth winning: bad site, plenty of reviews. */
const worthIt = () => make();
/** A site to rebuild, but a weaker argument: it scores too well. */
const possible = () => make({ siteScore: 70 });
/** Nothing to rebuild. */
const noSite = () => make({ website: "", siteScore: null, findings: [] });

test("the fixtures mean what the tests assume", () => {
  assert.equal(worthAPreview(worthIt()), true);
  assert.equal(worthAPreview(possible()), false);
  assert.equal(canBuildPreview(possible()), true);
  assert.equal(canBuildPreview(noSite()), false);
});

test("seven of a batch of twenty carry a link", () => {
  const pool = [...Array(40)].map((_, i) => (i < 5 ? worthIt() : noSite()));
  const batch = composeBatch(pool, 20);
  assert.equal(batch.length, 20);
  assert.equal(batch.filter((b) => b.wantLink).length, 5, "only five in the pool can have one");
});

test("the weaker sites make up the number when the good ones run out", () => {
  // Three worth winning, plenty that could have one, the rest nothing.
  const pool = [
    ...[...Array(3)].map(worthIt),
    ...[...Array(30)].map(noSite),
    ...[...Array(10)].map(possible),
  ];
  const batch = composeBatch(pool, 20);
  assert.equal(batch.length, 20);
  assert.equal(batch.filter((b) => b.wantLink).length, 7);
});

test("everybody worth winning gets one, even past the floor", () => {
  const pool = [...[...Array(12)].map(worthIt), ...[...Array(30)].map(noSite)];
  const batch = composeBatch(pool, 20);
  assert.equal(batch.filter((b) => b.wantLink).length, 12, "the floor is a floor, not a cap");
});

test("a business with no site to rebuild never gets a link", () => {
  const pool = [...Array(30)].map(noSite);
  const batch = composeBatch(pool, 20);
  assert.equal(batch.filter((b) => b.wantLink).length, 0);
});

test("the batch stays oldest first, so a day's mail is not visibly sorted", () => {
  const pool = [noSite(), noSite(), worthIt(), noSite(), worthIt()];
  const batch = composeBatch(pool, 5);
  assert.deepEqual(
    batch.map((b) => b.prospect.id),
    pool.map((p) => p.id),
  );
});

test("a smaller batch gets a smaller floor, rounded up", () => {
  const pool = [...[...Array(20)].map(possible)];
  // Twelve is the warm-up ramp's middle tier: 12 * 7 / 20 = 4.2, so five.
  assert.equal(composeBatch(pool, 12).filter((b) => b.wantLink).length, 5);
  assert.equal(composeBatch(pool, 8).filter((b) => b.wantLink).length, 3);
});

test("a batch bigger than the pool sends what there is", () => {
  const pool = [worthIt(), noSite()];
  const batch = composeBatch(pool, 20);
  assert.equal(batch.length, 2);
  assert.equal(batch.filter((b) => b.wantLink).length, 1);
});

test("nobody is sent to twice in one batch", () => {
  const pool = [...[...Array(10)].map(worthIt), ...[...Array(10)].map(possible)];
  const batch = composeBatch(pool, 20);
  assert.equal(new Set(batch.map((b) => b.prospect.id)).size, batch.length);
});
