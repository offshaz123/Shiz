#!/usr/bin/env node
/**
 * Scores a list of businesses' websites, worst first.
 *
 * The companion to find-prospects.mjs, which finds newly incorporated
 * companies. Those have no website yet. This one is for the opposite case:
 * businesses that are trading, have a site, and that site is poor. They are a
 * better prospect because the problem is already costing them something and
 * you can show them the proof rather than describe it.
 *
 * It uses our own live scanner, so every number here is the number a customer
 * would see if they ran it themselves — which is the point. Nothing is
 * estimated and nothing is invented.
 *
 * Usage:
 *   node scripts/scan-prospects.mjs sites.txt         # one domain per line
 *   node scripts/scan-prospects.mjs a.co.uk b.co.uk
 *   node scripts/scan-prospects.mjs sites.txt --csv > prospects.csv
 *
 * Lines beginning with # are ignored, so you can keep notes in the file.
 */

// Node's fetch ignores HTTP(S)_PROXY, unlike curl, so behind an egress proxy
// every request fails with an opaque 403. Same fix as find-prospects.mjs.
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

const ENDPOINT = process.env.SCAN_ENDPOINT || "https://shazmarketing.com/api/audit";

const args = process.argv.slice(2);
const csv = args.includes("--csv");
const inputs = args.filter((a) => !a.startsWith("--"));

if (inputs.length === 0) {
  console.error("Usage: node scripts/scan-prospects.mjs <file-of-domains | domain...> [--csv]");
  process.exit(1);
}

/** A file of domains, or domains given straight on the command line. */
const domains = inputs.flatMap((input) =>
  existsSync(input)
    ? readFileSync(input, "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    : [input],
);

async function scan(domain) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: domain }),
    });
    const data = await res.json();
    if (!res.ok) return { domain, error: data?.error ?? `http_${res.status}` };

    const problems = data.categories
      .flatMap((c) => c.checks)
      .filter((c) => c.severity === "critical")
      .map((c) => c.label);

    const weakest = data.categories
      .filter((c) => c.score >= 0)
      .sort((a, b) => a.score - b.score)[0];

    return {
      domain,
      score: data.score,
      critical: data.counts.critical,
      warning: data.counts.warning,
      pages: data.pagesFound,
      words: data.words,
      weakest: weakest ? `${weakest.name} ${weakest.score.toFixed(1)}` : "",
      problems,
    };
  } catch (err) {
    return { domain, error: String(err).slice(0, 60) };
  }
}

// Sequential on purpose. Each scan fetches somebody's site, and firing twenty
// at once is both rude and a good way to get our own IP blocked.
const results = [];
for (const domain of domains) {
  if (!csv) process.stderr.write(`scanning ${domain}… `);
  const result = await scan(domain);
  if (!csv) process.stderr.write(result.error ? `failed (${result.error})\n` : `${result.score}\n`);
  results.push(result);
}

const scored = results.filter((r) => !r.error).sort((a, b) => a.score - b.score);
const failed = results.filter((r) => r.error);

if (csv) {
  console.log("domain,score,critical,warning,pages,words,weakest,problems");
  for (const r of scored) {
    console.log(
      [r.domain, r.score, r.critical, r.warning, r.pages, r.words, r.weakest, r.problems.join("; ")]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
  }
} else {
  console.log("\nWorst first — the best prospects are at the top.\n");
  console.log("score  crit  warn  weakest category            domain");
  console.log("-".repeat(78));
  for (const r of scored) {
    console.log(
      `${String(r.score).padEnd(6)} ${String(r.critical).padEnd(5)} ${String(r.warning).padEnd(5)} ` +
        `${r.weakest.padEnd(27)} ${r.domain}`,
    );
  }
  if (scored.length) {
    console.log("\nWhat's actually broken on each:\n");
    for (const r of scored) {
      if (r.problems.length) console.log(`  ${r.domain}\n    ${r.problems.join(", ")}\n`);
    }
  }
  if (failed.length) {
    console.log("Couldn't scan:");
    for (const r of failed) console.log(`  ${r.domain} — ${r.error}`);
  }
}
