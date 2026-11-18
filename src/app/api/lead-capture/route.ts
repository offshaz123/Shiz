import { NextResponse } from "next/server";
import { getClientBySlug, recordClientLead } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Where a client's enquiry form posts.
 *
 * One endpoint for every client, told apart by the slug in the body, so a
 * new client needs a row in the database and nothing deployed.
 *
 * Open by design: it is a contact form, and the pages posting to it are
 * other people's websites on other people's domains. The protections that
 * fit are the ones that do not need a secret — a size cap, a required
 * client, and a honeypot field that a person never fills in and a bot
 * usually does.
 *
 * `source` is the field worth getting right. It is what turns "forty
 * enquiries" into "twenty-eight from Google", which is the difference
 * between a number and a decision, so the client's landing pages should set
 * it per channel rather than leaving it to default.
 */

const MAX_FIELD = 4000;

/**
 * Every answer carries these, not just the preflight.
 *
 * The form lives on the client's own domain, so each submission is a
 * cross-origin request and the browser discards a response without them —
 * which looks to the visitor like a form that silently failed, even though
 * the enquiry was saved.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

function field(body: Record<string, unknown>, name: string): string {
  const value = body[name];
  return typeof value === "string" ? value.trim().slice(0, MAX_FIELD) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return reply({ error: "bad_request" }, 400);

  // The honeypot. A hidden input nobody can see and a person never fills.
  // Answered with the same 200 a real submission gets, so a bot learns
  // nothing from the response about whether it worked.
  if (field(body, "website_url")) return reply({ ok: true });

  const slug = field(body, "client");
  if (!slug) return reply({ error: "no_client" }, 400);

  const client = await getClientBySlug(slug);
  if (!client) return reply({ error: "unknown_client" }, 404);

  const name = field(body, "name");
  const email = field(body, "email");
  const phone = field(body, "phone");
  const message = field(body, "message");

  // Something to contact them by, or the enquiry is not one.
  if (!email && !phone) {
    return reply({ error: "no_contact" }, 400);
  }

  const saved = await recordClientLead(client.id, {
    name,
    email,
    phone,
    message,
    source: field(body, "source") || "website",
    landingPage: field(body, "page"),
  });

  return saved ? reply({ ok: true }) : reply({ error: "not_saved" }, 503);
}

/** Browsers preflight a cross-origin JSON post, so this has to answer. */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Max-Age": "86400" },
  });
}
