import { NextResponse } from "next/server";
import { currentClient } from "@/lib/client-auth";
import {
  createInvoice,
  getInvoice,
  getSender,
  listInvoices,
  setInvoiceStatus,
  asPaidMethod,
  setBusinessProfile,
  type InvoiceStatus,
} from "@/lib/invoices";
import { sendInvoice } from "@/lib/send-invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A client's invoices, read and written by that client.
 *
 * Every handler starts from currentClient() and passes that id into the
 * query. The id is never read off the request, so there is no number in a
 * body or a URL anybody can change to reach another business's invoices or
 * send mail from another business's name.
 */

function text(body: unknown, name: string): string {
  const value = (body as Record<string, unknown>)?.[name];
  return typeof value === "string" ? value : "";
}

function discountKind(value: string): "none" | "percent" | "fixed" {
  return value === "percent" || value === "fixed" ? value : "none";
}

export async function GET() {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const invoices = await listInvoices(client.id);
  return invoices === null
    ? NextResponse.json({ error: "unavailable" }, { status: 503 })
    : NextResponse.json({ invoices });
}

export async function POST(request: Request) {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rawLines = Array.isArray((body as { lines?: unknown })?.lines)
    ? ((body as { lines: unknown[] }).lines as Record<string, unknown>[])
    : [];

  const id = await createInvoice(client.id, {
    customerName: text(body, "customerName"),
    customerCompany: text(body, "customerCompany"),
    customerEmail: text(body, "customerEmail"),
    customerAddress: text(body, "customerAddress"),
    issuedOn: text(body, "issuedOn"),
    dueOn: text(body, "dueOn"),
    vatRate: Number((body as { vatRate?: unknown })?.vatRate) || 0,
    discount: {
      kind: discountKind(text(body, "discountKind")),
      percent: Number((body as { discountPercent?: unknown })?.discountPercent) || 0,
      // Pounds on the way in, pence from here on, the same as a line price.
      pence: Math.round((Number((body as { discountAmount?: unknown })?.discountAmount) || 0) * 100),
    },
    notes: text(body, "notes"),
    paidNow: (body as { paidNow?: unknown })?.paidNow === true,
    paidMethod: asPaidMethod(text(body, "paidMethod")),
    lines: rawLines.map((line) => ({
      description: typeof line.description === "string" ? line.description : "",
      quantity: Number(line.quantity) || 0,
      // Pounds on the way in, pence from here on. Rounded once, here, so a
      // price typed as 19.99 cannot become 1998.9999 further down.
      unitPence: Math.round((Number(line.unitPrice) || 0) * 100),
    })),
  });

  return id === null
    ? NextResponse.json({ error: "needs_a_customer_and_a_line" }, { status: 400 })
    : NextResponse.json({ id });
}

/**
 * Moves one along, or sends it.
 *
 * Sending and marking sent are one action on purpose. An invoice that was
 * emailed but still reads as a draft, or reads as sent when the mail
 * bounced, is worse than either state on its own, so the status is only
 * stamped once the mail server has actually taken it.
 */
export async function PATCH(request: Request) {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = Number((body as { id?: unknown })?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  if ((body as { action?: unknown })?.action === "send") {
    const [invoice, sender] = await Promise.all([
      getInvoice(client.id, id),
      getSender(client.id),
    ]);
    if (!invoice || !sender) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const sent = await sendInvoice(invoice, sender);
    if (!sent.ok) return NextResponse.json({ error: sent.reason }, { status: 400 });

    await setInvoiceStatus(client.id, id, "sent");
    return NextResponse.json({ ok: true });
  }

  const status = text(body, "status");
  const allowed: InvoiceStatus[] = ["sent", "paid", "cancelled"];
  if (!allowed.includes(status as InvoiceStatus)) {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }

  const done = await setInvoiceStatus(
    client.id,
    id,
    status as InvoiceStatus,
    asPaidMethod(text(body, "paidMethod")),
  );
  return done
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_changed" }, { status: 400 });
}

/** Their own business details, as they appear on what they send out. */
const PROFILE_FIELDS = [
  "invoiceName",
  "email",
  "phone",
  "website",
  "vatNumber",
  "paymentDetails",
  "bankAccountName",
  "bankSortCode",
  "bankAccountNumber",
  "line1",
  "line2",
  "city",
  "postcode",
  "country",
];

export async function PUT(request: Request) {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const changes: Record<string, string> = {};
  for (const field of PROFILE_FIELDS) {
    const value = (body as Record<string, unknown>)?.[field];
    if (typeof value === "string") changes[field] = value;
  }

  const done = await setBusinessProfile(client.id, changes);
  return done
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_saved" }, { status: 400 });
}
