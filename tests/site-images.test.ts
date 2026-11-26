import { test } from "node:test";
import assert from "node:assert/strict";
import { rebuildFrom } from "../src/lib/site-rebuild.ts";

/**
 * Which pictures come off a business's own site.
 *
 * This is the bug Walid found on a physiotherapy clinic, and he was
 * right to be annoyed. Their site has nine photographs of treatment
 * rooms. The page we sent them showed about-shape-1.webp,
 * about-shape-2.webp and wh-shape-5.webp — three grey smudges a
 * template ships with to put behind a heading.
 *
 * Two causes. The first was that decoration was never excluded. The
 * second was subtler and worse: images were taken in document order and
 * capped at six, and a bought template puts its decoration at the top of
 * the page and its content at the bottom, so taking the first six was
 * close to taking the six least useful ones.
 */

/**
 * rebuildFrom ignores anything under 200 characters as not being a page,
 * so the fixtures carry a paragraph of filler. Without it these tests
 * all pass by returning nothing at all, which is the most misleading
 * way a test can be green.
 */
const FILLER =
  "<p>We are a physiotherapy clinic and we have been treating people in this town for a long time now.</p>";
const page = (body: string) =>
  `<html><head><title>A Clinic</title></head><body>${FILLER}${body}${FILLER}</body></html>`;
const base = "https://clinic.example.com/";
const shots = (body: string) => rebuildFrom(page(body), base).images.map((s) => s.replace(base, ""));

test("theme decoration never reaches the page", () => {
  const got = shots(`
    <img src="assets/img/about/about-shape-1.webp" width="400" height="400">
    <img src="assets/img/hero/hero-shape-1.webp" width="400" height="400">
    <img src="assets/img/about/wh-shape-5.webp" width="400" height="400">
    <img src="assets/img/footer-shape-2.webp" width="400" height="400">
    <img src="assets/img/services/service-1.webp" width="800" height="600">
  `);
  assert.deepEqual(got, ["assets/img/services/service-1.webp"]);
});

test("waves, blobs, patterns and the rest of the furniture go too", () => {
  const got = shots(`
    <img src="/img/wave-top.png" width="900" height="300">
    <img src="/img/pattern-dots.webp" width="900" height="300">
    <img src="/img/blob-2.png" width="900" height="300">
    <img src="/img/section-divider.webp" width="900" height="300">
    <img src="/img/gallery/room.jpg" width="900" height="600">
  `);
  assert.deepEqual(got, ["img/gallery/room.jpg"]);
});

test("other people's logos are not this business's photographs", () => {
  const got = shots(`
    <img src="/img/clients/client-1.webp" width="300" height="200">
    <img src="/img/partners/bupa.png" width="300" height="200">
    <img src="/img/awards/award-2024.png" width="300" height="200">
    <img src="/img/work/fitted-kitchen.jpg" width="900" height="600">
  `);
  assert.deepEqual(got, ["img/work/fitted-kitchen.jpg"]);
});

/**
 * The ordering fix. Nine service photographs sat below six pieces of
 * decoration, and the cap of six meant none of them was ever reached.
 */
test("the real photographs come first, whatever order the page is in", () => {
  const got = shots(`
    <img src="/img/hero/hero-bg.jpg" width="1600" height="900">
    <img src="/img/blog/blog-1.webp" width="600" height="400">
    <img src="/img/about/about.us.jpg" width="800" height="600">
    <img src="/img/services/service-1.webp" width="800" height="600">
  `);
  // Services beat hero beats about beats blog.
  assert.deepEqual(got, [
    "img/services/service-1.webp",
    "img/hero/hero-bg.jpg",
    "img/about/about.us.jpg",
    "img/blog/blog-1.webp",
  ]);
});

test("a run of service photographs keeps the order the business chose", () => {
  const got = shots(
    [1, 2, 3, 4, 5]
      .map((n) => `<img src="/img/services/service-${n}.webp" width="800" height="600">`)
      .join(""),
  );
  assert.deepEqual(got, [1, 2, 3, 4, 5].map((n) => `img/services/service-${n}.webp`));
});

test("more than six are kept, because nine is what that clinic had", () => {
  const got = shots(
    Array.from({ length: 14 }, (_, n) => `<img src="/img/work/job-${n}.jpg" width="800" height="600">`).join(""),
  );
  assert.equal(got.length, 12);
});

/**
 * Lazy loading. A template often puts a blurred thumbnail in src and the
 * real photograph in srcset, which is how blurry pictures ended up on a
 * page we sent somebody.
 */
test("the biggest version in a srcset wins over a blurred placeholder", () => {
  const got = shots(
    `<img src="/img/tiny/blur.jpg" srcset="/img/work/small.jpg 400w, /img/work/big.jpg 1600w" width="800" height="600">`,
  );
  assert.deepEqual(got, ["img/work/big.jpg"]);
});

test("a photograph set as a css background is still a photograph", () => {
  const got = shots(`<div style="background-image:url('/img/hero/shopfront.jpg')"></div>`);
  assert.deepEqual(got, ["img/hero/shopfront.jpg"]);
});

test("a css background that is a gradient or a shape is not", () => {
  const got = shots(`
    <div style="background:linear-gradient(red,blue)"></div>
    <div style="background-image:url('/img/hero/hero-shape-1.webp')"></div>
    <div style="background-image:url('/img/pattern.svg')"></div>
  `);
  assert.deepEqual(got, []);
});

test("icons and payment badges are still kept out", () => {
  const got = shots(`
    <img src="/img/icons/visa.png" width="300" height="200">
    <img src="/img/trustpilot.png" width="300" height="200">
    <img src="/img/avatar-kaynat.jpeg" width="300" height="300">
    <img src="/img/services/massage.jpg" width="800" height="600">
  `);
  assert.deepEqual(got, ["img/services/massage.jpg"]);
});

test("the logo does not become the hero photograph", () => {
  const built = rebuildFrom(
    page(`<img src="/assets/img/logo-black.png" width="300" height="120">
          <img src="/img/services/service-1.webp" width="800" height="600">`),
    base,
  );
  assert.ok(!built.images.includes(`${base}assets/img/logo-black.png`));
});

test("a page with nothing but decoration gives no photographs, not bad ones", () => {
  assert.deepEqual(shots(`<img src="/img/shape-1.webp" width="400" height="400">`), []);
});
