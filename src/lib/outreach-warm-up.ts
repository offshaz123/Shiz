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
 * Raised to Walid's numbers. He has said the mailbox is warmed up and that
 * fifteen to twenty a day is what he wants, and that is his call to make:
 * it is his domain and his sending reputation. The ramp is kept rather than
 * replaced with a flat fifteen, because the first few days of a brand new
 * sending pattern are still the risky ones and climbing over a week costs
 * nothing against a list that takes weeks to work through anyway.
 *
 * What has not changed is why there is a ceiling at all. These leave from
 * the same mailbox as the client work and the enquiry replies, so the
 * domain's own reputation is what is at stake, and bounces and complaints
 * land on the address Walid's customers write to.
 *
 * One number nobody has verified: the Hostinger Free Business Email plan
 * has its own daily sending limit and we have not confirmed what it is. If
 * sends start failing in batches, that limit is the first thing to check
 * and this table is the second.
 */
export const WARM_UP: readonly { after: number; perRun: number }[] = [
  { after: 0, perRun: 8 },
  { after: 40, perRun: 12 },
  { after: 120, perRun: 15 },
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
