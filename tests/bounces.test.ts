import { test } from "node:test";
import assert from "node:assert/strict";
import { isBounceSender, looksLikeBounce, parseBounce } from "../src/lib/bounces.ts";

/**
 * The messages here are built from the real failures in the mail server's
 * outbound log for 16 to 23 November 2026: a Gmail "account does not exist",
 * a Hostinger "no MX record", and a deferral that must not be mistaken for
 * either of them.
 */

const GMAIL_NO_SUCH_USER = `From: MAILER-DAEMON@bounce.mail.hostinger.com
Subject: Undelivered Mail Returned to Sender
Content-Type: multipart/report; report-type=delivery-status; boundary="ABC"

--ABC
Content-Type: text/plain; charset=us-ascii

This is the mail system at host smtp.hostinger.com.

I'm sorry to have to inform you that your message could not
be delivered to one or more recipients.

--ABC
Content-Type: message/delivery-status

Reporting-MTA: dns; smtp.hostinger.com
X-Postfix-Queue-ID: 4jXyz1

Final-Recipient: rfc822; skytechelectricallimited@gmail.com
Original-Recipient: rfc822;skytechelectricallimited@gmail.com
Action: failed
Status: 5.1.1
Remote-MTA: dns; gmail-smtp-in.l.google.com
Diagnostic-Code: smtp; 550-5.1.1 The email account that you tried to reach does
 not exist. Please try double-checking the recipient's email address for typos
 or unnecessary spaces.

--ABC--
`;

const NO_MX_RECORD = `From: mailer-daemon@bounce.mail.hostinger.com
Subject: Undelivered Mail Returned to Sender

Final-Recipient: rfc822; info@refinedrides.com
Action: failed
Status: 5.0.0
Diagnostic-Code: smtp; 550 giving up after 2 attempts: no MX record, implicit MX failed to connect
`;

const GREYLISTED = `From: mailer-daemon@bounce.mail.hostinger.com
Subject: Delivery Status Notification (Delay)

Final-Recipient: rfc822; info@clintsdetailing.co.uk
Action: delayed
Status: 4.2.0
Diagnostic-Code: smtp; 450 4.2.0 Recipient address rejected: greylist in action. Please try again in few minutes
`;

test("reads the dead address out of a Gmail no-such-user bounce", () => {
  const dead = parseBounce(GMAIL_NO_SUCH_USER);
  assert.equal(dead.length, 1);
  assert.equal(dead[0].email, "skytechelectricallimited@gmail.com");
  // The folded three-line diagnostic comes back as one readable sentence.
  assert.match(dead[0].reason, /^550-5\.1\.1 The email account/);
  assert.ok(!dead[0].reason.includes("\n"));
});

test("a domain with no mail server counts as dead", () => {
  const dead = parseBounce(NO_MX_RECORD);
  assert.deepEqual(
    dead.map((d) => d.email),
    ["info@refinedrides.com"],
  );
  assert.match(dead[0].reason, /no MX record/);
});

test("a greylist delay is not a dead address", () => {
  // The single most important case in this file. info@clintsdetailing.co.uk
  // was deferred on 21 November and then delivered. Marking it dead would
  // have stopped the sequence for a business that got the email.
  assert.deepEqual(parseBounce(GREYLISTED), []);
});

test("a 5.x.x status with no failed action is left alone", () => {
  const odd = `Final-Recipient: rfc822; someone@example.co.uk
Action: delayed
Status: 5.0.0
`;
  assert.deepEqual(parseBounce(odd), []);
});

test("a multi-recipient report only reports the one that failed", () => {
  const mixed = `Final-Recipient: rfc822; good@live.co.uk
Action: delivered
Status: 2.0.0

Final-Recipient: rfc822; bad@live.co.uk
Action: failed
Status: 5.1.1
Diagnostic-Code: smtp; 550 user unknown
`;
  assert.deepEqual(
    parseBounce(mixed).map((d) => d.email),
    ["bad@live.co.uk"],
  );
});

test("the same address reported twice is one dead address", () => {
  const twice = `Final-Recipient: rfc822; bad@live.co.uk
Action: failed
Status: 5.1.1

Final-Recipient: rfc822; <bad@live.co.uk>
Action: failed
Status: 5.1.1
`;
  assert.equal(parseBounce(twice).length, 1);
});

test("an ordinary email is not a bounce", () => {
  const reply = `From: dave@someroofing.co.uk
Subject: Re: your website

Not interested thanks.
`;
  assert.deepEqual(parseBounce(reply), []);
});

test("a mangled recipient line is ignored rather than guessed at", () => {
  const broken = `Final-Recipient: rfc822;
Action: failed
Status: 5.1.1
`;
  assert.deepEqual(parseBounce(broken), []);
  const domainOnly = `Final-Recipient: rfc822; refinedrides.com
Action: failed
Status: 5.1.1
`;
  assert.deepEqual(parseBounce(domainOnly), []);
});

test("knows a mail system from a person", () => {
  assert.ok(isBounceSender("MAILER-DAEMON@bounce.mail.hostinger.com"));
  assert.ok(isBounceSender("postmaster@someisp.net"));
  assert.ok(isBounceSender("anything@bounces.example.com"));
  assert.ok(!isBounceSender("dave@someroofing.co.uk"));
  assert.ok(!isBounceSender("not-an-address"));
});

test("opens a message that looks like a bounce either way round", () => {
  assert.ok(looksLikeBounce("mailer-daemon@x.com", "anything at all"));
  assert.ok(looksLikeBounce("noreply@someisp.net", "Undeliverable: your website"));
  assert.ok(!looksLikeBounce("dave@someroofing.co.uk", "Re: your website"));
});

test("a scrypt password round-trips and a wrong one does not", async () => {
  const { hashPassword, passwordMatches, toUsername } = await import("../src/lib/staff.ts");
  const stored = hashPassword("correct horse battery");
  assert.ok(passwordMatches("correct horse battery", stored));
  assert.ok(!passwordMatches("correct horse batter", stored));
  // Two hashes of the same password differ, because each gets its own salt.
  assert.notEqual(stored, hashPassword("correct horse battery"));
  // And a stored value that is not ours is never a match.
  assert.ok(!passwordMatches("anything", "plain:text"));
  assert.equal(toUsername("  Sam Ali! "), "samali");
});
