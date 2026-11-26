import { test } from "node:test";
import assert from "node:assert/strict";
import { LEAST_IMAGES, liveImages } from "../src/lib/preview-quality.ts";

/**
 * The gate that stops an empty page reaching somebody's inbox.
 *
 * Walid opened a preview we had sent a Texas homebuilder and found a
 * black screen with their name on it and nothing else. Their site is
 * full of photographs; it draws them with JavaScript after the page
 * loads, and we read the HTML as the server sends it, which for that
 * site is an empty shell.
 *
 * Nothing was broken in the page builder — it drew exactly what it was
 * given. What was missing was anybody checking before the link went in
 * an email. A stranger who opens a link from us and finds an empty page
 * does not open a second one, so the cost of one bad preview is the
 * whole relationship.
 */

const real = globalThis.fetch;
function pretend(answer: (url: string) => { status: number; type: string } | "throw") {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    const a = answer(url);
    if (a === "throw") throw new Error("refused");
    return new Response(null, { status: a.status, headers: { "content-type": a.type } });
  }) as typeof fetch;
}
const restore = () => {
  globalThis.fetch = real;
};

test("three is the floor, and it is the number the gate uses", () => {
  assert.equal(LEAST_IMAGES, 3);
});

test("pictures that really load are counted", async () => {
  pretend(() => ({ status: 200, type: "image/jpeg" }));
  try {
    assert.equal(await liveImages(["https://x.test/a.jpg", "https://x.test/b.jpg", "https://x.test/c.jpg"]), 3);
  } finally {
    restore();
  }
});

/**
 * A URL in an img tag is a claim, not a photograph. This is the case
 * that produces a page of empty frames, which looks worse than a page
 * with three pictures on it.
 */
test("a dead address is not a picture", async () => {
  pretend((url) => (url.includes("gone") ? { status: 404, type: "text/html" } : { status: 200, type: "image/png" }));
  try {
    assert.equal(await liveImages(["https://x.test/ok1.png", "https://x.test/gone.png", "https://x.test/ok2.png", "https://x.test/gone2.png"], 10), 2);
  } finally {
    restore();
  }
});

test("a page that answers with HTML where a picture should be does not count", async () => {
  pretend(() => ({ status: 200, type: "text/html; charset=utf-8" }));
  try {
    assert.equal(await liveImages(["https://x.test/a.jpg", "https://x.test/b.jpg", "https://x.test/c.jpg"], 10), 0);
  } finally {
    restore();
  }
});

/**
 * Hotlink protection: a CDN that serves its own pages happily and
 * answers 403 to everybody else. Common enough to have a name, and it
 * gives exactly the same empty frames as a dead link.
 */
test("a server refusing other domains counts as no picture", async () => {
  pretend(() => ({ status: 403, type: "image/jpeg" }));
  try {
    assert.equal(await liveImages(["https://x.test/a.jpg", "https://x.test/b.jpg"], 10), 0);
  } finally {
    restore();
  }
});

test("a server that throws is not a picture either", async () => {
  pretend(() => "throw");
  try {
    assert.equal(await liveImages(["https://x.test/a.jpg", "https://x.test/b.jpg"], 10), 0);
  } finally {
    restore();
  }
});

test("a partial-content answer is a picture, because that is what asking for one byte returns", async () => {
  pretend(() => ({ status: 206, type: "image/webp" }));
  try {
    assert.equal(await liveImages(["https://x.test/a.webp", "https://x.test/b.webp", "https://x.test/c.webp"]), 3);
  } finally {
    restore();
  }
});

/**
 * This runs while a cron is waiting. Proving the twelfth picture works
 * adds nothing to a decision the third one already made.
 */
test("checking stops once enough have passed", async () => {
  let asked = 0;
  pretend(() => {
    asked += 1;
    return { status: 200, type: "image/jpeg" };
  });
  try {
    await liveImages(Array.from({ length: 40 }, (_, i) => `https://x.test/p${i}.jpg`), 3);
    assert.ok(asked <= 8, `asked for ${asked}, which is more than it needed`);
  } finally {
    restore();
  }
});

test("an address that is not a url is not a picture", async () => {
  pretend(() => ({ status: 200, type: "image/jpeg" }));
  try {
    assert.equal(await liveImages(["not a url", "/relative.jpg"], 10), 0);
  } finally {
    restore();
  }
});

test("no pictures at all is the JavaScript-built site, and it comes back nought", async () => {
  pretend(() => ({ status: 200, type: "image/jpeg" }));
  try {
    assert.equal(await liveImages([]), 0);
  } finally {
    restore();
  }
});
