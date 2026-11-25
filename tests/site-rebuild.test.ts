import { test } from "node:test";
import assert from "node:assert/strict";
import { absolute, rebuildFrom, text } from "../src/lib/site-rebuild.ts";

/**
 * Pulling a business out of its own homepage.
 *
 * Worth testing because everything this produces ends up on a page
 * carrying that business's name and logo, sent to the owner. A service
 * invented out of a testimonial heading, or a photograph that turns out
 * to be a Visa logo, is the detail that tells them a machine made it,
 * and after that nothing else on the page is believed.
 */

const PAGE = `<!doctype html>
<html><head>
  <title>Barton Tyres | Tyre Fitting in Manchester | Cheap Tyres Near You</title>
  <meta name="description" content="Mobile tyre fitting across Manchester, seven days a week, at the roadside or on your drive.">
  <meta property="og:site_name" content="Barton Tyres">
  <meta property="og:image" content="/social/card.jpg">
  <meta name="theme-color" content="#0b7a3b">
  <style>.btn{background:#0b7a3b}.alt{background:#0b7a3b}</style>
</head><body>
  <img src="/img/logo.svg" alt="Barton Tyres logo">
  <h1>Tyres fitted where you are</h1>
  <h2>Why choose us</h2>
  <h2>Mobile tyre fitting</h2>
  <h2>Puncture repair</h2>
  <h2>Prices start from &pound;45</h2>
  <h2>Prices start from &pound;80</h2>
  <h3>Wheel balancing</h3>
  <h3>Contact</h3>
  <p>Short caption.</p>
  <p>We have been fitting tyres across Greater Manchester since 2009, from a van that carries everything needed to do the job on your driveway. Most calls are seen the same day, and we carry stock for the common sizes so you are not waiting on a delivery.</p>
  <p>Copyright 2026 Barton Tyres. All rights reserved and terms apply to every booking made through this website.</p>
  <img src="/img/van.jpg" width="900" height="600" alt="">
  <img src="/img/fitting.jpg?w=1200&amp;q=75" width="900" height="600" alt="">
  <img src="/img/visa-badge.png" width="60" height="40" alt="">
  <img src="/img/icon-tick.svg" width="24" height="24" alt="">
  <a href="tel:0161 123 4567">Call us</a>
  <a href="mailto:Hello@BartonTyres.co.uk">Email</a>
</body></html>`;

const BASE = "https://bartontyres.co.uk/";
const them = rebuildFrom(PAGE, BASE);

test("the name is the business, not the whole title tag", () => {
  assert.equal(them.name, "Barton Tyres");
});

test("a title with no og:site_name is cut at the first separator", () => {
  const without = rebuildFrom(PAGE.replace(/<meta property="og:site_name"[^>]*>/, ""), BASE);
  assert.equal(without.name, "Barton Tyres");
});

test("the tagline is their own description", () => {
  assert.match(them.tagline, /Mobile tyre fitting across Manchester/);
});

test("the logo is the image that says it is one", () => {
  assert.equal(them.logo, "https://bartontyres.co.uk/img/logo.svg");
});

test("services are what they sell, not the furniture around it", () => {
  assert.ok(them.services.includes("Mobile tyre fitting"));
  assert.ok(them.services.includes("Puncture repair"));
  assert.ok(them.services.includes("Wheel balancing"));
  assert.ok(!them.services.includes("Why choose us"), "section heading got through");
  assert.ok(!them.services.includes("Contact"), "navigation got through");
});

test("a price list counts once, not once per price", () => {
  const prices = them.services.filter((s) => /Prices start from/i.test(s));
  assert.equal(prices.length, 1, "the same heading repeated down a price list");
});

test("photographs are photographs, not badges and icons", () => {
  assert.ok(them.images.some((src) => src.endsWith("/img/van.jpg")));
  assert.ok(!them.images.some((src) => /visa|icon-tick/.test(src)), "furniture got through");
});

test("an escaped ampersand in an image address is decoded", () => {
  // Left as &amp; the picture 404s, which is how the first version of
  // this shipped a page full of broken images.
  const fitting = them.images.find((src) => src.includes("fitting.jpg"));
  assert.ok(fitting);
  assert.ok(fitting.includes("&q=75"));
  assert.ok(!fitting.includes("&amp;"));
});

test("the logo never turns up as a photograph", () => {
  assert.ok(!them.images.includes(them.logo));
});

test("the brand colour is the one the page declares", () => {
  assert.equal(them.colour, "#0b7a3b");
});

test("the phone and address come off their own links", () => {
  assert.equal(them.phone, "0161 123 4567");
  assert.equal(them.email, "hello@bartontyres.co.uk");
});

test("the about paragraph is the prose, not the caption or the small print", () => {
  assert.match(them.about, /fitting tyres across Greater Manchester/);
  assert.ok(!/All rights reserved/.test(them.about));
});

test("a page with nothing on it produces nothing, rather than guesses", () => {
  const empty = rebuildFrom("<html><body></body></html>", BASE);
  assert.equal(empty.name, "");
  assert.deepEqual(empty.services, []);
  assert.deepEqual(empty.images, []);
});

test("addresses that cannot be resolved are dropped, not passed through", () => {
  assert.equal(absolute("", BASE), "");
  assert.equal(absolute("data:image/png;base64,AAAA", BASE), "");
  assert.equal(absolute("/a.jpg", BASE), "https://bartontyres.co.uk/a.jpg");
});

test("entities in page text come back as the characters a person reads", () => {
  assert.equal(text("<p>Tyres &amp; wheels &pound;45</p>").replace(/\s+/g, " ").trim(), "Tyres & wheels 45");
});
