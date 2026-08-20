#!/usr/bin/env node
/**
 * Daily prospect finder — newly incorporated UK companies worth approaching.
 *
 * Source: Companies House Advanced Search API. Free, official, openly published
 * public data. Deliberately NOT scraping Google Maps or review sites, which
 * breaks their terms of service and risks the account.
 *
 * Setup (one-off):
 *   1. Register at https://developer.company-information.service.gov.uk
 *   2. Create an application, then create a "REST" / live API key
 *   3. export COMPANIES_HOUSE_KEY="your-key"
 *
 * Usage:
 *   node scripts/find-prospects.mjs                  # last 3 days, all sectors
 *   node scripts/find-prospects.mjs --days 7
 *   node scripts/find-prospects.mjs --sector automotive
 *   node scripts/find-prospects.mjs --location "romford"
 *   node scripts/find-prospects.mjs --limit 15
 */

const API = "https://api.company-information.service.gov.uk/advanced-search/companies";

// Node's fetch ignores HTTP(S)_PROXY environment variables, unlike curl, so
// behind an egress proxy every request fails with an opaque 403. NODE_USE_ENV_PROXY
// fixes it but is only read at startup — so when we're behind a proxy and it
// isn't set, re-exec ourselves once with it in place. No-op without a proxy.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync } = await import("node:child_process");
  const { existsSync } = await import("node:fs");
  const env = { ...process.env, NODE_USE_ENV_PROXY: "1" };

  // The proxy terminates TLS, so Node needs to trust its CA to verify the chain.
  const caBundle = "/root/.ccr/ca-bundle.crt";
  if (!env.NODE_EXTRA_CA_CERTS && existsSync(caBundle)) env.NODE_EXTRA_CA_CERTS = caBundle;

  const child = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    env,
    stdio: "inherit",
  });
  process.exit(child.status ?? 1);
}

// UK SIC 2007 codes, grouped by the sectors Shaz Marketing sells into.
const SECTORS = {
  automotive: {
    label: "Automotive",
    codes: ["45111", "45112", "45190", "45200", "45320"],
    angle: "New dealers and garages need enquiries before they need anything else.",
  },
  hospitality: {
    label: "Restaurants & Hospitality",
    codes: ["56101", "56102", "56103", "56302"],
    angle: "Bookings and covers — especially midweek — plus enquiries during service.",
  },
  beauty: {
    label: "Health, Beauty & Wellness",
    codes: ["96020", "93130", "96040"],
    angle: "Appointment-led, and almost entirely driven by Instagram.",
  },
  trades: {
    label: "Home & Trade Services",
    codes: ["43210", "43220", "43290", "43390", "41202"],
    angle: "Emergency and planned work behave differently — most run no ads at all.",
  },
  professional: {
    label: "Professional Services",
    codes: ["69201", "69202", "69102", "70229", "68310"],
    angle: "High client value, long decisions, usually no marketing at all early on.",
  },
};

function parseArgs(argv) {
  const out = { days: 3, sector: null, location: null, limit: 20 };
  for (let i = 0; i < argv.length; i++) {
    const next = argv[i + 1];
    if (argv[i] === "--days") out.days = Number(next);
    if (argv[i] === "--sector") out.sector = next;
    if (argv[i] === "--location") out.location = next;
    if (argv[i] === "--limit") out.limit = Number(next);
  }
  return out;
}

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function search({ key, codes, from, to, location, size }) {
  const params = new URLSearchParams({
    incorporated_from: from,
    incorporated_to: to,
    company_status: "active",
    size: String(size),
  });
  for (const c of codes) params.append("sic_codes", c);
  if (location) params.append("location", location);

  const res = await fetch(`${API}?${params}`, {
    headers: {
      // Companies House uses HTTP Basic with the key as username, blank password.
      Authorization: "Basic " + Buffer.from(`${key}:`).toString("base64"),
      Accept: "application/json",
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `${res.status} — the API key was rejected. Check COMPANIES_HOUSE_KEY is a live REST key, ` +
        "not a streaming key, and that the application is active."
    );
  }
  if (res.status === 429) throw new Error("429 — rate limited (600 requests per 5 min). Wait and retry.");
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from Companies House`);

  return res.json();
}

function formatAddress(a = {}) {
  return [a.address_line_1, a.locality, a.postal_code].filter(Boolean).join(", ");
}

async function main() {
  const key = process.env.COMPANIES_HOUSE_KEY;
  if (!key) {
    console.error("Missing COMPANIES_HOUSE_KEY.\n");
    console.error("Get a free key at https://developer.company-information.service.gov.uk");
    console.error("then run:  export COMPANIES_HOUSE_KEY=\"your-key\"");
    process.exit(1);
  }

  const { days, sector, location, limit } = parseArgs(process.argv.slice(2));
  const from = isoDaysAgo(days);
  const to = isoDaysAgo(0);
  const chosen = sector ? { [sector]: SECTORS[sector] } : SECTORS;

  if (sector && !SECTORS[sector]) {
    console.error(`Unknown sector "${sector}". Options: ${Object.keys(SECTORS).join(", ")}`);
    process.exit(1);
  }

  console.log(`# Prospects — companies incorporated ${from} to ${to}`);
  if (location) console.log(`Location filter: ${location}`);
  console.log("");

  let total = 0;

  for (const group of Object.values(chosen)) {
    let data;
    try {
      data = await search({ key, codes: group.codes, from, to, location, size: limit });
    } catch (err) {
      console.log(`## ${group.label}\n\nLookup failed: ${err.message}\n`);
      continue;
    }

    const items = data.items || [];
    if (items.length === 0) continue;

    console.log(`## ${group.label}  (${items.length})`);
    console.log(`_${group.angle}_\n`);

    for (const c of items) {
      const name = c.company_name;
      const num = c.company_number;
      const inc = c.date_of_creation;
      const addr = formatAddress(c.registered_office_address);
      console.log(`- **${name}**`);
      console.log(`  - Incorporated ${inc} · No. ${num}`);
      if (addr) console.log(`  - ${addr}`);
      console.log(`  - https://find-and-update.company-information.service.gov.uk/company/${num}`);
      total++;
    }
    console.log("");

    // Stay well inside the 600-per-5-minutes limit.
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`---\n${total} companies found. Sector slugs: ${Object.keys(SECTORS).join(", ")}`);
  console.log(
    "\nBefore contacting: companies can be called freely, but sole traders and " +
      "partnerships count as individuals under PECR and need consent before email. " +
      "Always identify yourself and offer an opt-out."
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
