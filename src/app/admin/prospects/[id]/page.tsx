import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../../LoginForm";
import { NotYours } from "../../NotYours";
import { getProspect, listProspectCalls, listProspectEmails } from "@/lib/prospects";
import { callLabel } from "@/lib/prospect-types";
import { outreachLine } from "@/lib/outreach-lines";
import { callScript } from "@/lib/call-script";
import { CallScript } from "@/components/CallScript";
import { LogCall } from "@/components/LogCall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business",
  robots: { index: false, follow: false },
};

/**
 * Everything known about one business, on one screen.
 *
 * The reason this exists: the automatic emails are sent by the scheduler
 * with nobody reading them first, and a list saying "we wrote to Barking
 * Detailing" is not enough to pick up the phone on. Before ringing you want
 * the things that list cannot hold — where they came from, what the scan
 * actually found, what each email said, and what happened on any previous
 * call. Those existed in the database and nowhere on screen.
 *
 * Deliberately read-only. The call list is where a prospect is worked on,
 * with its buttons and its statuses; adding a second place to change the
 * same row means two places to keep in step and two places to get it wrong.
 * This one answers "who are these people and what have we said to them".
 */

function when(value: string): string {
  const at = new Date(value.replace(" ", "T"));
  if (Number.isNaN(at.getTime())) return value;
  return at.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STEP_NAME: Record<number, string> = {
  1: "First email",
  2: "Follow-up, day 3",
  3: "Follow-up, day 5",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-0.5 py-2">
      <dt className="w-40 shrink-0 text-xs text-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default async function ProspectProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "prospects")) return <NotYours page="prospects" />;

  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const [emails, calls] = await Promise.all([listProspectEmails(id), listProspectCalls(id)]);
  const sent = (emails ?? []).filter((e) => e.status === "sent");

  // Why they are, or are not, in the automatic sequence. This is the
  // question the page is most often opened to answer, so it is answered in
  // a sentence at the top rather than left to be inferred from the fields.
  const standing = prospect.unsubscribedAt
    ? "Unsubscribed. Nothing will ever be sent to them again."
    : prospect.repliedAt
      ? "They replied, so the sequence stopped itself. This one is a conversation now."
      : prospect.sequenceStoppedAt
        ? `Sequence stopped${prospect.sequenceStopReason ? `: ${prospect.sequenceStopReason}` : "."}`
        : prospect.sequenceStartedAt
          ? `In the sequence since ${when(prospect.sequenceStartedAt)}. ${sent.length} of 3 sent.`
          : !prospect.email
            ? "No email address was found on their website, so this one is a phone job."
            : !prospect.scannedAt
              ? "Not scanned yet. Nothing automatic will write to them until it is, because the first email talks about what the scan found."
              : prospect.findings.length === 0
                ? "Scanned, but nothing worth writing about was found, so the first email has nothing true to say."
                : "Scanned, has findings and an address: due a first email on the next run.";

  const script = callScript(prospect, sent.length);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <Link
        href="/admin/prospects"
        className="text-xs font-semibold text-brand-pink hover:underline"
      >
        ← Back to the call list
      </Link>

      <div className="mt-4">
        <AdminHeading title={prospect.name}>{standing}</AdminHeading>
      </div>

      {/* Ringing them is the point of the page, so the number is a button
          near the top rather than a field in a table halfway down. */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {prospect.phone ? (
          <a
            href={`tel:${prospect.phone}`}
            className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ring {prospect.phone}
          </a>
        ) : (
          <span className="rounded-full border border-border px-5 py-2.5 text-sm text-muted">
            No phone number
          </span>
        )}
        {prospect.website && (
          <a
            href={prospect.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground"
          >
            Their website ↗
          </a>
        )}
        {prospect.mapsUri && (
          <a
            href={prospect.mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground"
          >
            Google listing ↗
          </a>
        )}
      </div>

      <div className="mt-5">
        <LogCall id={prospect.id} status={prospect.status} />
      </div>

      {prospect.phone && (
        <div className="mt-7">
          <CallScript script={script} />
        </div>
      )}

      <section className="mt-7 rounded-2xl border border-border bg-surface px-5 py-2">
        <dl className="divide-y divide-border">
          <Row label="How we found them">
            {prospect.foundFor ? (
              <>
                Searched <b>{prospect.foundFor}</b>
                {prospect.town && <> in <b>{prospect.town}</b></>} on Google Maps.
              </>
            ) : (
              "Added before the search terms were recorded."
            )}
          </Row>
          {prospect.industry && <Row label="Industry">{prospect.industry}</Row>}
          {prospect.category && <Row label="Google calls them">{prospect.category}</Row>}
          <Row label="Reviews">
            {prospect.reviews} review{prospect.reviews === 1 ? "" : "s"}
            {prospect.rating !== null && <> · {prospect.rating} out of 5</>}
          </Row>
          <Row label="Email">
            {prospect.email ? (
              <span className="break-all">{prospect.email}</span>
            ) : (
              <span className="text-muted">
                None published on their site, which is why they are a call rather than an email.
              </span>
            )}
          </Row>
          {prospect.address && <Row label="Address">{prospect.address}</Row>}
          <Row label="Status">{prospect.status}</Row>
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">What the scan found</h2>
        {!prospect.scannedAt ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Not scanned yet. Nothing automatic writes to an unscanned business, because the
            first email is a list of what is wrong with their website.
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-xs text-muted">
              Scanned {when(prospect.scannedAt)}
              {prospect.siteScore !== null && <> · scored {prospect.siteScore} out of 10</>}
            </p>
            {prospect.findings.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Nothing worth writing about. A site with no obvious problems is a worse cold
                email and often a better phone call.
              </p>
            ) : (
              <ol className="mt-3 flex flex-col gap-2.5">
                {prospect.findings.map((finding, i) => (
                  <li key={finding.label} className="flex gap-3 text-sm leading-relaxed">
                    <span className="shrink-0 font-semibold tabular-nums text-muted">
                      {i + 1}.
                    </span>
                    <span className="text-foreground">{outreachLine(finding)}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Emails sent {sent.length > 0 && <span className="text-muted">({sent.length})</span>}
        </h2>
        {!emails || emails.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nothing has been sent to them yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {emails.map((email) => (
              <li
                key={`${email.step}-${email.sentAt}`}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold text-foreground">
                    {STEP_NAME[email.step] ?? `Step ${email.step}`}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      email.sentBy === "auto"
                        ? "border-border text-muted"
                        : "border-brand-pink/40 text-brand-pink"
                    }`}
                  >
                    {email.sentBy === "auto" ? "automatic" : "sent by hand"}
                  </span>
                  {email.status !== "sent" && (
                    <span className="rounded-full border border-red-500/50 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                      failed
                    </span>
                  )}
                  <span className="ml-auto text-xs tabular-nums text-muted">
                    {when(email.sentAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{email.subject}</p>
                {/* The exact words that went out. Before ringing somebody it
                    matters what they were actually sent, not a summary of
                    it — they may well have it open in front of them. */}
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted hover:text-foreground">
                    Read what was sent
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-muted">
                    {email.body}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Calls</h2>
        {!calls || calls.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nobody has rung them yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {calls.map((call) => (
              <li key={call.calledAt} className="flex flex-wrap gap-x-3 gap-y-1 py-2.5 text-sm">
                <span className="font-medium text-foreground">
                  {callLabel(call.outcome)}
                </span>
                {call.minutes !== null && <span className="text-muted">{call.minutes} min</span>}
                <span className="ml-auto text-xs tabular-nums text-muted">
                  {when(call.calledAt)}
                </span>
                {call.notes && (
                  <p className="w-full text-xs leading-relaxed text-muted">{call.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {prospect.notes && (
        <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {prospect.notes}
          </p>
        </section>
      )}
    </div>
  );
}
