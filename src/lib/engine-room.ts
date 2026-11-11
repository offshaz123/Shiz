import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { getCronHealth } from "./admin-data";
import { placesBudget } from "./google-business";

/**
 * What the machinery has actually done, for the board on the admin page.
 *
 * Every figure here is counted from the database. Nothing is estimated,
 * nothing is rounded up, and a part of the pipeline that cannot be measured
 * shows no number rather than a plausible one — a dashboard that flatters
 * itself is worse than no dashboard, because you stop checking the thing it
 * is lying about.
 */

export type Station = {
  id: string;
  name: string;
  /** What it does, in the fewest honest words. */
  does: string;
  /** The number on its tile, and what the number counts. */
  value: number;
  unit: string;
  /** When it next acts, or what it is waiting for. */
  state: string;
  live: boolean;
  href?: string;
};

/** One step of the funnel. `of` is the number it is a share of, so the page
 *  never has to work a percentage out of two unrelated figures. */
export type Step = { label: string; value: number; of: number; note: string };

export type Day = { date: string; first: number; followUp: number };

export type EngineRoom = {
  stations: Station[];
  funnel: Step[];
  days: Day[];
  tiles: { label: string; value: string; note: string }[];
  running: boolean;
  /** Why the engine is not running, when it is not. */
  halted: string;
};

interface CountRow extends RowDataPacket {
  prospects: number;
  with_site: number;
  scanned: number;
  with_email: number;
  contacted: number;
  sequences: number;
  replied: number;
  unsubscribed: number;
  emails: number;
  emails_today: number;
  found_today: number;
  leads: number;
}

export async function getEngineRoom(): Promise<EngineRoom | null> {
  const counts = await withDb(async (db) => {
    const [rows] = await db.query<CountRow[]>(
      `SELECT
         (SELECT COUNT(*) FROM prospects) AS prospects,
         (SELECT COUNT(*) FROM prospects WHERE website IS NOT NULL AND website <> '') AS with_site,
         (SELECT COUNT(*) FROM prospects WHERE scanned_at IS NOT NULL) AS scanned,
         (SELECT COUNT(*) FROM prospects WHERE email IS NOT NULL AND email <> '') AS with_email,
         (SELECT COUNT(*) FROM prospects WHERE emailed_at IS NOT NULL OR called_at IS NOT NULL) AS contacted,
         (SELECT COUNT(*) FROM prospects
            WHERE sequence_started_at IS NOT NULL
              AND sequence_stopped_at IS NULL
              AND replied_at IS NULL
              AND unsubscribed_at IS NULL) AS sequences,
         (SELECT COUNT(*) FROM prospects WHERE replied_at IS NOT NULL) AS replied,
         (SELECT COUNT(*) FROM prospects WHERE unsubscribed_at IS NOT NULL) AS unsubscribed,
         (SELECT COUNT(*) FROM prospect_emails WHERE status = 'sent') AS emails,
         (SELECT COUNT(*) FROM prospect_emails
            WHERE status = 'sent' AND sent_at >= CURDATE()) AS emails_today,
         (SELECT COUNT(*) FROM prospects WHERE created_at >= CURDATE()) AS found_today,
         (SELECT COUNT(*) FROM scan_leads) AS leads`,
    );
    return rows[0];
  });

  if (!counts) return null;

  // The funnel and the daily figures come from the emails table, which is
  // the only honest record of what went out: the prospect row says when the
  // last one was sent, not how many or which.
  const steps = await withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { step: number; n: number })[]>(
      `SELECT step, COUNT(DISTINCT prospect_id) AS n
         FROM prospect_emails
        WHERE status = 'sent'
        GROUP BY step`,
    );
    const by = new Map(rows.map((r) => [Number(r.step), Number(r.n)]));
    return { first: by.get(1) ?? 0, second: by.get(2) ?? 0, third: by.get(3) ?? 0 };
  });

  const days = await withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & { d: string; first: number; follow_up: number })[]
    >(
      // Formatted in SQL rather than in JavaScript: the driver hands back a
      // Date object, and String()ing one gives "Wed Nov 11 2026", which
      // never matches an ISO key and silently produces an empty chart.
      `SELECT DATE_FORMAT(sent_at, '%Y-%m-%d') AS d,
              SUM(step = 1) AS first,
              SUM(step > 1) AS follow_up
         FROM prospect_emails
        WHERE status = 'sent' AND sent_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        GROUP BY DATE_FORMAT(sent_at, '%Y-%m-%d')
        ORDER BY d ASC`,
    );
    const sent = new Map(
      rows.map((r) => [
        String(r.d).slice(0, 10),
        { first: Number(r.first ?? 0), followUp: Number(r.follow_up ?? 0) },
      ]),
    );
    // Every day of the fortnight, including the quiet ones. A chart that
    // only plots the days something happened makes a slow week look busy.
    const series: Day[] = [];
    for (let back = 13; back >= 0; back--) {
      const date = new Date(Date.now() - back * 86_400_000).toISOString().slice(0, 10);
      series.push({ date, ...(sent.get(date) ?? { first: 0, followUp: 0 }) });
    }
    return series;
  });

  const cron = await getCronHealth();
  const places = placesBudget();

  const n = (v: unknown) => Number(v ?? 0);
  const unscanned = n(counts.with_site) - n(counts.scanned);
  const toContact = n(counts.prospects) - n(counts.contacted);
  const cronRan = cron?.lastRunAt !== null && cron?.lastRunAt !== undefined;
  const held = cron?.lastDetail?.startsWith("inbox unreadable") ?? false;

  const stations: Station[] = [
    {
      id: "finder",
      name: "Finder",
      does: "searches Google for businesses",
      value: n(counts.prospects),
      unit: "on the list",
      state: places.hasKey
        ? `${places.today} searches today`
        : "no Places key — searching is off",
      live: places.hasKey,
      href: "/admin/prospects",
    },
    {
      id: "scanner",
      name: "Scanner",
      does: "reads each website and scores it",
      value: n(counts.scanned),
      unit: "sites scanned",
      state: unscanned > 0 ? `${unscanned} waiting` : "nothing waiting",
      live: true,
      href: "/admin/prospects",
    },
    {
      id: "writer",
      name: "Writer",
      does: "builds each email out of what the scan found",
      value: n(counts.with_email),
      unit: "have an address",
      state: "drafts on demand, never sends by itself",
      live: true,
      href: "/admin/prospects",
    },
    {
      id: "postman",
      name: "Postman",
      does: "sends from info@, one at a time",
      value: n(counts.emails),
      unit: "emails sent",
      state: n(counts.emails_today) > 0 ? `${n(counts.emails_today)} today` : "nothing sent today",
      live: true,
      href: "/admin/health",
    },
    {
      id: "nudger",
      name: "Nudger",
      does: "sends the day 3 and day 5 follow-ups",
      value: n(counts.sequences),
      unit: "sequences running",
      state: held
        ? "held — the inbox can't be read"
        : cronRan
          ? `last run ${cron?.hoursSince ?? 0}h ago`
          : "the daily job has never run",
      live: cronRan && !held,
      href: "/admin/health",
    },
    {
      id: "listener",
      name: "Listener",
      does: "reads the inbox and stops the follow-ups",
      value: n(counts.replied),
      unit: "replies caught",
      state: held ? "can't reach the mailbox" : "checks on every run",
      live: !held,
      href: "/admin/health",
    },
  ];

  const total = n(counts.prospects);
  const customers = await withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { n: number })[]>(
      "SELECT COUNT(*) AS n FROM prospects WHERE status = 'customer'",
    );
    return Number(rows[0]?.n ?? 0);
  });

  return {
    stations,
    funnel: [
      { label: "Businesses found", value: total, of: total, note: "every search ever run" },
      {
        label: "Website scanned",
        value: n(counts.scanned),
        of: total,
        note: "scored, with something to open a call with",
      },
      {
        label: "Address found",
        value: n(counts.with_email),
        of: total,
        note: "can be emailed at all",
      },
      { label: "First email sent", value: steps?.first ?? 0, of: total, note: "sent by hand" },
      { label: "Day 3 follow-up", value: steps?.second ?? 0, of: total, note: "sent by the cron" },
      { label: "Day 5 follow-up", value: steps?.third ?? 0, of: total, note: "the last one" },
      { label: "Replied", value: n(counts.replied), of: total, note: "wrote back" },
      { label: "Customer", value: customers ?? 0, of: total, note: "signed" },
    ],
    days: days ?? [],
    tiles: [
      {
        label: "To contact",
        value: String(toContact),
        note: `${n(counts.prospects)} businesses found in total`,
      },
      {
        label: "Contacted",
        value: String(n(counts.contacted)),
        note: `${n(counts.emails)} emails sent`,
      },
      {
        label: "Replied",
        value: String(n(counts.replied)),
        note: n(counts.emails)
          ? `${Math.round((n(counts.replied) / n(counts.emails)) * 1000) / 10}% of emails sent`
          : "nothing sent yet",
      },
      {
        label: "Sequences running",
        value: String(n(counts.sequences)),
        note: "day 3 and day 5 go on their own",
      },
      {
        label: "Opted out",
        value: String(n(counts.unsubscribed)),
        note: "never contacted again",
      },
      {
        label: "Found today",
        value: String(n(counts.found_today)),
        note: `${unscanned} still to scan`,
      },
      {
        label: "Website leads",
        value: String(n(counts.leads)),
        note: "people who came to us",
      },
    ],
    running: cronRan && !held,
    halted: !cronRan
      ? "The daily job has never reported a run, so nothing automatic is happening."
      : held
        ? "Running, but holding the follow-ups back because the inbox can't be read."
        : "",
  };
}
