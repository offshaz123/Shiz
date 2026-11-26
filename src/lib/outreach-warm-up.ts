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
 * The ramp is kept rather than replaced with a flat number, because a
 * brand new domain sending eighty on its first day is a different thing
 * from an established one doing it, and this table is read by whatever
 * domain the sending moves to next.
 *
 * Per country, not split between them. That changed when the sending
 * moved to batches: each country now has its own two batches of twenty
 * a day, on its own clock, and a number shared between them would mean
 * Britain's quiet day silently doubling America's.
 *
 * The middle tier used to be twelve and the one above it needed a
 * hundred and twenty first emails before it opened, which left the real
 * ceiling at twelve a run — below a single batch. Walid asked for
 * twenty, twice, and the batch size is the policy now; this table is
 * only here to stop a cold domain starting at its ceiling. A domain
 * that has already sent forty first emails is not cold.
 *
 * What that costs is worth saying plainly, because it is his to decide
 * and he has decided it twice: eighty cold emails a day leave this
 * domain, from the same mailbox as the client work, and that mailbox
 * allows a hundred outgoing in total. Twenty a day is the whole margin
 * for replies to customers, invoices and everything sent by hand.
 *
 * What has not changed is why there is a ceiling at all. These leave from
 * the same mailbox as the client work and the enquiry replies, so the
 * domain's own reputation is what is at stake, and bounces and complaints
 * land on the address Walid's customers write to.
 *
 * The mailbox limit is a hundred outgoing a day, shared with everything
 * else that leaves this address. If sends start failing in batches that
 * ceiling is the first thing to check and this table is the second.
 */
export const WARM_UP: readonly { after: number; perRun: number }[] = [
  { after: 0, perRun: 8 },
  { after: 40, perRun: 20 },
  { after: 200, perRun: 40 },
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
