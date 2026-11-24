import type { Metadata } from "next";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { Mailbox } from "@/components/Mailbox";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Emails",
  robots: { index: false, follow: false },
};

/**
 * The mailbox: what has gone out and what has come back.
 *
 * Here because the figure Walid most often wants — how many emails went
 * today — existed only as a point on a chart on the overview. A number
 * you have to read off a line is a number nobody reads.
 *
 * The page itself does no fetching. Half of it is a live IMAP read, and
 * a mailbox that is slow to answer would otherwise hold the whole page
 * blank; this way the counts and the sent list appear at once and the
 * inbox fills in behind them.
 */
export default async function EmailsPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "emails")) return <NotYours page="emails" />;

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <AdminHeading title="Emails">
        Everything this mailbox has sent, and everything that has come back. The inbox is read
        live each time you open this, so it is whatever is in there now rather than a copy.
      </AdminHeading>

      <div className="mt-8">
        <Mailbox regions={who.regions} />
      </div>
    </main>
  );
}
