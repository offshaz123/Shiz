#!/usr/bin/env node
/**
 * Local prospect finder — trading businesses with few Google reviews.
 *
 * The gap this fills: scan-prospects.mjs tells you how bad someone's website
 * is, but it reads websites, not Google listings, so it can't tell you how
 * established a business is. A detailer with 400 reviews has been doing fine
 * without you. One with 11 is still building, is far more likely to pick up
 * the phone, and a bad website is costing them more in relative terms.
 *
 * So this one asks Google for the businesses, keeps the ones under a review
 * threshold, then runs their website through our own scanner. One command,
 * and the output is a call list: who to ring, how many reviews they have, and
 * what's broken on their site.
 *
 * Businesses with NO website at all are reported separately and first. They
 * are the better prospect — nothing to criticise, just something to build.
 *
 * Source: Google Places API (New), Text Search. Official API, within terms —
 * deliberately not scraping Google Maps, which breaks their terms and risks
 * the account.
 *
 * Setup (one-off):
 *   1. https://console.cloud.google.com → create a project
 *   2. APIs & Services → Enable "Places API (New)"
 *   3. Credentials → Create credentials → API key
 *   4. export GOOGLE_PLACES_KEY="your-key"
 *
 *   Billing has to be switched on, but Google gives a standing monthly credit
 *   that covers a few thousand of these lookups, so in practice this costs
 *   nothing at the volumes below. Each run below is 1-3 billable searches.
 *
 * Usage:
 *   node scripts/find-local-prospects.mjs "car detailing in Romford"
 *   node scripts/find-local-prospects.mjs "window tinting in Essex" --max-reviews 30
 *   node scripts/find-local-prospects.mjs "mobile valeting in Ilford" --no-scan
 *   node scripts/find-local-prospects.mjs areas.txt       # one query per line
 *   node scripts/find-local-prospects.mjs "..." --csv > calls.csv
 */

// Node's fetch ignores HTTP(S)_PROXY, unlike curl, so behind an egress proxy
// every request fails with an opaque 403. Same fix as the other two scripts.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync } = await import("node:child_process");
  const { existsSync } = await import("node:fs");
  const env = { ...process.env, NODE_USE_ENV_PROXY: "1" };
  const caBundle = "/root/.ccr/ca-bundle.crt";
  if (!env.NODE_EXTRA_CA_CERTS && existsSync(caBundle)) env.NODE_EXTRA_CA_CERTS = caBundle;
  const child = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    env,
    stdio: "inherit",
  });
  process.exit(child.status ?? 1);
}

const { readFileSync, existsSync } = await import("node:fs");

const PLACES = "https://places.googleapis.com/v1/places:searchText";
const SCANNER = process.env.SCAN_ENDPOINT || "https://shazmarketing.com/api/audit";

const args = process.argv.slice(2);
const csv = args.includes("--csv");
const noScan = args.includes("--no-scan");

function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i === -1 || i === args.length - 1) return fallback;
  const n = Number(args[i + 1]);
  return Number.isFinite(n) ? n : fallback;
}

const maxReviews = flag("max-reviews", 50);
const perQuery = flag("limit", 20);

const FLAGS_WITH_VALUES = new Set(["--max-reviews", "--limit"]);
const inputs = args.filter((a, i) => {
  if (a.startsWith("--")) return false;
  const prev = args[i - 1];
  return !(prev && FLAGS_WITH_VALUES.has(prev));
});

if (inputs.length === 0) {
  console.error('Usage: node scripts/find-local-prospects.mjs "car detailing in Romford" [--max-reviews 50] [--no-scan] [--csv]');
  process.exit(1);
}

const key = process.env.GOOGLE_PLACES_KEY;
if (!key) {
  console.error("GOOGLE_PLACES_KEY is not set. See the setup notes at the top of this file.");
  console.error("Without it there is no lawful way to read review counts in bulk — the");
  console.error("scanner reads websites, not Google listings.");
  process.exit(1);
}

/** A file of queries, or queries given straight on the command line. */
const queries = inputs.flatMap((input) =>
  existsSync(input)
    ? readFileSync(input, "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    : [input],
);

const FIELDS = [
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.googleMapsUri",
].join(",");

async function search(query) {
  const res = await fetch(PLACES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELDS,
      // Bias to the UK so "Romford" doesn't return a Romford somewhere else.
      "Accept-Language": "en-GB",
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: Math.min(perQuery, 20),
      regionCode: "GB",
      languageCode: "en",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data.places ?? [];
}

async function scanSite(url) {
  try {
    const res = await fetch(SCANNER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    // The scanner answered and said it couldn't read that site. That is a
    // finding about them, not a failure of ours.
    if (!res.ok) return { siteError: data?.error ?? `http_${res.status}` };

    const problems = data.categories
      .flatMap((c) => c.checks)
      .filter((c) => c.severity === "critical")
      .map((c) => c.label);

    const weakest = data.categories
      .filter((c) => c.score >= 0)
      .sort((a, b) => a.score - b.score)[0];

    return {
      score: data.score,
      critical: data.counts.critical,
      warning: data.counts.warning,
      weakest: weakest ? `${weakest.name} ${weakest.score.toFixed(1)}` : "",
      problems,
    };
  } catch (err) {
    return { networkError: String(err).slice(0, 60) };
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// Collect, de-duplicated across queries — the same business shows up for
// "detailing in Romford" and "valeting in Romford" and should be called once.
const seen = new Set();
const prospects = [];
const skipped = { tooManyReviews: 0, closed: 0, noReviewData: 0 };

for (const [i, query] of queries.entries()) {
  if (i > 0) await sleep(1000);
  if (!csv) process.stderr.write(`searching "${query}"… `);

  let places;
  try {
    places = await search(query);
  } catch (err) {
    if (!csv) process.stderr.write(`failed (${err.message})\n`);
    continue;
  }

  let kept = 0;
  for (const p of places) {
    const name = p.displayName?.text ?? "(no name)";
    const dedupeKey = p.websiteUri ? hostOf(p.websiteUri) : `${name}|${p.formattedAddress ?? ""}`;
    if (seen.has(dedupeKey)) continue;

    if (p.businessStatus && p.businessStatus !== "OPERATIONAL") {
      skipped.closed += 1;
      continue;
    }
    // No review count at all usually means a listing with no reviews yet,
    // which qualifies. Treat it as 0 rather than throwing it away.
    const reviews = p.userRatingCount ?? 0;
    if (reviews > maxReviews) {
      skipped.tooManyReviews += 1;
      continue;
    }

    seen.add(dedupeKey);
    kept += 1;
    prospects.push({
      name,
      reviews,
      rating: p.rating ?? null,
      phone: p.nationalPhoneNumber ?? "",
      address: p.formattedAddress ?? "",
      website: p.websiteUri ?? "",
      maps: p.googleMapsUri ?? "",
      query,
    });
  }
  if (!csv) process.stderr.write(`${places.length} found, ${kept} under ${maxReviews} reviews\n`);
}

const withSite = prospects.filter((p) => p.website);
const withoutSite = prospects.filter((p) => !p.website);

if (!noScan && withSite.length) {
  if (!csv) process.stderr.write(`\nscanning ${withSite.length} websites…\n`);
  for (const [i, p] of withSite.entries()) {
    if (i > 0) await sleep(2500);
    if (!csv) process.stderr.write(`  ${hostOf(p.website)}… `);

    let result = await scanSite(p.website);
    // Retry only when we couldn't reach our own scanner. A scanner that
    // answered "I couldn't read that site" will say the same thing again.
    if (result.networkError) {
      await sleep(6000);
      result = await scanSite(p.website);
    }
    Object.assign(p, result);

    if (!csv) {
      const problem = p.siteError ?? p.networkError;
      process.stderr.write(problem ? `couldn't read (${problem})\n` : `${p.score}\n`);
    }
  }
}

// Worst site first. Anything we couldn't score sorts to the end, since you
// can't open a call with a number you don't have.
const scored = withSite
  .filter((p) => p.score !== undefined)
  .sort((a, b) => a.score - b.score);
const unscored = withSite.filter((p) => p.score === undefined);

if (csv) {
  console.log("name,reviews,rating,phone,website,score,critical,warning,weakest,problems,address");
  const row = (p) =>
    console.log(
      [
        p.name,
        p.reviews,
        p.rating ?? "",
        p.phone,
        p.website,
        p.score ?? "",
        p.critical ?? "",
        p.warning ?? "",
        p.weakest ?? "",
        (p.problems ?? []).join("; ") || p.siteError || p.networkError || "",
        p.address,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
  withoutSite.forEach(row);
  scored.forEach(row);
  unscored.forEach(row);
} else {
  if (!prospects.length) {
    console.log(`\nNothing came back under ${maxReviews} reviews. Try a wider area, a`);
    console.log("different wording, or raise --max-reviews.");
  }

  if (withoutSite.length) {
    console.log(`\n=== No website at all (${withoutSite.length}) — ring these first ===\n`);
    for (const p of withoutSite) {
      console.log(`  ${p.name} — ${p.reviews} reviews${p.rating ? `, ${p.rating}★` : ""}`);
      if (p.phone) console.log(`    ${p.phone}`);
      if (p.address) console.log(`    ${p.address}`);
      console.log();
    }
  }

  if (scored.length) {
    console.log(`\n=== Has a website, worst first (${scored.length}) ===\n`);
    console.log("score  revs  crit  weakest category            business");
    console.log("-".repeat(78));
    for (const p of scored) {
      console.log(
        `${String(p.score).padEnd(6)} ${String(p.reviews).padEnd(5)} ${String(p.critical).padEnd(5)} ` +
          `${(p.weakest ?? "").padEnd(27)} ${p.name}`,
      );
    }
    console.log("\nCall list:\n");
    for (const p of scored) {
      console.log(`  ${p.name} — ${p.score}/10, ${p.reviews} reviews`);
      if (p.phone) console.log(`    ${p.phone}`);
      console.log(`    ${p.website}`);
      if (p.problems?.length) console.log(`    broken: ${p.problems.join(", ")}`);
      console.log();
    }
  }

  if (unscored.length) {
    console.log("\nHas a website but we couldn't read it — open it in a browser first:\n");
    for (const p of unscored) {
      console.log(
        `  ${p.name} — ${p.website} (${p.siteError ?? p.networkError}), ${p.reviews} reviews${p.phone ? `, ${p.phone}` : ""}`,
      );
    }
    console.log();
  }

  const dropped = skipped.tooManyReviews + skipped.closed;
  if (dropped) {
    console.log(
      `Left out: ${skipped.tooManyReviews} over ${maxReviews} reviews` +
        (skipped.closed ? `, ${skipped.closed} not trading` : "") +
        ".",
    );
  }
}
