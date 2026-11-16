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
 * These leave from the same mailbox as the client work and the enquiry
 * replies — Walid's deliberate choice — so the domain's own reputation is
 * what is at stake. A domain that has sent a couple of hundred emails in its
 * life and then starts sending fifty cold ones a day looks exactly like a
 * domain that has been taken over, and the mailboxes receiving them treat it
 * that way. So the volume climbs slowly instead of starting where it ends.
 *
 * Twelve follow-ups plus eight openers is around twenty emails on the
 * busiest day, which one mailbox sends without anyone noticing. Raise these
 * once there are weeks of clean DMARC reports behind them, not before.
 */
export const WARM_UP: readonly { after: number; perRun: number }[] = [
  { after: 0, perRun: 3 },
  { after: 25, perRun: 5 },
  { after: 75, perRun: 8 },
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
