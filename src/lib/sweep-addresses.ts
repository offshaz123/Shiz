import { domainAcceptsMail } from "./mx-check";
import { listUncheckedAddresses, markEmailDead, markMxChecked } from "./prospects";

/**
 * Going back over the addresses that were stored before anybody checked
 * whether they could receive mail.
 *
 * The MX check runs when a business is scanned, so it only ever protected
 * rows scanned after it was written. Everything older kept whatever address
 * was on the page — and the mail server's outbound log for 18, 21 and 23
 * November shows the consequence: the same two domains, neither with a mail
 * server behind it, attempted again every other day, each one two connection
 * attempts before the queue gives up.
 *
 * Deliberately a sweep off the back of an existing cron rather than a
 * migration or a job of its own. There is one scheduler on this hosting, a
 * second one is fiddly to get onto hPanel and easy to get wrong, and a
 * one-off script is a thing somebody has to remember to run. A few rows a
 * day finishes the backlog on its own and then costs nothing, because
 * mx_checked_at means a row is never asked about twice.
 */

/**
 * How many to check in one run.
 *
 * Each one is a DNS-over-HTTPS lookup with a four second ceiling, and this
 * runs in the same request as eighty site scans. Twenty is enough to clear
 * a backlog in a week or two without lengthening a run that is already the
 * slowest thing on the site.
 */
const PER_RUN = 20;

export type SweepResult = {
  checked: number;
  /** Addresses whose domain has no mail server at all. */
  dead: number;
};

export async function sweepAddresses(limit = PER_RUN): Promise<SweepResult> {
  const rows = await listUncheckedAddresses(limit);
  if (!rows || rows.length === 0) return { checked: 0, dead: 0 };

  const done: number[] = [];
  let dead = 0;

  for (const row of rows) {
    // A clear "no" is the only thing acted on. domainAcceptsMail returns
    // true for anything it could not resolve, which is the whole reason it
    // is written the way it is: a resolver having a bad afternoon must not
    // be able to mark every address on the list dead.
    const ok = await domainAcceptsMail(row.email);
    if (!ok) {
      dead += await markEmailDead(row.email, "No mail server for this domain");
    }
    done.push(row.id);
  }

  // Stamped whatever the answer was, including for the ones just marked
  // dead, so a row cannot come back round.
  await markMxChecked(done);

  return { checked: done.length, dead };
}
