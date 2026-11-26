import { test } from "node:test";
import assert from "node:assert/strict";
import { previewUrl, slugFor, tokenFrom } from "../src/lib/previews.ts";
import { previewProblem, previewWords, worthAPreview } from "../src/lib/preview-worth-it.ts";
import type { Prospect } from "../src/lib/prospect-types.ts";

/**
 * The address of a page built for somebody else's business, and who
 * gets one at all.
 *
 * Worth testing because both are quiet failures. A link that does not
 * resolve is a cold email with a dead link in it, which is worse than
 * no link; and a page built for a business with a perfectly good site
 * is a mock-up that insults the person reading it.
 */

test("the link reads as the business it belongs to", () => {
  assert.equal(slugFor("Auto Supreme"), "auto-supreme");
  assert.equal(slugFor("Barton Tyres & Exhausts"), "barton-tyres-and-exhausts");
  assert.equal(slugFor("  O'Brien   Motors  "), "o-brien-motors");
});

test("accents and punctuation never reach the address bar", () => {
  assert.equal(slugFor("Café Noir"), "cafe-noir");
  assert.equal(slugFor("!!!"), "business");
  assert.ok(!slugFor("Jo's Nails (Ilford)").includes("("));
});

test("a very long name is cut, and never left ending in a hyphen", () => {
  const slug = slugFor("The Extremely Long Name Of A Business That Goes On And On Forever Limited");
  assert.ok(slug.length <= 48);
  assert.ok(!slug.endsWith("-"));
});

test("the token is read off the end, whatever the name in front of it", () => {
  assert.equal(tokenFrom("auto-supreme-0123456789abcdef"), "0123456789abcdef");
  // Forwarded with the wrong name in front, it still finds the page.
  assert.equal(tokenFrom("some-other-name-0123456789abcdef"), "0123456789abcdef");
});

test("anything that is not a token is refused rather than guessed at", () => {
  assert.equal(tokenFrom("auto-supreme"), "");
  assert.equal(tokenFrom(""), "");
  assert.equal(tokenFrom("auto-supreme-SHORT"), "");
  assert.equal(tokenFrom("auto-supreme-0123456789ABCDEF"), "", "upper case is not our token");
  assert.equal(tokenFrom("../../etc/passwd"), "");
});

test("the address is the site, the slug and the token", () => {
  const url = previewUrl({ slug: "auto-supreme", token: "0123456789abcdef" });
  assert.match(url, /\/preview\/auto-supreme-0123456789abcdef$/);
  assert.equal(tokenFrom(url.split("/").pop() ?? ""), "0123456789abcdef");
});

const p = (over: Partial<Prospect>): Prospect => ({
  id: 1, placeId: "x", name: "Barton Tyres", phone: "0161 123 4567",
  email: "hi@bartontyres.co.uk", website: "https://bartontyres.co.uk",
  address: "", category: "", mapsUri: "", reviews: 40, rating: 4.6,
  siteScore: 30, findings: [{ label: "Secure connection", why: "No HTTPS" }],
  scannedAt: "2026-11-20 10:00:00", status: "new", notes: "", calledAt: null,
  callbackAt: null, lastCall: null, emailedAt: null, deletedAt: null,
  sequenceStartedAt: null, sequenceStoppedAt: null, sequenceStopReason: "",
  repliedAt: null, unsubscribedAt: null, unsubscribeUrl: "", emailCount: 0,
  foundFor: "", industry: "automotive", town: "Manchester", emailDeadAt: null,
  emailDeadReason: "", phoneDeadAt: null, phoneDeadReason: "", region: "uk",
  preview: null, ...over,
});

test("a busy business with a bad site is exactly who this is for", () => {
  assert.equal(previewProblem(p({})), null);
  assert.equal(worthAPreview(p({})), true);
});

test("nobody with a good site is sent a rebuild of it", () => {
  assert.equal(previewProblem(p({ siteScore: 68 })), "site-is-fine");
  assert.match(previewWords("site-is-fine", p({ siteScore: 68 })), /68 out of 100/);
});

test("a business with no website gets a call, not a page", () => {
  assert.equal(previewProblem(p({ website: "" })), "no-website");
});

test("an unscanned business has nothing to compare against", () => {
  assert.equal(previewProblem(p({ scannedAt: null, siteScore: null })), "never-scanned");
  assert.equal(previewProblem(p({ findings: [] })), "no-findings");
});

test("too quiet to be worth the work", () => {
  assert.equal(previewProblem(p({ reviews: 2 })), "too-quiet");
  assert.match(previewWords("too-quiet", p({ reviews: 2 })), /Only 2 reviews/);
});

test("the reason always reads as a sentence somebody can act on", () => {
  for (const reason of ["no-website", "never-scanned", "site-is-fine", "too-quiet", "no-findings"] as const) {
    const words = previewWords(reason, p({}));
    assert.ok(words.length > 20, reason);
    assert.ok(words.endsWith("."), `${reason} should read as a sentence`);
  }
});
