import type { Metadata } from "next";
import Link from "next/link";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { warmList, warmSummary } from "@/lib/warm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Warm list",
  robots: { index: false, follow: false },
};

/**
 * Everybody who has already put their hand up.
 *
 * The call list answers "who could I ring". This answers "who already
 * wanted something and never got closed", which is a different list
 * and a far shorter one — and when money is needed in weeks rather
 * than months it is the only list worth working.
 *
 * Ordered the way somebody should work down it rather than by date:
 * the people expecting a call first, then the ones who asked for
 * something and were never answered, then the ones who said yes to a
 * conversation. Cold strangers do not appear here at all; they have
 * their own page and they are the wrong people for a short deadline.
 */
export default async function MoneyPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "money")) return <NotYours page="money" />;

  const groups = await warmList();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <AdminHeading title="Warm list">
        {groups === null
          ? "No database connection, so the list cannot be read."
          : warmSummary(groups)}
      </AdminHeading>

      {groups !== null && groups.length === 0 && (
        <p className="mt-8 rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted">
          Nobody has an unanswered enquiry, a promised callback or a reply sitting against their
          name. Everything warm has been worked, which means the next sale comes off{" "}
          <Link href="/admin/prospects" className="underline hover:text-foreground">
            the call list
          </Link>{" "}
          instead — slower, and worth knowing before the day starts.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-9">
        {(groups ?? []).map((group) => (
          <section key={group.kind}>
            <h2 className="text-sm font-bold text-foreground">
              {group.title}
              <span className="ml-2 font-normal text-muted">{group.rows.length}</span>
            </h2>
            <p className="mt-1 text-xs text-muted">{group.why}</p>
            <p className="mt-1 text-xs font-semibold text-foreground">{group.move}</p>

            <ul className="mt-3 flex flex-col gap-1.5">
              {group.rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-surface px-4 py-3 text-xs"
                >
                  <span className="text-sm font-semibold text-foreground">{row.who}</span>
                  {row.phone && (
                    <a
                      href={`tel:${row.phone.replace(/\s+/g, "")}`}
                      className="font-semibold tabular-nums text-foreground underline-offset-2 hover:underline"
                    >
                      {row.phone}
                    </a>
                  )}
                  {row.email && <span className="truncate text-muted">{row.email}</span>}
                  <span className="ml-auto whitespace-nowrap tabular-nums text-muted">
                    {row.days === 0
                      ? "today"
                      : row.days === 1
                        ? "1 day"
                        : `${row.days} days`}
                  </span>
                  {row.context && (
                    <span className="w-full leading-relaxed text-muted">{row.context}</span>
                  )}
                  {row.href && (
                    <Link
                      href={row.href}
                      className="text-[11px] font-semibold text-brand-pink underline-offset-2 hover:underline"
                    >
                      Open →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-muted">
        Every row here is somebody who contacted you, replied to you, asked to be rung back, or
        paid you once. Nothing on this page is predicted and no pound figure is guessed — what it
        is worth depends on what you sell them, and that is your call, not a number this page
        could invent.
      </p>
    </main>
  );
}
