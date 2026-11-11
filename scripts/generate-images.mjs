/**
 * Generate the site's images with the Higgsfield API.
 *
 * The Higgsfield connector in Claude is read-only — it can list models and
 * browse past generations, but it cannot generate. This goes straight at the
 * REST API instead.
 *
 * Auth is an API key ID and secret created at open.higgsfield.ai, sent as
 *   Authorization: Key <KEY_ID>:<KEY_SECRET>
 * Set HIGGSFIELD_KEY to "<id>:<secret>". In a sandbox where the key is stored
 * as a network secret, the proxy fills the header in, so the placeholder below
 * is sent and replaced on the way out.
 *
 * Usage
 *   npm run images:estimate     price one image, generate nothing
 *   npm run images              generate everything still missing
 *
 * Both set NODE_USE_ENV_PROXY=1. Node's built-in fetch ignores HTTPS_PROXY
 * unless told not to, so without it every request leaves unproxied and comes
 * back 401 even when the credential is configured correctly.
 *
 * Or directly:
 *   node scripts/generate-images.mjs --estimate        price it, generate nothing
 *   node scripts/generate-images.mjs --only=automotive just that one
 *   node scripts/generate-images.mjs                   generate everything missing
 *
 * Nothing is overwritten: a prompt whose output file already exists is
 * skipped, so a re-run after a failure only pays for what is still missing.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { PROMPTS, STYLE } from "./image-prompts.mjs";

const API = "https://api.higgsfield.ai";
const MODEL = "/alibaba/qwen-image-3/text-to-image";
const OUT_DIR = "public/images/generated";

/** Sent verbatim unless a proxy replaces it. */
const KEY = process.env.HIGGSFIELD_KEY ?? "PROXY_FILLS_THIS_IN";


/* ------------------------------------------------------------------------ */

function headers() {
  return {
    Authorization: `Key ${KEY}`,
    "Content-Type": "application/json",
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function estimate(job) {
  const res = await fetch(`${API}/estimate${MODEL}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ prompt: job.prompt, aspect_ratio: job.ratio, resolution: "2k" }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`estimate ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function submit(job) {
  const res = await fetch(`${API}${MODEL}`, {
    method: "POST",
    headers: { ...headers(), "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({
      prompt: `${job.prompt} ${STYLE}`,
      aspect_ratio: job.ratio,
      resolution: "2k",
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`submit ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

/** Two seconds, easing out to ten, as the docs ask for. */
async function waitFor(statusUrl) {
  let gap = 2000;
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, gap));
    gap = Math.min(gap + 1000, 10000);
    const res = await fetch(statusUrl, { headers: headers() });
    if (!res.ok) continue;
    const body = await res.json();
    if (["completed", "failed", "nsfw", "canceled"].includes(body.status)) return body;
  }
  throw new Error("timed out waiting for the generation");
}

/** The result shape moves between models, so dig rather than assume. */
function findUrl(body) {
  const seen = JSON.stringify(body);
  const match = seen.match(/https?:\/\/[^"\\ ]+\.(?:png|jpe?g|webp)/i);
  return match ? match[0] : null;
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.find((a) => a.startsWith("--only="))?.slice(7);
  const estimateOnly = args.includes("--estimate");

  await mkdir(OUT_DIR, { recursive: true });

  const jobs = only ? PROMPTS.filter((p) => p.name.includes(only)) : PROMPTS;
  if (jobs.length === 0) {
    console.error(`Nothing matches --only=${only}`);
    process.exit(1);
  }

  if (estimateOnly) {
    const one = await estimate(jobs[0]);
    console.log("Cost of one image:", JSON.stringify(one));
    console.log(`${jobs.length} images to make.`);
    return;
  }

  for (const job of jobs) {
    const out = join(OUT_DIR, `${job.name}.png`);
    if (await exists(out)) {
      console.log(`· ${job.name} — already there, skipping`);
      continue;
    }
    try {
      process.stdout.write(`· ${job.name} … `);
      const accepted = await submit(job);
      const done = await waitFor(accepted.status_url);
      if (done.status !== "completed") {
        console.log(`${done.status} (not charged)`);
        continue;
      }
      const url = findUrl(done);
      if (!url) {
        console.log("completed but no image URL in the response");
        console.log(JSON.stringify(done).slice(0, 500));
        continue;
      }
      const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
      await writeFile(out, bytes);
      console.log(`saved ${(bytes.length / 1024).toFixed(0)}KB`);
    } catch (err) {
      console.log(`failed — ${err.message}`);
    }
  }

  console.log(`\nDone. Files in ${OUT_DIR}. Convert to WebP before committing.`);
}

main();
