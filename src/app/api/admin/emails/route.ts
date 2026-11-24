import { NextResponse } from "next/server";
import { canSee, canSeeRegion, currentUser } from "@/lib/admin-auth";
import { recentInbox } from "@/lib/mail-store";
import { classify } from "@/lib/inbox-sort";
import { listSent, mailboxCounts, sentBody, sendersWeKnow } from "@/lib/mailbox-view";
import { toRegion, type Region } from "@/lib/regions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * What the mailbox has sent and what has come back.
 *
 * Fetched by the page rather than rendered on the server, because half
 * of it is a live IMAP read: a mailbox that is slow to answer would
 * otherwise hold the whole page blank. This way the sent list and the
 * counts appear at once and the inbox fills in behind them.
 *
 * The inbox is sorted into three piles here rather than on the page,
 * because the sorting needs the headers and the headers are not worth
 * sending to a browser. A reply from a person first, a bounce in its
 * own pile because it is a job rather than a conversation, and the
 * machinery — DMARC reports, TikTok, Trustpilot — somewhere you can
 * still look but do not have to.
 *
 * A message that has arrived carries no country. What it carries is a
 * sender, so each one is matched against the businesses we have written
 * to and picks up their country from their row. Anything we cannot
 * match keeps no country and is counted separately, so choosing a
 * country visibly does something rather than appearing to do nothing.
 */
export async function GET(request: Request) {
  const who = await currentUser();
  if (!canSee(who, "emails")) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;

  // Opening one sent email. Its own request, so the list stays quick and
  // the body is only read when somebody actually wants to read it.
  const message = params.get("message");
  if (message) {
    const [kind, raw] = message.split("-");
    const id = Number(raw);
    if ((kind !== "outreach" && kind !== "audit") || !Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const found = await sentBody(kind, id);
    return found
      ? NextResponse.json(found)
      : NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const asked = params.get("region");
  const region: Region | undefined = asked ? toRegion(asked) : undefined;
  if (region && !canSeeRegion(who, region)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  // Two passes over the mailbox, because which messages are worth
  // opening depends on which senders we recognise, and that is a
  // database question. The first pass is envelopes only and cheap.
  const [sent, counts, envelopes] = await Promise.all([
    listSent(region, 120),
    mailboxCounts(),
    // Never allowed to fail the response. A mailbox refusing a login is
    // a thing to say on the page, not a reason to show nothing at all.
    recentInbox(40).catch(() => null),
  ]);

  const known = await sendersWeKnow((envelopes ?? []).map((m) => m.from));

  // Now read the bodies, but only of the ones that are replies.
  const inbox =
    envelopes === null
      ? null
      : await recentInbox(40, (m) =>
          classify({
            from: m.from,
            subject: m.subject,
            headers: m.headers,
            known: known.has(m.from),
          }) === "reply",
        ).catch(() => envelopes);

  return NextResponse.json({
    sent: sent ?? [],
    counts,
    // Null means the mailbox could not be read, which is different from
    // an empty inbox and has to stay different all the way to the page.
    inbox:
      inbox === null
        ? null
        : (inbox ?? []).map((m) => {
            const match = known.get(m.from);
            return {
              ...m,
              // Not sent to the browser: they are only needed to sort.
              headers: undefined,
              folder: classify({
                from: m.from,
                subject: m.subject,
                headers: m.headers,
                known: Boolean(match),
              }),
              business: match?.name ?? "",
              prospectId: match?.id ?? null,
              region: match?.region ?? null,
            };
          }),
    savedList: sent !== null,
  });
}
