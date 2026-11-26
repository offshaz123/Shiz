import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allowanceNow,
  DAY_ENDS,
  localTime,
  minutesSinceDayStart,
  nextSlot,
  openNow,
  PER_SLOT,
  sendingWords,
  SLOTS,
  slotsDue,
} from "../src/lib/sending-hours.ts";
import { plainToHtml } from "../src/lib/plain-to-html.ts";

/**
 * What time it is where the email is going.
 *
 * Worth testing because the failure is invisible from here: everything
 * looks right on the admin page in Pakistan while an American business
 * wakes up to a sales email timestamped three in the morning, and the
 * only person who ever finds out is the one who deletes it.
 *
 * The dates are fixed instants in UTC, so these assertions are about
 * zone conversion and nothing else.
 */

/** 2026-01-15 is winter: London is UTC, Chicago is UTC-6. */
const winter = (hhmm: string) => new Date(`2026-01-15T${hhmm}:00Z`);
/** 2026-07-15 is summer: London is UTC+1, Chicago is UTC-5. */
const summer = (hhmm: string) => new Date(`2026-07-15T${hhmm}:00Z`);

test("the clock read is the country's own, not ours", () => {
  assert.equal(localTime("uk", winter("10:00")).hour, 10);
  assert.equal(localTime("us", winter("10:00")).hour, 4);
  assert.equal(localTime("us", winter("16:00")).hour, 10);
});

test("summer time is followed without a table of offsets", () => {
  // The same instant is an hour later in London in July than in January.
  assert.equal(localTime("uk", summer("10:00")).hour, 11);
  assert.equal(localTime("us", summer("15:00")).hour, 10);
});

test("nothing goes out before the first batch opens", () => {
  assert.equal(openNow("uk", winter("07:00")), false);
  assert.equal(slotsDue("uk", winter("09:59")), 0);
  assert.equal(allowanceNow("uk", 0, winter("09:00")), 0);
});

test("nothing goes out into America's night", () => {
  // Nine in the morning in London is three in the morning in Chicago.
  const earlyMorningUk = winter("09:00");
  assert.equal(localTime("us", earlyMorningUk).hour, 3);
  assert.equal(openNow("us", earlyMorningUk), false);
  assert.equal(allowanceNow("us", 0, earlyMorningUk), 0);
});

test("the first batch opens at ten, the second at two", () => {
  assert.equal(slotsDue("uk", winter("10:00")), 1);
  assert.equal(slotsDue("uk", winter("13:59")), 1);
  assert.equal(slotsDue("uk", winter("14:00")), 2);
  assert.deepEqual([...SLOTS], [10, 14]);
});

test("a batch is twenty, and two batches are forty", () => {
  assert.equal(allowanceNow("uk", 0, winter("10:30")), PER_SLOT);
  assert.equal(allowanceNow("uk", 0, winter("15:00")), PER_SLOT * 2);
});

test("what has already gone out comes off the allowance", () => {
  assert.equal(allowanceNow("uk", 20, winter("10:30")), 0);
  assert.equal(allowanceNow("uk", 20, winter("15:00")), 20);
  assert.equal(allowanceNow("uk", 8, winter("10:30")), 12);
});

test("sending more than the allowance by hand does not borrow from tomorrow", () => {
  assert.equal(allowanceNow("uk", 60, winter("15:00")), 0);
  // A nonsense count is still not a licence to send.
  assert.equal(allowanceNow("uk", -5, winter("15:00")), 40);
});

/**
 * The part that keeps a once-a-day scheduler working.
 *
 * Hostinger's cron fires once. If the batches were "which window are we
 * in" rather than "how many have come due", a single run at three in the
 * afternoon would send twenty and silently drop the morning's twenty.
 */
test("a single run in the afternoon sends both batches", () => {
  assert.equal(allowanceNow("uk", 0, winter("15:00")), 40);
});

test("the day closes, and a late run sends nothing", () => {
  assert.equal(slotsDue("uk", winter(`${DAY_ENDS}:00`)), 0);
  assert.equal(openNow("uk", winter("21:00")), false);
  assert.equal(allowanceNow("uk", 0, winter("22:30")), 0);
});

test("the day start is counted in that country's hours", () => {
  // Four in the morning in Chicago, so four hours of their day have passed.
  assert.equal(minutesSinceDayStart("us", winter("10:00")), 4 * 60);
  assert.equal(minutesSinceDayStart("uk", winter("10:30")), 10 * 60 + 30);
});

test("the next batch is named while there is one left today", () => {
  assert.equal(nextSlot("uk", winter("08:00")), 10);
  assert.equal(nextSlot("uk", winter("11:00")), 14);
  assert.equal(nextSlot("uk", winter("15:00")), null);
});

test("the wording says their time first, because ours is not the point", () => {
  const words = sendingWords("us", 0, winter("16:00"));
  assert.match(words, /^10:00 there/);
  assert.match(words, /20 still to go/);
});

test("the wording says when the next one is, not just that nothing is due", () => {
  assert.match(sendingWords("uk", 0, winter("08:00")), /next batch at 10am/);
  assert.match(sendingWords("uk", 20, winter("10:30")), /next batch at 2pm/);
  assert.match(sendingWords("uk", 40, winter("15:00")), /have gone/);
});

/**
 * The link being a link.
 *
 * Walid watched somebody have to copy a URL out of one of these by hand
 * on a desktop. The text part cannot be fixed — whether it links is the
 * mail program's decision — so the message carries an HTML part too.
 */
test("a web address becomes something you can press", () => {
  const html = plainToHtml("Here it is:\n\nhttps://shazmarketing.com/preview/a-b1c2\n\nIt comes down in a week.");
  assert.match(html, /<a href="https:\/\/shazmarketing\.com\/preview\/a-b1c2">/);
});

test("a full stop after the address is not part of it", () => {
  const html = plainToHtml("Look at https://example.com/x.");
  assert.match(html, /<a href="https:\/\/example\.com\/x">https:\/\/example\.com\/x<\/a>\./);
});

test("nothing in the body can become markup", () => {
  const html = plainToHtml('Hi <script>alert("x")</script> & "regards"');
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&amp;/);
});

test("the blank lines between paragraphs survive", () => {
  const html = plainToHtml("One\n\nTwo");
  assert.match(html, /One<br>\n<br>\nTwo/);
});
