import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";

/**
 * Everybody who has already put their hand up and never been closed.
 *
 * Built for one situation and written down plainly because it matters:
 * money is needed in weeks rather than months. In that window, cold
 * outreach is the wrong place to look. A stranger found on Google this
 * morning takes weeks of emails and two calls before anybody buys. A
 * person who filled in the scan form six weeks ago and never heard
 * back already wanted something, already gave a phone number, and
 * already knows the name.
 *
 * All of this was in the database the whole time, spread across four
 * tables and three pages, which is the same as not being there. This
 * puts it on one screen in the order a person should work it: warmest
 * first, oldest first within that, with the contact details on the row
 * so nobody has to go looking.
 *
 * Two rules, the same ones the rest of the admin keeps to:
 *
 *  - Every row is a real person with a real contact detail. Nothing is
 *    a segment, a score, or an estimate of how likely they are to buy.
 *  - No money is predicted. It would be easy to put a pound figure at
 *    the top of this page and it would be a made-up number, which is
 *    the one thing that would stop it being used.
 */

export type WarmKind =
  | "enquiry-unanswered"
  | "enquiry-cold"
  | "prospect-replied"
  | "callback-due"
  | "interested"
  | "client-lapsed";

export type WarmRow = {
  id: string;
  kind: WarmKind;
  who: string;
  /** Whatever we hold: an email, a number, or both. */
  email: string;
  phone: string;
  /** Days since the thing that made them warm. */
  days: number;
  /** The one line of context worth having before you ring. */
  context: string;
  href: string | null;
};

export type WarmGroup = {
  kind: WarmKind;
  title: string;
  /** Why these are worth doing before the group below. */
  why: string;
  /** What to actually say or do. */
  move: string;
  rows: WarmRow[];
};

interface LeadRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  score: number | null;
  notes: string | null;
  contacted: number;
  days: number;
}

interface ProspectRow extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  days: number;
  callback_at: string | null;
  last_note: string | null;
}

interface ClientRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  contact_email: string | null;
  days: number;
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export async function warmList(): Promise<WarmGroup[] | null> {
  return withDb(async (db) => {
    // People who asked us for something through the site.
    const [leads] = await db.query<LeadRow[]>(
      `SELECT id, name, email, phone, website, score, notes, contacted,
              DATEDIFF(NOW(), created_at) AS days
         FROM scan_leads
        WHERE unsubscribed_at IS NULL
        ORDER BY created_at ASC`,
    );

    // Businesses off the call list who have shown a sign of life.
    const [prospects] = await db.query<ProspectRow[]>(
      `SELECT p.id, p.name, p.email, p.phone, p.status, p.callback_at,
              DATEDIFF(NOW(), COALESCE(p.replied_at, p.called_at, p.emailed_at)) AS days,
              (SELECT c.notes FROM prospect_calls c
                WHERE c.prospect_id = p.id AND c.notes IS NOT NULL
                ORDER BY c.called_at DESC LIMIT 1) AS last_note
         FROM prospects p
        WHERE p.deleted_at IS NULL
          AND p.status <> 'customer'
          AND p.unsubscribed_at IS NULL
          AND (p.replied_at IS NOT NULL
               OR p.callback_at IS NOT NULL
               OR p.status = 'interested')
        ORDER BY p.callback_at IS NULL, p.callback_at ASC, p.replied_at ASC`,
    );

    // Clients who were switched off.
    const [lapsed] = await db.query<ClientRow[]>(
      `SELECT id, name, slug, contact_email,
              DATEDIFF(NOW(), updated_at) AS days
         FROM clients
        WHERE is_active = 0
        ORDER BY updated_at DESC`,
    );

    const n = (v: unknown) => Number(v ?? 0);
    const today = new Date().toISOString().slice(0, 10);

    const unanswered: WarmRow[] = leads
      .filter((l) => l.contacted === 0)
      .map((l) => ({
        id: `lead-${l.id}`,
        kind: "enquiry-unanswered" as const,
        who: String(l.name || l.email || "Someone"),
        email: String(l.email ?? ""),
        phone: String(l.phone ?? ""),
        days: n(l.days),
        context: l.website
          ? `Scanned ${String(l.website).replace(/^https?:\/\//, "")}${l.score !== null ? `, scored ${l.score}` : ""}`
          : "Came in through the site",
        href: "/admin/leads",
      }));

    const cold: WarmRow[] = leads
      .filter((l) => l.contacted === 1 && n(l.days) >= 14)
      .map((l) => ({
        id: `lead-${l.id}`,
        kind: "enquiry-cold" as const,
        who: String(l.name || l.email || "Someone"),
        email: String(l.email ?? ""),
        phone: String(l.phone ?? ""),
        days: n(l.days),
        context: l.notes ? String(l.notes).slice(0, 140) : "Spoken to once, nothing since",
        href: "/admin/leads",
      }));

    const prospectRow = (p: ProspectRow, kind: WarmKind, context: string): WarmRow => ({
      id: `prospect-${p.id}`,
      kind,
      who: String(p.name ?? ""),
      email: String(p.email ?? ""),
      phone: String(p.phone ?? ""),
      days: n(p.days),
      context,
      href: `/admin/prospects/${p.id}`,
    });

    const callbacks = prospects
      .filter((p) => p.callback_at !== null && String(p.callback_at).slice(0, 10) <= today)
      .map((p) =>
        prospectRow(
          p,
          "callback-due",
          p.last_note
            ? String(p.last_note).slice(0, 140)
            : `Asked to be rung back on ${String(p.callback_at).slice(0, 10)}`,
        ),
      );

    const replied = prospects
      .filter((p) => !callbacks.some((c) => c.id === `prospect-${p.id}`) && p.status !== "interested")
      .map((p) =>
        prospectRow(p, "prospect-replied", p.last_note ? String(p.last_note).slice(0, 140) : "Answered an email"),
      );

    const interested = prospects
      .filter(
        (p) =>
          p.status === "interested" &&
          !callbacks.some((c) => c.id === `prospect-${p.id}`),
      )
      .map((p) =>
        prospectRow(p, "interested", p.last_note ? String(p.last_note).slice(0, 140) : "Marked interested"),
      );

    const lapsedRows: WarmRow[] = lapsed.map((c) => ({
      id: `client-${c.id}`,
      kind: "client-lapsed" as const,
      who: String(c.name ?? ""),
      email: String(c.contact_email ?? ""),
      phone: "",
      days: n(c.days),
      context: "Was a client, account switched off",
      href: `/admin/clients/${c.slug}`,
    }));

    const groups: WarmGroup[] = [
      {
        kind: "callback-due",
        title: "They asked you to ring back, and the day has come",
        why: "The only people on this page who are expecting your call.",
        move: "Ring. Open with what they said last time, which is on the row.",
        rows: callbacks,
      },
      {
        kind: "enquiry-unanswered",
        title: "They asked you for something and nobody answered",
        why: "They came to you. They gave a number. Nobody rang.",
        move: "Ring today, apologise for the delay, and offer the thing they asked for.",
        rows: unanswered,
      },
      {
        kind: "interested",
        title: "Said they were interested",
        why: "Somebody already had the conversation and it went well.",
        move: "Ring with a price and a date. Do not start the pitch again.",
        rows: interested,
      },
      {
        kind: "prospect-replied",
        title: "Answered an email and went quiet",
        why: "They replied to a cold email, which almost nobody does.",
        move: "Ring rather than email back. The reply was the hard part.",
        rows: replied,
      },
      {
        kind: "client-lapsed",
        title: "Used to pay you",
        why: "They know the name, the work and the price. Cheapest sale there is.",
        move: "Ring and ask what changed. Offer something smaller than before.",
        rows: lapsedRows,
      },
      {
        kind: "enquiry-cold",
        title: "Enquired, got a reply, then nothing",
        why: "Warm two weeks ago. Still warmer than anybody on the call list.",
        move: "One call. If there is no answer, leave it and move on.",
        rows: cold,
      },
    ];

    return groups.filter((g) => g.rows.length > 0);
  });
}

/** The one line at the top: how many people, and how many are expecting a call. */
export function warmSummary(groups: WarmGroup[]): string {
  const total = groups.reduce((sum, g) => sum + g.rows.length, 0);
  if (total === 0) {
    return "Nobody is waiting on you. Everything warm has been worked.";
  }
  const expecting = groups
    .filter((g) => g.kind === "callback-due" || g.kind === "enquiry-unanswered")
    .reduce((sum, g) => sum + g.rows.length, 0);

  return expecting > 0
    ? `${plural(total, "person", "people")} who already put their hand up — ${plural(expecting, "is", "are")} waiting on a call right now.`
    : `${plural(total, "person", "people")} who already put their hand up.`;
}
