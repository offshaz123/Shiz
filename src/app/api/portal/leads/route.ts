import { NextResponse } from "next/server";
import { currentClient } from "@/lib/client-auth";
import { markLeadAnswered, recordClientLead, setLeadStatus } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A client marking their own enquiries: answered, and where it got to.
 *
 * This had to exist for the dashboard to mean anything. Two of the four
 * figures on it — how many became customers, and how long people waited —
 * can only come from the person who did the answering. Without a way to
 * record them they would have read zero and "—" forever, which is worse
 * than not showing them: a number that is always zero teaches you to
 * ignore the panel it sits in.
 *
 * The client id comes from the session and is passed into every query, so
 * the id in the body can only ever name one of their own leads.
 */
/**
 * An enquiry the client takes themselves.
 *
 * Most of these businesses get as many jobs over the phone and off the
 * van as they do through a form, and until now only the form ones
 * existed. That made every figure on their dashboard a count of the
 * website rather than a count of their business, which is the wrong
 * thing to be measuring and the wrong thing to be judged on.
 *
 * Added after the fact, it can be marked as already answered. Somebody
 * typing up Tuesday's phone call on Thursday should not have their reply
 * time wrecked by their own book-keeping.
 */
export async function POST(request: Request) {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const text = (name: string) => {
    const value = (body as Record<string, unknown>)?.[name];
    return typeof value === "string" ? value.trim() : "";
  };

  const name = text("name");
  if (!name) return NextResponse.json({ error: "needs_a_name" }, { status: 400 });

  const typed = Number((body as { value?: unknown })?.value);
  const id = await recordClientLead(client.id, {
    name,
    email: text("email"),
    phone: text("phone"),
    message: text("message"),
    source: text("source") || "phone",
    landingPage: "",
    value: Number.isFinite(typed) && typed > 0 ? typed : null,
    status: text("status"),
    alreadyAnswered: (body as { alreadyAnswered?: unknown })?.alreadyAnswered === true,
  });

  return id === null
    ? NextResponse.json({ error: "not_saved" }, { status: 503 })
    : NextResponse.json({ id });
}

export async function PATCH(request: Request) {
  const client = await currentClient();
  if (!client) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  // Answering and moving them along are usually the same moment, so both
  // can arrive together and either alone.
  let changed = false;

  if (body?.answered === true) {
    changed = (await markLeadAnswered(client.id, id)) || changed;
  }

  if (typeof body?.status === "string") {
    const ok = await setLeadStatus(client.id, id, body.status);
    if (!ok) return NextResponse.json({ error: "bad_status" }, { status: 400 });
    // Anything past "new" means somebody has dealt with them, so the reply
    // clock stops here too rather than relying on a separate press.
    if (body.status !== "new") await markLeadAnswered(client.id, id);
    changed = true;
  }

  return changed
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "nothing_to_do" }, { status: 400 });
}
