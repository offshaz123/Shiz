import { test } from "node:test";
import assert from "node:assert/strict";
import { callOrder, planCall } from "../src/lib/call-priority.ts";
import type { Prospect } from "../src/lib/prospect-types.ts";

/**
 * Who a sales assistant rings first, and what they open with.
 *
 * Worth testing because the ordering is the whole product here. A list
 * that puts a customer we already have above a business with no website
 * is a list somebody stops trusting on the first morning, and after that
 * they work it top to bottom by hand and the ordering may as well not
 * exist.
 */

const NOW = new Date("2026-11-19T10:00:00").getTime();
const ago = (days: number) =>
  new Date(NOW - days * 86_400_000).toISOString().slice(0, 19).replace("T", " ");

const p = (over: Partial<Prospect>): Prospect => ({
  id: 1, placeId: "x", name: "Barton Tyres", phone: "0161 123 4567", email: "",
  website: "https://bartontyres.co.uk", address: "", category: "", mapsUri: "",
  reviews: 20, rating: 4.5, siteScore: 80, findings: [], scannedAt: ago(1),
  status: "new", notes: "", calledAt: null, callbackAt: null, lastCall: null,
  emailedAt: null, deletedAt: null, sequenceStartedAt: null, sequenceStoppedAt: null,
  sequenceStopReason: "", repliedAt: null, unsubscribedAt: null, unsubscribeUrl: "",
  emailCount: 0, foundFor: "", industry: "automotive", town: "Manchester",
  emailDeadAt: null, emailDeadReason: "", ...over,
});

test("a promised callback beats everything else on the list", () => {
  const callback = p({ id: 1, callbackAt: ago(1), siteScore: 90 });
  const noSite = p({ id: 2, website: "", reviews: 0 });
  const [first] = callOrder([noSite, callback], NOW);
  assert.equal(first.prospect.id, 1);
  assert.equal(first.plan.urgency, "today");
});

test("a callback that is not due yet does not jump the queue", () => {
  const later = p({ id: 1, callbackAt: new Date(NOW + 5 * 86_400_000).toISOString() });
  const plan = planCall(later, NOW);
  assert.notEqual(plan.score, 1000);
});

test("no website at all is the top of the cold list", () => {
  const plan = planCall(p({ website: "", reviews: 12, scannedAt: null }), NOW);
  assert.equal(plan.urgency, "today");
  assert.match(plan.reasons[0], /No website/);
  assert.match(plan.opener, /could not find a website/);
});

test("a bad website is worth ringing, a good one much less", () => {
  const bad = planCall(p({ siteScore: 25, reviews: 0 }), NOW);
  const good = planCall(p({ siteScore: 92, reviews: 40 }), NOW);
  assert.ok(bad.score > good.score);
  assert.equal(good.urgency, "when-you-can");
});

test("a good site says so, rather than being quietly buried", () => {
  const plan = planCall(p({ siteScore: 92 }), NOW);
  assert.ok(plan.reasons.some((r) => /less obviously wrong/.test(r)));
});

test("an existing customer is never rung as a prospect", () => {
  const plan = planCall(p({ status: "customer", website: "", reviews: 0 }), NOW);
  assert.equal(plan.urgency, "leave-it");
  assert.equal(plan.opener, "");
});

test("somebody who said no, or unsubscribed, is left alone", () => {
  assert.equal(planCall(p({ status: "not-interested" }), NOW).urgency, "leave-it");
  assert.equal(planCall(p({ unsubscribedAt: ago(2) }), NOW).urgency, "leave-it");
});

test("rung today is not rung again today", () => {
  const rung = p({ id: 1, calledAt: ago(0), website: "", reviews: 0 });
  const fresh = p({ id: 2, siteScore: 75 });
  const [first] = callOrder([rung, fresh], NOW);
  assert.equal(first.prospect.id, 2);
});

test("rung a fortnight ago comes back round, below the untried", () => {
  const old = p({ id: 1, calledAt: ago(14), website: "", reviews: 0 });
  const fresh = p({ id: 2, website: "", reviews: 0 });
  const order = callOrder([old, fresh], NOW);
  assert.equal(order[0].prospect.id, 2);
  assert.ok(order[1].plan.score > 0);
});

test("one we are already emailing is a second attempt, not a first", () => {
  const emailed = planCall(p({ emailCount: 3, siteScore: 30 }), NOW);
  const cold = planCall(p({ emailCount: 0, siteScore: 30 }), NOW);
  assert.ok(cold.score > emailed.score);
  assert.ok(emailed.reasons.some((r) => /3 emails already sent/.test(r)));
});

test("nothing scanned means nothing to open with, and it says so", () => {
  const plan = planCall(p({ scannedAt: null, siteScore: null }), NOW);
  assert.equal(plan.opener, "");
  assert.match(plan.reasons[0], /not been looked at/);
});

test("the opener names something real about them", () => {
  const plan = planCall(
    p({
      siteScore: 55,
      findings: [{ label: "No phone number on the page", why: "People leave rather than hunt." }],
    }),
    NOW,
  );
  assert.match(plan.opener, /no phone number on the page/i);
});

test("at most two faults are put in front of somebody", () => {
  const plan = planCall(
    p({
      siteScore: 20,
      findings: [
        { label: "A", why: "one" }, { label: "B", why: "two" },
        { label: "C", why: "three" }, { label: "D", why: "four" },
      ],
    }),
    NOW,
  );
  assert.ok(!plan.reasons.includes("three"));
  assert.ok(!plan.reasons.includes("four"));
});

test("every reason is a fact, never a guess at whether they will buy", () => {
  const plan = planCall(p({ website: "", reviews: 0, siteScore: null }), NOW);
  for (const reason of plan.reasons) {
    assert.doesNotMatch(reason, /likely|probably|chance|will buy|hot lead/i);
  }
});

test("a dead email address is a reason to ring, not a snub", () => {
  // The whole point of the bounce handling. Before it, this business read
  // as "three emails, no reply" — somebody who had ignored us. They had
  // never received one.
  const bounced = p({
    email: "info@refinedrides.com",
    emailCount: 3,
    emailDeadAt: ago(1),
    emailDeadReason: "550 no MX record",
    siteScore: 60,
  });
  const plan = planCall(bounced, NOW);

  assert.ok(plan.reasons.some((r) => r.includes("does not work")));
  assert.ok(!plan.reasons.some((r) => r.includes("no reply")));
  assert.match(plan.opener, /came straight back/);
  assert.match(plan.opener, /info@refinedrides\.com/);
});

test("a dead address outranks the same business with a live one", () => {
  const dead = p({ id: 1, email: "info@x.co.uk", emailCount: 3, emailDeadAt: ago(1) });
  const ignored = p({ id: 2, email: "info@y.co.uk", emailCount: 3 });
  const order = callOrder([ignored, dead], NOW);
  assert.equal(order[0].prospect.id, 1);
});
