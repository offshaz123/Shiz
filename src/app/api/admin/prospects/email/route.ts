import { NextResponse } from "next/server";
import { canSee, currentUser } from "@/lib/admin-auth";

/**
 * The page behind this route. Checked here as well as on the page,
 * because the browser calls these directly and a member of staff
 * without the page can type the address of its data.
 */
async function allowed(): Promise<boolean> {
  return canSee(await currentUser(), "prospects");
}
import { sendProspectEmail } from "@/lib/send-prospect-email";
import { listProspectEmails, stopSequence } from "@/lib/prospects";

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
  unsubscribed: "They have asked not to be emailed, so nothing was sent.",
  send_failed: "The mail server refused it. Try again in a minute.",
};

export async function POST(request: Request) {
  if (!(await allowed())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const subject = typeof body?.subject === "string" ? body.subject : "";
  const text = typeof body?.body === "string" ? body.body : "";

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Calling off the two follow-ups for one business, from the call list,
  // without having to remember a status that means something else.
  if (body?.action === "stop") {
    await stopSequence(id, "stopped by hand");
    return NextResponse.json({ stopped: true });
  }

  // An email sent straight after a phone call is a one-off, not step one of
  // anything. Step 0 says so: it marks them written to without starting the
  // day 3 and day 5 follow-ups, because somebody who has just been spoken to
  // and has given a WhatsApp number does not then want two scripted cold
  // emails. The sequence is stopped outright below for the same reason.
  //
  // Otherwise it is always step one from here. Steps two and three exist
  // only for a prospect whose first email a person read and sent, and they
  // are sent by the cron. "hand": this is the one path where a person has
  // read the email and pressed send. Everything else goes out as "auto",
  // which is what the admin page's automatic-email section reads.
  const afterCall = body?.afterCall === true;
  const result = await sendProspectEmail(id, subject, text, afterCall ? 0 : 1, "hand");
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason, message: MESSAGES[result.reason] ?? result.reason },
      // A missing address or an empty draft is the caller's fault; missing
      // SMTP credentials or a refusing mail server is ours.
      { status: ["no_email", "empty", "no_prospect"].includes(result.reason) ? 400 : 503 },
    );
  }

  // Said out loud on the record, and it also keeps the automatic first
  // email away from them: that job writes to anybody never written to, and
  // a step 0 send leaves no sequence start behind for it to notice.
  // Unless he has said to carry on with them, which the box asks him
  // whenever a sequence is actually running.
  if (afterCall && body?.keepSequence !== true) {
    await stopSequence(id, "emailed by hand after a call");
  }

  return NextResponse.json({
    sent: true,
    afterCall,
    recipient: result.recipient,
    // False means the email went but no copy could be put in the Sent
    // folder, which the admin page says out loud rather than leaving him to
    // find out by looking for it later.
    filedInSent: result.filedInSent,
  });
}

export async function GET(request: Request) {
  if (!(await allowed())) {
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
