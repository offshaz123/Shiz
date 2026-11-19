import { listClientLeads } from "./clients";
import { listBookingsBetween } from "./bookings";
import { listInvoices } from "./invoices";

/**
 * The four lists every joined-up page needs.
 *
 * In one place because three pages now want all of them and each was
 * fetching them slightly differently — one reading two months of diary,
 * another reading a fortnight. A customer record that quietly forgets
 * last spring's job because of a date range chosen for a different page
 * is worse than no customer record.
 *
 * The diary is read wide for the same reason: a customer's history is
 * the whole point, so it goes back two years rather than two months.
 */
export async function loadEverything(clientId: number, daysBack = 730) {
  const today = new Date();
  const day = (shift: number) =>
    new Date(today.getTime() + shift * 86_400_000).toISOString().slice(0, 10);

  const [leads, bookings, quotes, invoices] = await Promise.all([
    listClientLeads(clientId),
    listBookingsBetween(clientId, day(-daysBack), day(365)),
    listInvoices(clientId, "quote"),
    listInvoices(clientId, "invoice"),
  ]);

  return {
    leads: leads ?? [],
    bookings: bookings ?? [],
    quotes: quotes ?? [],
    invoices: invoices ?? [],
  };
}
