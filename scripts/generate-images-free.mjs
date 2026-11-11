/**
 * Generate the site's images for free, via Pollinations.
 *
 * The Higgsfield route works but bills a prepaid API balance that is separate
 * from the app subscription credits, and that balance is empty — every
 * request came back 403 not_enough_credits. This needs no key and no account.
 *
 * The free tier allows one image every 45 seconds per IP, so the run paces
 * itself at 50. Thirteen images takes about eleven minutes and costs nothing.
 *
 * Usage
 *   npm run images:free                 everything still missing
 *   node scripts/generate-images-free.mjs --only=automotive
 *
 * Nothing is overwritten: a prompt whose file already exists is skipped, so a
 * re-run after a failure only fetches what is still missing.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { PROMPTS, STYLE } from "./image-prompts.mjs";

const OUT_DIR = "public/images/generated";
const GAP_MS = 50_000; // the documented limit is one per 45s
const WIDTH = 1600;
const HEIGHT = 900;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Pollinations takes the prompt in the URL path, so it has to survive
 * encoding. A seed keeps a re-run of the same prompt reproducible.
 */
function urlFor(job) {
  const prompt = encodeURIComponent(`${job.prompt} ${STYLE}`);
  const params = new URLSearchParams({
    width: String(WIDTH),
    height: String(HEIGHT),
    nologo: "true",
    seed: String(job.seed ?? 1),
  });
  return `https://image.pollinations.ai/prompt/${prompt}?${params}`;
}

/** One retry, because the rate limit is per IP and shared with nobody here. */
async function fetchImage(job) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(urlFor(job));
    const type = res.headers.get("content-type") ?? "";

    if (res.ok && type.startsWith("image/")) {
      return Buffer.from(await res.arrayBuffer());
    }

    // A 402 here means the rate limit, not a bill — it says how long to wait.
    const body = await res.text();
    if (attempt === 2) {
      throw new Error(`${res.status} ${body.slice(0, 160)}`);
    }
    await wait(GAP_MS);
  }
  throw new Error("unreachable");
}

async function main() {
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  await mkdir(OUT_DIR, { recursive: true });

  const jobs = (only ? PROMPTS.filter((p) => p.name.includes(only)) : PROMPTS).filter(
    async (job) => !(await exists(join(OUT_DIR, `${job.name}.jpg`))),
  );

  if (jobs.length === 0) {
    console.error(only ? `Nothing matches --only=${only}` : "Nothing to do.");
    process.exit(1);
  }

  console.log(`${jobs.length} to fetch, one every ${GAP_MS / 1000}s.\n`);

  let made = 0;
  let first = true;

  for (const job of jobs) {
    const out = join(OUT_DIR, `${job.name}.jpg`);
    if (await exists(out)) {
      console.log(`· ${job.name} — already there, skipping`);
      continue;
    }

    if (!first) await wait(GAP_MS);
    first = false;

    try {
      process.stdout.write(`· ${job.name} … `);
      const bytes = await fetchImage(job);
      await writeFile(out, bytes);
      made++;
      console.log(`${(bytes.length / 1024).toFixed(0)}KB`);
    } catch (err) {
      console.log(`failed — ${err.message}`);
    }
  }

  console.log(`\n${made} of ${jobs.length} saved to ${OUT_DIR}.`);
}

main();
