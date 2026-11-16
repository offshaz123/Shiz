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
    const [fresh] = await db.query<IdRow[]>(
      `SELECT id FROM prospects
        WHERE emailed_at IS NULL AND called_at IS NULL
          AND (website IS NULL OR website = '' OR site_score IS NOT NULL)
        ORDER BY (website IS NULL OR website = '') DESC, site_score ASC, reviews ASC
        LIMIT 10`,
    );
    return {
      emailed: emailed.map((r) => r.id),
      replied: replied.map((r) => r.id),
      callbacks: callbacks.map((r) => r.id),
      interested: interested.map((r) => r.id),
      fresh: fresh.map((r) => r.id),
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
      why: "Nobody has spoken to these. Businesses with no website at all come first — there is nothing to criticise, only something to build.",
      prospects: fresh,
    },
  ].filter((group) => group.prospects.length > 0);
}
