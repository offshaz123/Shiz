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
    const [fresh] = await db.query<IdRow[]>(
      `SELECT id FROM prospects
        WHERE emailed_at IS NULL AND called_at IS NULL
          AND (website IS NULL OR website = '' OR site_score IS NOT NULL)
        ORDER BY (website IS NULL OR website = '') DESC, site_score ASC, reviews ASC
        LIMIT 10`,
    );
    return {
      replied: replied.map((r) => r.id),
      callbacks: callbacks.map((r) => r.id),
      interested: interested.map((r) => r.id),
      fresh: fresh.map((r) => r.id),
    };
  });

  if (!picked) return null;

  const [replied, callbacks, interested, fresh] = await Promise.all([
    rowsFor(picked.replied, byIds),
    rowsFor(picked.callbacks, byIds),
    rowsFor(picked.interested, byIds),
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
      id: "fresh",
      title: "Worth ringing cold",
      why: "Nobody has spoken to these. Businesses with no website at all come first — there is nothing to criticise, only something to build.",
      prospects: fresh,
    },
  ].filter((group) => group.prospects.length > 0);
}
