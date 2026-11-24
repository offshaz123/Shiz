import { NextResponse } from "next/server";
import { canSee, canSeeRegion, currentUser } from "@/lib/admin-auth";
import { recentInbox } from "@/lib/mail-store";
import { listSent, mailboxCounts, sendersWeKnow } from "@/lib/mailbox-view";
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
 * The inbox is not filtered by country, because an email that has
 * arrived does not carry one. What it carries is a sender, so each
 * message is matched against the businesses we have written to, and a
 * message from one of them picks up their country from their row.
 * Anything we cannot match is shown as it is rather than hidden — a
 * reply from an address we do not recognise is still a reply.
 */
export async function GET(request: Request) {
  const who = await currentUser();
  if (!canSee(who, "emails")) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const asked = new URL(request.url).searchParams.get("region");
  const region: Region | undefined = asked ? toRegion(asked) : undefined;
  if (region && !canSeeRegion(who, region)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const [sent, counts, inbox] = await Promise.all([
    listSent(region, 120),
    mailboxCounts(),
    // Never allowed to fail the response. A mailbox refusing a login is
    // a thing to say on the page, not a reason to show nothing at all.
    recentInbox(40).catch(() => null),
  ]);

  const known = await sendersWeKnow((inbox ?? []).map((m) => m.from));

  return NextResponse.json({
    sent: sent ?? [],
    counts,
    // Null means the mailbox could not be read, which is different from
    // an empty inbox and has to stay different all the way to the page.
    inbox:
      inbox === null
        ? null
        : inbox.map((m) => {
            const match = known.get(m.from);
            return {
              ...m,
              business: match?.name ?? "",
              prospectId: match?.id ?? null,
              region: match?.region ?? null,
            };
          }),
    savedList: sent !== null,
  });
}
