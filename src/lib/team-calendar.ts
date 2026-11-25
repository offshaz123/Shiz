import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import type { Region } from "./regions";
import type { DiaryItem } from "./calendar";

/**
 * Everything the team has promised to do on a particular day.
 *
 * Three different things end up here and they come from three different
 * tables, which is exactly why the page exists: a promise to ring
 * somebody back lived on a prospect row, an invoice falling due lived on
 * a client, and the day an automatic follow-up goes out lived nowhere at
 * all — it was worked out by a cron at four in the morning and never
 * written down anywhere a person could see it.
 *
 * None of them is invented. A call-back is on the diary because somebody
 * said "ring me Thursday at ten" and it was typed in. An invoice is
 * there because a date was put on it. A follow-up is there because the
 * sequence it belongs to was started on a day, and three and five days
 * later are when the next ones go.
 */

type Options = {
  /** Only these countries, so somebody's diary is their own work. */
  regions?: Region[];
  /** Only this member of staff's promises. Undefined means everybody,
   *  which is what the owner sees. */
  staffId?: number | null;
  /** How far back and forward to look, in days. */
  back?: number;
  ahead?: number;
};

interface CallbackRow extends RowDataPacket {
  id: number;
  name: string;
  phone: string | null;
  callback_at: string;
  region: string;
  caller: string | null;
  staff_id: number | null;
  notes: string | null;
}

interface InvoiceRow extends RowDataPacket {
  id: number;
  client_id: number;
  number: string;
  customer_name: string | null;
  business: string | null;
  slug: string | null;
  due_on: string;
  status: string;
}

interface SequenceRow extends RowDataPacket {
  id: number;
  name: string;
  region: string;
  sequence_started_at: string;
  last_step: number | null;
}

/** The two emails that send themselves, and how long after the first. */
const SEQUENCE_DAYS: Record<number, number> = { 2: 3, 3: 5 };

function day(value: unknown): string {
  return String(value).slice(0, 10);
}

/** YYYY-MM-DD for a day this many days from the one given. */
function shiftDay(from: string, by: number): string {
  const when = new Date(`${from}T12:00:00Z`);
  when.setUTCDate(when.getUTCDate() + by);
  return when.toISOString().slice(0, 10);
}

export async function teamDiary(options: Options = {}): Promise<DiaryItem[] | null> {
  const { regions, staffId, back = 60, ahead = 120 } = options;

  return withDb(async (db) => {
    const items: DiaryItem[] = [];

    // ---- Promised call-backs ------------------------------------------
    const where = [
      "p.deleted_at IS NULL",
      "p.callback_at IS NOT NULL",
      "p.status NOT IN ('customer', 'not-interested')",
      "p.callback_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)",
      "p.callback_at < DATE_ADD(CURDATE(), INTERVAL ? DAY)",
    ];
    const params: (string | number)[] = [back, ahead];

    if (regions && regions.length > 0) {
      where.push(`p.region IN (${regions.map(() => "?").join(", ")})`);
      params.push(...regions);
    }

    const [calls] = await db.query<CallbackRow[]>(
      `SELECT p.id, p.name, p.phone, p.callback_at, p.region,
              c.caller, c.staff_id, c.notes
         FROM prospects p
         -- The last call to them: where the promise was made, who made
         -- it, and what the next one should open with.
         LEFT JOIN prospect_calls c
           ON c.id = (SELECT c2.id FROM prospect_calls c2
                       WHERE c2.prospect_id = p.id
                       ORDER BY c2.called_at DESC LIMIT 1)
        WHERE ${where.join(" AND ")}
        ORDER BY p.callback_at ASC`,
      params,
    );

    for (const row of calls) {
      // A member of staff sees their own promises. Anything nobody is
      // recorded against stays on everybody's diary rather than
      // disappearing: an unowned promise is still owed.
      const owner = row.staff_id === null ? null : Number(row.staff_id);
      if (staffId !== undefined && staffId !== null && owner !== null && owner !== staffId) {
        continue;
      }

      const at = String(row.callback_at);
      items.push({
        id: `call-${row.id}`,
        kind: "call-back",
        day: at.slice(0, 10),
        time: at.slice(11, 16),
        title: String(row.name ?? ""),
        detail: [row.phone, row.notes ? `Last time: ${String(row.notes).slice(0, 120)}` : ""]
          .filter(Boolean)
          .join(" · "),
        who: String(row.caller ?? ""),
        staffId: owner,
        href: `/admin/prospects/${row.id}`,
      });
    }

    // ---- Invoices falling due -----------------------------------------
    //
    // Only unpaid ones, and only real invoices: a quote has a validity
    // date, not a due date, and putting it here would have somebody
    // chasing money nobody owes yet.
    const [invoices] = await db.query<InvoiceRow[]>(
      `SELECT i.id, i.client_id, i.number, i.customer_name,
              c.name AS business, c.slug, i.due_on, i.status
         FROM client_invoices i
         LEFT JOIN clients c ON c.id = i.client_id
        WHERE i.kind = 'invoice'
          AND i.due_on IS NOT NULL
          AND i.status <> 'paid'
          AND i.due_on >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          AND i.due_on < DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY i.due_on ASC`,
      [back, ahead],
    );

    // Money is the owner's business, not a caller's. Somebody whose
    // diary is filtered to their own calls does not get the invoices.
    if (staffId === undefined || staffId === null) {
      for (const row of invoices) {
        items.push({
          id: `invoice-${row.id}`,
          kind: "invoice",
          day: day(row.due_on),
          time: "",
          title: String(row.business || row.customer_name || "Invoice"),
          detail: `Invoice ${row.number}${row.status === "sent" ? " — sent, not paid" : ""}`,
          who: "",
          staffId: null,
          href: row.slug ? `/admin/clients/${row.slug}` : "/admin/clients",
        });
      }
    }

    // ---- The follow-up emails that send themselves ---------------------
    //
    // Worked out rather than stored, because nothing stores them: the
    // job looks at how long ago the sequence started and sends what is
    // owed. Same sum here, so the diary says what the morning will do.
    const seqWhere = [
      "p.deleted_at IS NULL",
      "p.sequence_started_at IS NOT NULL",
      "p.sequence_stopped_at IS NULL",
      "p.replied_at IS NULL",
      "p.unsubscribed_at IS NULL",
      "p.email IS NOT NULL AND p.email <> ''",
      "p.email_dead_at IS NULL",
      "p.status NOT IN ('interested', 'not-interested', 'customer')",
    ];
    const seqParams: (string | number)[] = [];
    if (regions && regions.length > 0) {
      seqWhere.push(`p.region IN (${regions.map(() => "?").join(", ")})`);
      seqParams.push(...regions);
    }

    const [sequences] = await db.query<SequenceRow[]>(
      `SELECT p.id, p.name, p.region, p.sequence_started_at,
              MAX(e.step) AS last_step
         FROM prospects p
         LEFT JOIN prospect_emails e
           ON e.prospect_id = p.id AND e.status = 'sent'
        WHERE ${seqWhere.join(" AND ")}
        GROUP BY p.id
       HAVING last_step IS NOT NULL AND last_step < 3
        LIMIT 500`,
      seqParams,
    );

    // Nobody's personal job, so they are the owner's view only — the
    // same reasoning as the invoices.
    if (staffId === undefined || staffId === null) {
      for (const row of sequences) {
        const next = Number(row.last_step ?? 1) + 1;
        const after = SEQUENCE_DAYS[next];
        if (!after) continue;
        items.push({
          id: `email-${row.id}-${next}`,
          kind: "follow-up",
          day: shiftDay(day(row.sequence_started_at), after),
          time: "",
          title: String(row.name ?? ""),
          detail: `Follow-up ${next} of 3 goes out by itself`,
          who: "",
          staffId: null,
          href: `/admin/prospects/${row.id}`,
        });
      }
    }

    return items;
  });
}
