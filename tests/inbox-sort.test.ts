import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, extractReplyText, isBounce, isNoise } from "../src/lib/inbox-sort.ts";

/**
 * Every sender here was in the real info@shazmarketing.com inbox in the
 * month to 23 November 2026. The job is to keep a reply from a business
 * out of the pile with the DMARC reports in it, and to never do the
 * reverse.
 */

const msg = (over: Partial<Parameters<typeof classify>[0]>) => ({
  from: "someone@example.co.uk",
  subject: "Hello",
  ...over,
});

test("a failure report is a bounce, not noise", () => {
  // Tested before noise on purpose: a mail daemon reads as automated
  // either way, and a bounce is the one with a job attached to it.
  assert.equal(
    classify(msg({ from: "mailer-daemon@bounce.mail.hostinger.com", subject: "Undelivered Mail Returned to Sender" })),
    "bounced",
  );
  assert.equal(classify(msg({ from: "postmaster@someisp.net", subject: "Delivery has failed" })), "bounced");
  assert.ok(isBounce(msg({ from: "anything@bounces.example.com", subject: "x" })));
});

test("the machinery goes to other", () => {
  for (const from of [
    "noreply-dmarc-support@google.com",
    "dmarcreport@microsoft.com",
    "noreply@dmarc.yahoo.com",
    "dmarcreports@secureserver.net",
    "bounces+36941951-1248-info=shazmarketing.com@em9481.i.service.tiktok.com",
    "bounces+8215937-18a5-info=shazmarketing.com@post.trustpilot.com",
    "no-reply@herofishcardshop.com",
  ]) {
    assert.equal(classify(msg({ from, subject: "Report Domain: shazmarketing.com" })), "other", from);
  }
});

test("a sender that declares itself automated goes to other", () => {
  // The honest signal, and it beats guessing from the address.
  assert.ok(isNoise(msg({ headers: { "list-unsubscribe": "<https://x.com/u>" } })));
  assert.ok(isNoise(msg({ headers: { precedence: "bulk" } })));
  assert.ok(isNoise(msg({ headers: { "auto-submitted": "auto-replied" } })));
  // auto-submitted: no is the explicit "a person sent this".
  assert.ok(!isNoise(msg({ headers: { "auto-submitted": "no" } })));
});

test("a business we wrote to is always a reply", () => {
  // The one that must never be got wrong. Even if their mail looks
  // automated, a business we approached writing back is the message the
  // whole system exists to produce.
  assert.equal(
    classify(msg({ from: "noreply@dagenhambuilder.co.uk", known: true, subject: "Re: your website" })),
    "reply",
  );
  assert.equal(classify(msg({ from: "dave@dagenhambuilder.co.uk", known: true })), "reply");
});

test("a stranger writing in is a reply, not noise", () => {
  // Somebody who found the website and wrote is the most valuable thing
  // in the inbox, and nothing about their address says so.
  assert.equal(classify(msg({ from: "sohab@gmail.com", subject: "Quote for a website" })), "reply");
  assert.equal(classify(msg({ from: "anna@someroofing.co.uk", subject: "Re: Three things" })), "reply");
});

test("reads what they said and drops the quoted copy of our own email", () => {
  const source = [
    "From: dave@dagenhambuilder.co.uk",
    "Subject: Re: Three things on your website",
    "Content-Type: text/plain; charset=utf-8",
    "",
    "Thanks for this. We know the site is dated.",
    "Can you do a price for a new one?",
    "",
    "On Mon, 23 Nov 2026, Walid Shah wrote:",
    "> I had a look at your website this morning",
    "> and there are a couple of things on it",
  ].join("\n");

  const said = extractReplyText(source);
  assert.match(said, /^Thanks for this/);
  assert.match(said, /price for a new one/);
  assert.ok(!said.includes("I had a look"), "the quoted original is still in it");
  assert.ok(!said.includes("wrote:"));
});

test("prefers the plain text part of a multipart reply", () => {
  const source = [
    "Content-Type: multipart/alternative; boundary=XYZ",
    "",
    "--XYZ",
    "Content-Type: text/plain; charset=utf-8",
    "",
    "Not interested thanks.",
    "",
    "--XYZ",
    "Content-Type: text/html; charset=utf-8",
    "",
    "<div><p>Not interested thanks.</p></div>",
    "",
    "--XYZ--",
  ].join("\n");

  assert.equal(extractReplyText(source), "Not interested thanks.");
});

test("an HTML-only reply comes back as words rather than tags", () => {
  const source = [
    "Content-Type: text/html; charset=utf-8",
    "",
    "<html><body><p>Give me a ring on 07700 900123.</p></body></html>",
  ].join("\n");

  const said = extractReplyText(source);
  assert.match(said, /Give me a ring on 07700 900123/);
  assert.ok(!said.includes("<"));
});

test("quoted-printable is decoded rather than shown raw", () => {
  const source = [
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    "Thanks =E2=80=94 we already have an agency.",
  ].join("\n");

  assert.match(extractReplyText(source), /Thanks — we already have an agency/);
});
