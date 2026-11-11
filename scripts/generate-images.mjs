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
 *   node scripts/generate-images.mjs --estimate        price it, generate nothing
 *   node scripts/generate-images.mjs --only=automotive just that one
 *   node scripts/generate-images.mjs                   generate everything missing
 *
 * Nothing is overwritten: a prompt whose output file already exists is
 * skipped, so a re-run after a failure only pays for what is still missing.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const API = "https://api.higgsfield.ai";
const MODEL = "/higgsfield/ads-studio/v1.0";
const OUT_DIR = "public/images/generated";

/** Sent verbatim unless a proxy replaces it. */
const KEY = process.env.HIGGSFIELD_KEY ?? "PROXY_FILLS_THIS_IN";

/**
 * House style, appended to every prompt.
 *
 * No text, ever: image models still render type as mush, and a garbled word
 * on a real page looks worse than no image. Headlines go on afterwards in
 * code, where they are sharp, translatable and readable by a screen reader.
 *
 * No faces that could be mistaken for a client, and nothing that implies we
 * did work we have not done.
 */
const STYLE =
  "Photographic, natural daylight, shallow depth of field, muted colour, " +
  "British setting. No text, no words, no lettering, no logos, no signage, " +
  "no watermarks. No direct eye contact with the camera. Unposed and " +
  "ordinary rather than stock-photo cheerful.";

/** 16:9 for page headers, 1:1 only where a square genuinely fits. */
const PROMPTS = [
  // --- Services -----------------------------------------------------------
  {
    name: "service-meta-ads",
    ratio: "16:9",
    prompt:
      "Over-the-shoulder view of a phone held in one hand, scrolling a social feed, " +
      "in the cab of a working van with the door open onto a grey street.",
  },
  {
    name: "service-google-ads",
    ratio: "16:9",
    prompt:
      "A phone on a workbench among tools, screen lit, someone reaching for it with " +
      "a hand that has been working. Late afternoon light through a roller door.",
  },
  {
    name: "service-seo",
    ratio: "16:9",
    prompt:
      "A small shopfront on a British high street at dusk, lights on inside, seen " +
      "from across the road. Quiet, ordinary, a little worn.",
  },
  {
    name: "service-web-design",
    ratio: "16:9",
    prompt:
      "A laptop and a phone side by side on a kitchen table, both screens bright but " +
      "unreadable at this angle, a mug and a notebook beside them. Morning light.",
  },
  {
    name: "service-social",
    ratio: "16:9",
    prompt:
      "Someone filming a short clip on a phone propped against a toolbox in a small " +
      "workshop. Rough, real, not a studio.",
  },

  // --- Industries ---------------------------------------------------------
  {
    name: "industry-automotive",
    ratio: "16:9",
    prompt:
      "A car on a lift in a small independent garage, one mechanic underneath, " +
      "strip lighting, oil-stained concrete floor.",
  },
  {
    name: "industry-health-beauty",
    ratio: "16:9",
    prompt:
      "A small treatment room in a beauty salon, clean towels folded, a chair and a " +
      "mirror, soft daylight through a frosted window. Nobody in shot.",
  },
  {
    name: "industry-hospitality",
    ratio: "16:9",
    prompt:
      "The pass of a small restaurant kitchen mid-service, hands plating, steam, " +
      "warm overhead light. Faces out of frame.",
  },
  {
    name: "industry-home-trades",
    ratio: "16:9",
    prompt:
      "A plumber's van with the back doors open on a residential street, tools and " +
      "pipe stacked inside, grey British weather.",
  },
  {
    name: "industry-professional-services",
    ratio: "16:9",
    prompt:
      "A small office above a shop, two desks, papers and a desk lamp, net curtains, " +
      "late afternoon. Lived in rather than corporate.",
  },
  {
    name: "industry-property",
    ratio: "16:9",
    prompt:
      "A set of keys on the worktop of an empty flat, boxes stacked behind, bare " +
      "walls, light from a window with no curtains.",
  },
  {
    name: "industry-fitness",
    ratio: "16:9",
    prompt:
      "A small independent gym early in the morning, racks and plates, nobody there " +
      "yet, low sun through high windows.",
  },
  {
    name: "industry-retail",
    ratio: "16:9",
    prompt:
      "The counter of a small independent shop, card machine and packaging, stock on " +
      "shelves behind, daylight from the front window.",
  },
];

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
    body: JSON.stringify({ prompt: job.prompt, aspect_ratio: job.ratio, batch_size: 1 }),
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
      batch_size: 1,
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
