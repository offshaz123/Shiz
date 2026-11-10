import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { sendProspectEmail } from "@/lib/send-prospect-email";
import { listProspectEmails } from "@/lib/prospects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends one outreach email from the call list, and reads back what has
 * already been sent to a prospect.
 *
 * One prospect per request. The address is looked up server-side from the id,
 * so this cannot be used to mail anyone who is not already a row in the call
 * list with an address taken off their own website.
 */

/** Which failures are worth saying out loud in the admin page, and in what
 *  words. Anything not listed falls back to the raw reason. */
const MESSAGES: Record<string, string> = {
  no_smtp: "Email is not configured on the server (SMTP settings missing).",
  no_database: "The database is unavailable, so nothing was sent.",
  no_prospect: "That prospect is no longer in the list.",
  no_email: "No email address on file for them.",
  empty: "The subject and the message both need something in them.",
  send_failed: "The mail server refused it. Try again in a minute.",
};

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const subject = typeof body?.subject === "string" ? body.subject : "";
  const text = typeof body?.body === "string" ? body.body : "";

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const result = await sendProspectEmail(id, subject, text);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason, message: MESSAGES[result.reason] ?? result.reason },
      // A missing address or an empty draft is the caller's fault; missing
      // SMTP credentials or a refusing mail server is ours.
      { status: ["no_email", "empty", "no_prospect"].includes(result.reason) ? 400 : 503 },
    );
  }

  return NextResponse.json({ sent: true, recipient: result.recipient });
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const sent = await listProspectEmails(id);
  if (sent === null) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
  return NextResponse.json({ sent });
}
