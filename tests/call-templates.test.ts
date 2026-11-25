import { test } from "node:test";
import assert from "node:assert/strict";
import { callTemplates } from "../src/lib/call-templates.ts";
import { callScript } from "../src/lib/call-script.ts";
import type { Prospect } from "../src/lib/prospect-types.ts";

/**
 * The email that goes straight after a call, and the script that gets
 * the call there.
 *
 * Worth testing because both of them are read by the person who answered
 * the phone twenty seconds earlier. An email that opens like a cold
 * mailshot, or a script that forgets to ask for the WhatsApp number the
 * whole call is for, undoes the call it came from — and neither failure
 * shows up in a screenshot.
 */

const p = (over: Partial<Prospect>): Prospect => ({
  id: 1, placeId: "x", name: "Barton Tyres", phone: "0161 123 4567",
  email: "hello@bartontyres.co.uk", website: "https://bartontyres.co.uk",
  address: "", category: "", mapsUri: "", reviews: 20, rating: 4.5,
  siteScore: 60,
  findings: [
    { label: "Secure connection", why: "No HTTPS" },
    { label: "Tappable phone number", why: "Not a tel: link" },
  ],
  scannedAt: "2026-11-20 10:00:00",
  status: "new", notes: "", calledAt: null, callbackAt: null, lastCall: null,
  emailedAt: null, deletedAt: null, sequenceStartedAt: null, sequenceStoppedAt: null,
  sequenceStopReason: "", repliedAt: null, unsubscribedAt: null, unsubscribeUrl: "",
  emailCount: 0, foundFor: "", industry: "automotive", town: "Manchester",
  emailDeadAt: null, emailDeadReason: "", phoneDeadAt: null, phoneDeadReason: "",
  region: "uk", ...over,
});

test("there are three of them and each one is different", () => {
  const t = callTemplates(p({}));
  assert.equal(t.length, 3);
  assert.equal(new Set(t.map((x) => x.key)).size, 3);
  assert.equal(new Set(t.map((x) => x.subject)).size, 3);
  assert.equal(new Set(t.map((x) => x.body)).size, 3);
  for (const one of t) {
    assert.ok(one.label.length > 0, "needs a label for the button");
    assert.ok(one.when.length > 0, "needs to say when to use it");
  }
});

test("every one of them refers to the call that just happened", () => {
  for (const one of callTemplates(p({}))) {
    assert.match(one.body, /call|phone/i);
  }
});

test("every one of them gives the WhatsApp number in a readable form", () => {
  for (const one of callTemplates(p({}))) {
    assert.match(one.body, /WhatsApp/);
    assert.match(one.body, /07539 559947/);
    assert.doesNotMatch(one.body, /447539559947/);
  }
});

test("the caller's own name signs it, not Walid's", () => {
  const [first] = callTemplates(p({}), "Ali Raza");
  assert.match(first.body, /Ali Raza/);
  assert.doesNotMatch(first.body, /Walid/);
});

test("with nobody named it falls back to the owner", () => {
  const [first] = callTemplates(p({}));
  assert.match(first.body, /Walid Shah/);
});

test("the findings go in as a numbered list", () => {
  const [, , theirSite] = callTemplates(p({}));
  assert.match(theirSite.body, /^1\. /m);
  assert.match(theirSite.body, /^2\. /m);
});

test("a clean site is said to be clean rather than given invented faults", () => {
  const [, , theirSite] = callTemplates(p({ findings: [] }));
  assert.match(theirSite.body, /nothing obviously wrong/i);
  assert.doesNotMatch(theirSite.body, /^1\. /m);
});

test("an unsubscribe link is used where there is one", () => {
  const [first] = callTemplates(p({}), "", "https://example.com/u/abc");
  assert.match(first.body, /https:\/\/example\.com\/u\/abc/);
});

test("and where there is not, they are still told how to stop it", () => {
  const [first] = callTemplates(p({}));
  assert.match(first.body, /rather I didn't email again/i);
});

test("no template promises a result or quotes a figure", () => {
  for (const one of callTemplates(p({}))) {
    assert.doesNotMatch(one.body, /guarantee|guaranteed/i);
    assert.doesNotMatch(one.body, /\b\d+%/);
  }
});

test("the script asks for the WhatsApp number", () => {
  const script = callScript(p({}), 0, "Ali");
  const whole = script.sections.map((s) => `${s.heading} ${s.say} ${s.note}`).join(" ");
  assert.match(whole, /WhatsApp/);
});

test("the script holds the call to five minutes and says why", () => {
  const script = callScript(p({}), 0, "Ali");
  assert.equal(script.minutes, 5);
  const whole = script.sections.map((s) => `${s.heading} ${s.say} ${s.note}`).join(" ");
  assert.match(whole, /five minutes|5 minutes/i);
});

test("the script carries the findings as points to talk through", () => {
  const script = callScript(p({}), 0, "Ali");
  assert.equal(script.keyPoints.length, 2);
  for (const point of script.keyPoints) assert.ok(point.length > 0);
});

test("a clean site leaves no points to invent", () => {
  assert.deepEqual(callScript(p({ findings: [] }), 0, "Ali").keyPoints, []);
});

test("the opening line uses the name of whoever is ringing", () => {
  const ali = callScript(p({}), 0, "Ali");
  assert.match(ali.sections[0].say ?? "", /It's Ali from/);
  const nobody = callScript(p({}), 0, "");
  assert.match(nobody.sections[0].say ?? "", /It's Walid from/);
});
