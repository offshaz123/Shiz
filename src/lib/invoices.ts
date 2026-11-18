import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withDb } from "./db";
import { pounds, totals, type Discount, type InvoiceLine } from "./invoice-maths";

export type { Discount };
import {
  formatAddress,
  formatBankDetails,
  tidyAccountNumber,
  tidyEmail,
  tidySortCode,
  tidyPhone,
  tidyPostcode,
  tidyVatNumber,
  tidyWebsite,
} from "./business-profile";
import { logoUrlFrom } from "./client-logo";

// Re-exported so a server file has one place to import from, while the
// browser-side pages take them straight from invoice-maths and never pull
// the database driver in with them.
export { pounds, totals };
export type { InvoiceLine };

/**
 * Invoices a client sends to their own customers.
 *
 * Money is pence, as a whole number, everywhere in this file and in the
 * database. Pounds as a float is a total that eventually comes out a penny
 * short, and the one document where a penny is noticed is the one asking
 * somebody to pay. It is turned into pounds once, at the edge, for display.
 *
 * The customer's name and address are copied onto the invoice rather than
 * pointed at. An invoice is a record of what was sent on a day: if their
 * customer moves next year, last quarter's invoice still has to say what it
 * said when it went out.
 *
 * Numbers count from 1 per client and are never reused. A gap in an invoice
 * sequence is a question from an accountant, so a draft takes its number
 * when it is created and keeps it even if it is later cancelled.
 */

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export const INVOICE_STATUSES: readonly InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "cancelled",
];

export type Invoice = {
  id: number;
  number: number;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerAddress: string;
  /** YYYY-MM-DD. */
  issuedOn: string;
  dueOn: string;
  vatRate: number;
  discount: Discount;
  notes: string;
  status: InvoiceStatus;
  sentAt: string;
  paidAt: string;
  lines: InvoiceLine[];
  /** All pence. */
  subtotalPence: number;
  discountPence: number;
  afterDiscountPence: number;
  vatPence: number;
  totalPence: number;
};

/** What the business sending it looks like on the page. */
export type InvoiceSender = {
  name: string;
  logoUrl: string;
  email: string;
  /** Already laid out one part per line, ready to print. */
  address: string;
  phone: string;
  website: string;
  vatNumber: string;
  paymentDetails: string;
};

/** The same business, in the separate boxes they fill in. */
export type BusinessProfile = {
  bankAccountName: string;
  bankSortCode: string;
  bankAccountNumber: string;
  /** What we file them under; not editable from their side. */
  accountName: string;
  invoiceName: string;
  email: string;
  phone: string;
  website: string;
  vatNumber: string;
  paymentDetails: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  /** Where their uploaded logo is served from, or "" if there is none. */
  logoUrl: string;
};

interface InvoiceRow extends RowDataPacket {
  id: number;
  number: number;
  customer_name: string;
  customer_company: string | null;
  customer_email: string | null;
  customer_address: string | null;
  issued_on: string;
  due_on: string | null;
  vat_rate: string;
  discount_kind: string;
  discount_percent: string;
  discount_pence: number;
  notes: string | null;
  status: string;
  sent_at: string | null;
  paid_at: string | null;
}

interface LineRow extends RowDataPacket {
  id: number;
  invoice_id: number;
  description: string;
  quantity: string;
  unit_pence: number;
}

/** A date column can arrive as a Date or a string depending on the driver. */
function day(value: string | Date | null): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function asStatus(value: string): InvoiceStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value)
    ? (value as InvoiceStatus)
    : "draft";
}

function build(row: InvoiceRow, lines: InvoiceLine[]): Invoice {
  const vatRate = Number(row.vat_rate);
  const discount: Discount = {
    kind:
      row.discount_kind === "percent" || row.discount_kind === "fixed"
        ? row.discount_kind
        : "none",
    percent: Number(row.discount_percent) || 0,
    pence: Number(row.discount_pence) || 0,
  };
  const sums = totals(lines, vatRate, discount);
  return {
    id: row.id,
    number: row.number,
    customerName: row.customer_name,
    customerCompany: row.customer_company ?? "",
    customerEmail: row.customer_email ?? "",
    customerAddress: row.customer_address ?? "",
    issuedOn: day(row.issued_on),
    dueOn: day(row.due_on),
    vatRate,
    discount,
    notes: row.notes ?? "",
    status: asStatus(row.status),
    sentAt: row.sent_at ? String(row.sent_at) : "",
    paidAt: row.paid_at ? String(row.paid_at) : "",
    lines,
    ...sums,
  };
}

function toLine(row: LineRow): InvoiceLine {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    unitPence: row.unit_pence,
  };
}

const INVOICE_COLUMNS = `id, number, customer_name, customer_company, customer_email, customer_address,
  issued_on, due_on, vat_rate, discount_kind, discount_percent, discount_pence,
  notes, status, sent_at, paid_at`;

/** Every invoice this client has, newest first, with its lines. */
export async function listInvoices(clientId: number): Promise<Invoice[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<InvoiceRow[]>(
      `SELECT ${INVOICE_COLUMNS} FROM client_invoices
        WHERE client_id = ? ORDER BY number DESC LIMIT 500`,
      [clientId],
    );
    if (rows.length === 0) return [];

    // One query for every line rather than one per invoice.
    const [lines] = await db.query<LineRow[]>(
      `SELECT id, invoice_id, description, quantity, unit_pence
         FROM client_invoice_lines
        WHERE invoice_id IN (${rows.map(() => "?").join(",")})
        ORDER BY position ASC, id ASC`,
      rows.map((r) => r.id),
    );

    const byInvoice = new Map<number, InvoiceLine[]>();
    for (const line of lines) {
      const list = byInvoice.get(line.invoice_id) ?? [];
      list.push(toLine(line));
      byInvoice.set(line.invoice_id, list);
    }
    return rows.map((row) => build(row, byInvoice.get(row.id) ?? []));
  });
}

/**
 * One invoice, scoped to its owner.
 *
 * The client id is part of the query rather than checked afterwards, so
 * there is no path where somebody changes a number in a URL and reads
 * another business's invoice.
 */
export async function getInvoice(clientId: number, id: number): Promise<Invoice | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<InvoiceRow[]>(
      `SELECT ${INVOICE_COLUMNS} FROM client_invoices
        WHERE id = ? AND client_id = ? LIMIT 1`,
      [id, clientId],
    );
    const row = rows[0];
    if (!row) return null;

    const [lines] = await db.query<LineRow[]>(
      `SELECT id, invoice_id, description, quantity, unit_pence
         FROM client_invoice_lines WHERE invoice_id = ?
        ORDER BY position ASC, id ASC`,
      [id],
    );
    return build(row, lines.map(toLine));
  });
  return found ?? null;
}

export type NewInvoice = {
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerAddress: string;
  issuedOn: string;
  dueOn: string;
  vatRate: number;
  discount: Discount;
  notes: string;
  lines: { description: string; quantity: number; unitPence: number }[];
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns the new invoice's id, or null if there was nothing to invoice. */
export async function createInvoice(
  clientId: number,
  input: NewInvoice,
): Promise<number | null> {
  const name = input.customerName.trim().slice(0, 160);
  const lines = input.lines
    .map((line) => ({
      description: line.description.trim().slice(0, 255),
      quantity: Number.isFinite(line.quantity) ? Math.max(0, line.quantity) : 0,
      unitPence: Number.isFinite(line.unitPence) ? Math.round(line.unitPence) : 0,
    }))
    .filter((line) => line.description !== "");

  // An invoice with no customer or nothing on it is not a draft, it is a
  // mistake, and saving it would take a number out of the sequence.
  if (!name || lines.length === 0) return null;
  if (!DATE.test(input.issuedOn)) return null;

  const created = await withDb(async (db) => {
    // The number and the row are taken together, so two invoices started
    // in the same second cannot be handed the same number. The unique key
    // on (client_id, number) is what actually guarantees it; this just
    // makes the collision rare enough never to be seen.
    const [[seq]] = await db.query<(RowDataPacket & { next: number })[]>(
      "SELECT COALESCE(MAX(number), 0) + 1 AS next FROM client_invoices WHERE client_id = ?",
      [clientId],
    );

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO client_invoices
         (client_id, number, customer_name, customer_company, customer_email,
          customer_address, issued_on, due_on, vat_rate,
          discount_kind, discount_percent, discount_pence, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        seq.next,
        name,
        input.customerCompany.trim().slice(0, 160) || null,
        input.customerEmail.trim().slice(0, 200) || null,
        input.customerAddress.trim().slice(0, 1000) || null,
        input.issuedOn,
        DATE.test(input.dueOn) ? input.dueOn : null,
        Number.isFinite(input.vatRate) ? Math.min(Math.max(input.vatRate, 0), 100) : 0,
        input.discount.kind,
        Math.min(Math.max(Number(input.discount.percent) || 0, 0), 100),
        Math.max(Math.round(Number(input.discount.pence) || 0), 0),
        input.notes.trim().slice(0, 2000) || null,
      ],
    );

    const invoiceId = result.insertId;
    for (const [position, line] of lines.entries()) {
      await db.execute(
        `INSERT INTO client_invoice_lines (invoice_id, description, quantity, unit_pence, position)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, line.description, line.quantity, line.unitPence, position],
      );
    }
    return invoiceId;
  });
  return created ?? null;
}

/**
 * Moves an invoice along.
 *
 * Only forwards into a state that means something: a draft can be sent or
 * cancelled, a sent one can be paid or cancelled. Nothing goes back to
 * draft once it has left, because the customer already has the one that
 * went.
 */
export async function setInvoiceStatus(
  clientId: number,
  id: number,
  status: InvoiceStatus,
): Promise<boolean> {
  const stamp =
    status === "paid"
      ? ", paid_at = COALESCE(paid_at, NOW())"
      : status === "sent"
        ? ", sent_at = COALESCE(sent_at, NOW())"
        : "";

  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE client_invoices SET status = ?${stamp}
        WHERE id = ? AND client_id = ? AND status <> 'cancelled'`,
      [status, id, clientId],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

/** The business details that have to appear on what they send out. */
const PROFILE_COLUMNS = `name, invoice_name, slug, contact_email, business_phone, business_website,
  vat_number, payment_details, address_line1, address_line2, city, postcode, country,
  bank_account_name, bank_sort_code, bank_account_number`;

type ProfileRow = RowDataPacket & {
  name: string;
  invoice_name: string | null;
  slug: string;
  contact_email: string | null;
  business_phone: string | null;
  business_website: string | null;
  vat_number: string | null;
  payment_details: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  bank_account_name: string | null;
  bank_sort_code: string | null;
  bank_account_number: string | null;
};

async function readProfile(
  clientId: number,
): Promise<{ row: ProfileRow; logoStamp: string | null } | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<ProfileRow[]>(
      `SELECT ${PROFILE_COLUMNS} FROM clients WHERE id = ? LIMIT 1`,
      [clientId],
    );
    const row = rows[0];
    if (!row) return null;

    const [logos] = await db.query<(RowDataPacket & { updated_at: string })[]>(
      "SELECT updated_at FROM client_logos WHERE client_id = ? LIMIT 1",
      [clientId],
    );
    return { row, logoStamp: logos[0] ? String(logos[0].updated_at) : null };
  });
  return found ?? null;
}

export async function getSender(clientId: number): Promise<InvoiceSender | null> {
  const found = await readProfile(clientId);
  if (!found) return null;
  const { row, logoStamp } = found;

  return {
    // The invoice name wins when they have set one: we file them as "Auto
    // Wrap Manchester" but the invoice may need to say "A W Manchester Ltd".
    name: row.invoice_name?.trim() || row.name,
    logoUrl: logoUrlFrom(row.slug, logoStamp, ""),
    email: tidyEmail(row.contact_email ?? ""),
    address: formatAddress({
      line1: row.address_line1 ?? "",
      line2: row.address_line2 ?? "",
      city: row.city ?? "",
      postcode: row.postcode ?? "",
      country: row.country ?? "",
    }),
    phone: tidyPhone(row.business_phone ?? ""),
    website: tidyWebsite(row.business_website ?? ""),
    vatNumber: tidyVatNumber(row.vat_number ?? ""),
    // Built from the boxes rather than taken as typed, so each line is
    // labelled for the person copying it into a banking app.
    paymentDetails: formatBankDetails({
      accountName: row.bank_account_name ?? "",
      sortCode: row.bank_sort_code ?? "",
      accountNumber: row.bank_account_number ?? "",
      note: row.payment_details ?? "",
    }),
  };
}

/** The same details, in the boxes they are typed into. */
export async function getBusinessProfile(clientId: number): Promise<BusinessProfile | null> {
  const found = await readProfile(clientId);
  if (!found) return null;
  const { row, logoStamp } = found;

  return {
    accountName: row.name,
    invoiceName: row.invoice_name ?? "",
    email: row.contact_email ?? "",
    phone: row.business_phone ?? "",
    website: row.business_website ?? "",
    vatNumber: row.vat_number ?? "",
    paymentDetails: row.payment_details ?? "",
    line1: row.address_line1 ?? "",
    line2: row.address_line2 ?? "",
    city: row.city ?? "",
    postcode: row.postcode ?? "",
    country: row.country ?? "",
    bankAccountName: row.bank_account_name ?? "",
    bankSortCode: row.bank_sort_code ?? "",
    bankAccountNumber: row.bank_account_number ?? "",
    logoUrl: logoUrlFrom(row.slug, logoStamp, ""),
  };
}

/**
 * Saves what they typed, tidied on the way in.
 *
 * Tidied here rather than only when printing, so that what they see in the
 * box afterwards is what their customers will see. A form that silently
 * prints something different from what it shows is a form nobody trusts
 * the second time.
 */
export async function setBusinessProfile(
  clientId: number,
  changes: Record<string, string>,
): Promise<boolean> {
  const columns: Record<string, { column: string; tidy?: (v: string) => string }> = {
    invoiceName: { column: "invoice_name" },
    email: { column: "contact_email", tidy: tidyEmail },
    phone: { column: "business_phone", tidy: tidyPhone },
    website: { column: "business_website", tidy: tidyWebsite },
    vatNumber: { column: "vat_number", tidy: tidyVatNumber },
    paymentDetails: { column: "payment_details" },
    bankAccountName: { column: "bank_account_name" },
    bankSortCode: { column: "bank_sort_code", tidy: tidySortCode },
    bankAccountNumber: { column: "bank_account_number", tidy: tidyAccountNumber },
    line1: { column: "address_line1" },
    line2: { column: "address_line2" },
    city: { column: "city" },
    postcode: { column: "postcode", tidy: tidyPostcode },
    country: { column: "country" },
  };

  const sets: string[] = [];
  const params: string[] = [];
  for (const [key, spec] of Object.entries(columns)) {
    const value = changes[key];
    if (typeof value !== "string") continue;
    sets.push(`${spec.column} = ?`);
    params.push((spec.tidy ? spec.tidy(value) : value.trim()).slice(0, 2000));
  }
  if (sets.length === 0) return false;

  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE clients SET ${sets.join(", ")} WHERE id = ?`,
      [...params, clientId],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}
