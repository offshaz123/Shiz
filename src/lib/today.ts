import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import type { Prospect } from "./prospect-types";

/**
 * The day's work, in the order it should be done.
 *
 * The call list answers "who could I ring". It does not answer "what do I do
 * now", and the difference matters most to somebody on their first morning:
 * a page of filters is a thing to learn, a list of four jobs is a thing to
 * start. Everything here is something that will go wrong if it is left —
 * a promise to ring back, somebody waiting on an answer — rather than
 * everything that could be done.
 *
 * Ordered by what costs the most to ignore. A person who has written back is
 * at the top, because a reply left for a day is the most expensive silence
 * in the business.
 */

export type TodayGroup = {
  id: string;
  title: string;
  why: string;
  prospects: Prospect[];
};

interface IdRow extends RowDataPacket {
  id: number;
}

/** The columns the call list builds a row from, so Today shows exactly the
 *  same thing rather than a thinner copy that drifts. */
async function rowsFor(ids: number[], list: (ids: number[]) => Promise<Prospect[] | null>) {
  return ids.length ? ((await list(ids)) ?? []) : [];
}

/**
 * How many cold calls a day the list aims to put up.
 *
 * Walid's number: ten to fifteen is a morning's work that actually gets
 * done, where thirty is a list you scroll past. Fifteen so there is slack
 * for the ones that turn out to be wrong numbers.
 */
const DAILY_CALLS = 15;

interface FreshRow extends IdRow {
  industry: string | null;
}

/**
 * What the spreading actually needs: an id and a trade.
 *
 * Narrower than the database row on purpose. Taking the driver's row type
 * here would mean a pure function that cannot be called without MySQL's
 * RowDataPacket, which makes it untestable for no benefit — the sorting
 * does not care where the rows came from.
 */
export type Spreadable = { id: number; industry: string | null };

/**
 * Takes one from each trade in turn until the list is full.
 *
 * The rows arrive in priority order, and that order is heavily clustered:
 * one search puts thirty businesses of the same trade in at once, so the
 * first fifteen by priority are usually the first fifteen results of one
 * search. Round-robin keeps the priority order within each trade while
 * making the day's calls span several, which is both a better morning and
 * better information — fifteen trades tried once tells you more about where
 * the work is than one trade tried fifteen times.
 *
 * Anything with no industry recorded is its own bucket rather than being
 * dropped: an old row is still a business worth ringing.
 */
export function spreadByIndustry(rows: readonly Spreadable[], limit: number): number[] {
  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const key = row.industry ?? "";
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row.id);
    else buckets.set(key, [row.id]);
  }

  const picked: number[] = [];
  const lists = [...buckets.values()];
  for (let round = 0; picked.length < limit; round += 1) {
    let tookOne = false;
    for (const list of lists) {
      if (round >= list.length) continue;
      picked.push(list[round]);
      tookOne = true;
      if (picked.length >= limit) break;
    }
    // Every bucket is exhausted; there simply are not enough prospects.
    if (!tookOne) break;
  }
  return picked;
}

export async function getToday(
  byIds: (ids: number[]) => Promise<Prospect[] | null>,
): Promise<TodayGroup[] | null> {
  const picked = await withDb(async (db) => {
    const [replied] = await db.query<IdRow[]>(
      `SELECT id FROM prospects
        WHERE replied_at IS NOT NULL AND status NOT IN ('customer', 'not-interested')
        ORDER BY replied_at DESC LIMIT 25`,
    );
    const [callbacks] = await db.query<IdRow[]>(
      `SELECT id FROM prospects
        WHERE callback_at IS NOT NULL
          AND callback_at <= CURDATE()
          AND status NOT IN ('customer', 'not-interested')
          AND unsubscribed_at IS NULL
        ORDER BY callback_at ASC LIMIT 25`,
    );
    const [interested] = await db.query<IdRow[]>(
      `SELECT id FROM prospects
        WHERE status = 'interested'
        ORDER BY updated_at DESC LIMIT 25`,
    );
    // The hand-off from email to phone.
    //
    // Three emails go out over five days and then the sequence stops, and
    // until now that was the end of it: a business that had read three
    // emails and not replied sat in the list looking exactly like one
    // nobody had ever touched. That is the worst moment to drop somebody.
    // They know the name by now, which is the whole point of having sent
    // three, and the call opens with a reason to be ringing rather than
    // cold.
    //
    // Two days after the last email, not the same day. A reply to email
    // three usually arrives the morning after it, and ringing somebody who
    // is about to write back is how you turn a warm lead into an annoyed
    // one.
    //
    // They need a phone number for this to be a call at all, and anyone who
    // replied, unsubscribed, was already rung, or has a status saying the
    // answer is known is out.
    const [emailed] = await db.query<IdRow[]>(
      `SELECT p.id
         FROM prospects p
         JOIN prospect_emails e
           ON e.prospect_id = p.id AND e.status = 'sent' AND e.step = 3
        WHERE p.replied_at IS NULL
          AND p.unsubscribed_at IS NULL
          AND p.called_at IS NULL
          AND p.deleted_at IS NULL
          AND p.phone IS NOT NULL AND p.phone <> ''
          AND p.status NOT IN ('customer', 'not-interested', 'interested')
          AND e.sent_at <= DATE_SUB(NOW(), INTERVAL 2 DAY)
        ORDER BY e.sent_at ASC
        LIMIT 25`,
    );
    // The cold list.
    //
    // Ordered by one idea: a business the machine cannot reach is the one
    // that needs a person. No published email address means the sequence
    // will never write to them, so they are first — left alone they are
    // never contacted at all. Then the ones with no website, where there is
    // nothing to criticise and only something to build. Then worst site
    // first among the rest.
    //
    // Over-fetched rather than taken straight, because the top of a list
    // ordered this way is all one trade: searching "car detailing in
    // Romford" puts thirty detailers in, and a morning of ringing thirty
    // detailers is a worse morning than ringing fifteen businesses across
    // six trades. The spreading is done below.
    const [fresh] = await db.query<FreshRow[]>(
      `SELECT id, industry FROM prospects
        WHERE emailed_at IS NULL AND called_at IS NULL
          AND deleted_at IS NULL
          AND unsubscribed_at IS NULL
          AND status NOT IN ('customer', 'not-interested')
          AND (website IS NULL OR website = '' OR site_score IS NOT NULL)
        ORDER BY (email IS NULL OR email = '') DESC,
                 (website IS NULL OR website = '') DESC,
                 site_score ASC,
                 reviews ASC
        LIMIT 90`,
    );
    return {
      emailed: emailed.map((r) => r.id),
      replied: replied.map((r) => r.id),
      callbacks: callbacks.map((r) => r.id),
      interested: interested.map((r) => r.id),
      fresh: spreadByIndustry(fresh, DAILY_CALLS),
    };
  });

  if (!picked) return null;

  const [replied, callbacks, interested, emailed, fresh] = await Promise.all([
    rowsFor(picked.replied, byIds),
    rowsFor(picked.callbacks, byIds),
    rowsFor(picked.interested, byIds),
    rowsFor(picked.emailed, byIds),
    rowsFor(picked.fresh, byIds),
  ]);

  return [
    {
      id: "replied",
      title: "They wrote back",
      why: "Answer these first. A reply left overnight is the most expensive silence there is, and the follow-ups have already stopped themselves.",
      prospects: replied,
    },
    {
      id: "callbacks",
      title: "You said you would ring back",
      why: "Promised and now due. More work is lost to a forgotten callback than to a bad pitch.",
      prospects: callbacks,
    },
    {
      id: "interested",
      title: "Said they were interested",
      why: "Warm and waiting. If there is nothing booked with them, that is the call to make.",
      prospects: interested,
    },
    {
      id: "emailed",
      title: "Had all three emails, never replied",
      why: "Ring these before the cold ones. They have had three emails from you over five days, so the name is not new to them, and the call has a reason to exist: you are following up something you already sent. Two days after the last email, so anybody about to reply has had the chance.",
      prospects: emailed,
    },
    {
      id: "fresh",
      title: "Worth ringing cold",
      why: "Nobody has spoken to these. Businesses with no email address come first, because the sequence can never reach them and a call is the only way they hear from us at all. Then the ones with no website, where there is nothing to criticise and only something to build. Spread across trades rather than fifteen of the same one.",
      prospects: fresh,
    },
  ].filter((group) => group.prospects.length > 0);
}
