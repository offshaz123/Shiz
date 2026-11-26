/**
 * How many brand-new first emails may go out in one run.
 *
 * Its own module, with no imports at all, for two reasons. It is policy
 * rather than plumbing — the one number that decides how fast automated cold
 * mail leaves this domain — and keeping it free of the database and the
 * content files means it can be tested directly, which matters for the one
 * piece of this that is neither visible from the admin page nor reversible
 * once the mail has gone.
 */

/**
 * The ramp, keyed on how many first emails have ever actually been sent.
 *
 * Raised again, to Walid's numbers: he has asked for thirty-five to forty
 * a day for each country, so eighty in total, and that is his call to
 * make. It is his domain and his sending reputation, he has been told
 * twice what the risk is, and he has decided it is not one.
 *
 * The ramp is kept rather than replaced with a flat eighty, because a
 * brand new domain sending eighty on its first day is a different thing
 * from an established one doing it, and this table is read by whatever
 * domain the sending moves to next. From where this one already stands
 * the top tier applies immediately.
 *
 * This number is split across both countries, not applied to each: the
 * run asks each region for the whole allowance and interleaves them, so
 * eighty here is roughly forty apiece when both lists are full.
 *
 * What has not changed is why there is a ceiling at all. These leave from
 * the same mailbox as the client work and the enquiry replies, so the
 * domain's own reputation is what is at stake, and bounces and complaints
 * land on the address Walid's customers write to.
 *
 * One number nobody has verified, and it matters a great deal more at
 * eighty a day than it did at fifteen: the Hostinger mailbox has its own
 * daily sending limit and we have not confirmed what it is. The client
 * work leaves from the same mailbox, so hitting that ceiling would stop
 * a reply to a customer, not just an outreach email. If sends start
 * failing in batches, that limit is the first thing to check and this
 * table is the second.
 */
export const WARM_UP: readonly { after: number; perRun: number }[] = [
  { after: 0, perRun: 8 },
  { after: 40, perRun: 12 },
  { after: 120, perRun: 40 },
  { after: 400, perRun: 80 },
];

export function newPerRun(everSent: number): number {
  // Starts at the slowest tier and only ever climbs, so a count that arrives
  // negative or NaN gets the most cautious answer rather than the last one in
  // the table. Guessing high here is the expensive direction.
  let allowed = WARM_UP[0].perRun;
  for (const tier of WARM_UP) {
    if (everSent >= tier.after) allowed = tier.perRun;
  }
  return allowed;
}
