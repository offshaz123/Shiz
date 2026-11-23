import { test } from "node:test";
import assert from "node:assert/strict";
import {
  REGIONS,
  callableNow,
  callingWindow,
  isRegion,
  regionInfo,
  toRegion,
} from "../src/lib/regions.ts";
import { allUsAreas, usAreaGroups, usCities } from "../src/content/areas-us.ts";
import { allAreas } from "../src/content/areas.ts";

/**
 * The region is what keeps two countries in one set of tables honest. The
 * failures that matter are quiet ones: a bad value defaulting to the wrong
 * list, or a caller in Pakistan being told the wrong hours.
 */

test("anything that is not a region becomes the UK", () => {
  assert.equal(toRegion("us"), "us");
  assert.equal(toRegion("uk"), "uk");
  // Everything found before the United States existed is British, so a
  // missing or mangled value has to land there and nowhere else.
  assert.equal(toRegion(undefined), "uk");
  assert.equal(toRegion("US"), "uk");
  assert.equal(toRegion("fr"), "uk");
  assert.ok(!isRegion("gb"));
});

test("each region tells Places which country it means", () => {
  assert.equal(regionInfo("uk").placesRegionCode, "GB");
  assert.equal(regionInfo("us").placesRegionCode, "US");
});

test("the calling window is given in the caller's own hours", () => {
  // Pakistan is UTC+5. London's 9 to 5 is their 2pm to 10pm, and the
  // American working day runs through their night into the morning.
  assert.equal(callingWindow("uk", 5), "2pm to 10pm");
  assert.equal(callingWindow("us", 5), "7pm to 6am");
});

test("knows when each country is open", () => {
  // 10:00 UTC: Britain is mid-morning, America is asleep.
  const morning = new Date("2026-11-24T10:00:00Z");
  assert.ok(callableNow("uk", morning));
  assert.ok(!callableNow("us", morning));

  // 20:00 UTC: Britain has gone home, America is at work.
  const evening = new Date("2026-11-24T20:00:00Z");
  assert.ok(!callableNow("uk", evening));
  assert.ok(callableNow("us", evening));
});

test("the two place lists do not overlap", () => {
  // Arlington is a real place in both countries, and a name in both lists
  // would be filed under whichever region happened to search it first.
  const uk = new Set(allAreas.map((a) => a.toLowerCase()));
  const clashes = allUsAreas.filter((a) => uk.has(a.toLowerCase()));
  assert.deepEqual(clashes, [], `in both lists: ${clashes.join(", ")}`);
});

test("every US state group has places in it", () => {
  for (const group of usAreaGroups) {
    assert.ok(group.areas.length >= 5, `${group.name} is too thin to rotate through`);
    assert.ok(group.note.length > 0, `${group.name} has no note saying why it is here`);
  }
  assert.ok(usCities.length >= 10);
  assert.equal(REGIONS.length, 2);
});

test("UK trade names are translated for an American search", async () => {
  const { tradeName } = await import("../src/lib/trade-names.ts");
  // The MOT is a British test. Searching it in Texas finds nobody and
  // still spends the Places call.
  assert.equal(tradeName("Garages & MOT", "us"), "Auto repair shops");
  assert.equal(tradeName("Solicitors", "us"), "Attorneys");
  assert.equal(tradeName("Estate agents", "us"), "Real estate agents");
  assert.equal(tradeName("Takeaways", "us"), "Takeout restaurants");

  // Unchanged where the word is the same, and never changed for the UK.
  assert.equal(tradeName("Plumbers", "us"), "Plumbers");
  assert.equal(tradeName("Garages & MOT", "uk"), "Garages & MOT");
  assert.equal(tradeName("Solicitors", "uk"), "Solicitors");
});

test("the daily rotation searches each country in its own words", async () => {
  const { searchesForDay, dayIndex } = await import("../src/lib/auto-search.ts");
  const day = dayIndex(new Date("2026-11-24T12:00:00Z"));

  const uk = searchesForDay(day, 40, 0, "uk");
  const us = searchesForDay(day, 40, 0, "us");
  assert.ok(uk.length > 0 && us.length > 0);

  // No British town ever appears in an American search, and nothing is
  // ever searched with a word that country does not use.
  assert.ok(!us.some((s) => s.query.includes("MOT")));
  assert.ok(!us.some((s) => s.town === "Barking"));
  assert.ok(!uk.some((s) => s.town === "Katy"));
});

test("an American email carries a postal address and a British one does not", async () => {
  const { buildDraft } = await import("../src/lib/prospect-outreach.ts");
  const them = (region: "uk" | "us") => ({
    id: 1, placeId: "p", name: "Katy Mobile Detailing", phone: "555 0100",
    email: "info@katydetail.com", website: "https://katydetail.com", address: "", category: "",
    mapsUri: "", reviews: 0, rating: null, siteScore: 41,
    findings: [{ label: "no phone number on the page", why: "No number on the home page." }],
    scannedAt: "2026-11-23 09:00:00", status: "new" as const, notes: "", calledAt: null,
    callbackAt: null, lastCall: null, emailedAt: null, deletedAt: null, sequenceStartedAt: null,
    sequenceStoppedAt: null, sequenceStopReason: "", repliedAt: null, unsubscribedAt: null,
    unsubscribeUrl: "", emailCount: 0, foundFor: "", industry: "automotive", town: "Katy",
    emailDeadAt: null, emailDeadReason: "", region,
  });

  // US commercial email has to carry a valid physical postal address.
  // This is the law the sender is held to, not a deliverability tip.
  const us = buildDraft(1, them("us"), "https://example.com/u/1").body;
  assert.ok(us.includes("One Canada Square"), "no postal address on a US email");
  assert.ok(us.includes("United Kingdom"));

  // It came off the UK signature deliberately, and stays off.
  const uk = buildDraft(1, them("uk"), "https://example.com/u/1").body;
  assert.ok(!uk.includes("One Canada Square"));

  // Every step, not only the first.
  for (const step of [1, 2, 3] as const) {
    assert.ok(buildDraft(step, them("us"), "https://example.com/u/1").body.includes("E14 5AB"));
  }
});
