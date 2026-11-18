import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { withDb } from "./db";

/**
 * A client's diary.
 *
 * An enquiry is only worth something once it is a time in a diary, and the
 * dashboard could show the enquiry and then lose sight of it entirely. This
 * is the half that turns a lead list into something a business runs its
 * week on.
 *
 * Everything here takes a clientId and filters on it. A booking belongs to
 * one business and there is no query in this file that could return
 * somebody else's.
 */

export type Booking = {
  id: number;
  leadId: number | null;
  customerName: string;
  phone: string;
  email: string;
  job: string;
  notes: string;
  /** YYYY-MM-DD. */
  bookedOn: string;
  /** HH:MM, or empty for an all-day job. */
  startsAt: string;
  durationMinutes: number | null;
  price: number | null;
  status: string;
};

export const BOOKING_STATUSES = ["booked", "done", "cancelled", "no-show"] as const;

interface BookingRow extends RowDataPacket {
  id: number;
  lead_id: number | null;
  customer_name: string;
  phone: string | null;
  email: string | null;
  job: string | null;
  notes: string | null;
  booked_on: string;
  starts_at: string | null;
  duration_minutes: number | null;
  price: string | null;
  status: string;
}

/** MySQL hands back a DATE as a Date in some drivers and a string in
 *  others, and a diary that is a day out is worse than no diary. */
function asDay(value: unknown): string {
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerName: row.customer_name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    job: row.job ?? "",
    notes: row.notes ?? "",
    bookedOn: asDay(row.booked_on),
    // TIME comes back as HH:MM:SS; the diary only ever shows HH:MM.
    startsAt: row.starts_at ? String(row.starts_at).slice(0, 5) : "",
    durationMinutes: row.duration_minutes === null ? null : Number(row.duration_minutes),
    price: row.price === null ? null : Number(row.price),
    status: row.status,
  };
}

const COLUMNS = `id, lead_id, customer_name, phone, email, job, notes,
         booked_on, starts_at, duration_minutes, price, status`;

/** Everything in a month, for the grid. `month` is YYYY-MM. */
export async function listBookingsForMonth(
  clientId: number,
  month: string,
): Promise<Booking[] | null> {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  return withDb(async (db) => {
    const [rows] = await db.query<BookingRow[]>(
      `SELECT ${COLUMNS} FROM client_bookings
        WHERE client_id = ?
          AND booked_on >= ?
          AND booked_on < DATE_ADD(?, INTERVAL 1 MONTH)
        ORDER BY booked_on ASC, starts_at ASC`,
      [clientId, `${month}-01`, `${month}-01`],
    );
    return rows.map(toBooking);
  });
}

/** What is coming, for the list under the grid and the app's front screen. */
export async function listUpcoming(clientId: number, days = 14): Promise<Booking[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<BookingRow[]>(
      `SELECT ${COLUMNS} FROM client_bookings
        WHERE client_id = ?
          AND status = 'booked'
          AND booked_on >= CURDATE()
          AND booked_on < DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY booked_on ASC, starts_at ASC
        LIMIT 100`,
      [clientId, days],
    );
    return rows.map(toBooking);
  });
}

export async function createBooking(
  clientId: number,
  booking: {
    customerName: string;
    phone: string;
    email: string;
    job: string;
    notes: string;
    bookedOn: string;
    startsAt: string;
    durationMinutes: number | null;
    price: number | null;
    leadId: number | null;
  },
): Promise<number | null> {
  if (!booking.customerName.trim()) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.bookedOn)) return null;

  const created = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO client_bookings
         (client_id, lead_id, customer_name, phone, email, job, notes,
          booked_on, starts_at, duration_minutes, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        booking.leadId,
        booking.customerName.trim().slice(0, 160),
        booking.phone.slice(0, 60) || null,
        booking.email.slice(0, 200) || null,
        booking.job.slice(0, 255) || null,
        booking.notes.slice(0, 4000) || null,
        booking.bookedOn,
        /^\d{2}:\d{2}$/.test(booking.startsAt) ? `${booking.startsAt}:00` : null,
        booking.durationMinutes && booking.durationMinutes > 0 ? booking.durationMinutes : null,
        booking.price !== null && booking.price >= 0 ? booking.price : null,
      ],
    );
    return result.insertId;
  });
  return created ?? null;
}

export async function updateBookingStatus(
  clientId: number,
  id: number,
  status: string,
): Promise<boolean> {
  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) return false;
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE client_bookings SET status = ? WHERE id = ? AND client_id = ?",
      [status, id, clientId],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

export async function deleteBooking(clientId: number, id: number): Promise<boolean> {
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM client_bookings WHERE id = ? AND client_id = ?",
      [id, clientId],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

/* --------------------------------------------------------- reminders --- */

export type DueReminder = {
  bookingId: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  customerName: string;
  job: string;
  bookedOn: string;
  startsAt: string;
};

/**
 * Tomorrow's jobs that have not been reminded about yet.
 *
 * `reminded_at IS NULL` rather than a date comparison, so a job can only
 * ever produce one reminder however many times the run happens. Cancelled
 * jobs are excluded: a reminder for something that is not happening is
 * worse than no reminder.
 */
export async function listRemindersDue(): Promise<DueReminder[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & {
        id: number;
        client_id: number;
        client_name: string;
        contact_email: string | null;
        customer_name: string;
        job: string | null;
        booked_on: string;
        starts_at: string | null;
      })[]
    >(
      `SELECT b.id, b.client_id, c.name AS client_name, c.contact_email,
              b.customer_name, b.job, b.booked_on, b.starts_at
         FROM client_bookings b
         JOIN clients c ON c.id = b.client_id
        WHERE b.status = 'booked'
          AND b.reminded_at IS NULL
          AND b.booked_on = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND c.is_active = 1
          AND c.contact_email IS NOT NULL AND c.contact_email <> ''
        ORDER BY b.client_id, b.starts_at`,
    );
    return rows.map((r) => ({
      bookingId: r.id,
      clientId: r.client_id,
      clientName: r.client_name,
      clientEmail: r.contact_email ?? "",
      customerName: r.customer_name,
      job: r.job ?? "",
      bookedOn: asDay(r.booked_on),
      startsAt: r.starts_at ? String(r.starts_at).slice(0, 5) : "",
    }));
  });
}

export async function markReminded(bookingIds: number[]): Promise<void> {
  if (bookingIds.length === 0) return;
  await withDb(async (db) => {
    await db.query("UPDATE client_bookings SET reminded_at = NOW() WHERE id IN (?)", [bookingIds]);
  }).catch(() => null);
}

/** Today's jobs for every active client, for the morning summary. */
export async function listTodayByClient(): Promise<DueReminder[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & {
        id: number;
        client_id: number;
        client_name: string;
        contact_email: string | null;
        customer_name: string;
        job: string | null;
        booked_on: string;
        starts_at: string | null;
      })[]
    >(
      `SELECT b.id, b.client_id, c.name AS client_name, c.contact_email,
              b.customer_name, b.job, b.booked_on, b.starts_at
         FROM client_bookings b
         JOIN clients c ON c.id = b.client_id
        WHERE b.status = 'booked'
          AND b.booked_on = CURDATE()
          AND c.is_active = 1
          AND c.contact_email IS NOT NULL AND c.contact_email <> ''
        ORDER BY b.client_id, b.starts_at`,
    );
    return rows.map((r) => ({
      bookingId: r.id,
      clientId: r.client_id,
      clientName: r.client_name,
      clientEmail: r.contact_email ?? "",
      customerName: r.customer_name,
      job: r.job ?? "",
      bookedOn: asDay(r.booked_on),
      startsAt: r.starts_at ? String(r.starts_at).slice(0, 5) : "",
    }));
  });
}
