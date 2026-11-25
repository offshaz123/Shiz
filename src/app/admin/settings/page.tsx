import type { Metadata } from "next";
import Link from "next/link";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { PhoneSystemSettings } from "@/components/PhoneSystemSettings";
import { callerIdFor, pbxId } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

/**
 * The settings that belong to the company rather than to a person.
 *
 * They had ended up wherever there was room. The phone system's account
 * number — the same for everybody — and the two numbers a business sees
 * when we ring it were both inside the box on the Team page where the
 * owner sets his own extension, under a heading that said "Your own
 * extension" and meant nothing of the sort.
 *
 * The test for whether something belongs here: does it describe the
 * company, or one person, or one business we work for? Company things
 * live here under a heading that says what they are. A person's own
 * extension stays with the people, on Team. What one client pays for
 * stays on that client.
 */
export default async function SettingsPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "settings")) return <NotYours page="settings" />;

  const [pbx, uk, us] = await Promise.all([pbxId(), callerIdFor("uk"), callerIdFor("us")]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <AdminHeading title="Settings">
        The things that are set once for the whole company. Anything belonging to one person is on{" "}
        <Link href="/admin/staff" className="underline hover:text-brand-pink">
          Team
        </Link>
        ; anything belonging to one client is on that client&apos;s own page.
      </AdminHeading>

      <section id="phone" className="mt-8 scroll-mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">The phone system</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Set these two and every person&apos;s calling app signs in, and every business sees a
          number from its own country.
        </p>

        <div className="mt-4">
          <PhoneSystemSettings pbxId={pbx} ukNumber={uk} usNumber={us} />
        </div>
      </section>
    </main>
  );
}
