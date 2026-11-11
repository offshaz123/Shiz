import { test } from "node:test";
import assert from "node:assert/strict";
import { extractEmail } from "../src/lib/prospect-scan.ts";
import { isBlockedAddress } from "../src/lib/scan-site.ts";
import { buildReport } from "../src/lib/site-audit.ts";

/**
 * The parts of the scanner that are quiet when they are wrong.
 *
 * Everything here is a pure function with no network and no database, which
 * is the point: these are the pieces that decide what goes into a cold email
 * to a stranger, and a mistake in them is not visible from the admin page.
 * It took somebody opening a prospect's website by hand to notice the email
 * extractor was only ever reading the homepage.
 */

test("mailto links are read", () => {
  assert.equal(extractEmail('<a href="mailto:info@barkingdetailing.co.uk">Email</a>'), "info@barkingdetailing.co.uk");
});

test("a generic inbox is preferred over a personal one", () => {
  const html = '<a href="mailto:dave@barkingdetailing.co.uk">Dave</a><a href="mailto:info@barkingdetailing.co.uk">Us</a>';
  assert.equal(extractEmail(html), "info@barkingdetailing.co.uk");
});

test("Cloudflare's obfuscated addresses are decoded", () => {
  // "info@barkingdetailing.co.uk" XORed with key 0x7a, the form Cloudflare emits.
  const address = "info@barkingdetailing.co.uk";
  const key = 0x7a;
  const hex =
    key.toString(16).padStart(2, "0") +
    [...address].map((c) => (c.charCodeAt(0) ^ key).toString(16).padStart(2, "0")).join("");
  assert.equal(extractEmail(`<a href="/cdn-cgi/l/email-protection#${hex}">email</a>`), address);
});

test("addresses written out to dodge scrapers are read", () => {
  assert.equal(extractEmail("<p>info (at) barkingdetailing (dot) co (dot) uk</p>"), "info@barkingdetailing.co.uk");
});

test("template placeholders and asset filenames are not addresses", () => {
  // "barkingdetailing.co.uk" above is a real-looking domain on purpose: the
  // junk list filters anything containing "example.", which is what stops a
  // template's placeholder address being emailed as though it were real.
  assert.equal(extractEmail('<img src="logo@2x.png"><p>you@yourdomain.com</p>'), "");
  assert.equal(extractEmail('<script src="https://sentry.io/x@sentry.js"></script>'), "");
});

test("private and reserved addresses are blocked", () => {
  for (const ip of ["127.0.0.1", "10.0.0.5", "192.168.1.1", "169.254.169.254", "::1", "fc00::1"]) {
    assert.equal(isBlockedAddress(ip), true, `${ip} should be blocked`);
  }
  for (const ip of ["93.184.216.34", "2606:2800:220:1:248:1893:25c8:1946"]) {
    assert.equal(isBlockedAddress(ip), false, `${ip} should be allowed`);
  }
});

test("a site behind a cookie banner is never told its pixel is missing", () => {
  // No tracking tags in the HTML at all, because consent has not been given.
  const html = `<html><head><title>A Business</title></head>
    <body><h1>A Business</h1><div id="onetrust-banner-sdk">We use cookies</div></body></html>`;
  const report = buildReport({
    html,
    finalUrl: "https://barkingdetailing.co.uk/",
    robots: true,
    sitemap: true,
    ms: 300,
  });

  const tracking = report.categories.find((c) => c.name === "Tracking & Advertising");
  assert.ok(tracking, "the tracking category should exist");
  for (const check of tracking.checks) {
    assert.equal(
      check.severity,
      "unknown",
      `${check.label} should be unknown behind a consent banner, not ${check.severity}`,
    );
  }
});

test("a site with no consent banner is told plainly what is missing", () => {
  const html = `<html><head><title>A Business</title></head><body><h1>A Business</h1></body></html>`;
  const report = buildReport({
    html,
    finalUrl: "https://barkingdetailing.co.uk/",
    robots: true,
    sitemap: true,
    ms: 300,
  });
  const tracking = report.categories.find((c) => c.name === "Tracking & Advertising");
  assert.ok(tracking?.checks.some((c) => c.severity === "critical" || c.severity === "warning"));
});
