import type { Metadata } from "next";
import Link from "next/link";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { getToday } from "@/lib/today";
import { listProspectsByIds } from "@/lib/prospects";
import { CALL_LABEL, type CallOutcome } from "@/lib/prospect-types";
import { callScript } from "@/lib/call-script";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today",
  robots: { index: false, follow: false },
};

/**
 * What to do now.
 *
 * The call list answers "who could I ring", which is a different question and
 * a worse one to open the morning with. This is only things that go wrong if
 * they are left — a reply nobody has answered, a callback that was promised
 * — in the order they cost the most to ignore.
 *
 * It is deliberately short. A day's work that runs past the fold is a list
 * somebody scrolls instead of starting.
 */
export default async function AdminTodayPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "today")) return <NotYours page="today" />;

  const groups = await getToday(listProspectsByIds);
  const total = (groups ?? []).reduce((n, g) => n + g.prospects.length, 0);
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <AdminHeading title="Today">
        {today}{" · "}
        {groups === null
          ? "No database connection."
          : total === 0
            ? "Nothing waiting on you."
            : `${total} ${total === 1 ? "thing" : "things"} worth doing, most urgent first.`}
      </AdminHeading>

      {groups !== null && total === 0 && (
        <p className="mt-8 rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted">
          Nobody has replied, nothing is due to be rung back, and everything found so far has been
          contacted. Go and find some more —{" "}
          <Link href="/admin/prospects" className="underline hover:text-foreground">
            the call list
          </Link>{" "}
          searches Google, and{" "}
          <Link href="/admin/company" className="underline hover:text-foreground">
            the register
          </Link>{" "}
          has companies that started this month.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {(groups ?? []).map((group) => (
          <section key={group.id}>
            <h2 className="text-sm font-bold text-foreground">
              {group.title}
              <span className="ml-2 rounded-full bg-brand-pink/15 px-2 py-0.5 text-[11px] text-brand-pink">
                {group.prospects.length}
              </span>
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">{group.why}</p>

            {group.id === "emailed" && (
              <p className="mt-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs leading-relaxed text-muted">
                Something to open with:{" "}
                <span className="text-foreground">
                  &ldquo;Hi, it&rsquo;s Walid from Shaz Marketing Group. I sent you a few emails
                  last week about a couple of things on your website that are losing you
                  enquiries. I won&rsquo;t keep you, I just wanted to check they reached you,
                  because I know emails get buried.&rdquo;
                </span>{" "}
                It is true, it explains the call, and it gives them an easy way out, which is
                what stops it sounding like a cold call.
              </p>
            )}

            <ul className="mt-3 flex flex-col gap-2">
              {group.prospects.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-surface px-4 py-3 text-xs"
                >
                  <Link
                    href={`/admin/prospects/${p.id}`}
                    className="text-sm font-bold text-foreground hover:underline"
                  >
                    {p.name}
                  </Link>

                  {p.phone ? (
                    <a href={`tel:${p.phone}`} className="font-semibold underline">
                      {p.phone}
                    </a>
                  ) : (
                    <span className="text-muted">no number</span>
                  )}

                  {p.town && <span className="text-muted">{p.town}</span>}

                  {/* Why this one is a call rather than an email. Without
                      it the cold list reads as an undifferentiated pile,
                      and these two are a different pitch: one has nothing
                      to criticise, the other cannot be reached any other
                      way. */}
                  {group.id === "fresh" && !p.website && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                      no website
                    </span>
                  )}
                  {group.id === "fresh" && p.website && !p.email && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                      no email found
                    </span>
                  )}

                  {/* How many emails they have actually had, on the row of
                      the group that exists because of them. "Three emails"
                      is the reason the call is not cold, so it belongs
                      where the number is dialled rather than in a note
                      somewhere else. */}
                  {group.id === "emailed" && p.emailCount > 0 && (
                    <span className="rounded-full border border-border px-2 py-0.5 font-semibold text-foreground">
                      {p.emailCount} {p.emailCount === 1 ? "email" : "emails"} sent
                    </span>
                  )}

                  {p.callbackAt && (
                    <span className="font-bold text-brand-pink">
                      promised {p.callbackAt.slice(0, 10)}
                    </span>
                  )}

                  {(group.id === "fresh" || group.id === "emailed") && (
                    <p className="w-full text-xs leading-relaxed text-muted">
                      {callScript(p, p.emailCount).reason}{" "}
                      <Link
                        href={`/admin/prospects/${p.id}`}
                        className="font-semibold text-brand-pink hover:underline"
                      >
                        What to say →
                      </Link>
                    </p>
                  )}

                  {p.lastCall && (
                    <span className="text-muted">
                      last call {p.lastCall.at.slice(5)} ·{" "}
                      {CALL_LABEL[p.lastCall.outcome as CallOutcome] ?? p.lastCall.outcome}
                    </span>
                  )}

                  {p.emailCount > 0 && (
                    <span className="text-muted">
                      {p.emailCount} email{p.emailCount === 1 ? "" : "s"} sent
                    </span>
                  )}

                  {p.siteScore !== null && (
                    <span className="text-muted">site {p.siteScore.toFixed(1)}</span>
                  )}

                  {p.findings.length > 0 && (
                    <span className="w-full leading-relaxed text-muted">
                      Opening line: {p.findings[0].label}
                      {p.findings[0].why ? ` — ${p.findings[0].why}` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {total > 0 && (
        <p className="mt-10 text-xs leading-relaxed text-muted">
          Log what happens on{" "}
          <Link href="/admin/prospects" className="underline hover:text-foreground">
            the call list
          </Link>{" "}
          — press Log a call on the row. Anything you write there is what shows up here tomorrow.
        </p>
      )}
    </div>
  );
}
