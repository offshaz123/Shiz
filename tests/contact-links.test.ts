import { test } from "node:test";
import assert from "node:assert/strict";
import { contactLinks } from "../src/lib/prospect-scan.ts";

/**
 * Which pages get fetched when the homepage carries no address.
 *
 * Worth testing because the budget is three requests against somebody
 * else's site and the ordering decides what they are spent on. A bug here
 * is invisible: the scan still succeeds, it just quietly comes back with no
 * email for a business that publishes one, and the prospect drops out of
 * the email list for good.
 */

const base = new URL("https://barkingdetailing.co.uk/");
const paths = (html: string) => contactLinks(html, base).map((u) => u.pathname);

test("a contact link beats an about link that appears first", () => {
  const html = `<a href="/about-us">About</a><a href="/contact">Contact</a>`;
  assert.deepEqual(paths(html), ["/contact", "/about-us"]);
});

test("a footer contact link is not lost to a header about link", () => {
  const html = `<a href="/about">About</a>${"<p>x</p>".repeat(50)}<a href="/get-in-touch">Talk</a>`;
  assert.equal(paths(html)[0], "/get-in-touch");
});

test("the privacy page is followed, because it has to name a contact", () => {
  const html = `<a href="/privacy-policy">Privacy</a>`;
  assert.deepEqual(paths(html), ["/privacy-policy"]);
});

test("at most three pages, however many match", () => {
  const html = ["/contact", "/enquiries", "/privacy", "/about", "/terms", "/booking"]
    .map((p) => `<a href="${p}">x</a>`)
    .join("");
  assert.equal(paths(html).length, 3);
});

test("links to other domains are never followed", () => {
  const html = `<a href="https://facebook.com/contact">Us</a><a href="/contact">Ours</a>`;
  assert.deepEqual(paths(html), ["/contact"]);
});

test("a site with nothing contact-shaped gives nothing to fetch", () => {
  assert.deepEqual(paths(`<a href="/services">Services</a><a href="/gallery">Gallery</a>`), []);
});
