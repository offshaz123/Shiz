/**
 * What state an invoice is in.
 *
 * Beside the payment methods and apart from the queries for the same
 * reason: the buttons that move an invoice along run in the browser, and
 * the module that moves it imports the database driver.
 */

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export const INVOICE_STATUSES: readonly InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "cancelled",
];

export function asStatus(value: string): InvoiceStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value)
    ? (value as InvoiceStatus)
    : "draft";
}
